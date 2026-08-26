import { Request, Response } from 'express';
import { query, execute } from '../config/mysqlDb';
import { createNotification } from '../utils/codes';

// NOTE: `certificates.verification_code` and `certificates.training_assignment_id`
// are added via schema_updates.sql (not present in the original dump).

const CERT_SELECT = `
  SELECT c.id, c.employee_id, CONCAT(u.first_name,' ',u.last_name) AS employee_name,
         c.training_assignment_id, c.title AS program_title,
         c.certificate_number AS cert_number, c.issue_date AS issued_date, c.verification_code
  FROM certificates c
  LEFT JOIN employees e ON e.id = c.employee_id
  LEFT JOIN users u ON u.id = e.user_id
`;

export const getCertificates = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    let sql = CERT_SELECT;
    const params: any[] = [];

    if (user?.role === 'Employee') {
      const [emp] = await query('SELECT id FROM employees WHERE user_id = ?', [user.id]);
      sql += ' WHERE c.employee_id = ?';
      params.push(emp?.id ?? -1);
    }

    const rows = await query(sql, params);
    res.json({ success: true, data: rows });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyCertificate = async (req: Request, res: Response) => {
  try {
    const { code } = req.params;
    const [cert] = await query(CERT_SELECT + ' WHERE c.verification_code = ? OR c.certificate_number = ?', [code, code]);

    if (!cert) {
      return res.status(404).json({ success: false, message: 'Invalid or expired certificate code' });
    }

    res.json({
      success: true,
      valid: true,
      data: cert,
      message: 'Certificate is authentic and verified by OKGIP Platform.',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const generateCertificate = async (req: Request, res: Response) => {
  try {
    const { trainingAssignmentId } = req.body;

    const [assignment] = await query('SELECT * FROM training_assignments WHERE id = ?', [Number(trainingAssignmentId)]);
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Training assignment not found' });
    }

    const [emp] = await query(
      `SELECT e.id, e.user_id, u.first_name, u.last_name FROM employees e JOIN users u ON u.id = e.user_id WHERE e.id = ?`,
      [assignment.employee_id]
    );
    const [program] = await query('SELECT * FROM training_programs WHERE id = ?', [assignment.training_program_id]);

    if (!emp || !program) {
      return res.status(400).json({ success: false, message: 'Associated employee or training program missing' });
    }

    const certNum = `OKGIP-CERT-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    const verCode = `VER-${Math.floor(10000 + Math.random() * 90000)}-${(program.category || 'GEN').substring(0, 4).toUpperCase()}`;

    const result = await execute(
      `INSERT INTO certificates (employee_id, certificate_number, title, provider, issue_date, verification_code, training_assignment_id)
       VALUES (?, ?, ?, ?, CURDATE(), ?, ?)`,
      [emp.id, certNum, program.title, program.provider || 'OKGIP Platform', verCode, assignment.id]
    );

    await execute(
      `UPDATE training_assignments SET status = 'Completed', progress_percentage = 100, certificate_url = ? WHERE id = ?`,
      [`/api/certificates/verify/${verCode}`, assignment.id]
    );

    await execute(
      `INSERT INTO employee_badges (employee_id, badge_title, description, icon, awarded_at)
       VALUES (?, 'Training Master', ?, 'Award', CURDATE())`,
      [emp.id, `Completed '${program.title}' certified training.`]
    );

    await createNotification(
      execute,
      emp.user_id,
      'Certificate Earned! 🎓',
      `Congratulations! Your certificate for '${program.title}' is ready to download.`,
      'Certificate Earned',
      'CERTIFICATE',
      result.insertId
    );

    const newCert = {
      id: result.insertId,
      employee_id: emp.id,
      employee_name: `${emp.first_name} ${emp.last_name}`,
      training_assignment_id: assignment.id,
      program_title: program.title,
      cert_number: certNum,
      issued_date: new Date().toISOString().split('T')[0],
      verification_code: verCode,
    };

    res.json({ success: true, data: newCert, message: 'Certificate generated successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

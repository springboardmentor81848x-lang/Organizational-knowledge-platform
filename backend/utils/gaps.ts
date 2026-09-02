import { query, execute } from '../config/mysqlDb';

/**
 * Recomputes knowledge_gaps for every assessed employee against their
 * department's required skills.
 *
 * `knowledge_gaps` has two UNIQUE KEYs in the real schema:
 *   - uq_emp_skill_gap (employee_id, skill_id)
 *   - gap_code
 * The previous implementation did DELETE FROM knowledge_gaps followed by a
 * loop of INSERTs with a sequentially-numbered gap_code (via MAX(id)+1).
 * Under concurrent requests (recalculateAllGaps runs on almost every
 * gap-related endpoint), two overlapping calls could both read the same
 * MAX(id) before either finished inserting, producing the same gap_code
 * twice, or racing on the DELETE — both cases threw ER_DUP_ENTRY.
 *
 * Fix: gap_code is now deterministic (`GAP-EMP{employee_id}-SK{skill_id}`),
 * which is unique per (employee, skill) pair by construction, and every
 * write goes through INSERT ... ON DUPLICATE KEY UPDATE instead of
 * DELETE+INSERT. That makes recalculation idempotent and safe under
 * concurrency — MySQL resolves the upsert atomically per row against the
 * uq_emp_skill_gap unique key, no matter how many requests call this at once.
 */
export async function recalculateAllGaps(): Promise<void> {
  const employees = await query('SELECT id, department_id FROM employees WHERE department_id IS NOT NULL');
  const empSkills = await query('SELECT employee_id, skill_id, current_proficiency FROM employee_skills');
  const deptReqs = await query('SELECT department_id, skill_id, required_proficiency FROM department_required_skills');
  const activeAssignments = await query(
    `SELECT ta.employee_id, tp.target_skill_id
     FROM training_assignments ta
     JOIN training_programs tp ON tp.id = ta.training_program_id
     WHERE ta.status IN ('In Progress', 'Assigned')`
  );

  const assessedEmployeeIds = new Set(empSkills.map((s: any) => s.employee_id));
  const skillByEmp = new Map<string, number>();
  empSkills.forEach((s: any) => skillByEmp.set(`${s.employee_id}:${s.skill_id}`, s.current_proficiency));
  const activeTrainingSet = new Set(activeAssignments.map((a: any) => `${a.employee_id}:${a.target_skill_id}`));

  // Every (employee, skill) pair that currently has a real, positive gap —
  // used below to clean up stale rows (resolved gaps, or skills no longer
  // required by the employee's department) without a blanket DELETE.
  const validPairs = new Set<string>();

  for (const emp of employees) {
    if (!assessedEmployeeIds.has(emp.id)) continue;
    const reqs = deptReqs.filter((r: any) => r.department_id === emp.department_id);

    for (const req of reqs) {
      const currentProf = skillByEmp.get(`${emp.id}:${req.skill_id}`) ?? 0;
      const gapScore = req.required_proficiency - currentProf;
      if (gapScore <= 0) continue;

      validPairs.add(`${emp.id}:${req.skill_id}`);

      const priority = gapScore >= 2 ? 'High' : gapScore === 1 ? 'Medium' : 'Low';
      const status = activeTrainingSet.has(`${emp.id}:${req.skill_id}`) ? 'In Training' : 'Identified';
      const gapCode = `GAP-EMP${emp.id}-SK${req.skill_id}`;

      await execute(
        `INSERT INTO knowledge_gaps
          (gap_code, employee_id, skill_id, required_proficiency, current_proficiency, gap_score, priority, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           required_proficiency = VALUES(required_proficiency),
           current_proficiency = VALUES(current_proficiency),
           gap_score = VALUES(gap_score),
           priority = VALUES(priority),
           status = VALUES(status),
           updated_at = CURRENT_TIMESTAMP`,
        [gapCode, emp.id, req.skill_id, req.required_proficiency, currentProf, gapScore, priority, status]
      );
    }
  }

  // Clean up stale gaps for assessed employees: rows that exist but are no
  // longer in the valid pair set (proficiency now meets the requirement, or
  // the skill is no longer required by their department). Scoped to
  // assessed employees only, and done as one targeted DELETE by id rather
  // than a blanket wipe, so it can't race with the upserts above.
  const assessedIds = [...assessedEmployeeIds];
  if (assessedIds.length > 0) {
    const placeholders = assessedIds.map(() => '?').join(',');
    const existingGaps = await query(
      `SELECT id, employee_id, skill_id FROM knowledge_gaps WHERE employee_id IN (${placeholders})`,
      assessedIds
    );
    const staleIds = existingGaps
      .filter((g: any) => !validPairs.has(`${g.employee_id}:${g.skill_id}`))
      .map((g: any) => g.id);

    if (staleIds.length > 0) {
      const idPlaceholders = staleIds.map(() => '?').join(',');
      await execute(`DELETE FROM knowledge_gaps WHERE id IN (${idPlaceholders})`, staleIds);
    }
  }
}

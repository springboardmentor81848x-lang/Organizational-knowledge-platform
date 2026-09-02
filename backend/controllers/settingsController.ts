import { Response } from 'express';
import { query, execute } from '../config/mysqlDb';
import { AuthRequest } from '../middleware/auth';

function toApi(row: any) {
  return {
    platformName: row.platform_name,
    jwtExpiration: row.jwt_expiration,
    defaultRole: row.default_role,
    gapAlertThreshold: row.gap_alert_threshold,
    autoTrainingReminder: !!row.auto_training_reminder,
    strictRbacMode: !!row.strict_rbac_mode,
    mysqlSyncStatus: 'Connected & Healthy',
    lastUpdated: row.updated_at,
  };
}

async function ensureRow() {
  const rows = await query('SELECT * FROM system_settings WHERE id = 1');
  if (rows.length === 0) {
    await execute(
      `INSERT INTO system_settings (id, platform_name, jwt_expiration, default_role, gap_alert_threshold, auto_training_reminder, strict_rbac_mode)
       VALUES (1, 'Organizational Knowledge Gap Intelligence Platform (OKGIP)', '24h', 'Employee', 2, 1, 1)`
    );
    return (await query('SELECT * FROM system_settings WHERE id = 1'))[0];
  }
  return rows[0];
}

export const getSettings = async (req: AuthRequest, res: Response) => {
  const row = await ensureRow();
  return res.json({ success: true, data: toApi(row) });
};

export const updateSettings = async (req: AuthRequest, res: Response) => {
  await ensureRow();
  const { platformName, jwtExpiration, defaultRole, gapAlertThreshold, autoTrainingReminder, strictRbacMode } = req.body;

  await execute(
    `UPDATE system_settings SET
      platform_name = COALESCE(?, platform_name),
      jwt_expiration = COALESCE(?, jwt_expiration),
      default_role = COALESCE(?, default_role),
      gap_alert_threshold = COALESCE(?, gap_alert_threshold),
      auto_training_reminder = COALESCE(?, auto_training_reminder),
      strict_rbac_mode = COALESCE(?, strict_rbac_mode)
     WHERE id = 1`,
    [
      platformName ?? null,
      jwtExpiration ?? null,
      defaultRole ?? null,
      gapAlertThreshold !== undefined ? Number(gapAlertThreshold) : null,
      autoTrainingReminder !== undefined ? (autoTrainingReminder ? 1 : 0) : null,
      strictRbacMode !== undefined ? (strictRbacMode ? 1 : 0) : null,
    ]
  );

  const row = await ensureRow();
  return res.json({ success: true, message: 'System settings saved successfully', data: toApi(row) });
};

const db = require('../config/db');

const createCallLog = async ({
  callerId,
  receiverId,
  callType,
  streamCallId,
  startedAt,
  endedAt = null,
  status,
  duration = null,
  metadata = null
}) => {
  const result = await db.query(
    `INSERT INTO call_logs 
      (caller_id, receiver_id, call_type, stream_call_id, started_at, ended_at, status, duration, metadata)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [callerId, receiverId, callType, streamCallId, startedAt, endedAt, status, duration, metadata]
  );
  return result.rows[0];
};

const getAllCallLogs = async () => {
  const result = await db.query('SELECT * FROM call_logs ORDER BY created_at DESC');
  return result.rows;
};

module.exports = { createCallLog, getAllCallLogs };

const db = require('../config/db');

const createCallLog = async ({
  callerId,
  receiverId,
  callType,      // 'audio' or 'video'
  streamCallId,  // ID from Stream API
  startedAt,     // timestamp
  endedAt,       // timestamp or null
  status,        // 'initiated', 'accepted', 'ended', etc.
  metadata       // optional, JSON object
}) => {
  const result = await db.query(
    `INSERT INTO call_logs 
      (caller_id, receiver_id, call_type, stream_call_id, started_at, ended_at, status, metadata)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [callerId, receiverId, callType, streamCallId, startedAt, endedAt, status, metadata]
  );
  return result.rows[0];
};

module.exports = { createCallLog };
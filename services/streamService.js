const express = require('express');
const cors = require('cors');
const { StreamChat } = require('stream-chat');
const {createCallLog, getAllCallLogs} = require('../models/callLogModel');
const db = require('../config/db');
require('dotenv').config();

const router = express.Router();

const apiKey = process.env.STREAM_API_KEY;
const apiSecret = process.env.STREAM_API_SECRET;
const serverClient = StreamChat.getInstance(apiKey, apiSecret);

// //Helper to check if the user exists
// async function userExists(userId) {
//   const result = await db.query('SELECT id FROM users WHERE id = $1', [userId]);
//   return result.rows.length > 0;
// }

// Endpoint to generate token for a given user
router.get('/get-token', (req, res) => {
  const userId = req.query.user_id;
  if (!userId) {
    return res.status(400).json({ error: 'Missing user_id' });
  }
  try {
    const token = serverClient.createToken(userId);
    return res.status(200).json({ token });
  } catch (error) {
    console.error('Token generation error:', error);
    return res.status(500).json({ error: 'Token generation failed' });
  }
});

// Endpoint to log a call initiation
router.post('/log-call', async (req, res) => {
  const {
    caller_id,
    receiver_id,
    call_type,
    stream_call_id,
    status,
    metadata // optional
  } = req.body;

  if (!caller_id || !call_type || !stream_call_id || !status) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  //  // Check if both users exist
  // if (!(await userExists(caller_id))) {
  //   return res.status(400).json({ error: 'Caller does not exist' });
  // }
  // if (!(await userExists(receiver_id))) {
  //   return res.status(400).json({ error: 'Receiver does not exist' });
  // }

  try {
    const log = await createCallLog({
      callerId: caller_id,
      receiverId: receiver_id,
      callType: call_type,
      streamCallId: stream_call_id,
      startedAt: new Date(),
      status,
      metadata
    });
    res.status(201).json(log);
  } catch (error) {
    console.error('Call log error:', error);
    res.status(500).json({ error: 'Failed to log call' });
  }
});


// Endpoint to update a call log with receiver_id and/or status using call log id
router.patch('/log-call/:id', async (req, res) => {
  const { id } = req.params;
  const { receiver_id, status } = req.body;

  if (!receiver_id && !status) {
    return res.status(400).json({ error: 'Nothing to update' });
  }

  // Optionally check if receiver exists
  // Uncomment only if you have the `userExists` helper
  // if (receiver_id && !(await userExists(receiver_id))) {
  //   return res.status(400).json({ error: 'Receiver does not exist' });
  // }

  try {
    let setParts = [];
    let values = [];
    let idx = 1;

    if (receiver_id) {
      setParts.push(`receiver_id = $${idx++}`);
      values.push(receiver_id);
    }
    if (status) {
      setParts.push(`status = $${idx++}`);
      values.push(status);
    }

    values.push(id); // path param used here

    const result = await db.query(
      `UPDATE call_logs SET ${setParts.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Call log not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Call log update error:', error);
    res.status(500).json({ error: 'Failed to update call log' });
  }
});


// Endpoint to get all call logs
router.get('/call-logs', async (req, res) => {
  try {
    const logs = await getAllCallLogs();
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch call logs' });
  }
});

module.exports = router;

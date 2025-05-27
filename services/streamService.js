const express = require('express');
const cors = require('cors');
const { StreamChat } = require('stream-chat');
require('dotenv').config();

const router = express.Router();

const apiKey = process.env.STREAM_API_KEY;
const apiSecret = process.env.STREAM_API_SECRET;
const serverClient = StreamChat.getInstance(apiKey, apiSecret);

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

module.exports = router;
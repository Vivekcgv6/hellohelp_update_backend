const { createCallLog } = require('../models/callLogModel');

// In your call event handler/controller:
await createCallLog({
  customer_id: 1,
  agent_id: 2,
  stream_call_id: 'stream123',
  call_type: 'audio',
  status: 'initiated',
  started_at: new Date(),
  ended_at: null,
  duration: null
});
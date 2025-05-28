const { createCallLog } = require('../models/callLogModel');

// In your call event handler/controller:
await createCallLog({
  caller_Id: 1,
  receiver_Id: 2,
  call_type: 'audio',
  stream_call_id: 'stream123',
  call_type: 'audio',
  status: 'initiated',
  started_at: new Date(),
  ended_at: null,
  duration: null,
});

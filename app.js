const WebSocket = require('ws');
const { createClient } = require('@deepgram/sdk');

const deepgramApiKey = '8c399d4c8b91bdd50abee3290bd71ef05d3a167b'; // Replace with your real key
const deepgram = createClient(deepgramApiKey);

const wss = new WebSocket.Server({ port: 3000 });

wss.on('connection', async (clientSocket) => {
  console.log('Client connected');

  const deepgramLive = await deepgram.listen.live({
    model: 'nova',
    language: 'en-US',
    smart_format: true,
  });

  deepgramLive.on('open', () => {
    console.log('Connected to Deepgram');
  });

  deepgramLive.on('transcriptReceived', (transcription) => {
    const transcript = transcription.channel.alternatives[0].transcript;
    if (transcript) {
      console.log('Transcript:', transcript);
      clientSocket.send(transcript);
    }
  });

  deepgramLive.on('error', (err) => {
    console.error('Deepgram error:', err);
  });

  clientSocket.on('message', (msg) => {
    if (deepgramLive.getReadyState() === 1) {
      deepgramLive.send(msg);
    }
  });

  clientSocket.on('close', () => {
    console.log('Client disconnected');
    deepgramLive.finish();
  });
});

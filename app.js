const WebSocket = require('ws');
const { Deepgram } = require('@deepgram/sdk');
const deepgram = new Deepgram('8c399d4c8b91bdd50abee3290bd71ef05d3a167b');

const server = new WebSocket.Server({ port: 3000 });

server.on('connection', (clientSocket) => {
  console.log('Client connected');

  const dgSocket = deepgram.transcription.live({
    punctuate: true,
    language: 'en-US',
  });

  dgSocket.on('open', () => {
    console.log('Connected to Deepgram');

    clientSocket.on('message', (message) => {
      dgSocket.send(message);
    });

    dgSocket.on('transcriptReceived', (data) => {
      const transcript = JSON.parse(data);
      const text = transcript.channel?.alternatives[0]?.transcript;
      if (text) {
        console.log('Transcript:', text);
        clientSocket.send(text);
      }
    });
  });

  dgSocket.on('error', (err) => console.error('Deepgram error:', err));
  dgSocket.on('close', () => console.log('Deepgram connection closed'));

  clientSocket.on('close', () => {
    dgSocket.finish();
    console.log('Client disconnected');
  });
});

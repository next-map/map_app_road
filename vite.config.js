import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import svgr from 'vite-plugin-svgr';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import glsl from 'vite-plugin-glsl';

// WebSocket 서버 생성 함수
const createWebSocketServer = () => {
  const server = createServer();
  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws) => {
    console.log('New client connected');

    ws.on('message', (message) => {
      console.log(`Received: ${message}`);
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    });

    ws.on('close', () => {
      console.log('Client disconnected');
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

    ws.send('Welcome to the WebSocket server!');
  });

  server.listen(8080, () => {
    console.log("safsdafasdfsadfasfd")
    console.log('WebSocket server is running on ws://localhost:8080');
  });
};

export default defineConfig({

  plugins: [react(), svgr(), glsl(),
    {
      name: 'configure-server',
      configureServer(server) {     
        
        // Vite 개발 서버에 WebSocket 서버 추가
        createWebSocketServer(server.httpServer);
      },
    },
  ],
  resolve: {
    alias: {
      '@components': path.resolve(__dirname, 'src/components'),
      '@pages': path.resolve(__dirname, 'src/pages'),
      '@styles': path.resolve(__dirname, 'src/styles'),
      '@assets/weatherAsset': path.resolve(__dirname, 'src/assets/weatherAssets'),
      '@img': path.resolve(__dirname, 'src/img'),
      '@font': path.resolve(__dirname, 'src/fonts')
    }
  }
}); 
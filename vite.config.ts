import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Add this line to expose the server outside the container
    https: {
      key: fs.readFileSync(path.resolve(__dirname, 'certificates/localhost.key')),
      cert: fs.readFileSync(path.resolve(__dirname, 'certificates/localhost.crt')),
    },
    port: 3000
  }
});
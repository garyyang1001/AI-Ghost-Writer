import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    
    // Get API key with priority: GEMINI_API_KEY > API_KEY
    const apiKey = env.GEMINI_API_KEY || env.API_KEY;
    
    // Validate API key in development
    if (mode === 'development' && !apiKey) {
      console.warn('\n⚠️  Warning: GEMINI_API_KEY not found in environment variables.');
      console.warn('   Please copy .env.example to .env and add your Google Gemini API key.');
      console.warn('   For cloud deployment, set GEMINI_API_KEY in your platform environment variables.\n');
    }
    
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        // Consistent API key access - use GEMINI_API_KEY as primary
        'process.env.GEMINI_API_KEY': JSON.stringify(apiKey),
        'process.env.API_KEY': JSON.stringify(apiKey)  // Backward compatibility
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});

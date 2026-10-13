import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { initDatabase } from './server/db.js';
import apiRouter, { authenticateToken } from './server/api.js';

dotenv.config();

const app = express();
// Ensure server always binds to port 3000 as required by the AI Studio preview environment
const PORT = 3000;
const isProd = process.env.NODE_ENV === 'production';

process.on('uncaughtException', (err) => {
  console.error('Uncaught server exception:', err);
});
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled server rejection:', reason);
});

// Basic middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Static uploads directory for product images
const uploadsDir = path.resolve('uploads');
app.use('/uploads', express.static(uploadsDir));

// Global auth header reader
app.use(authenticateToken);

// Mount backend API router
app.use('/api', apiRouter);

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    store: 'SK BRAND',
    version: '1.0.0',
    mode: isProd ? 'production' : 'development'
  });
});

async function startServer() {
  try {
    console.log('Initializing SK BRAND persistent database...');
    await initDatabase();

    if (!isProd) {
      // Development mode: Mount Vite middleware
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa'
      });
      app.use(vite.middlewares);
      console.log('Vite middleware mounted for development.');
    } else {
      // Production mode: Serve built dist assets
      const distPath = path.resolve('dist');
      app.use(express.static(distPath));
      app.get('*', (_req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
      console.log('Serving production static build from dist/.');
    }

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`SK BRAND Full-Stack Server running at http://0.0.0.0:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start SK BRAND server:', err);
    process.exit(1);
  }
}

startServer();

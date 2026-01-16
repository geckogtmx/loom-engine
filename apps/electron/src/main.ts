import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer } from 'ws';
import chokidar from 'chokidar';
import { registerSessionHandlers, validateSessionToken } from './ipc/sessionHandlers';
import { registerWorldHandlers } from './ipc/worldHandlers';
import { createDb } from '@loom/db';
import { SecureKeyStore } from './services/SecureKeyStore';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configuration
const isDev = !app.isPackaged;
const dbPath = process.env.DB_PATH || (isDev
  ? path.join(__dirname, '../../../packages/db/local.db')
  : path.join(app.getPath('userData'), 'loom.db'));
console.log(`[Main] Using Database: ${dbPath}`);

// WebSocket Server for Streaming
const wss = new WebSocketServer({ port: 8080 });
const connectionRateLimit = new Map<string, number>();

wss.on('connection', (ws, req) => {
  const ip = req.socket.remoteAddress || 'unknown';
  const now = Date.now();

  // Rate Limiting (Phase 7.9)
  // Max 5 connections per 10 seconds per IP
  const lastConn = connectionRateLimit.get(ip) || 0;
  if (now - lastConn < 2000) { // 2s debounce roughly
    console.warn(`[SECURITY] Rate limit blocked IP: ${ip}`);
    ws.close(3000, 'Rate Limit');
    return;
  }
  connectionRateLimit.set(ip, now);

  // Clean up rate limit map
  if (connectionRateLimit.size > 1000) connectionRateLimit.clear();

  const url = new URL(req.url || '', `http://${req.headers.host}`);
  const token = url.searchParams.get('token');

  // Simple token validation (Phase 7.5)
  // Check against active sessions in memory
  if (!validateSessionToken(token)) {
    console.warn(`[SECURITY] Blocked unauthorized WebSocket connection attempt. Token: ${token || 'missing'}`);
    ws.close(3000, 'Unauthorized');
    return;
  }

  console.log(`[WebSocket] UI connected with verified token: ${(token || '').substring(0, 8)}...`);

  ws.on('message', (message) => {
    // Only process messages from authenticated sockets
    console.debug(`Received: ${message}`);
  });
});

// File Watcher for Knowledge Base
const watcher = chokidar.watch(path.join(__dirname, '../../../knowledge'), {
  ignored: /(^|[\/\\])\../,
  persistent: true,
});

watcher.on('change', (filePath) => {
  console.warn(`File changed: ${filePath}`);
  // Logic for DB reconciliation will go here in Phase 1
});

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: true, // Explicitly enabled (Phase 7.9)
    },
    backgroundColor: '#0f172a',
    titleBarStyle: 'hidden',
  });

  // In development, load from the Web App port (5174)
  // In development, we MUST load the Web App (Renderer) port.
  // The VITE_DEV_SERVER_URL env var often points to Electron's own vite server (5175),
  // which causes a blank white screen. We explicitly target the Renderer (5174).
  const isDev = !app.isPackaged; // or process.env.NODE_ENV === 'development'

  if (isDev) {
    console.log('[Main] Development Mode detected. Loading http://localhost:5174');
    win.loadURL('http://localhost:5174');
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, '../renderer/index.html'));
  }
}

app.whenReady().then(async () => {
  createWindow();

  // Initialize database and SecureKeyStore
  const db = createDb(dbPath);
  const keyStore = new SecureKeyStore(db);

  // Check if encryption is available
  if (!SecureKeyStore.isAvailable()) {
    console.error('[SECURITY] safeStorage encryption not available on this system!');
    console.error('[SECURITY] API keys cannot be securely stored.');
  } else {
    // One-time migration from .env to encrypted storage
    const existingProviders = await keyStore.listProviders();
    if (existingProviders.length === 0) {
      console.log('[SecureKeyStore] No encrypted keys found. Checking .env for migration...');
      await keyStore.migrateFromEnv();
    } else {
      console.log(`[SecureKeyStore] Found ${existingProviders.length} encrypted keys: ${existingProviders.join(', ')}`);
    }
  }

  registerSessionHandlers(dbPath);
  registerWorldHandlers(dbPath);

  ipcMain.handle('window:close', () => {
    app.quit();
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

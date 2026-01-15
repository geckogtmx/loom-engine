import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer } from 'ws';
import chokidar from 'chokidar';
import { registerSessionHandlers } from './ipc/sessionHandlers';
import { registerWorldHandlers } from './ipc/worldHandlers';
import { createDb } from '@loom/db';
import { SecureKeyStore } from './services/SecureKeyStore';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configuration
const dbPath = process.env.DB_PATH || path.join(app.getPath('userData'), 'loom.db');

// WebSocket Server for Streaming
const wss = new WebSocketServer({ port: 8080 });
wss.on('connection', (ws) => {
  console.warn('UI connected to WebSocket');
  ws.on('message', (message) => {
    console.warn(`Received: ${message}`);
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
    },
    backgroundColor: '#0f172a',
    titleBarStyle: 'hidden',
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
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

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

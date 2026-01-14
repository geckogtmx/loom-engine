import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer } from 'ws';
import chokidar from 'chokidar';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

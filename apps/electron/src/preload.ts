import { contextBridge, ipcRenderer } from 'electron';
import { WorldChannels, SessionChannels } from './ipc/channels';

contextBridge.exposeInMainWorld('api', {
  world: {
    create: (input: any) => ipcRenderer.invoke(WorldChannels.CREATE, input),
    get: (id: string) => ipcRenderer.invoke(WorldChannels.GET, id),
    list: () => ipcRenderer.invoke(WorldChannels.LIST),
    update: (id: string, input: any) => ipcRenderer.invoke(WorldChannels.UPDATE, id, input),
    delete: (id: string) => ipcRenderer.invoke(WorldChannels.DELETE, id),
  },
  session: {
    create: (worldId: string) => ipcRenderer.invoke(SessionChannels.CREATE, worldId),
    list: (worldId: string) => ipcRenderer.invoke(SessionChannels.LIST, worldId),
    initialize: (sessionId: string) => ipcRenderer.invoke(SessionChannels.INITIALIZE, sessionId),
    setIntent: (sessionId: string, goal: string, audience: string, constraints: string[]) =>
      ipcRenderer.invoke(SessionChannels.SET_INTENT, sessionId, goal, audience, constraints),
    start: (sessionId: string) => ipcRenderer.invoke(SessionChannels.START, sessionId),
    end: (sessionId: string) => ipcRenderer.invoke(SessionChannels.END, sessionId),
    getState: (sessionId: string) => ipcRenderer.invoke(SessionChannels.GET_STATE, sessionId),
    detectIncomplete: () => ipcRenderer.invoke(SessionChannels.DETECT_INCOMPLETE),
    recover: (sessionId: string, action: string) => ipcRenderer.invoke(SessionChannels.RECOVER, sessionId, action),
  },
  // Existing APIs (if any, preserving structure)
});

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    send: (channel: string, data: any) => ipcRenderer.send(channel, data),
    invoke: (channel: string, ...args: any[]) => ipcRenderer.invoke(channel, ...args),
    on: (channel: string, func: (...args: any[]) => void) =>
      ipcRenderer.on(channel, (event, ...args) => func(...args)),
  },
});

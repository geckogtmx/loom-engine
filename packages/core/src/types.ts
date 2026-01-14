export type SessionStatus = 'pending' | 'active' | 'summarizing' | 'closed' | 'failed';

export interface IntentEnvelope {
  goal: string;
  constraints: string[];
  scope: string[];
}

export interface World {
  id: string;
  name: string;
  purpose: string;
}

export interface Agent {
  id: string;
  name: string;
  profile: string;
  telos: string;
}

export interface MemoryLayer {
  L4: 'Telos';
  L3: 'Knowledge';
  L2: 'Episodic';
  L1: 'Active';
}

import React from 'react';

export interface Agent {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  path: string;
}

export type Theme = 'light' | 'dark';

export interface HistoryItem {
  id: string;
  agentId: string;
  action: string;
  timestamp: number;
  status: 'success' | 'error' | 'pending';
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}
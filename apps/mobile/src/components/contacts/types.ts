// ─── Contacts feature types ──────────────────────────────

export type OnlineStatus = 'online' | 'offline' | 'away';

export interface PulseContact {
  id: string;
  name: string;
  username: string;
  avatarUrl?: string;
  onlineStatus: OnlineStatus;
  phone?: string;
}

export interface SearchResult {
  id: string;
  name: string;
  username: string;
  avatarUrl?: string;
}

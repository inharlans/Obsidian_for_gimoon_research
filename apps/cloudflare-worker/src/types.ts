import type { OAuthHelpers } from "@cloudflare/workers-oauth-provider";

export interface Env extends Cloudflare.Env {
  OAUTH_PROVIDER: OAuthHelpers;
  OWNER_EMAIL?: string;
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
  OAUTH_RECOVERY_KEY: string;
}

export interface AuthProps {
  userId: string;
  login: string;
  email?: string;
  scopes: string[];
}

export interface SnapshotNote {
  id: string;
  type: string;
  title: string;
  aliases: string[];
  metadata: Record<string, unknown>;
  body: string;
  summary: string;
  searchText: string;
}

export interface SnapshotEdge {
  id: string;
  subject: string;
  predicate: string;
  object: string;
  status: string;
  evidenceRefs: string[];
}

export interface PaperKgSnapshot {
  schemaVersion: "1.0";
  generatedAt: string;
  sourceRevision: string;
  noteCount: number;
  notes: SnapshotNote[];
  edges: SnapshotEdge[];
  aliases: Record<string, string[]>;
}

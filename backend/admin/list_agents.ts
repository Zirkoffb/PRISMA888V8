import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../shared/db";

export interface Agent {
  id: number;
  name: string;
  description?: string;
  type: string;
  capabilities: string[];
  status: string;
  createdAt: Date;
}

export interface ListAgentsResponse {
  agents: Agent[];
}

// Lists all available AI agents.
export const listAgents = api<void, ListAgentsResponse>(
  { auth: true, expose: true, method: "GET", path: "/admin/agents" },
  async () => {
    const auth = getAuthData()!;
    
    if (auth.role !== 'admin') {
      throw new Error("Only admin users can list agents");
    }

    const agents = await db.queryAll<{
      id: number;
      name: string;
      description: string | null;
      type: string;
      capabilities: string[];
      status: string;
      created_at: Date;
    }>`
      SELECT id, name, description, type, capabilities, status, created_at
      FROM agents 
      ORDER BY name
    `;

    return {
      agents: agents.map(a => ({
        id: a.id,
        name: a.name,
        description: a.description || undefined,
        type: a.type,
        capabilities: a.capabilities,
        status: a.status,
        createdAt: a.created_at,
      }))
    };
  }
);

import { api } from "encore.dev/api";
import db from "../shared/db";

export interface SimpleAgent {
  id: number;
  name: string;
  description: string;
  strategy_focus: string;
  status: string;
}

export const listActiveAgents = api(
  { method: "GET", path: "/admin/agents-active", expose: true },
  async (): Promise<{ agents: SimpleAgent[] }> => {
    const result = await db.queryAll<{
      id: number;
      name: string;
      description: string;
      strategy_focus: string;
      status: string;
    }>`
      SELECT id, name, description, strategy_focus, status
      FROM agents 
      WHERE is_active = true 
      ORDER BY created_at DESC
    `;

    const agents = result.map((row) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      strategy_focus: row.strategy_focus,
      status: row.status
    }));

    return { agents };
  }
);
import { api } from "encore.dev/api";
import db from "../shared/db";

export interface Agent {
  id: number;
  name: string;
  description: string;
  strategy_focus: string;
  status: string;
  is_active: boolean;
  created_at: string;
}

export interface CreateAgentRequest {
  name: string;
  description: string;
  strategy_focus: string;
}

// List all active agents
export const listAgentsWithKnowledge = api(
  { method: "GET", path: "/admin/agents-detailed", expose: true },
  async (): Promise<{ agents: Agent[] }> => {
    const result = await db.queryAll<{
      id: number;
      name: string;
      description: string;
      strategy_focus: string;
      status: string;
      is_active: boolean;
      created_at: string;
    }>`
      SELECT id, name, description, strategy_focus, status, is_active, created_at
      FROM agents 
      WHERE is_active = true 
      ORDER BY created_at DESC
    `;

    const agents = result.map((row) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      strategy_focus: row.strategy_focus || '',
      status: row.status,
      is_active: row.is_active,
      created_at: row.created_at
    }));

    return { agents };
  }
);

// Create new agent
export const createAgent = api(
  { method: "POST", path: "/admin/agents", expose: true },
  async (req: CreateAgentRequest): Promise<Agent> => {
    const agent = await db.queryRow<{
      id: number;
      name: string;
      description: string;
      strategy_focus: string;
      status: string;
      is_active: boolean;
      created_at: string;
    }>`
      INSERT INTO agents (name, description, strategy_focus, status, is_active)
      VALUES (${req.name}, ${req.description}, ${req.strategy_focus}, 'active', true)
      RETURNING *
    `;

    if (!agent) {
      throw new Error("Failed to create agent");
    }

    return {
      id: agent.id,
      name: agent.name,
      description: agent.description,
      strategy_focus: agent.strategy_focus || '',
      status: agent.status,
      is_active: agent.is_active,
      created_at: agent.created_at
    };
  }
);

// Update agent
export const updateAgent = api(
  { method: "PUT", path: "/admin/agents/:id", expose: true },
  async (req: { id: number; name?: string; description?: string; strategy_focus?: string }): Promise<void> => {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (req.name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      values.push(req.name);
    }
    if (req.description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      values.push(req.description);
    }
    if (req.strategy_focus !== undefined) {
      updates.push(`strategy_focus = $${paramIndex++}`);
      values.push(req.strategy_focus);
    }

    if (updates.length > 0) {
      updates.push(`updated_at = NOW()`);
      values.push(req.id);

      await db.exec`
        UPDATE agents 
        SET name = ${req.name || null}, description = ${req.description || null}, 
            strategy_focus = ${req.strategy_focus || null}, updated_at = NOW()
        WHERE id = ${req.id}
      `;
    }
  }
);

// Delete (deactivate) agent
export const deleteAgent = api(
  { method: "DELETE", path: "/admin/agents/:id", expose: true },
  async (req: { id: number }): Promise<void> => {
    await db.exec`
      UPDATE agents 
      SET is_active = false
      WHERE id = ${req.id}
    `;
  }
);

export interface KnowledgeFile {
  filename: string;
  content: string;
  content_type: string;
  size: number;
}

export interface UploadKnowledgeRequest {
  agent_id: number;
  files: KnowledgeFile[];
}

// Upload knowledge (placeholder)
export const uploadAgentKnowledge = api(
  { method: "POST", path: "/admin/agents/:agent_id/knowledge", expose: true },
  async (req: UploadKnowledgeRequest): Promise<{ message: string; files_processed: number }> => {
    // Placeholder implementation
    return {
      message: `${req.files.length} arquivos processados com sucesso`,
      files_processed: req.files.length
    };
  }
);

// Remove knowledge (placeholder)
export const removeAgentKnowledge = api(
  { method: "DELETE", path: "/admin/agents/:agent_id/knowledge/:file_id", expose: true },
  async (req: { agent_id: number; file_id: number }): Promise<void> => {
    // Placeholder implementation
  }
);

export interface GenerateActionPlanRequest {
  tenant_id: number;
  agent_id: number;
  strategic_axes: Record<string, number>;
}

export interface ActionPlan {
  id: number;
  core_values: {
    primary: string[];
    secondary: string[];
  };
  communication_profile: {
    tone: string;
    key_messages: string[];
    target_audience: string[];
  };
  tactical_actions: {
    title: string;
    description: string;
    priority: string;
    due_date: string;
    category: string;
    estimated_hours: number;
  }[];
  generated_at: string;
}

// Generate action plan (placeholder)
export const generateActionPlan = api(
  { method: "POST", path: "/admin/generate-action-plan", expose: true },
  async (req: GenerateActionPlanRequest): Promise<ActionPlan> => {
    // Mock action plan
    return {
      id: 1,
      core_values: {
        primary: ["Transparência", "Proximidade", "Eficiência"],
        secondary: ["Inovação", "Sustentabilidade"]
      },
      communication_profile: {
        tone: "Direto e acessível",
        key_messages: ["Mudança real", "Escuta ativa"],
        target_audience: ["Eleitores locais", "Lideranças"]
      },
      tactical_actions: [
        {
          title: "Reunião comunitária",
          description: "Organizar encontro com moradores",
          priority: "alta",
          due_date: "2024-02-15",
          category: "Mobilização",
          estimated_hours: 4
        }
      ],
      generated_at: new Date().toISOString()
    };
  }
);
import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { agentTaskCreatedTopic } from "../shared/events";
import db from "../shared/db";

export interface CreateAgentTaskRequest {
  agentId: number;
  taskType: string;
  inputData: any;
}

export interface CreateAgentTaskResponse {
  taskId: number;
  status: string;
}

// Creates a new AI agent task.
export const createTask = api<CreateAgentTaskRequest, CreateAgentTaskResponse>(
  { auth: true, expose: true, method: "POST", path: "/agents/tasks" },
  async (req) => {
    const auth = getAuthData()!;
    
    if (!auth.tenantId) {
      throw new Error("Tenant ID required");
    }

    const task = await db.queryRow<{ id: number }>`
      INSERT INTO agent_tasks (tenant_id, agent_id, task_type, input_data, status)
      VALUES (${auth.tenantId}, ${req.agentId}, ${req.taskType}, ${JSON.stringify(req.inputData)}, 'pending')
      RETURNING id
    `;

    await agentTaskCreatedTopic.publish({
      taskId: task!.id,
      tenantId: auth.tenantId,
      agentId: req.agentId,
      taskType: req.taskType,
      inputData: req.inputData,
    });

    return {
      taskId: task!.id,
      status: 'pending',
    };
  }
);

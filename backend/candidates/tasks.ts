import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../shared/db";

export interface Task {
  id: number;
  title: string;
  description?: string;
  priority: string;
  status: string;
  dueDate?: Date;
  assignedTo?: string;
  createdAt: Date;
  completedAt?: Date;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
  assignedTo?: string;
}

export interface UpdateTaskRequest {
  id: number;
  title?: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  status?: 'pending' | 'in_progress' | 'completed';
  dueDate?: Date;
  assignedTo?: string;
}

export interface ListTasksResponse {
  tasks: Task[];
}

// Lists all tasks for the candidate.
export const listTasks = api<void, ListTasksResponse>(
  { auth: true, expose: true, method: "GET", path: "/candidates/tasks" },
  async () => {
    const auth = getAuthData()!;
    
    if (!auth.tenantId) {
      throw new Error("Tenant ID required");
    }

    const tasks = await db.queryAll<{
      id: number;
      title: string;
      description: string | null;
      priority: string;
      status: string;
      due_date: Date | null;
      assigned_to: string | null;
      created_at: Date;
      completed_at: Date | null;
    }>`
      SELECT id, title, description, priority, status, due_date, assigned_to, created_at, completed_at
      FROM tasks 
      WHERE tenant_id = ${auth.tenantId}
      ORDER BY 
        CASE priority 
          WHEN 'high' THEN 1 
          WHEN 'medium' THEN 2 
          WHEN 'low' THEN 3 
        END,
        due_date ASC NULLS LAST,
        created_at DESC
    `;

    return {
      tasks: tasks.map(t => ({
        id: t.id,
        title: t.title,
        description: t.description || undefined,
        priority: t.priority,
        status: t.status,
        dueDate: t.due_date || undefined,
        assignedTo: t.assigned_to || undefined,
        createdAt: t.created_at,
        completedAt: t.completed_at || undefined,
      }))
    };
  }
);

// Creates a new task.
export const createTask = api<CreateTaskRequest, Task>(
  { auth: true, expose: true, method: "POST", path: "/candidates/tasks" },
  async (req) => {
    const auth = getAuthData()!;
    
    if (!auth.tenantId) {
      throw new Error("Tenant ID required");
    }

    const task = await db.queryRow<{
      id: number;
      title: string;
      description: string | null;
      priority: string;
      status: string;
      due_date: Date | null;
      assigned_to: string | null;
      created_at: Date;
    }>`
      INSERT INTO tasks (tenant_id, title, description, priority, due_date, assigned_to)
      VALUES (${auth.tenantId}, ${req.title}, ${req.description || null}, ${req.priority}, 
              ${req.dueDate || null}, ${req.assignedTo || null})
      RETURNING id, title, description, priority, status, due_date, assigned_to, created_at
    `;

    return {
      id: task!.id,
      title: task!.title,
      description: task!.description || undefined,
      priority: task!.priority,
      status: task!.status,
      dueDate: task!.due_date || undefined,
      assignedTo: task!.assigned_to || undefined,
      createdAt: task!.created_at,
    };
  }
);

// Updates an existing task.
export const updateTask = api<UpdateTaskRequest, Task>(
  { auth: true, expose: true, method: "PUT", path: "/candidates/tasks" },
  async (req) => {
    const auth = getAuthData()!;
    
    if (!auth.tenantId) {
      throw new Error("Tenant ID required");
    }

    // Build dynamic update query
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (req.title !== undefined) {
      updates.push(`title = $${paramIndex++}`);
      values.push(req.title);
    }
    if (req.description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      values.push(req.description);
    }
    if (req.priority !== undefined) {
      updates.push(`priority = $${paramIndex++}`);
      values.push(req.priority);
    }
    if (req.status !== undefined) {
      updates.push(`status = $${paramIndex++}`);
      values.push(req.status);
      if (req.status === 'completed') {
        updates.push(`completed_at = NOW()`);
      }
    }
    if (req.dueDate !== undefined) {
      updates.push(`due_date = $${paramIndex++}`);
      values.push(req.dueDate);
    }
    if (req.assignedTo !== undefined) {
      updates.push(`assigned_to = $${paramIndex++}`);
      values.push(req.assignedTo);
    }

    if (updates.length === 0) {
      throw new Error("No fields to update");
    }

    values.push(req.id, auth.tenantId);
    const whereClause = `WHERE id = $${paramIndex++} AND tenant_id = $${paramIndex++}`;

    const task = await db.rawQueryRow<{
      id: number;
      title: string;
      description: string | null;
      priority: string;
      status: string;
      due_date: Date | null;
      assigned_to: string | null;
      created_at: Date;
      completed_at: Date | null;
    }>(
      `UPDATE tasks SET ${updates.join(', ')} ${whereClause} 
       RETURNING id, title, description, priority, status, due_date, assigned_to, created_at, completed_at`,
      ...values
    );

    if (!task) {
      throw new Error("Task not found");
    }

    return {
      id: task.id,
      title: task.title,
      description: task.description || undefined,
      priority: task.priority,
      status: task.status,
      dueDate: task.due_date || undefined,
      assignedTo: task.assigned_to || undefined,
      createdAt: task.created_at,
      completedAt: task.completed_at || undefined,
    };
  }
);

import { Topic } from "encore.dev/pubsub";

// Data processing events
export interface DataUploadedEvent {
  tenantId: number;
  dataType: 'elections' | 'ibge' | 'polls';
  fileName: string;
  filePath: string;
  uploadedBy: string;
}

export interface DataProcessedEvent {
  tenantId: number;
  dataType: string;
  recordsProcessed: number;
  success: boolean;
  errors?: string[];
}

// AI agent events
export interface AgentTaskCreatedEvent {
  taskId: number;
  tenantId: number;
  agentId: number;
  taskType: string;
  inputData: any;
}

export interface AgentTaskCompletedEvent {
  taskId: number;
  tenantId: number;
  agentId: number;
  success: boolean;
  outputData?: any;
  error?: string;
}

// Notification events
export interface NotificationEvent {
  tenantId: number;
  type: 'insight' | 'task' | 'alert';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
}

export const dataUploadedTopic = new Topic<DataUploadedEvent>("data-uploaded", {
  deliveryGuarantee: "at-least-once",
});

export const dataProcessedTopic = new Topic<DataProcessedEvent>("data-processed", {
  deliveryGuarantee: "at-least-once",
});

export const agentTaskCreatedTopic = new Topic<AgentTaskCreatedEvent>("agent-task-created", {
  deliveryGuarantee: "at-least-once",
});

export const agentTaskCompletedTopic = new Topic<AgentTaskCompletedEvent>("agent-task-completed", {
  deliveryGuarantee: "at-least-once",
});

export const notificationTopic = new Topic<NotificationEvent>("notification", {
  deliveryGuarantee: "at-least-once",
});

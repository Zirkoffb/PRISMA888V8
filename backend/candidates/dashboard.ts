import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../shared/db";

export interface DashboardStats {
  totalVotes: number;
  votingPercentage: number;
  pollRating: number;
  activeInsights: number;
  pendingTasks: number;
}

export interface RecentInsight {
  id: number;
  title: string;
  description: string;
  type: string;
  priority: string;
  createdAt: Date;
  isRead: boolean;
}

export interface DashboardResponse {
  stats: DashboardStats;
  recentInsights: RecentInsight[];
  upcomingTasks: {
    id: number;
    title: string;
    dueDate: Date | null;
    priority: string;
  }[];
}

// Gets dashboard data for the candidate.
export const getDashboard = api<void, DashboardResponse>(
  { auth: true, expose: true, method: "GET", path: "/candidates/dashboard" },
  async () => {
    const auth = getAuthData()!;
    
    if (!auth.tenantId) {
      throw new Error("Tenant ID required");
    }

    // Get vote statistics
    const voteStats = await db.queryRow<{
      total_votes: number;
      vote_percentage: number;
    }>`
      SELECT 
        COALESCE(SUM(votes), 0) as total_votes,
        COALESCE(AVG(percentage), 0) as vote_percentage
      FROM elections 
      WHERE tenant_id = ${auth.tenantId}
    `;

    // Get latest poll rating
    const pollRating = await db.queryRow<{ avg_intention: number }>`
      SELECT COALESCE(AVG(intention_percentage), 0) as avg_intention
      FROM polls 
      WHERE tenant_id = ${auth.tenantId}
      ORDER BY date_conducted DESC
      LIMIT 5
    `;

    // Get insights count
    const insightsCount = await db.queryRow<{ count: number }>`
      SELECT COUNT(*) as count
      FROM insights 
      WHERE tenant_id = ${auth.tenantId} AND is_read = false
    `;

    // Get pending tasks count
    const tasksCount = await db.queryRow<{ count: number }>`
      SELECT COUNT(*) as count
      FROM tasks 
      WHERE tenant_id = ${auth.tenantId} AND status = 'pending'
    `;

    // Get recent insights
    const recentInsights = await db.queryAll<{
      id: number;
      title: string;
      description: string;
      type: string;
      priority: string;
      created_at: Date;
      is_read: boolean;
    }>`
      SELECT id, title, description, type, priority, created_at, is_read
      FROM insights 
      WHERE tenant_id = ${auth.tenantId}
      ORDER BY created_at DESC
      LIMIT 5
    `;

    // Get upcoming tasks
    const upcomingTasks = await db.queryAll<{
      id: number;
      title: string;
      due_date: Date | null;
      priority: string;
    }>`
      SELECT id, title, due_date, priority
      FROM tasks 
      WHERE tenant_id = ${auth.tenantId} AND status = 'pending'
      ORDER BY due_date ASC NULLS LAST
      LIMIT 5
    `;

    return {
      stats: {
        totalVotes: voteStats?.total_votes || 0,
        votingPercentage: voteStats?.vote_percentage || 0,
        pollRating: pollRating?.avg_intention || 0,
        activeInsights: insightsCount?.count || 0,
        pendingTasks: tasksCount?.count || 0,
      },
      recentInsights: recentInsights.map(i => ({
        id: i.id,
        title: i.title,
        description: i.description,
        type: i.type,
        priority: i.priority,
        createdAt: i.created_at,
        isRead: i.is_read,
      })),
      upcomingTasks: upcomingTasks.map(t => ({
        id: t.id,
        title: t.title,
        dueDate: t.due_date,
        priority: t.priority,
      })),
    };
  }
);

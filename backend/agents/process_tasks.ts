import { Subscription } from "encore.dev/pubsub";
import { agentTaskCreatedTopic, agentTaskCompletedTopic, notificationTopic } from "../shared/events";
import db from "../shared/db";

// Processes AI agent tasks
new Subscription(agentTaskCreatedTopic, "process-agent-tasks", {
  handler: async (event) => {
    try {
      // Update task status to 'processing'
      await db.exec`
        UPDATE agent_tasks 
        SET status = 'processing', started_at = NOW()
        WHERE id = ${event.taskId}
      `;

      // Get agent details
      const agent = await db.queryRow`
        SELECT name, type, capabilities FROM agents WHERE id = ${event.agentId}
      `;

      if (!agent) {
        throw new Error("Agent not found");
      }

      // Simulate AI processing based on agent type
      const outputData = await processAgentTask(agent.type, event.inputData);

      // Update task with results
      await db.exec`
        UPDATE agent_tasks 
        SET status = 'completed', completed_at = NOW(), output_data = ${JSON.stringify(outputData)}
        WHERE id = ${event.taskId}
      `;

      // Create insight if applicable
      if (outputData.insight) {
        await db.exec`
          INSERT INTO insights (tenant_id, title, description, type, data, priority)
          VALUES (${event.tenantId}, ${outputData.insight.title}, ${outputData.insight.description},
                  ${agent.type}, ${JSON.stringify(outputData)}, ${outputData.insight.priority || 'medium'})
        `;

        // Send notification
        await notificationTopic.publish({
          tenantId: event.tenantId,
          type: 'insight',
          title: outputData.insight.title,
          message: outputData.insight.description,
          priority: outputData.insight.priority || 'medium',
        });
      }

      await agentTaskCompletedTopic.publish({
        taskId: event.taskId,
        tenantId: event.tenantId,
        agentId: event.agentId,
        success: true,
        outputData,
      });
    } catch (error) {
      await db.exec`
        UPDATE agent_tasks 
        SET status = 'failed', completed_at = NOW()
        WHERE id = ${event.taskId}
      `;

      await agentTaskCompletedTopic.publish({
        taskId: event.taskId,
        tenantId: event.tenantId,
        agentId: event.agentId,
        success: false,
        error: String(error),
      });
    }
  }
});

async function processAgentTask(agentType: string, inputData: any): Promise<any> {
  // Simulate AI processing with different responses based on agent type
  await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate processing time

  switch (agentType) {
    case 'data_analysis':
      return {
        analysis: "Community analysis completed",
        segments: [
          { name: "Young Professionals", percentage: 35, characteristics: ["High income", "Urban"] },
          { name: "Seniors", percentage: 28, characteristics: ["Fixed income", "Healthcare concerns"] },
          { name: "Families", percentage: 37, characteristics: ["Education focused", "Suburban"] }
        ],
        insight: {
          title: "Community Segmentation Analysis",
          description: "Identified 3 key voter segments with distinct characteristics and priorities",
          priority: "high"
        }
      };

    case 'poll_analysis':
      return {
        analysis: "Poll interpretation completed",
        trends: [
          { metric: "Intention", value: 42, change: "+3%" },
          { metric: "Rejection", value: 25, change: "-2%" },
          { metric: "Undecided", value: 33, change: "-1%" }
        ],
        insight: {
          title: "Poll Trend Analysis",
          description: "Positive momentum detected with 3% increase in voting intention",
          priority: "high"
        }
      };

    case 'strategy':
      return {
        recommendations: [
          "Focus on healthcare messaging for senior segments",
          "Increase digital outreach for young professionals",
          "Prioritize education policy for family segments"
        ],
        insight: {
          title: "Strategic Recommendations",
          description: "Generated targeted messaging strategy based on voter segments",
          priority: "medium"
        }
      };

    case 'content':
      return {
        content: {
          messages: [
            "Healthcare for all - your well-being is our priority",
            "Investing in education today for a better tomorrow",
            "Creating opportunities for young professionals"
          ],
          channels: ["social_media", "radio", "digital_ads"]
        },
        insight: {
          title: "Content Strategy Generated",
          description: "Created targeted messaging for key voter segments",
          priority: "medium"
        }
      };

    default:
      return {
        analysis: "Generic processing completed",
        insight: {
          title: "Analysis Complete",
          description: "Data processing finished successfully",
          priority: "low"
        }
      };
  }
}

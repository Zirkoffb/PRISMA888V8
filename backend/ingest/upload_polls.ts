import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { uploadsBucket } from "./storage";
import { dataUploadedTopic } from "../shared/events";

export interface UploadPollsRequest {
  fileName: string;
  fileData: string; // base64 encoded
}

export interface UploadPollsResponse {
  success: boolean;
  message: string;
  filePath: string;
}

// Uploads polls data for processing.
export const uploadPolls = api<UploadPollsRequest, UploadPollsResponse>(
  { auth: true, expose: true, method: "POST", path: "/ingest/polls" },
  async (req) => {
    const auth = getAuthData()!;
    
    if (!auth.tenantId) {
      throw new Error("Tenant ID required");
    }

    try {
      const fileBuffer = Buffer.from(req.fileData, 'base64');
      const timestamp = Date.now();
      const filePath = `polls/${auth.tenantId}/${timestamp}_${req.fileName}`;
      
      await uploadsBucket.upload(filePath, fileBuffer, {
        contentType: req.fileName.endsWith('.pdf') ? 'application/pdf' : 'text/csv'
      });

      await dataUploadedTopic.publish({
        tenantId: auth.tenantId,
        dataType: 'polls',
        fileName: req.fileName,
        filePath,
        uploadedBy: auth.email,
      });

      return {
        success: true,
        message: "Polls data uploaded successfully",
        filePath,
      };
    } catch (error) {
      return {
        success: false,
        message: `Upload failed: ${error}`,
        filePath: "",
      };
    }
  }
);

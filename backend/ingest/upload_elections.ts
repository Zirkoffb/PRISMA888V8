import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { uploadsBucket } from "./storage";
import { dataUploadedTopic } from "../shared/events";

export interface UploadElectionsRequest {
  fileName: string;
  fileData: string; // base64 encoded
}

export interface UploadElectionsResponse {
  success: boolean;
  message: string;
  filePath: string;
}

// Uploads elections CSV data for processing.
export const uploadElections = api<UploadElectionsRequest, UploadElectionsResponse>(
  { auth: true, expose: true, method: "POST", path: "/ingest/elections" },
  async (req) => {
    const auth = getAuthData()!;
    
    if (!auth.tenantId) {
      throw new Error("Tenant ID required");
    }

    try {
      // Decode base64 file data
      const fileBuffer = Buffer.from(req.fileData, 'base64');
      
      // Generate unique file path
      const timestamp = Date.now();
      const filePath = `elections/${auth.tenantId}/${timestamp}_${req.fileName}`;
      
      // Upload to object storage
      await uploadsBucket.upload(filePath, fileBuffer, {
        contentType: 'text/csv'
      });

      // Publish event for async processing
      await dataUploadedTopic.publish({
        tenantId: auth.tenantId,
        dataType: 'elections',
        fileName: req.fileName,
        filePath,
        uploadedBy: auth.email,
      });

      return {
        success: true,
        message: "Elections data uploaded successfully",
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

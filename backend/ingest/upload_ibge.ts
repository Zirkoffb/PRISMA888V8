import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { uploadsBucket } from "./storage";
import { dataUploadedTopic } from "../shared/events";

export interface UploadIBGERequest {
  fileName: string;
  fileData: string; // base64 encoded
}

export interface UploadIBGEResponse {
  success: boolean;
  message: string;
  filePath: string;
}

// Uploads IBGE demographic data for processing.
export const uploadIBGE = api<UploadIBGERequest, UploadIBGEResponse>(
  { auth: true, expose: true, method: "POST", path: "/ingest/ibge" },
  async (req) => {
    const auth = getAuthData()!;
    
    if (!auth.tenantId) {
      throw new Error("Tenant ID required");
    }

    try {
      const fileBuffer = Buffer.from(req.fileData, 'base64');
      const timestamp = Date.now();
      const filePath = `ibge/${auth.tenantId}/${timestamp}_${req.fileName}`;
      
      await uploadsBucket.upload(filePath, fileBuffer, {
        contentType: 'text/csv'
      });

      await dataUploadedTopic.publish({
        tenantId: auth.tenantId,
        dataType: 'ibge',
        fileName: req.fileName,
        filePath,
        uploadedBy: auth.email,
      });

      return {
        success: true,
        message: "IBGE data uploaded successfully",
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

import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../shared/db";
import { Bucket } from "encore.dev/storage/objects";

const vaultBucket = new Bucket("prisma888-vault");

export interface Document {
  id: number;
  name: string;
  type: string;
  sizeBytes: number;
  tags: string[];
  uploadedBy: string;
  uploadedAt: Date;
}

export interface UploadDocumentRequest {
  name: string;
  type: string;
  fileData: string; // base64 encoded
  tags?: string[];
}

export interface ListDocumentsResponse {
  documents: Document[];
}

// Lists all documents in the vault.
export const listDocuments = api<void, ListDocumentsResponse>(
  { auth: true, expose: true, method: "GET", path: "/candidates/vault" },
  async () => {
    const auth = getAuthData()!;
    
    if (!auth.tenantId) {
      throw new Error("Tenant ID required");
    }

    const documents = await db.queryAll<{
      id: number;
      name: string;
      type: string;
      size_bytes: number;
      tags: string[];
      uploaded_by: string;
      uploaded_at: Date;
    }>`
      SELECT id, name, type, size_bytes, tags, uploaded_by, uploaded_at
      FROM documents 
      WHERE tenant_id = ${auth.tenantId}
      ORDER BY uploaded_at DESC
    `;

    return {
      documents: documents.map(d => ({
        id: d.id,
        name: d.name,
        type: d.type,
        sizeBytes: d.size_bytes,
        tags: d.tags,
        uploadedBy: d.uploaded_by,
        uploadedAt: d.uploaded_at,
      }))
    };
  }
);

// Uploads a document to the vault.
export const uploadDocument = api<UploadDocumentRequest, Document>(
  { auth: true, expose: true, method: "POST", path: "/candidates/vault" },
  async (req) => {
    const auth = getAuthData()!;
    
    if (!auth.tenantId) {
      throw new Error("Tenant ID required");
    }

    try {
      const fileBuffer = Buffer.from(req.fileData, 'base64');
      const timestamp = Date.now();
      const filePath = `vault/${auth.tenantId}/${timestamp}_${req.name}`;
      
      await vaultBucket.upload(filePath, fileBuffer, {
        contentType: req.type
      });

      const document = await db.queryRow<{
        id: number;
        name: string;
        type: string;
        size_bytes: number;
        tags: string[];
        uploaded_by: string;
        uploaded_at: Date;
      }>`
        INSERT INTO documents (tenant_id, name, type, size_bytes, file_path, tags, uploaded_by)
        VALUES (${auth.tenantId}, ${req.name}, ${req.type}, ${fileBuffer.length}, 
                ${filePath}, ${req.tags || []}, ${auth.email})
        RETURNING id, name, type, size_bytes, tags, uploaded_by, uploaded_at
      `;

      return {
        id: document!.id,
        name: document!.name,
        type: document!.type,
        sizeBytes: document!.size_bytes,
        tags: document!.tags,
        uploadedBy: document!.uploaded_by,
        uploadedAt: document!.uploaded_at,
      };
    } catch (error) {
      throw new Error(`Upload failed: ${error}`);
    }
  }
);

// Downloads a document from the vault.
export const downloadDocument = api<{ id: number }, { fileName: string; fileData: string }>(
  { auth: true, expose: true, method: "GET", path: "/candidates/vault/:id" },
  async (params) => {
    const auth = getAuthData()!;
    
    if (!auth.tenantId) {
      throw new Error("Tenant ID required");
    }

    const document = await db.queryRow<{
      name: string;
      file_path: string;
    }>`
      SELECT name, file_path
      FROM documents 
      WHERE id = ${params.id} AND tenant_id = ${auth.tenantId}
    `;

    if (!document) {
      throw new Error("Document not found");
    }

    const fileBuffer = await vaultBucket.download(document.file_path);
    const fileData = fileBuffer.toString('base64');

    return {
      fileName: document.name,
      fileData,
    };
  }
);

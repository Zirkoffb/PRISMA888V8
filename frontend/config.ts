// PRISMA888 Configuration
// This file contains configuration values for the frontend application

// The base URL for the API backend
// TODO: Update this when deploying to production
export const apiBaseUrl = "http://localhost:4000";

// Subdomain configuration for multi-tenant routing
// In production, this should be automatically detected from the hostname
export const defaultSubdomain = "demo";

// Application metadata
export const appName = "PRISMA888";
export const appDescription = "Electoral Intelligence Platform";
export const appVersion = "1.0.0";

// Theme configuration for Prisma Noir design system
export const theme = {
  name: "Prisma Noir",
  darkMode: true,
  primaryColor: "blue",
  accentColor: "purple",
};

// Feature flags
export const features = {
  aiAgents: true,
  dataUpload: true,
  mapVisualization: true,
  taskManagement: true,
  documentVault: true,
  multiTenant: true,
};

// File upload configuration
export const upload = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: {
    csv: [".csv"],
    pdf: [".pdf"],
    images: [".jpg", ".jpeg", ".png", ".gif"],
    documents: [".doc", ".docx", ".pdf", ".txt"],
  },
};

import { Header, APIError, Gateway } from "encore.dev/api";
import { authHandler } from "encore.dev/auth";
import db from "./db";

interface AuthParams {
  authorization?: Header<"Authorization">;
  subdomain?: Header<"X-Subdomain">;
}

export interface AuthData {
  userID: string;
  email: string;
  name: string;
  role: 'admin' | 'candidate' | 'analyst';
  tenantId?: number;
  subdomain?: string;
}

export const auth = authHandler<AuthParams, AuthData>(
  async (data) => {
    const token = data.authorization?.replace("Bearer ", "");
    if (!token) {
      throw APIError.unauthenticated("missing token");
    }

    // In a real implementation, you'd validate the JWT token here
    // For this example, we'll decode a simple format: "user_id:email:name:role"
    try {
      const [userID, email, name, role] = token.split(":");
      
      if (!userID || !email || !name || !role) {
        throw APIError.unauthenticated("invalid token format");
      }

      // Get user data from database
      const user = await db.queryRow`
        SELECT u.*, t.subdomain 
        FROM users u 
        LEFT JOIN tenants t ON u.tenant_id = t.id 
        WHERE u.email = ${email} AND u.is_active = true
      `;

      if (!user) {
        throw APIError.unauthenticated("user not found");
      }

      // For admin users, they can access any tenant via subdomain
      let tenantId = user.tenant_id;
      let subdomain = user.subdomain;

      if (role === 'admin' && data.subdomain) {
        const tenant = await db.queryRow`
          SELECT id, subdomain FROM tenants WHERE subdomain = ${data.subdomain} AND is_active = true
        `;
        if (tenant) {
          tenantId = tenant.id;
          subdomain = tenant.subdomain;
        }
      }

      return {
        userID,
        email,
        name,
        role: role as 'admin' | 'candidate' | 'analyst',
        tenantId,
        subdomain,
      };
    } catch (err) {
      throw APIError.unauthenticated("invalid token", err as Error);
    }
  }
);

export const gw = new Gateway({ authHandler: auth });

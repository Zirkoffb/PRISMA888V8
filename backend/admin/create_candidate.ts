import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../shared/db";

export interface CreateCandidateRequest {
  subdomain: string;
  name: string;
  candidateName: string;
  position: string;
  party?: string;
  electionYear: number;
  city: string;
  state: string;
  assigned_agent_id?: number;
  government_plan?: {
    filename: string;
    content: string;
    strategic_axes?: any;
  };
}

export interface CreateCandidateResponse {
  id: number;
  subdomain: string;
}

// Creates a new candidate tenant.
export const createCandidate = api<CreateCandidateRequest, CreateCandidateResponse>(
  { auth: true, expose: true, method: "POST", path: "/admin/candidates" },
  async (req) => {
    const auth = getAuthData()!;
    
    if (auth.role !== 'admin') {
      throw new Error("Only admin users can create candidates");
    }

    // Check if subdomain already exists
    const existing = await db.queryRow`
      SELECT id FROM tenants WHERE subdomain = ${req.subdomain}
    `;
    
    if (existing) {
      throw new Error("Subdomain already exists");
    }

    const tenant = await db.queryRow<{ id: number }>`
      INSERT INTO tenants (subdomain, name, candidate_name, position, party, election_year, city, state, assigned_agent_id)
      VALUES (${req.subdomain}, ${req.name}, ${req.candidateName}, ${req.position}, 
              ${req.party || null}, ${req.electionYear}, ${req.city}, ${req.state}, ${req.assigned_agent_id || null})
      RETURNING id
    `;

    // Process government plan if provided
    if (req.government_plan) {
      await db.query`
        INSERT INTO government_plans (tenant_id, filename, file_path, strategic_axes)
        VALUES (${tenant!.id}, ${req.government_plan.filename}, 
                ${`/plans/${tenant!.id}/${req.government_plan.filename}`}, 
                ${JSON.stringify(req.government_plan.strategic_axes || {})})
      `;
    }

    return {
      id: tenant!.id,
      subdomain: req.subdomain,
    };
  }
);

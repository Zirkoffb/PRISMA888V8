import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../shared/db";

export interface Candidate {
  id: number;
  subdomain: string;
  name: string;
  candidateName: string;
  position: string;
  party?: string;
  electionYear: number;
  city: string;
  state: string;
  isActive: boolean;
  createdAt: Date;
}

export interface ListCandidatesResponse {
  candidates: Candidate[];
}

// Lists all candidates for admin users.
export const listCandidates = api<void, ListCandidatesResponse>(
  { auth: true, expose: true, method: "GET", path: "/admin/candidates" },
  async () => {
    const auth = getAuthData()!;
    
    if (auth.role !== 'admin') {
      throw new Error("Only admin users can list all candidates");
    }

    const candidates = await db.queryAll<{
      id: number;
      subdomain: string;
      name: string;
      candidate_name: string;
      position: string;
      party: string | null;
      election_year: number;
      city: string;
      state: string;
      is_active: boolean;
      created_at: Date;
    }>`
      SELECT id, subdomain, name, candidate_name, position, party, 
             election_year, city, state, is_active, created_at
      FROM tenants 
      ORDER BY created_at DESC
    `;

    return {
      candidates: candidates.map(c => ({
        id: c.id,
        subdomain: c.subdomain,
        name: c.name,
        candidateName: c.candidate_name,
        position: c.position,
        party: c.party || undefined,
        electionYear: c.election_year,
        city: c.city,
        state: c.state,
        isActive: c.is_active,
        createdAt: c.created_at,
      }))
    };
  }
);

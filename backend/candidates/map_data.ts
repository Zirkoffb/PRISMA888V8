import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../shared/db";

export interface MapZone {
  zone: string;
  totalVotes: number;
  percentage: number;
  population: number;
  demographics: {
    ageGroups: { [key: string]: number };
    incomeGroups: { [key: string]: number };
    educationGroups: { [key: string]: number };
  };
}

export interface MapDataResponse {
  zones: MapZone[];
}

// Gets electoral map data with demographics.
export const getMapData = api<void, MapDataResponse>(
  { auth: true, expose: true, method: "GET", path: "/candidates/map" },
  async () => {
    const auth = getAuthData()!;
    
    if (!auth.tenantId) {
      throw new Error("Tenant ID required");
    }

    const zones = await db.queryAll<{
      zone: string;
      total_votes: number;
      avg_percentage: number;
      population: number;
      age_0_17: number;
      age_18_24: number;
      age_25_34: number;
      age_35_44: number;
      age_45_54: number;
      age_55_64: number;
      age_65_plus: number;
      income_0_2: number;
      income_2_5: number;
      income_5_10: number;
      income_10_plus: number;
      education_fundamental: number;
      education_medio: number;
      education_superior: number;
    }>`
      SELECT 
        e.zone,
        COALESCE(SUM(e.votes), 0) as total_votes,
        COALESCE(AVG(e.percentage), 0) as avg_percentage,
        COALESCE(i.population, 0) as population,
        COALESCE(i.age_0_17, 0) as age_0_17,
        COALESCE(i.age_18_24, 0) as age_18_24,
        COALESCE(i.age_25_34, 0) as age_25_34,
        COALESCE(i.age_35_44, 0) as age_35_44,
        COALESCE(i.age_45_54, 0) as age_45_54,
        COALESCE(i.age_55_64, 0) as age_55_64,
        COALESCE(i.age_65_plus, 0) as age_65_plus,
        COALESCE(i.income_0_2, 0) as income_0_2,
        COALESCE(i.income_2_5, 0) as income_2_5,
        COALESCE(i.income_5_10, 0) as income_5_10,
        COALESCE(i.income_10_plus, 0) as income_10_plus,
        COALESCE(i.education_fundamental, 0) as education_fundamental,
        COALESCE(i.education_medio, 0) as education_medio,
        COALESCE(i.education_superior, 0) as education_superior
      FROM elections e
      LEFT JOIN ibge_data i ON e.zone = i.zone AND e.tenant_id = i.tenant_id
      WHERE e.tenant_id = ${auth.tenantId}
      GROUP BY e.zone, i.population, i.age_0_17, i.age_18_24, i.age_25_34, i.age_35_44,
               i.age_45_54, i.age_55_64, i.age_65_plus, i.income_0_2, i.income_2_5,
               i.income_5_10, i.income_10_plus, i.education_fundamental, i.education_medio,
               i.education_superior
      ORDER BY e.zone
    `;

    return {
      zones: zones.map(z => ({
        zone: z.zone,
        totalVotes: z.total_votes,
        percentage: z.avg_percentage,
        population: z.population,
        demographics: {
          ageGroups: {
            "0-17": z.age_0_17,
            "18-24": z.age_18_24,
            "25-34": z.age_25_34,
            "35-44": z.age_35_44,
            "45-54": z.age_45_54,
            "55-64": z.age_55_64,
            "65+": z.age_65_plus,
          },
          incomeGroups: {
            "0-2SM": z.income_0_2,
            "2-5SM": z.income_2_5,
            "5-10SM": z.income_5_10,
            "10+SM": z.income_10_plus,
          },
          educationGroups: {
            "Fundamental": z.education_fundamental,
            "Médio": z.education_medio,
            "Superior": z.education_superior,
          },
        },
      }))
    };
  }
);

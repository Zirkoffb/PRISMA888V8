import { Subscription } from "encore.dev/pubsub";
import { dataUploadedTopic, dataProcessedTopic } from "../shared/events";
import { uploadsBucket } from "./storage";
import db from "../shared/db";

// Processes uploaded data files
new Subscription(dataUploadedTopic, "process-uploaded-data", {
  handler: async (event) => {
    try {
      const fileBuffer = await uploadsBucket.download(event.filePath);
      const fileContent = fileBuffer.toString('utf-8');
      
      let recordsProcessed = 0;
      const errors: string[] = [];

      switch (event.dataType) {
        case 'elections':
          recordsProcessed = await processElectionsCSV(event.tenantId, fileContent, errors);
          break;
        case 'ibge':
          recordsProcessed = await processIBGECSV(event.tenantId, fileContent, errors);
          break;
        case 'polls':
          recordsProcessed = await processPollsData(event.tenantId, fileContent, errors);
          break;
      }

      await dataProcessedTopic.publish({
        tenantId: event.tenantId,
        dataType: event.dataType,
        recordsProcessed,
        success: errors.length === 0,
        errors: errors.length > 0 ? errors : undefined,
      });
    } catch (error) {
      await dataProcessedTopic.publish({
        tenantId: event.tenantId,
        dataType: event.dataType,
        recordsProcessed: 0,
        success: false,
        errors: [`Processing error: ${error}`],
      });
    }
  }
});

async function processElectionsCSV(tenantId: number, content: string, errors: string[]): Promise<number> {
  const lines = content.split('\n').slice(1); // Skip header
  let processed = 0;

  for (const line of lines) {
    if (line.trim() === '') continue;
    
    try {
      const [zone, section, candidateName, party, votes, percentage, electionType, year] = line.split(',');
      
      await db.exec`
        INSERT INTO elections (tenant_id, zone, section, candidate_name, party, votes, percentage, election_type, year)
        VALUES (${tenantId}, ${zone}, ${section}, ${candidateName}, ${party}, ${parseInt(votes)}, 
                ${parseFloat(percentage)}, ${electionType}, ${parseInt(year)})
      `;
      processed++;
    } catch (error) {
      errors.push(`Error processing line: ${line} - ${error}`);
    }
  }

  return processed;
}

async function processIBGECSV(tenantId: number, content: string, errors: string[]): Promise<number> {
  const lines = content.split('\n').slice(1); // Skip header
  let processed = 0;

  for (const line of lines) {
    if (line.trim() === '') continue;
    
    try {
      const [zone, neighborhood, population, age_0_17, age_18_24, age_25_34, age_35_44, 
             age_45_54, age_55_64, age_65_plus, income_0_2, income_2_5, income_5_10, 
             income_10_plus, education_fundamental, education_medio, education_superior] = line.split(',');
      
      await db.exec`
        INSERT INTO ibge_data (tenant_id, zone, neighborhood, population, age_0_17, age_18_24, 
                              age_25_34, age_35_44, age_45_54, age_55_64, age_65_plus,
                              income_0_2, income_2_5, income_5_10, income_10_plus,
                              education_fundamental, education_medio, education_superior)
        VALUES (${tenantId}, ${zone}, ${neighborhood}, ${parseInt(population)}, 
                ${parseInt(age_0_17)}, ${parseInt(age_18_24)}, ${parseInt(age_25_34)},
                ${parseInt(age_35_44)}, ${parseInt(age_45_54)}, ${parseInt(age_55_64)},
                ${parseInt(age_65_plus)}, ${parseInt(income_0_2)}, ${parseInt(income_2_5)},
                ${parseInt(income_5_10)}, ${parseInt(income_10_plus)}, ${parseInt(education_fundamental)},
                ${parseInt(education_medio)}, ${parseInt(education_superior)})
      `;
      processed++;
    } catch (error) {
      errors.push(`Error processing line: ${line} - ${error}`);
    }
  }

  return processed;
}

async function processPollsData(tenantId: number, content: string, errors: string[]): Promise<number> {
  const lines = content.split('\n').slice(1); // Skip header
  let processed = 0;

  for (const line of lines) {
    if (line.trim() === '') continue;
    
    try {
      const [pollName, dateConducted, sampleSize, candidateName, intentionPercentage, 
             rejectionPercentage, confidenceLevel, marginError, methodology] = line.split(',');
      
      await db.exec`
        INSERT INTO polls (tenant_id, poll_name, date_conducted, sample_size, candidate_name,
                          intention_percentage, rejection_percentage, confidence_level, 
                          margin_error, methodology)
        VALUES (${tenantId}, ${pollName}, ${dateConducted}, ${parseInt(sampleSize)}, 
                ${candidateName}, ${parseFloat(intentionPercentage)}, ${parseFloat(rejectionPercentage)},
                ${parseFloat(confidenceLevel)}, ${parseFloat(marginError)}, ${methodology})
      `;
      processed++;
    } catch (error) {
      errors.push(`Error processing line: ${line} - ${error}`);
    }
  }

  return processed;
}

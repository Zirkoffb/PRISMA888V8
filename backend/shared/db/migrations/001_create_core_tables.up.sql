-- Tenants (candidates/campaigns)
CREATE TABLE tenants (
  id BIGSERIAL PRIMARY KEY,
  subdomain VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  candidate_name VARCHAR(255) NOT NULL,
  position VARCHAR(255) NOT NULL,
  party VARCHAR(100),
  election_year INTEGER NOT NULL,
  city VARCHAR(255) NOT NULL,
  state VARCHAR(2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Users (admin and candidate users)
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'candidate', 'analyst')),
  tenant_id BIGINT REFERENCES tenants(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Elections data
CREATE TABLE elections (
  id BIGSERIAL PRIMARY KEY,
  tenant_id BIGINT REFERENCES tenants(id),
  zone VARCHAR(10) NOT NULL,
  section VARCHAR(10) NOT NULL,
  candidate_name VARCHAR(255) NOT NULL,
  party VARCHAR(100),
  votes INTEGER NOT NULL,
  percentage DOUBLE PRECISION,
  election_type VARCHAR(50) NOT NULL,
  year INTEGER NOT NULL,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- IBGE demographic data
CREATE TABLE ibge_data (
  id BIGSERIAL PRIMARY KEY,
  tenant_id BIGINT REFERENCES tenants(id),
  zone VARCHAR(10),
  neighborhood VARCHAR(255),
  population INTEGER,
  age_0_17 INTEGER,
  age_18_24 INTEGER,
  age_25_34 INTEGER,
  age_35_44 INTEGER,
  age_45_54 INTEGER,
  age_55_64 INTEGER,
  age_65_plus INTEGER,
  income_0_2 INTEGER,
  income_2_5 INTEGER,
  income_5_10 INTEGER,
  income_10_plus INTEGER,
  education_fundamental INTEGER,
  education_medio INTEGER,
  education_superior INTEGER,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Polls data
CREATE TABLE polls (
  id BIGSERIAL PRIMARY KEY,
  tenant_id BIGINT REFERENCES tenants(id),
  poll_name VARCHAR(255) NOT NULL,
  date_conducted DATE NOT NULL,
  sample_size INTEGER,
  candidate_name VARCHAR(255) NOT NULL,
  intention_percentage DOUBLE PRECISION,
  rejection_percentage DOUBLE PRECISION,
  confidence_level DOUBLE PRECISION,
  margin_error DOUBLE PRECISION,
  methodology TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Agents
CREATE TABLE agents (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(100) NOT NULL,
  capabilities TEXT[],
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agent Tasks
CREATE TABLE agent_tasks (
  id BIGSERIAL PRIMARY KEY,
  tenant_id BIGINT REFERENCES tenants(id),
  agent_id BIGINT REFERENCES agents(id),
  task_type VARCHAR(100) NOT NULL,
  input_data JSONB,
  output_data JSONB,
  status VARCHAR(50) DEFAULT 'pending',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tasks for candidate dashboard
CREATE TABLE tasks (
  id BIGSERIAL PRIMARY KEY,
  tenant_id BIGINT REFERENCES tenants(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  priority VARCHAR(20) DEFAULT 'medium',
  status VARCHAR(50) DEFAULT 'pending',
  due_date DATE,
  assigned_to VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Document vault
CREATE TABLE documents (
  id BIGSERIAL PRIMARY KEY,
  tenant_id BIGINT REFERENCES tenants(id),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL,
  size_bytes BIGINT,
  file_path VARCHAR(500),
  tags VARCHAR(255)[],
  uploaded_by VARCHAR(255),
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analytics insights
CREATE TABLE insights (
  id BIGSERIAL PRIMARY KEY,
  tenant_id BIGINT REFERENCES tenants(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(100) NOT NULL,
  data JSONB,
  priority VARCHAR(20) DEFAULT 'medium',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  is_read BOOLEAN DEFAULT false
);

-- Create indexes for performance
CREATE INDEX idx_tenants_subdomain ON tenants(subdomain);
CREATE INDEX idx_users_tenant_id ON users(tenant_id);
CREATE INDEX idx_elections_tenant_id ON elections(tenant_id);
CREATE INDEX idx_ibge_data_tenant_id ON ibge_data(tenant_id);
CREATE INDEX idx_polls_tenant_id ON polls(tenant_id);
CREATE INDEX idx_agent_tasks_tenant_id ON agent_tasks(tenant_id);
CREATE INDEX idx_tasks_tenant_id ON tasks(tenant_id);
CREATE INDEX idx_documents_tenant_id ON documents(tenant_id);
CREATE INDEX idx_insights_tenant_id ON insights(tenant_id);

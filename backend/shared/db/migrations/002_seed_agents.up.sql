-- Insert default AI agents
INSERT INTO agents (name, description, type, capabilities) VALUES
('Community Analyzer', 'Analyzes demographic and electoral data to identify community patterns and voter behavior', 'data_analysis', ARRAY['demographic_analysis', 'voting_patterns', 'community_segmentation']),
('Poll Interpreter', 'Processes and interprets polling data to provide strategic insights', 'poll_analysis', ARRAY['poll_interpretation', 'trend_analysis', 'voter_sentiment']),
('Electoral Strategist', 'Provides strategic recommendations based on electoral and demographic data', 'strategy', ARRAY['campaign_strategy', 'voter_targeting', 'resource_allocation']),
('Content Generator', 'Generates content and messaging based on voter data and campaign goals', 'content', ARRAY['content_creation', 'message_optimization', 'audience_targeting']);

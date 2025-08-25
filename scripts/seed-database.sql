-- Seed script for development data
-- This script will be run after migrations to populate initial data

-- Insert sample users (for development only)
INSERT INTO users (address, nonce) VALUES 
('0x742d35Cc6634C0532925a3b8D4C9db96590c6C87', NULL),
('0x8ba1f109551bD432803012645Hac136c9c1e3a9f', NULL)
ON CONFLICT (address) DO NOTHING;

-- Insert sample tasks
INSERT INTO tasks (title, description, status, "userId") VALUES 
('Setup Development Environment', 'Configure local development environment with all necessary tools', 'processed', 1),
('Create Database Schema', 'Design and implement the database schema for the task management system', 'processed', 1),
('Implement Authentication', 'Add Web3 wallet authentication using Reown SDK', 'pending', 1),
('Build Task Dashboard', 'Create a responsive dashboard for managing tasks', 'pending', 2),
('Add Real-time Updates', 'Implement WebSocket connections for real-time task updates', 'pending', 2)
ON CONFLICT DO NOTHING;

-- Insert sample task logs
INSERT INTO task_logs ("taskId", action, details) VALUES 
(1, 'processed', 'Development environment setup completed successfully'),
(2, 'processed', 'Database schema created and migrated'),
(1, 'updated', 'Added additional development tools'),
(2, 'updated', 'Optimized database indexes for better performance')
ON CONFLICT DO NOTHING;

-- Create database schema for Athlete Analytics backend

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user', 'moderator', 'guest')),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE,
    height DECIMAL(5,2) CHECK (height > 0 AND height <= 300), -- in cm
    weight DECIMAL(5,2) CHECK (weight > 0 AND weight <= 500), -- in kg
    unique_id UUID UNIQUE NOT NULL DEFAULT uuid_generate_v4(),
    phone VARCHAR(20),
    emergency_contact_name VARCHAR(200),
    emergency_contact_number VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tenants table
CREATE TABLE IF NOT EXISTS tenants (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_unique_id ON users(unique_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

CREATE INDEX IF NOT EXISTS idx_tenants_name ON tenants(name);
CREATE INDEX IF NOT EXISTS idx_tenants_is_active ON tenants(is_active);
CREATE INDEX IF NOT EXISTS idx_tenants_city ON tenants(city);
CREATE INDEX IF NOT EXISTS idx_tenants_country ON tenants(country);
CREATE INDEX IF NOT EXISTS idx_tenants_created_at ON tenants(created_at);

-- Function to automatically update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default admin user (password: admin123)
INSERT INTO users (email, password_hash, role, first_name, last_name) 
VALUES (
    'admin@athleteanalytics.com', 
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBGNtQZzTmYZJO', -- admin123
    'admin', 
    'System', 
    'Administrator'
) ON CONFLICT (email) DO NOTHING;

-- Insert sample tenants
INSERT INTO tenants (name, city, state, country, description) VALUES
    ('Elite Sports Academy', 'New York', 'New York', 'USA', 'Premier sports training facility'),
    ('Champions Fitness Center', 'Los Angeles', 'California', 'USA', 'Comprehensive fitness and athletic development'),
    ('Athletic Performance Institute', 'Chicago', 'Illinois', 'USA', 'Professional athlete training and analytics')
ON CONFLICT DO NOTHING;
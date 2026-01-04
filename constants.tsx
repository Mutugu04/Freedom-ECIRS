
import React from 'react';

export const STATIONS = [
  { code: 'FR-KAN', name: 'Freedom Radio 99.5 FM Kano', location: 'Kano', frequency: '99.5 FM' },
  { code: 'FR-DUT', name: 'Freedom Radio 99.5 FM Dutse', location: 'Jigawa', frequency: '99.5 FM' },
  { code: 'FR-KAD', name: 'Freedom Radio 92.9 FM Kaduna', location: 'Kaduna', frequency: '92.9 FM' },
  { code: 'DL-KAN', name: 'Dala FM 88.5 Kano', location: 'Kano', frequency: '88.5 FM' },
  { code: 'FRG-HQ', name: 'Freedom Radio & TV Nigeria Ltd HQ', location: 'Kano', frequency: 'N/A' },
];

export const EBRS_SQL_SCHEMA = `-- =============================================================================
-- Freedom Radio Group - Electronic Billing and Receipting System (EBRS)
-- Senior Database Architect Design
-- Compliant: Nigerian Evidence Act 2011 & Cybercrimes Act 2015
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -----------------------------------------------------------------------------
-- 1. ENUMS & DOMAINS
-- -----------------------------------------------------------------------------
CREATE TYPE user_role AS ENUM ('super_admin', 'station_manager', 'sales_executive', 'accountant', 'viewer');
CREATE TYPE client_type AS ENUM ('direct', 'agency');
CREATE TYPE contract_type AS ENUM ('spot_advertising', 'sponsorship', 'live_mention', 'outside_broadcast', 'production');
CREATE TYPE contract_status AS ENUM ('draft', 'pending_approval', 'approved', 'active', 'completed', 'cancelled');
CREATE TYPE invoice_status AS ENUM ('draft', 'sent', 'partially_paid', 'paid', 'overdue', 'voided');
CREATE TYPE payment_method AS ENUM ('cash', 'bank_transfer', 'cheque', 'pos');
CREATE TYPE time_segment AS ENUM ('super_prime', 'prime', 'drive_time', 'off_peak');
CREATE TYPE doc_type AS ENUM ('CON', 'INV', 'REC');

-- -----------------------------------------------------------------------------
-- 2. CORE TABLES
-- -----------------------------------------------------------------------------

-- Stations: Management of the 5 network nodes
CREATE TABLE stations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(10) UNIQUE NOT NULL, -- e.g., FR-KAN
    name VARCHAR(100) NOT NULL,
    location VARCHAR(100) NOT NULL,
    frequency VARCHAR(20),
    contact_info JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ -- Soft Delete
);

-- Users: IAM with Station Scoping
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE,
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role user_role NOT NULL DEFAULT 'viewer',
    password_hash TEXT NOT NULL,
    digital_cert_path TEXT, -- Reference to stored cert
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- User-Station Mapping (One user can manage multiple stations)
CREATE TABLE user_station_access (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    station_id UUID REFERENCES stations(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, station_id)
);

-- Clients: Tax and Agency tracking
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(100),
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    tin VARCHAR(20) UNIQUE, -- Tax Identification Number
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(50),
    type client_type NOT NULL DEFAULT 'direct',
    agency_commission_rate NUMERIC(4,2) DEFAULT 0.00,
    credit_limit_kobo BIGINT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Rate Cards: Station-specific pricing
CREATE TABLE rate_cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    station_id UUID REFERENCES stations(id) ON DELETE CASCADE,
    segment time_segment NOT NULL,
    spot_type VARCHAR(50) NOT NULL, -- standard_30, live_mention_15, etc.
    base_rate_kobo BIGINT NOT NULL, -- Stored in kobo for precision
    effective_from DATE NOT NULL,
    effective_to DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 3. FINANCIAL DOCUMENTS (With Checksum Triggers)
-- -----------------------------------------------------------------------------

-- Helper function for Checksum (Luhn-like Modulo 10 or custom Radio Checksum)
CREATE OR REPLACE FUNCTION calculate_doc_checksum(input_str TEXT) 
RETURNS INTEGER AS $$
DECLARE
    sum INTEGER := 0;
    i INTEGER;
    char_code INTEGER;
BEGIN
    FOR i IN 1..length(input_str) LOOP
        char_code := ascii(substring(input_str FROM i FOR 1));
        sum := (sum + char_code * i) % 10;
    END LOOP;
    RETURN sum;
END;
$$ LANGUAGE plpgsql;

-- Sequence generator per station/type
CREATE TABLE doc_sequences (
    station_code VARCHAR(10),
    doc_code VARCHAR(5),
    year_month VARCHAR(6),
    last_val INTEGER DEFAULT 0,
    PRIMARY KEY (station_code, doc_code, year_month)
);

-- Contracts
CREATE TABLE contracts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_number VARCHAR(50) UNIQUE, -- Format: [STATION]-CON-[YYYYMM]-[SEQ]-[CHECK]
    client_id UUID NOT NULL REFERENCES clients(id),
    station_id UUID NOT NULL REFERENCES stations(id),
    creator_id UUID NOT NULL REFERENCES users(id),
    type contract_type NOT NULL,
    campaign_name VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_spots INTEGER DEFAULT 0,
    total_amount_kobo BIGINT DEFAULT 0,
    discount_pct NUMERIC(5,2) DEFAULT 0.00,
    status contract_status DEFAULT 'draft',
    approval_data JSONB, -- {approver_id, date, digital_sig}
    terms_and_conditions TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE contract_line_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contract_id UUID REFERENCES contracts(id) ON DELETE CASCADE,
    rate_card_id UUID REFERENCES rate_cards(id),
    description TEXT,
    quantity INTEGER NOT NULL,
    unit_price_kobo BIGINT NOT NULL,
    subtotal_kobo BIGINT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoices
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_number VARCHAR(50) UNIQUE,
    contract_id UUID REFERENCES contracts(id),
    client_id UUID REFERENCES clients(id),
    station_id UUID REFERENCES stations(id),
    creator_id UUID REFERENCES users(id),
    invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    subtotal_kobo BIGINT NOT NULL,
    vat_kobo BIGINT NOT NULL, -- Nigeria 7.5%
    total_amount_kobo BIGINT NOT NULL,
    status invoice_status DEFAULT 'draft',
    digital_signature TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Receipts
CREATE TABLE receipts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_number VARCHAR(50) UNIQUE,
    invoice_id UUID REFERENCES invoices(id),
    client_id UUID REFERENCES clients(id),
    station_id UUID REFERENCES stations(id),
    creator_id UUID REFERENCES users(id),
    receipt_date DATE NOT NULL DEFAULT CURRENT_DATE,
    amount_received_kobo BIGINT NOT NULL,
    method payment_method NOT NULL,
    bank_reference VARCHAR(100),
    digital_signature TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- -----------------------------------------------------------------------------
-- 4. COMPLIANCE & LOGGING
-- -----------------------------------------------------------------------------

-- Digital Signatures Log (Evidence Act Compliance)
CREATE TABLE digital_signatures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    document_type doc_type NOT NULL,
    document_id UUID NOT NULL,
    signature_hash TEXT NOT NULL, -- SHA-256
    certificate_data JSONB,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    verification_status BOOLEAN DEFAULT FALSE
);

-- Audit Log: Every mutation recorded
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name VARCHAR(50) NOT NULL,
    record_id UUID NOT NULL,
    action VARCHAR(20) NOT NULL, -- CREATE, UPDATE, DELETE, SIGN
    user_id UUID REFERENCES users(id),
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Verification Log: For QR code/Public portal scans
CREATE TABLE document_verification_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_type doc_type NOT NULL,
    document_id UUID NOT NULL,
    method VARCHAR(20) NOT NULL, -- qr, portal, sms
    requester_ip INET,
    result VARCHAR(20), -- valid, invalid
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 5. TRIGGER FOR AUTO-NUMBERING
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION generate_document_number()
RETURNS TRIGGER AS $$
DECLARE
    s_code VARCHAR(10);
    d_code VARCHAR(5);
    ym VARCHAR(6);
    seq INTEGER;
    check_sum INTEGER;
    final_num VARCHAR(50);
BEGIN
    -- Get Station Code
    SELECT code INTO s_code FROM stations WHERE id = NEW.station_id;
    
    -- Determine Doc Type Code
    IF TG_TABLE_NAME = 'contracts' THEN d_code := 'CON';
    ELSIF TG_TABLE_NAME = 'invoices' THEN d_code := 'INV';
    ELSIF TG_TABLE_NAME = 'receipts' THEN d_code := 'REC';
    END IF;

    ym := to_char(CURRENT_DATE, 'YYYYMM');

    -- Get next sequence value (Atomic increment)
    INSERT INTO doc_sequences (station_code, doc_code, year_month, last_val)
    VALUES (s_code, d_code, ym, 1)
    ON CONFLICT (station_code, doc_code, year_month)
    DO UPDATE SET last_val = doc_sequences.last_val + 1
    RETURNING last_val INTO seq;

    -- Calculate Checksum on the sequence string
    check_sum := calculate_doc_checksum(s_code || d_code || ym || seq::TEXT);
    
    -- Assemble
    final_num := s_code || '-' || d_code || '-' || ym || '-' || lpad(seq::TEXT, 4, '0') || '-' || check_sum::TEXT;
    
    NEW.document_number := final_num;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_contract_num BEFORE INSERT ON contracts FOR EACH ROW EXECUTE FUNCTION generate_document_number();
CREATE TRIGGER trg_invoice_num BEFORE INSERT ON invoices FOR EACH ROW EXECUTE FUNCTION generate_document_number();
CREATE TRIGGER trg_receipt_num BEFORE INSERT ON receipts FOR EACH ROW EXECUTE FUNCTION generate_document_number();

-- -----------------------------------------------------------------------------
-- 6. INDEXES
-- -----------------------------------------------------------------------------
CREATE INDEX idx_contracts_doc ON contracts(document_number);
CREATE INDEX idx_invoices_doc ON invoices(document_number);
CREATE INDEX idx_receipts_doc ON receipts(document_number);
CREATE INDEX idx_clients_tin ON clients(tin);
CREATE INDEX idx_clients_phone ON clients(phone);
CREATE INDEX idx_audit_timestamp ON audit_logs(timestamp);
CREATE INDEX idx_contracts_dates ON contracts(start_date, end_date);

-- -----------------------------------------------------------------------------
-- 7. CONVENIENCE VIEWS (Naira formatting)
-- -----------------------------------------------------------------------------
CREATE VIEW v_contracts_naira AS
SELECT *, (total_amount_kobo / 100.0) as amount_ngn FROM contracts;

CREATE VIEW v_clients_balance AS
SELECT *, (balance_kobo / 100.0) as balance_ngn FROM clients;
`;

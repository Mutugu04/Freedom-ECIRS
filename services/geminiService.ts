
import { GoogleGenAI } from "@google/genai";

// Initialize the Google GenAI client once using the recommended pattern
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getSchemaInsights = async (prompt: string, schema: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `
      You are a senior database architect and legal compliance expert for Nigeria's radio industry.
      Below is the PostgreSQL schema for the Freedom Radio Group EBRS.
      
      User Question: ${prompt}
      
      SCHEMA:
      ${schema}
      
      Provide a detailed, professional response focused on performance, compliance (Evidence Act 2011), and Northern Nigerian radio operations.
    `,
  });
  return response.text;
};

export const getFastAPIImplementation = async (fileName: string, context: string) => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `
        You are a senior Python FastAPI developer. 
        Generate the full code for the file "${fileName}" based on the EBRS requirements.
        Use FastAPI, SQLAlchemy 2.0 (async), Pydantic v2.
        Station-scoped access control.
        Context: ${context}
        
        Provide ONLY the Python code.
      `,
    });
    return response.text;
};

export const getPDFEngineCode = async (className: string) => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `
        You are a Python document generation specialist using ReportLab.
        Generate the implementation for the class "${className}" for the Freedom Radio Group EBRS.
        Requirements:
        - Professional layout for Radio Advertising (Contracts, Invoices, Receipts).
        - Security features: QR codes, Micro-text borders, SHA-256 hashing.
        - Compliance with Nigerian Evidence Act 2011.
        - Use Deep Blue (#1B4F72) and Burgundy (#A23B72) accents.
        
        Provide ONLY the Python code.
      `,
    });
    return response.text;
};

export const getSecurityEngineCode = async (className: string) => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `
        You are a cryptography specialist implementing digital signatures for the Freedom Radio EBRS.
        Generate the implementation for "${className}" in Python using the 'cryptography' library.
        Context: Nigerian Evidence Act 2011 compliance.
        Requirements:
        - RSA-2048 key generation.
        - X.509 certificate generation.
        - AES-256 encrypted private key storage.
        - SHA-256 document hashing and signing.
        - Signature verification.
        
        Provide ONLY the Python code.
      `,
    });
    return response.text;
};

export const getPricingEngineCode = async (className: string) => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `
        You are a broadcast business analyst and Python developer.
        Implement the class "${className}" for Freedom Radio Group's pricing engine.
        Broadcast Parameters:
        - Stations: FR-KAN (Flagship), FR-DUT, FR-KAD, DL-KAN (Youth).
        - Segments: Super Prime (6-9 AM, 6-8 PM), Prime, Drive Time, Off-Peak.
        - Multipliers: 15s (0.6x), 30s (1.0x), 45s (1.4x), 60s (1.75x).
        - Discounts: Volume (up to 20%), Agency (15%), Pre-payment (5%).
        - Packages: Freedom Network (25% off), Northern Reach (15% off).
        - Tax: 7.5% VAT.
        
        Provide ONLY the Python code.
      `,
    });
    return response.text;
};

export const getReportingEngineCode = async (reportType: string) => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `
        You are a Business Intelligence developer creating reports for Freedom Radio Group EBRS.
        Implement the "${reportType}" reporting logic in Python.
        Features required:
        - Data aggregation from PostgreSQL views (v_daily_sales_summary, v_user_performance).
        - PDF Export using ReportLab.
        - Excel Export using Openpyxl.
        - Cross-station performance analytics.
        - Financial aging and collection ratios.
        
        Provide ONLY the Python code.
      `,
    });
    return response.text;
};

export const getDevOpsEngineCode = async (configType: string) => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `
        You are a senior DevOps Engineer deploying the Freedom Radio EBRS ecosystem.
        Generate the production configuration for "${configType}".
        Requirements:
        - Multi-station hub-and-spoke architecture (HQ + 4 Nodes).
        - High Availability: Nginx, Gunicorn, PostgreSQL 15 replication.
        - Security: SSL/TLS termination, WireGuard VPN configuration, Security Hardening.
        - CI/CD: GitHub Actions (build, test, deploy).
        - Monitoring: Prometheus metrics and Alertmanager rules.
        
        Provide ONLY the code (Docker, Nginx, Shell, YAML, or SQL).
      `,
    });
    return response.text;
};

export const getAPIDocsCode = async (type: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `
      You are a technical writer and API architect.
      Generate a comprehensive OpenAPI 3.1 specification (YAML) for the Freedom Radio Group EBRS API.
      Focus on the "${type}" endpoints.
      Include:
      - Authentication (Bearer JWT).
      - Endpoint definitions (GET, POST, PUT, DELETE).
      - Detailed request/response schemas using the EBRS UUID and kobo-based currency patterns.
      - Error response codes (400, 401, 403, 404, 500).
      
      Provide ONLY the YAML code.
    `,
  });
  return response.text;
};

export const getSDKCode = async (language: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `
      You are a senior software engineer.
      Generate a professional, developer-friendly client SDK for the Freedom Radio Group EBRS API in "${language}".
      Features:
      - Authentication handling (JWT storage and refresh).
      - Resource wrappers for Clients, Contracts, Invoices, and Receipts.
      - Exception handling for API errors.
      - Asynchronous support (using httpx or similar for Python).
      - Proper documentation strings/comments.
      
      Provide ONLY the ${language} code.
    `,
  });
  return response.text;
};

export const getMigrationEngineCode = async (dataType: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `
      You are a data engineer.
      Generate a Python data migration script for "${dataType}" to import data from legacy Excel spreadsheets into the EBRS PostgreSQL schema.
      Requirements:
      - Use 'pandas' for Excel parsing and 'pydantic' for data validation.
      - Implement checks for: Duplicate TIN, invalid phone formats, missing required fields.
      - Support batch processing for high volume data (thousands of records).
      - Detailed logging of errors and warnings per row.
      - Mapping logic from flat CSV/XLS to normalized EBRS tables.
      
      Provide ONLY the Python code.
    `,
  });
  return response.text;
};

export const getWhatsAppIntegrationCode = async (moduleType: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `
      You are a senior full-stack developer.
      Generate the Python code for "${moduleType}" integration with the WhatsApp Business Platform (Cloud API) for the Freedom Radio Group EBRS.
      Requirements:
      - Use FastAPI for webhooks and 'httpx' for outgoing requests.
      - Support sending template messages (Invoices, Receipts, Reminders).
      - Handle media attachments (PDF invoices).
      - Webhook implementation for delivery status (sent, delivered, read) and customer replies.
      - Securely handle Access Tokens and Phone ID variables.
      - Integration with the EBRS 'document_signatures' table for verification links in messages.
      
      Provide ONLY the Python code.
    `,
  });
  return response.text;
};

export const getAccountingIntegrationCode = async (software: string) => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `
        You are a senior data integration specialist.
        Generate a Python module for Freedom Radio Group EBRS to export financial data (Invoices/Receipts) to "${software}".
        Requirements:
        - Formats: QuickBooks (IIF or SDK), Sage 50 (CSV Export format), Generic (Standard Accounting CSV).
        - Handle VAT (7.5%) mapping to specific tax codes.
        - Map EBRS Station Codes to Accounting Profit Centers.
        - Support for daily automated scheduling logic.
        - Precision handling for Naira kobo (integer to decimal conversion).
        - Exception handling for data mismatches.
        
        Provide ONLY the Python code.
      `,
    });
    return response.text;
};

export const getComplianceExplanation = async (schema: string) => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `
        Analyze this SQL schema and document engine spec for compliance with the Nigerian Evidence Act 2011 and Cybercrimes Act 2015. 
        Focus on electronic records, digital signatures, and audit trails for Freedom Radio.
        
        SCHEMA:
        ${schema}
      `,
    });
    return response.text;
};

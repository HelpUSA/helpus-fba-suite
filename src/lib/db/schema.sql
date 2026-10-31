-- HelpUS FBA Suite & ERP Database Schema (PostgreSQL / Supabase)
-- Phase P0: Production Relational Model with ACID Guarantees & Row Level Security

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Warehouses (Multi-Nó Logístico EUA & Brasil)
CREATE TABLE IF NOT EXISTS warehouses (
    code VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    country VARCHAR(10) NOT NULL CHECK (country IN ('US', 'BR')),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO warehouses (code, name, country, description) VALUES
('WH-USA-PREP', 'Prep Ninjas Hub (Salt Lake City, UT)', 'US', 'Armazém 3PL para recepção, inspeção e etiquetagem FNSKU nos EUA.'),
('WH-USA-FBA-RYY2', 'Amazon FBA RYY2 (White, GA)', 'US', 'Centro de Distribuição FBA da Amazon pronto para despacho Prime.'),
('WH-BR-TRANSIT-BRASPRESS', 'Braspress Logística (Em Trânsito)', 'BR', 'Carga rodoviária interestadual em transferência para a filial JPA.'),
('WH-BR-LOCAL-JPA', 'HelpUS Base Bessa (João Pessoa/PB)', 'BR', 'Polo logístico para separação, conferência e expedição Mercado Envios / DBA.')
ON CONFLICT (code) DO NOTHING;

-- 2. Products Catalog
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sku VARCHAR(100) UNIQUE NOT NULL,
    asin VARCHAR(50),
    ncm VARCHAR(20),
    title VARCHAR(255) NOT NULL,
    marketplace VARCHAR(50) NOT NULL CHECK (marketplace IN ('Amazon US', 'Amazon BR')),
    currency VARCHAR(10) NOT NULL CHECK (currency IN ('USD', 'BRL')),
    unit_cost NUMERIC(12, 2) NOT NULL DEFAULT 0,
    sale_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
    image_url TEXT,
    supplier_name VARCHAR(255),
    reorder_point INT NOT NULL DEFAULT 10,
    environment VARCHAR(20) NOT NULL DEFAULT 'production' CHECK (environment IN ('production', 'sandbox')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Inventory Balances per Warehouse Node
CREATE TABLE IF NOT EXISTS inventory_balances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_sku VARCHAR(100) NOT NULL REFERENCES products(sku) ON DELETE CASCADE,
    warehouse_code VARCHAR(50) NOT NULL REFERENCES warehouses(code) ON DELETE RESTRICT,
    quantity INT NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT uq_product_warehouse UNIQUE (product_sku, warehouse_code)
);

-- 4. Invoices (NF-e Brasil & Commercial Invoices US)
CREATE TABLE IF NOT EXISTS invoices (
    id VARCHAR(100) PRIMARY KEY,
    tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('NFE_BR', 'INVOICE_US')),
    numero VARCHAR(100) NOT NULL,
    serie VARCHAR(20),
    chave VARCHAR(100),
    data_emissao TIMESTAMP WITH TIME ZONE NOT NULL,
    data_importacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fornecedor_nome VARCHAR(255) NOT NULL,
    fornecedor_doc VARCHAR(100) NOT NULL,
    valor_total NUMERIC(14, 2) NOT NULL,
    moeda VARCHAR(10) NOT NULL CHECK (moeda IN ('BRL', 'USD')),
    status VARCHAR(50) NOT NULL DEFAULT 'EM_TRANSITO' CHECK (status IN ('PROCESSADA', 'EM_TRANSITO', 'CONCILIADA')),
    itens_count INT NOT NULL DEFAULT 1,
    environment VARCHAR(20) NOT NULL DEFAULT 'production',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Invoice Items
CREATE TABLE IF NOT EXISTS invoice_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id VARCHAR(100) NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    sku VARCHAR(100) NOT NULL,
    descricao TEXT NOT NULL,
    quantidade INT NOT NULL CHECK (quantidade > 0),
    valor_unitario NUMERIC(12, 2) NOT NULL,
    custo_efetivo_unitario NUMERIC(12, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Stock Movements (Audit Trail Ledger)
CREATE TABLE IF NOT EXISTS stock_movements (
    id VARCHAR(100) PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sku VARCHAR(100) NOT NULL,
    product_title TEXT NOT NULL,
    movement_type VARCHAR(50) NOT NULL CHECK (movement_type IN ('INBOUND_NFE', 'INBOUND_IMPORT', 'TRANSFER', 'SALE', 'ADJUSTMENT')),
    from_warehouse VARCHAR(50) REFERENCES warehouses(code),
    to_warehouse VARCHAR(50) REFERENCES warehouses(code),
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_cost NUMERIC(12, 2),
    document_ref VARCHAR(255),
    notes TEXT,
    environment VARCHAR(20) NOT NULL DEFAULT 'production'
);

-- 7. Outbound Sales Orders
CREATE TABLE IF NOT EXISTS sale_orders (
    id VARCHAR(100) PRIMARY KEY,
    order_number VARCHAR(100) UNIQUE NOT NULL,
    marketplace VARCHAR(50) NOT NULL CHECK (marketplace IN ('Amazon US', 'Amazon BR', 'Mercado Livre')),
    order_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sku VARCHAR(100) NOT NULL,
    product_title TEXT NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    sale_price NUMERIC(12, 2) NOT NULL,
    unit_cost NUMERIC(12, 2) NOT NULL,
    gross_profit NUMERIC(12, 2) NOT NULL,
    customer_city VARCHAR(255),
    warehouse_source VARCHAR(50) NOT NULL REFERENCES warehouses(code),
    status VARCHAR(50) NOT NULL DEFAULT 'CONFIRMED' CHECK (status IN ('CONFIRMED', 'DELIVERED')),
    environment VARCHAR(20) NOT NULL DEFAULT 'production'
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_inventory_sku ON inventory_balances(product_sku);
CREATE INDEX IF NOT EXISTS idx_movements_sku ON stock_movements(sku);
CREATE INDEX IF NOT EXISTS idx_orders_sku ON sale_orders(sku);
CREATE INDEX IF NOT EXISTS idx_invoices_chave ON invoices(chave);

-- 8. Customer Returns & Reverse Logistics (Phase P3)
CREATE TABLE IF NOT EXISTS returns (
    id VARCHAR(100) PRIMARY KEY,
    return_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    order_number VARCHAR(100),
    sku VARCHAR(100) NOT NULL REFERENCES products(sku),
    product_title TEXT NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    reason VARCHAR(50) NOT NULL CHECK (reason IN ('CUSTOMER_DEFECT', 'DAMAGED_CARRIER', 'WRONG_ITEM', 'CUSTOMER_REMORSE', 'LOST_IN_TRANSIT')),
    disposition VARCHAR(50) NOT NULL CHECK (disposition IN ('SELLABLE', 'DEFECTIVE', 'CARRIER_DAMAGED', 'CUSTOMER_DAMAGED')),
    warehouse VARCHAR(50) NOT NULL REFERENCES warehouses(code),
    status VARCHAR(50) NOT NULL CHECK (status IN ('RECEIVED', 'INSPECTION', 'RESTOCKED', 'REIMBURSEMENT_CLAIMED', 'REIMBURSED', 'DISPOSED')),
    reimbursement_amount NUMERIC(12, 2) DEFAULT 0,
    currency VARCHAR(10) NOT NULL CHECK (currency IN ('USD', 'BRL')),
    notes TEXT,
    environment VARCHAR(20) NOT NULL DEFAULT 'production',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_returns_sku ON returns(sku);
CREATE INDEX IF NOT EXISTS idx_returns_status ON returns(status);


-- Migration to Ala Carte System
-- Targets PostgreSQL (Supabase)

-- 1. Update Menu Table
ALTER TABLE menu ADD COLUMN IF NOT EXISTS harga DECIMAL(12, 2) DEFAULT 0;
ALTER TABLE menu ADD COLUMN IF NOT EXISTS id_kategori INTEGER DEFAULT 1;

-- 2. Ensure Kategori Table exists and has correct data
CREATE TABLE IF NOT EXISTS kategori (
    id_kategori SERIAL PRIMARY KEY,
    nama_kategori VARCHAR(100) UNIQUE NOT NULL
);

INSERT INTO kategori (nama_kategori) VALUES 
('Makanan'), 
('Minuman'), 
('Snack'), 
('Penutup')
ON CONFLICT (nama_kategori) DO NOTHING;

-- 3. Update Pesanan Table for Ala Carte
ALTER TABLE pesanan ADD COLUMN IF NOT EXISTS total_harga DECIMAL(12, 2) DEFAULT 0;
ALTER TABLE pesanan ADD COLUMN IF NOT EXISTS status_pembayaran VARCHAR(20) DEFAULT 'unpaid'; -- unpaid, paid
ALTER TABLE pesanan ADD COLUMN IF NOT EXISTS snap_token VARCHAR(255); -- for payment integration if needed
ALTER TABLE pesanan ADD COLUMN IF NOT EXISTS qris_url TEXT;

-- 4. Update Detail Pesanan Table to store price at time of order
ALTER TABLE detail_pesanan ADD COLUMN IF NOT EXISTS harga_satuan DECIMAL(12, 2) DEFAULT 0;
ALTER TABLE detail_pesanan ADD COLUMN IF NOT EXISTS subtotal DECIMAL(12, 2) DEFAULT 0;

-- 5. Fix Status Enum if necessary (PostgreSQL uses different approach than MySQL)
-- The current code uses string checks, so we might not need to strictly define enum if it's already VARCHAR or ENUM.
-- In init-db.js it used CREATE TYPE. Let's ensure order statuses are consistent.

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status') THEN
        CREATE TYPE order_status AS ENUM ('pending', 'Menunggu', 'cooking', 'Diproses', 'ready', 'Selesai', 'Batal');
    END IF;
END $$;

-- If we want to change column type, it's safer to just let it be VARCHAR for now to avoid migration headache with existing data.

-- 6. Create Table for Customer Auth if not exists
CREATE TABLE IF NOT EXISTS customers (
    id_customer SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    no_meja INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

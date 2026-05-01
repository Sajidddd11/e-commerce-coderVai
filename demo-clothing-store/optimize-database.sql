-- Performance optimization indexes for product variants
-- Run this in your PostgreSQL database

-- Index for faster product variant lookups
CREATE INDEX IF NOT EXISTS idx_product_variant_product_id 
ON product_variant(product_id);

-- Index for faster option value lookups
CREATE INDEX IF NOT EXISTS idx_product_option_value_option_id 
ON product_option_value(option_id);

-- Index for faster variant option lookups
CREATE INDEX IF NOT EXISTS idx_product_variant_option_variant_id 
ON product_variant_option(variant_id);

-- Index for inventory items
CREATE INDEX IF NOT EXISTS idx_inventory_item_variant_id 
ON inventory_item(variant_id) 
WHERE variant_id IS NOT NULL;

-- Analyze tables for query optimization
ANALYZE product_variant;
ANALYZE product_option_value;
ANALYZE product_variant_option;
ANALYZE inventory_item;

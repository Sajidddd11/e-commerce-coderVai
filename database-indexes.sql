-- Performance Optimization Indexes for MedusaJS v2
-- Based on YOUR actual schema structure
-- Run this in Supabase SQL Editor or via node run-indexes.js

-- ==================================================
-- PRODUCT VARIANT INDEXES (Most Critical)
-- ==================================================

-- Product variant by product (for listing products with variants)
CREATE INDEX IF NOT EXISTS idx_product_variant_product_id_deleted 
  ON product_variant(product_id, deleted_at);

-- Product variant by SKU (for inventory lookups)
CREATE INDEX IF NOT EXISTS idx_product_variant_sku_deleted 
  ON product_variant(sku) WHERE deleted_at IS NULL;

-- Product variant rank (for sorting)
CREATE INDEX IF NOT EXISTS idx_product_variant_rank 
  ON product_variant(variant_rank) WHERE deleted_at IS NULL;

-- ==================================================
-- INVENTORY INDEXES
-- ==================================================

-- Inventory item lookups
CREATE INDEX IF NOT EXISTS idx_inventory_item_sku 
  ON inventory_item(sku) WHERE deleted_at IS NULL;

-- Inventory level by item (for stock checks)
CREATE INDEX IF NOT EXISTS idx_inventory_level_item_location 
  ON inventory_level(inventory_item_id, location_id) WHERE deleted_at IS NULL;

-- Product variant to inventory item mapping
CREATE INDEX IF NOT EXISTS idx_product_variant_inventory_variant 
  ON product_variant_inventory_item(variant_id) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_product_variant_inventory_item 
  ON product_variant_inventory_item(inventory_item_id) WHERE deleted_at IS NULL;

-- ==================================================
-- PRICE INDEXES (Critical for calculated_price)
-- ==================================================

-- Price set lookups
CREATE INDEX IF NOT EXISTS idx_price_price_set_currency 
  ON price(price_set_id, currency_code) WHERE deleted_at IS NULL;

-- Variant to price set mapping
CREATE INDEX IF NOT EXISTS idx_product_variant_price_variant 
  ON product_variant_price_set(variant_id) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_product_variant_price_set 
  ON product_variant_price_set(price_set_id) WHERE deleted_at IS NULL;

-- ==================================================
-- PRODUCT OPTION INDEXES
-- ==================================================

-- Variant options (for filtering by size, color, etc)
CREATE INDEX IF NOT EXISTS idx_product_variant_option_variant 
  ON product_variant_option(variant_id);

CREATE INDEX IF NOT EXISTS idx_product_variant_option_value 
  ON product_variant_option(option_value_id);

-- Option values
CREATE INDEX IF NOT EXISTS idx_product_option_value_option 
  ON product_option_value(option_id) WHERE deleted_at IS NULL;

-- ==================================================
-- IMAGE INDEXES
-- ==================================================

-- Product images with rank (for ordering)
CREATE INDEX IF NOT EXISTS idx_image_product_rank 
  ON image(product_id, rank) WHERE deleted_at IS NULL;

-- Variant images
CREATE INDEX IF NOT EXISTS idx_product_variant_image_variant 
  ON product_variant_product_image(variant_id) WHERE deleted_at IS NULL;

-- ==================================================
-- CART INDEXES (For faster checkout)
-- ==================================================

-- Cart line items by cart
CREATE INDEX IF NOT EXISTS idx_cart_line_item_cart 
  ON cart_line_item(cart_id) WHERE deleted_at IS NULL;

-- Cart line items by variant (for stock checks)
CREATE INDEX IF NOT EXISTS idx_cart_line_item_variant 
  ON cart_line_item(variant_id) WHERE deleted_at IS NULL;

-- Cart by customer
CREATE INDEX IF NOT EXISTS idx_cart_customer_region 
  ON cart(customer_id, region_id) WHERE deleted_at IS NULL;

-- ==================================================
-- ORDER INDEXES
-- ==================================================

-- Orders by customer and date (for order history)
CREATE INDEX IF NOT EXISTS idx_order_customer_created 
  ON "order"(customer_id, created_at DESC) WHERE deleted_at IS NULL;

-- Orders by region
CREATE INDEX IF NOT EXISTS idx_order_region_created 
  ON "order"(region_id, created_at DESC) WHERE deleted_at IS NULL;

-- Order items by order
CREATE INDEX IF NOT EXISTS idx_order_item_order_version 
  ON order_item(order_id, version) WHERE deleted_at IS NULL;

-- ==================================================
-- PRODUCT INDEXES
-- ==================================================

-- Product by handle (for product pages)
CREATE INDEX IF NOT EXISTS idx_product_handle_status 
  ON product(handle, status) WHERE deleted_at IS NULL;

-- Product by collection
CREATE INDEX IF NOT EXISTS idx_product_collection 
  ON product(collection_id) WHERE deleted_at IS NULL;

-- Product by type
CREATE INDEX IF NOT EXISTS idx_product_type 
  ON product(type_id) WHERE deleted_at IS NULL;

-- ==================================================
-- ANALYZE TABLES (Update statistics for query planner)
-- ==================================================

ANALYZE product_variant;
ANALYZE inventory_item;
ANALYZE inventory_level;
ANALYZE product_variant_inventory_item;
ANALYZE price;
ANALYZE product_variant_price_set;
ANALYZE cart;
ANALYZE cart_line_item;
ANALYZE "order";
ANALYZE product;
ANALYZE image;

-- ==================================================
-- VERIFICATION: Check created indexes
-- ==================================================

SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public' 
  AND (indexname LIKE 'idx_%' OR indexname LIKE 'IDX_%')
  AND tablename IN (
    'product_variant',
    'inventory_item', 
    'inventory_level',
    'product_variant_inventory_item',
    'price',
    'product_variant_price_set',
    'cart',
    'cart_line_item',
    'order',
    'product',
    'image'
  )
ORDER BY tablename, indexname;


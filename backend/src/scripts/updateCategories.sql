-- Update Categories with Descriptions and Images
-- Run this script in your MySQL database

-- Step 1: Add descriptions to existing categories
UPDATE categories 
SET description = 'Premium athletic footwear and sportswear from the world\'s leading sports brand. Known for innovation, performance, and iconic designs that have shaped sports culture for decades.'
WHERE category_name = 'Nike';

UPDATE categories 
SET description = 'Comfort-focused footwear combining classic style with modern comfort technology. Perfect for everyday wear with superior cushioning and support.'
WHERE category_name = 'New Balance';

UPDATE categories 
SET description = 'German sportswear giant offering cutting-edge athletic footwear and lifestyle sneakers. Combining performance technology with street style for athletes and fashion enthusiasts.'
WHERE category_name = 'Adidas';

UPDATE categories 
SET description = 'Dynamic sportswear brand delivering high-performance athletic shoes with bold designs. From professional sports to street fashion, Puma brings energy and innovation to every step.'
WHERE category_name = 'Puma';

UPDATE categories 
SET description = 'Iconic skateboarding and lifestyle brand known for classic silhouettes and timeless designs. From the skate park to the streets, Vans represents authentic youth culture and creative expression.'
WHERE category_name = 'Vans';

-- Step 2: Add image_urls column to categories table
ALTER TABLE categories 
ADD COLUMN image_urls JSON DEFAULT NULL;

-- Step 3: Add sample images for each category
UPDATE categories 
SET image_urls = JSON_ARRAY(
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&h=600&fit=crop'
)
WHERE category_name = 'Nike';

UPDATE categories 
SET image_urls = JSON_ARRAY(
    'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&h=600&fit=crop'
)
WHERE category_name = 'New Balance';

UPDATE categories 
SET image_urls = JSON_ARRAY(
    'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&h=600&fit=crop'
)
WHERE category_name = 'Adidas';

UPDATE categories 
SET image_urls = JSON_ARRAY(
    'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&h=600&fit=crop'
)
WHERE category_name = 'Puma';

UPDATE categories 
SET image_urls = JSON_ARRAY(
    'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&h=600&fit=crop'
)
WHERE category_name = 'Vans';

-- Verify the updates
SELECT category_id, category_name, description, image_urls FROM categories;

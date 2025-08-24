// backend/src/services/cartService.js
const Cart = require('../models/Cart');
const dbSingleton = require('../config/database');

class CartService {
    // Get cart for user (database for logged-in, session for guests)
    async getCart(req) {
        try {
            if (req.user) {
                // Logged-in user: get from database
                const userId = req.user.id;
                console.log('🛒 Getting cart from database for user:', userId);
                return await Cart.getUserCart(userId);
            } else {
                // Guest user: get from session and fetch product details
                console.log('🛒 Getting cart from session for guest');
                const guestCart = this.getGuestCart(req);
                return await this.enrichGuestCartWithProductDetails(guestCart);
            }
        } catch (error) {
            console.error('Error getting cart:', error);
            throw error;
        }
    }

    // Enrich guest cart with product details from database
    async enrichGuestCartWithProductDetails(guestCart) {
        try {
            if (!guestCart.items || guestCart.items.length === 0) {
                return guestCart;
            }

            const db = await dbSingleton.getConnection();
            
            // Get all product IDs from guest cart
            const productIds = guestCart.items.map(item => item.product_id);
            
            // Fetch product details for all items
            const [productRows] = await db.query(`
                SELECT 
                    id,
                    name,
                    description,
                    price,
                    image_urls,
                    stock_quantity
                FROM products 
                WHERE id IN (${productIds.map(() => '?').join(',')})
            `, productIds);

            // Create a map of product details
            const productMap = {};
            productRows.forEach(product => {
                productMap[product.id] = product;
            });

            // Enrich cart items with product details
            const enrichedItems = guestCart.items.map(item => {
                const product = productMap[item.product_id];
                if (product) {
                    return {
                        cart_item_id: item.cart_item_id,
                        product_id: item.product_id,
                        quantity: item.quantity,
                        selected_size: item.selected_size,
                        selected_color: item.selected_color,
                        product_name: product.name,
                        description: product.description,
                        price: product.price,
                        image_urls: product.image_urls,
                        stock_quantity: product.stock_quantity
                    };
                } else {
                    // Product not found, return item without details
                    console.warn(`Product ${item.product_id} not found in database`);
                    return {
                        ...item,
                        product_name: 'Product not found',
                        description: '',
                        price: 0,
                        image_urls: null,
                        stock_quantity: 0
                    };
                }
            });

            return {
                cart: {
                    cart_id: 'guest_cart',
                    user_id: 'guest',
                    total_cost: guestCart.total_cost,
                    item_count: guestCart.item_count
                },
                items: enrichedItems
            };
        } catch (error) {
            console.error('Error enriching guest cart:', error);
            return guestCart;
        }
    }

    // Add item to cart (database for logged-in, session for guests)
    async addToCart(req, productId, quantity = 1, selectedSize = null, selectedColor = null) {
        try {
            if (req.user) {
                // Logged-in user: add to database
                const userId = req.user.id;
                console.log('🛒 Adding item to database cart for user:', userId);
                return await Cart.addToCart(userId, productId, quantity, selectedSize, selectedColor);
            } else {
                // Guest user: add to session
                console.log('🛒 Adding item to session cart for guest');
                return this.addToGuestCart(req, productId, quantity, selectedSize, selectedColor);
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
            throw error;
        }
    }

    // Update item quantity (database for logged-in, session for guests)
    async updateQuantity(req, cartItemId, quantity) {
        try {
            if (req.user) {
                // Logged-in user: update in database
                const userId = req.user.id;
                console.log('🛒 Updating quantity in database for user:', userId);
                return await Cart.updateQuantity(userId, cartItemId, quantity);
            } else {
                // Guest user: update in session
                console.log('🛒 Updating quantity in session for guest');
                return this.updateGuestCartItem(req, cartItemId, quantity);
            }
        } catch (error) {
            console.error('Error updating quantity:', error);
            throw error;
        }
    }

    // Remove item from cart (database for logged-in, session for guests)
    async removeFromCart(req, cartItemId) {
        try {
            if (req.user) {
                // Logged-in user: remove from database
                const userId = req.user.id;
                console.log('🛒 Removing item from database for user:', userId);
                return await Cart.removeFromCart(userId, cartItemId);
            } else {
                // Guest user: remove from session
                console.log('🛒 Removing item from session for guest');
                return this.removeFromGuestCart(req, cartItemId);
            }
        } catch (error) {
            console.error('Error removing from cart:', error);
            throw error;
        }
    }

    // Clear cart (database for logged-in, session for guests)
    async clearCart(req) {
        try {
            if (req.user) {
                // Logged-in user: clear database cart
                const userId = req.user.id;
                console.log('🛒 Clearing database cart for user:', userId);
                return await Cart.clearCart(userId);
            } else {
                // Guest user: clear session cart
                console.log('🛒 Clearing session cart for guest');
                return this.clearGuestCart(req);
            }
        } catch (error) {
            console.error('Error clearing cart:', error);
            throw error;
        }
    }

    // Merge guest cart into user cart when user logs in
    async mergeGuestCart(req) {
        try {
            if (!req.user) {
                return { success: false, message: 'User not authenticated' };
            }

            const guestCart = this.getGuestCart(req);
            if (!guestCart || !guestCart.items || guestCart.items.length === 0) {
                return { success: true, message: 'No guest cart to merge' };
            }

            const userId = req.user.id;
            console.log('🛒 Merging guest cart into user cart for user:', userId);

            // Add each guest cart item to user's database cart
            for (const item of guestCart.items) {
                await Cart.addToCart(
                    userId,
                    item.product_id,
                    item.quantity,
                    item.selected_size,
                    item.selected_color
                );
            }

            // Clear guest cart from session
            this.clearGuestCart(req);

            return { success: true, message: 'Guest cart merged successfully' };
        } catch (error) {
            console.error('Error merging guest cart:', error);
            throw error;
        }
    }

    // Guest cart methods (session-based only)
    getGuestCart(req) {
        if (!req.session.guestCart) {
            req.session.guestCart = {
                items: [],
                total_cost: 0.00,
                item_count: 0
            };
        }
        return req.session.guestCart;
    }

    async addToGuestCart(req, productId, quantity = 1, selectedSize = null, selectedColor = null) {
        const cart = this.getGuestCart(req);
        
        // Check if item already exists
        const existingItemIndex = cart.items.findIndex(item => 
            item.product_id === productId && 
            item.selected_size === selectedSize && 
            item.selected_color === selectedColor
        );

        if (existingItemIndex !== -1) {
            // Update existing item quantity
            cart.items[existingItemIndex].quantity += quantity;
        } else {
            // Add new item
            cart.items.push({
                cart_item_id: Date.now() + Math.random(), // Temporary ID
                product_id: productId,
                quantity: quantity,
                selected_size: selectedSize,
                selected_color: selectedColor
            });
        }

        await this.updateGuestCartTotal(req);
        return { success: true, message: 'Item added to guest cart' };
    }

    async updateGuestCartItem(req, cartItemId, quantity) {
        const cart = this.getGuestCart(req);
        const itemIndex = cart.items.findIndex(item => item.cart_item_id == cartItemId);
        
        if (itemIndex !== -1) {
            if (quantity <= 0) {
                cart.items.splice(itemIndex, 1);
            } else {
                cart.items[itemIndex].quantity = quantity;
            }
            await this.updateGuestCartTotal(req);
            return { success: true, message: 'Guest cart item updated' };
        }
        
        throw new Error('Cart item not found');
    }

    async removeFromGuestCart(req, cartItemId) {
        const cart = this.getGuestCart(req);
        const itemIndex = cart.items.findIndex(item => item.cart_item_id == cartItemId);
        
        if (itemIndex !== -1) {
            cart.items.splice(itemIndex, 1);
            await this.updateGuestCartTotal(req);
            return { success: true, message: 'Item removed from guest cart' };
        }
        
        throw new Error('Cart item not found');
    }

    clearGuestCart(req) {
        req.session.guestCart = {
            items: [],
            total_cost: 0.00,
            item_count: 0
        };
        return { success: true, message: 'Guest cart cleared' };
    }

    async updateGuestCartTotal(req) {
        const cart = this.getGuestCart(req);
        cart.item_count = cart.items.reduce((total, item) => total + item.quantity, 0);
        
        // Calculate total cost using product prices
        if (cart.items.length > 0) {
            try {
                const db = await dbSingleton.getConnection();
                const productIds = cart.items.map(item => item.product_id);
                
                const [productRows] = await db.query(`
                    SELECT id, price FROM products 
                    WHERE id IN (${productIds.map(() => '?').join(',')})
                `, productIds);
                
                const productMap = {};
                productRows.forEach(product => {
                    productMap[product.id] = product;
                });
                
                cart.total_cost = cart.items.reduce((total, item) => {
                    const product = productMap[item.product_id];
                    return total + (product ? product.price * item.quantity : 0);
                }, 0);
            } catch (error) {
                console.error('Error calculating guest cart total:', error);
                cart.total_cost = 0.00;
            }
        } else {
            cart.total_cost = 0.00;
        }
    }

    // Get cart statistics (only for logged-in users)
    async getCartStats() {
        try {
            // Only count database carts (logged-in users)
            const db = await dbSingleton.getConnection();
            
            const [stats] = await db.query(`
                SELECT 
                    COUNT(DISTINCT c.user_id) as total_user_carts,
                    AVG(c.total_cost) as avg_cart_value,
                    SUM(c.total_cost) as total_cart_value
                FROM carts c
                WHERE c.total_cost > 0
                AND c.user_id NOT LIKE 'guest_%'
            `);
            
            return stats[0];
        } catch (error) {
            console.error('Error getting cart stats:', error);
            throw error;
        }
    }
}

module.exports = new CartService();

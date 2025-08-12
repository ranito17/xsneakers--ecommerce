import React from 'react';
import CartItem from './CartItem';
import styles from './cartItems.module.css';

const CartItems = ({ cartItems, updateQuantity, removeFromCart, isLoading }) => {
    return (
        <div className={styles.cartItemsContainer}>
            <div className={styles.cartItemsHeader}>
                <h2>Cart Items</h2>
                <span className={styles.itemsCount}>{cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}</span>
            </div>
            
            <div className={styles.cartItemsList}>
                {cartItems.map((item) => {
                    // Create unique key based on product ID and size only
                    const uniqueKey = `${item.id}-${item.selected_size || 'no-size'}`;
                    
                    return (
                        <CartItem 
                            key={uniqueKey} 
                            item={item} 
                            updateQuantity={updateQuantity}
                            removeFromCart={removeFromCart}
                            isLoading={isLoading}
                        />
                    );
                })}
            </div>
        </div>
    );
};

export default CartItems;

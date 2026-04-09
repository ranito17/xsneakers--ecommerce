import React from 'react';
import WishlistCard from './WishlistCard';
import styles from './wishlistList.module.css';

const WishlistList = ({ products, onRemove }) => {
    if (!products || products.length === 0) {
        return null;
    }

    return (
        <div className={styles.wishlistList}>
            {products.map(product => (
                <WishlistCard
                    key={product.id}
                    product={product}
                    onRemove={onRemove}
                />
            ))}
        </div>
    );
};

export default WishlistList;


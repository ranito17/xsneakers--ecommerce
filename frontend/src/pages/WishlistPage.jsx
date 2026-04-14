import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuthentication';
import { useToast } from '../components/common/toast';
import { getWishlist, removeFromWishlist } from '../services/userApi';
import { productApi } from '../services/productApi';
import WishlistList from '../components/wishlist/WishlistList';
import { LoadingContainer, ErrorContainer } from '../components/contactForm';
import styles from './pages.module.css';

const WishlistPage = () => {
    const navigate = useNavigate();
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const { showError } = useToast();
    const [wishlistProducts, setWishlistProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // loadWishlist - טוען את המוצרים ב-wishlist של המשתמש
    // שליחה לשרת: getWishlist(), getAllProducts()
    // תגובה מהשרת: { wishlist: [...] }, { data: [...] }
    const loadWishlist = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const wishlistResponse = await getWishlist();
            const wishlistIds = wishlistResponse.wishlist || [];
            if (wishlistIds.length === 0) {
                setWishlistProducts([]);
                setIsLoading(false);
                return;
            }
            const productsResponse = await productApi.getProducts();
            const allProducts = productsResponse.data || [];
            const wishlistItems = allProducts.filter(product =>
                wishlistIds.includes(Number(product.id))
            );
            setWishlistProducts(wishlistItems);
        } catch (err) {
            console.error('Error loading wishlist:', err);
            setError('Failed to load wishlist. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };


    // handleRemoveFromWishlist - מסיר מוצר מה-wishlist
    // שליחה לשרת: removeFromWishlist(productId)
    // תגובה מהשרת: { success: true }
    const handleRemoveFromWishlist = async (productId) => {
        try {
            await removeFromWishlist(productId);
            setWishlistProducts(prev => prev.filter(product => product.id !== productId));
        } catch (err) {
            console.error('Error removing from wishlist:', err);
            showError('Failed to remove item from wishlist. Please try again.');
        }
    };


    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            navigate('/login');
            return;
        }
        if (isAuthenticated) {
            loadWishlist();
        }
    }, [isAuthenticated, authLoading, navigate]);
    if (authLoading || isLoading) {
        return <LoadingContainer message="Loading your wishlist..." size="medium" />;
    }
    if (error) {
        return <ErrorContainer message={error} onRetry={loadWishlist} />;
    }
    if (wishlistProducts.length === 0) {
        return (
            <div className={styles.wishlistContainer}>
                <div className={styles.wishlistEmpty}>
                    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                    <h2>Your Wishlist is Empty</h2>
                    <p>Save your favorite products and they'll appear here!</p>
                    <button
                        onClick={() => navigate('/products')}
                        className={styles.wishlistShopButton}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="9" cy="21" r="1"/>
                            <circle cx="20" cy="21" r="1"/>
                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                        </svg>
                        Start Shopping
                    </button>
                </div>
            </div>
        );
    }
    return (
        <div className={styles.wishlistContainer}>
            <div className={styles.wishlistHeader}>
                <h1 className={styles.wishlistTitle}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                    My Wishlist
                </h1>
                <p className={styles.wishlistCount}>
                    {wishlistProducts.length} {wishlistProducts.length === 1 ? 'item' : 'items'}
                </p>
            </div>
            <WishlistList
                products={wishlistProducts}
                onRemove={handleRemoveFromWishlist}
            />
        </div>
    );
};

export default WishlistPage;

// דף תשלום: מטפל בבדיקות גישה, הצגת סיכום הזמנה, ולשליחת הזמנה לשרת
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuthentication';
import { useCart } from '../hooks/useCart';
import { useSettings } from '../context/SettingsProvider';
import { useToast } from '../components/common/toast';
import { orderApi } from '../services/orderApi';
import { userApi } from '../services/userApi';
import { calculateOrderSummary, formatPrice, formatTaxRate } from '../utils/price.utils';
import { formatAddress, validateAddress } from '../utils/user.utils';
import PaymentForm from '../components/payment/PaymentForm';
import PaymentSummary from '../components/payment/PaymentSummary';
import PayPalModal from '../components/payment/PayPalModal';
import styles from './pages.module.css';

const PaymentPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated, user } = useAuth();
    const { cartItems, cartTotal, clearCart, loading: cartLoading } = useCart();
    const { calculateDeliveryCost, settings } = useSettings();
    const { showError, showSuccess, showWarning } = useToast();
    
    // Check if this is a "Buy Now" purchase (single product without adding to cart)
    const buyNowProduct = location.state?.buyNowProduct;
    const isBuyNow = !!buyNowProduct;
    
    const [paymentMethod, setPaymentMethod] = useState('credit-card');
    const [useSavedAddress, setUseSavedAddress] = useState(false);
    const [userProfile, setUserProfile] = useState(null);
    const [showPayPalModal, setShowPayPalModal] = useState(false);
    const [paypalOrderPayload, setPaypalOrderPayload] = useState(null);
    const [formData, setFormData] = useState({
        cardNumber: '',
        cardName: '',
        expiryDate: '',
        cvv: '',
        house_number: '',
        street: '',
        city: '',
        zipcode: ''
    });

    // ---- קריאות API ולוגיקה מול שרת (ממוקם מוקדם לקריאות ברורות) ----

        const fetchUserProfile = async () => {
        if (!isAuthenticated) return;
                try {
                    const response = await userApi.getProfile();
                    if (response.success) {
                        setUserProfile(response.data);
                    }
                } catch (error) {
                    console.error('Error fetching user profile:', error);
            }
        };

    // Fetch user profile to get address
    useEffect(() => {
        fetchUserProfile();
    }, [isAuthenticated]);

    // Parse user address from JSON string if needed
    const getUserAddress = () => {
        // Use userProfile if available, otherwise fallback to user from auth
        const userData = userProfile || user;
        if (!userData?.address) return null;
        
        try {
            // If address is a string, parse it
            if (typeof userData.address === 'string') {
                return JSON.parse(userData.address);
            }
            // If it's already an object, return it
            return userData.address;
        } catch (e) {
            console.error('Error parsing user address:', e);
            return null;
        }
    };

    const savedAddress = getUserAddress();

    // Debug: Log address info
    useEffect(() => {
        console.log('📍 PaymentPage - User from auth:', user);
        console.log('📍 PaymentPage - User profile:', userProfile);
        console.log('📍 PaymentPage - Saved address:', savedAddress);
        console.log('📍 PaymentPage - Use saved address:', useSavedAddress);
    }, [user, userProfile, savedAddress, useSavedAddress]);

    // Handle "Use Saved Address" button click
    const handleUseSavedAddress = () => {
        if (savedAddress) {
            setUseSavedAddress(true);
            setFormData(prev => ({
                ...prev,
                house_number: savedAddress.house_number || '',
                street: savedAddress.street || '',
                city: savedAddress.city || '',
                zipcode: savedAddress.zipcode || ''
            }));
        }
    };

    useEffect(() => {
        // Redirect to login if not authenticated
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        // Prevent admins from accessing payment page
        if (user && user.role === 'admin') {
            showError('Admins cannot place orders. Please use a customer account.');
            navigate('/');
            return;
        }

        // Redirect to cart if cart is empty AND not a Buy Now purchase
        if (!isBuyNow && (!cartItems || cartItems.length === 0)) {
            navigate('/cart');
            return;
        }
    }, [isAuthenticated, user, cartItems, navigate, isBuyNow, showError]);

    // Get items based on checkout type (Buy Now or Cart)
    const getCheckoutItems = () => {
        if (isBuyNow) {
            return [buyNowProduct];
        }
        return cartItems;
    };

    const checkoutItems = getCheckoutItems();
    
    // Calculate order summary using centralized utility
    const taxRate = settings.taxRate || 0.09; // 9% default
    const deliverySettings = {
        freeDeliveryThreshold: settings.freeDeliveryThreshold || 100,
        flatDeliveryCost: settings.flatDeliveryCost || 10,
        deliveryEnabled: settings.deliveryEnabled !== false
    };
    
    const orderSummary = calculateOrderSummary(checkoutItems, taxRate, deliverySettings);
    
    // Destructure for easy access
    const {
        subtotal: checkoutTotal,
        taxAmount,
        baseAmount,
        deliveryCost,
        total: totalAmount
    } = orderSummary;

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleChangeAddress = () => {
        setUseSavedAddress(false);
        setFormData(prev => ({
            ...prev,
            house_number: '',
            street: '',
            city: '',
            zipcode: ''
        }));
    };

    // Format address for display
    const formattedSavedAddress = savedAddress ? formatAddress(savedAddress, 'multiline') : null;

    // Format summary values
    const formattedSubtotal = formatPrice(checkoutTotal, settings?.currency || 'ILS');
    const formattedBaseAmount = formatPrice(baseAmount, settings?.currency || 'ILS');
    const formattedTaxAmount = formatPrice(taxAmount, settings?.currency || 'ILS');
    const formattedTaxRate = formatTaxRate(taxRate);
    const formattedDeliveryCost = deliveryCost === 0 ? 'FREE' : formatPrice(deliveryCost, settings?.currency || 'ILS');
    const formattedTotal = formatPrice(totalAmount, settings?.currency || 'ILS');
    const formattedFreeDeliveryAmount = settings.free_delivery_threshold 
        ? formatPrice(settings.free_delivery_threshold - cartTotal, settings?.currency || 'ILS')
        : null;

    // Format item prices
    const formattedItems = checkoutItems.map(item => ({
        ...item,
        formattedPrice: formatPrice(item.price * (item.quantity || 1), settings?.currency || 'ILS')
    }));

    // Validation functions using user.utils
    const validatePaymentAddress = () => {
        if (useSavedAddress && savedAddress) {
            // Validate saved address
            const validation = validateAddress(savedAddress);
            if (!validation.isValid) {
                return {
                    isValid: false,
                    error: Object.values(validation.errors).join(', ')
                };
            }
            return { isValid: true };
        } else {
            // Validate form address
            const addressToValidate = {
                house_number: formData.house_number,
                street: formData.street,
                city: formData.city,
                zipcode: formData.zipcode
            };
            const validation = validateAddress(addressToValidate);
            if (!validation.isValid) {
                return {
                    isValid: false,
                    error: Object.values(validation.errors).join(', ')
                };
            }
            return { isValid: true };
        }
    };

    const validatePaymentMethod = () => {
        if (paymentMethod === 'credit-card') {
            // In test mode, all fields are optional, but we can add validation here if needed
            return { isValid: true };
        }
        return { isValid: true };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!isAuthenticated || !user) {
            showWarning('Please log in to complete your order.');
            navigate('/login');
            return;
        }

        // Prevent admins from placing orders
        if (user.role === 'admin') {
            showError('Admins cannot place orders. Please use a customer account.');
            return;
        }

        // If PayPal is selected, validate + open modal.
        // Order creation will happen on backend only AFTER PayPal capture.
        if (paymentMethod === 'paypal') {
            const addressValidation = validatePaymentAddress();
            if (!addressValidation.isValid) {
                showWarning(addressValidation.error);
                return;
            }

            const orderAddress = (useSavedAddress && savedAddress) ? savedAddress : {
                house_number: formData.house_number,
                street: formData.street,
                city: formData.city,
                zipcode: formData.zipcode
            };

            setPaypalOrderPayload({
                delivery_cost: deliveryCost,
                address: orderAddress,
                items: checkoutItems.map(item => ({
                    product_id: item.id,
                    quantity: item.quantity || 1,
                    selected_size: item.selected_size
                }))
            });

            setShowPayPalModal(true);
            return;
        }

        // Validate payment method
        const paymentValidation = validatePaymentMethod();
        if (!paymentValidation.isValid) {
            showWarning(paymentValidation.error);
            return;
        }

        // Validate address using user.utils validation
        const addressValidation = validatePaymentAddress();
        if (!addressValidation.isValid) {
            showWarning(addressValidation.error);
            return;
        }

        try {
            // Prepare address data
            let orderAddress = null;
            if (useSavedAddress && savedAddress) {
                orderAddress = savedAddress;
            } else {
                orderAddress = {
                    house_number: formData.house_number,
                    street: formData.street,
                    city: formData.city,
                    zipcode: formData.zipcode
                };
            }

            // Prepare order data with all required fields
            const orderData = {
                delivery_cost: deliveryCost,
                address: orderAddress,
                items: checkoutItems.map(item => ({
                    product_id: item.id,
                    quantity: item.quantity || 1,
                    selected_size: item.selected_size
                })),
                payment_status: 'paid' // For credit card test orders
            };

            console.log('🛒 Payment Page: Placing order with data:', orderData);
            
            const result = await orderApi.placeOrder(orderData);
            
            if (result.success && result.data && result.data.orderNumber) {
                if (!isBuyNow) {
                    await clearCart();
                }
                
                showSuccess(`Order placed successfully! Your order number is: ${result.data.orderNumber}`);
                
                const orderId = result.data.orderId || result.data.id;
                if (orderId) {
                    navigate(`/orderPage?orderId=${orderId}`);
                } else {
                    navigate('/orderPage');
                }
            } else {
                const fallbackMessage = result?.message || 'Order placed, but order number not available.';
                showWarning(fallbackMessage);
                navigate('/orderPage');
            }
        } catch (error) {
            console.error('❌ Payment Page: Error placing order:', error);
            showError(error.response?.data?.message || 'Failed to place order. Please try again.');
        }
    };

    if ((!isBuyNow && (!checkoutItems || checkoutItems.length === 0)) || cartLoading) {
        return null;
    }

    return (
        <div className={styles.paymentPage}>
            <div className={styles.paymentContentWrapper}>
                {/* Left Side - Payment Form */}
                <div className={styles.paymentSection}>
                    <h1 className={styles.paymentTitle}>Payment Information</h1>
                    
                    <form onSubmit={handleSubmit} className={styles.paymentForm}>
                        <PaymentForm
                            paymentMethod={paymentMethod}
                            onPaymentMethodChange={setPaymentMethod}
                            formData={formData}
                            onInputChange={handleInputChange}
                            savedAddress={savedAddress}
                            formattedSavedAddress={formattedSavedAddress}
                            useSavedAddress={useSavedAddress}
                            onUseSavedAddress={handleUseSavedAddress}
                            onChangeAddress={handleChangeAddress}
                        />

                        <button type="submit" className={styles.paymentSubmitButton}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M5 12h14"/>
                                <path d="M12 5l7 7-7 7"/>
                            </svg>
                            Place Test Order
                        </button>
                    </form>
                </div>

                {/* Right Side - Order Summary */}
                <PaymentSummary
                    items={formattedItems}
                    formattedSubtotal={formattedSubtotal}
                    formattedBaseAmount={formattedBaseAmount}
                    formattedTaxAmount={formattedTaxAmount}
                    formattedTaxRate={formattedTaxRate}
                    formattedDeliveryCost={formattedDeliveryCost}
                    formattedTotal={formattedTotal}
                    showFreeDeliveryNote={deliveryCost > 0 && settings.free_delivery_threshold}
                    formattedFreeDeliveryAmount={formattedFreeDeliveryAmount}
                />
            </div>

            {/* PayPal Modal */}
            <PayPalModal
                isOpen={showPayPalModal}
                onClose={() => {
                    setShowPayPalModal(false);
                    setPaypalOrderPayload(null);
                }}
                storeOrderPayload={paypalOrderPayload}
                onSuccess={async (paypalResult) => {
                    setShowPayPalModal(false);

                    if (!isBuyNow) {
                        await clearCart();
                    }

                    const demoNote = paypalResult?.demo ? ' (demo)' : '';
                    showSuccess(`PayPal payment successful${demoNote}! Order: ${paypalResult.orderNumber}`);

                    if (paypalResult?.orderId) {
                        navigate(`/orderPage?orderId=${paypalResult.orderId}`);
                    } else {
                        navigate('/orderPage');
                    }
                }}
                amount={totalAmount}
                currency={settings?.currency || 'ILS'}
                description={`Order payment - ${checkoutItems.length} item(s)`}
            />
        </div>
    );
};

export default PaymentPage;


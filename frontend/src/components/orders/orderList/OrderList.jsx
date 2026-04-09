import React from 'react';
import OrderCard from '../orderCard/OrderCard';
import styles from './orderList.module.css';

const OrderList = ({ orders, onViewDetails, onDownloadReceipt }) => {
    return (
        <div className={styles.orderList}>
            {orders.map(order => (
                <OrderCard 
                    key={order.order_id} 
                    order={order} 
                    onViewDetails={onViewDetails}
                    onDownloadReceipt={onDownloadReceipt}
                />
            ))}
        </div>
    );
};

export default OrderList;

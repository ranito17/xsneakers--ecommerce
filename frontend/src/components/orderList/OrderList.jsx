import React from 'react';
import OrderCard from '../orderCard/OrderCard';
import styles from './orderList.module.css';

const OrderList = ({ orders, onViewDetails }) => {
    return (
        <div className={styles.orderList}>
            {orders.map(order => (
                <OrderCard key={order.order_id} order={order} onViewDetails={onViewDetails} />
            ))}
        </div>
    );
};

export default OrderList;

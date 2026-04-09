import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import styles from './charts.module.css';
import { formatPrice } from '../../../../utils/price.utils';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

/**
 * SizeDistributionChart Component
 * 
 * Displays size distribution analytics using horizontal bar chart.
 * Best for limited, discrete size categories (e.g., 7, 8, 9, 10, 11, 12, 13).
 * 
 * Shows:
 * - Quantity sold per size
 * - Revenue per size
 * - Order count per size
 * 
 * Features:
 * - Sort by quantity (ascending/descending)
 * - Sort by size (ascending/descending)
 */
const SizeDistributionChart = ({ data = [], isLoading = false, title = "Size Distribution" }) => {
  // Hooks must be called before any conditional returns
  const [sortBy, setSortBy] = React.useState('quantity'); // 'quantity' or 'size'
  const [sortOrder, setSortOrder] = React.useState('desc'); // 'asc' or 'desc'

  // Sort data based on selected option (only if data exists)
  const sortedData = React.useMemo(() => {
    if (!data || data.length === 0) return [];
    
    const dataCopy = [...data];
    
    if (sortBy === 'quantity') {
      // Sort by quantity sold
      return dataCopy.sort((a, b) => {
        const qtyA = parseInt(a.total_quantity_sold) || 0;
        const qtyB = parseInt(b.total_quantity_sold) || 0;
        return sortOrder === 'desc' ? qtyB - qtyA : qtyA - qtyB;
      });
    } else {
      // Sort by size
      return dataCopy.sort((a, b) => {
        const sizeA = parseFloat(a.size) || 0;
        const sizeB = parseFloat(b.size) || 0;
        return sortOrder === 'desc' ? sizeB - sizeA : sizeA - sizeB;
      });
    }
  }, [data, sortBy, sortOrder]);

  // Prepare chart data (recalculates when sortedData changes)
  // Show empty bars with minimal height if no data (like OrdersBarChart)
  const chartData = React.useMemo(() => {
    if (!sortedData || sortedData.length === 0) {
      // Return empty chart structure with placeholder bars
      return {
        labels: ['No Data'],
        datasets: [{
          label: 'Quantity Sold',
          data: [0],
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          borderColor: '#3B82F6',
          borderWidth: 2,
          borderRadius: 6,
          borderSkipped: false,
          hoverBackgroundColor: 'rgba(59, 130, 246, 0.3)',
        }]
      };
    }
    
    // Calculate max quantity for zero bar height
    const maxQuantity = Math.max(...sortedData.map(item => parseInt(item.total_quantity_sold) || 0), 1);
    const zeroBarHeight = 0.005; // 0.5% - minimal visible height
    
    return {
      labels: sortedData.map(item => `Size ${item.size}`),
      datasets: [
        {
          label: 'Quantity Sold',
          data: sortedData.map(item => {
            const value = parseInt(item.total_quantity_sold) || 0;
            // If zero, show as minimal height (0.5% of max) just to see the edge
            return value === 0 ? maxQuantity * zeroBarHeight : value;
          }),
          backgroundColor: sortedData.map(item => {
            const value = parseInt(item.total_quantity_sold) || 0;
            return value === 0 ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.8)';
          }),
          borderColor: '#3B82F6',
          borderWidth: 2,
          borderRadius: 6,
          borderSkipped: false,
          hoverBackgroundColor: 'rgba(59, 130, 246, 1)',
        }
      ]
    };
  }, [sortedData]);

  const options = {
    indexAxis: 'y', // Horizontal bar chart
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#374151',
          font: {
            size: 12,
            weight: '500'
          },
          usePointStyle: true,
          pointStyle: 'rect'
        }
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#111827',
        bodyColor: '#374151',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        cornerRadius: 12,
        displayColors: true,
        callbacks: {
          label: function(context) {
            if (!sortedData || sortedData.length === 0) {
              return ['No data available'];
            }
            const index = context.dataIndex;
            if (index >= sortedData.length) return ['No data'];
            
            const item = sortedData[index];
            if (!item) return ['No data'];
            
            // For zero values, show actual zero (not the minimal height value)
            const actualValue = parseInt(item.total_quantity_sold) || 0;
            const quantity = actualValue;
            const revenue = parseFloat(item.total_revenue) || 0;
            const orders = parseInt(item.order_count) || 0;
            
            return [
              `Quantity: ${quantity} units`,
              `Revenue: ${formatPrice(revenue)}`,
              `Orders: ${orders}`
            ];
          }
        }
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: false
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 12,
            weight: '500'
          },
          stepSize: 1
        },
        title: {
          display: true,
          text: 'Quantity Sold',
          color: '#374151',
          font: {
            size: 13,
            weight: '600'
          }
        }
      },
      y: {
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: false
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 12,
            weight: '500'
          }
        }
      }
    },
    interaction: {
      mode: 'index',
      intersect: false,
    }
  };

  // Calculate summary statistics
  const totalQuantity = React.useMemo(() => {
    if (!sortedData || sortedData.length === 0) return 0;
    return sortedData.reduce((sum, item) => sum + (parseInt(item.total_quantity_sold) || 0), 0);
  }, [sortedData]);

  const totalRevenue = React.useMemo(() => {
    if (!sortedData || sortedData.length === 0) return 0;
    return sortedData.reduce((sum, item) => sum + (parseFloat(item.total_revenue) || 0), 0);
  }, [sortedData]);

  const mostPopularSize = React.useMemo(() => {
    if (!sortedData || sortedData.length === 0) return {};
    return sortedData.reduce((max, item) => {
      const currentQty = parseInt(item.total_quantity_sold) || 0;
      const maxQty = parseInt(max.total_quantity_sold) || 0;
      return currentQty > maxQty ? item : max;
    }, sortedData[0]);
  }, [sortedData]);

  // Handle loading state
  if (isLoading) {
    return (
      <div className={styles.chartContainer}>
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>Loading size data...</p>
        </div>
      </div>
    );
  }

  // Always show chart, even with empty data
  return (
    <div className={styles.chartContainer}>
      <div className={styles.chartHeader}>
        <h3>{title}</h3>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              padding: '0.5rem 0.75rem',
              borderRadius: '6px',
              border: '1px solid #e2e8f0',
              backgroundColor: 'white',
              color: '#374151',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            <option value="quantity">Sort by Quantity</option>
            <option value="size">Sort by Size</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            style={{
              padding: '0.5rem 0.75rem',
              borderRadius: '6px',
              border: '1px solid #e2e8f0',
              backgroundColor: 'white',
              color: '#374151',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}
            title={sortOrder === 'desc' ? 'Descending' : 'Ascending'}
          >
            {sortOrder === 'desc' ? '↓' : '↑'}
            {sortOrder === 'desc' ? 'Desc' : 'Asc'}
          </button>
        </div>
      </div>
      <div className={styles.chartWrapper}>
        <Bar data={chartData} options={options} />
      </div>
      
      {/* Summary Footer */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        marginTop: '24px', 
        padding: '20px',
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#64748b', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>Total Quantity</div>
          <div style={{ color: '#0f172a', fontSize: '20px', fontWeight: '700' }}>
            {totalQuantity.toLocaleString()}
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#64748b', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>Total Revenue</div>
          <div style={{ color: '#0f172a', fontSize: '20px', fontWeight: '700' }}>
            {formatPrice(totalRevenue)}
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#64748b', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>Most Popular</div>
          <div style={{ color: '#0f172a', fontSize: '20px', fontWeight: '700' }}>
            Size {mostPopularSize.size || 'N/A'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SizeDistributionChart;


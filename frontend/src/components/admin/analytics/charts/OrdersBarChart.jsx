import React, { useState, useEffect } from 'react';
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
import { processWeekData, process4WeeksData, getWeekStart, getPreviousWeek, getNextWeek, getMonthStart, getPreviousMonth, getNextMonth } from '../../../../utils/chartUtils';
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

const OrdersBarChart = ({ data = [], isLoading = false, dateRange, groupBy = 'day', onGroupByChange }) => {
  // Determine if we're using 4-week grouping
  const daysDiff = dateRange?.startDate && dateRange?.endDate ? 
    Math.ceil((new Date(dateRange.endDate) - new Date(dateRange.startDate)) / (1000 * 60 * 60 * 24)) : 0;
  const use4Weeks = (daysDiff > 30 && groupBy === '4weeks');
  
  // State for current week/month view - initialize to start of date range
  const [currentPeriodStart, setCurrentPeriodStart] = useState(() => {
    if (dateRange?.startDate) {
      if (use4Weeks) {
        // For 4-week view, use first day of the month containing start date
        return getMonthStart(dateRange.startDate);
      } else {
        // Use the start date's week, but ensure we don't go before the actual start date
        const weekStart = getWeekStart(dateRange.startDate);
        const weekStartStr = weekStart.toISOString().split('T')[0];
        // If week start is before the actual start date, use the start date itself
        return weekStartStr < dateRange.startDate ? dateRange.startDate : weekStartStr;
      }
    }
    if (use4Weeks) {
      return getMonthStart(new Date().toISOString().split('T')[0]);
    }
    return getWeekStart(new Date()).toISOString().split('T')[0];
  });


  // Update period start when date range or grouping changes
  useEffect(() => {
    if (dateRange?.startDate) {
      if (use4Weeks) {
        // For 4-week view, use first day of the month
        setCurrentPeriodStart(getMonthStart(dateRange.startDate));
      } else {
        // Use the start date's week, but ensure we don't go before the actual start date
        const weekStart = getWeekStart(dateRange.startDate);
        const weekStartStr = weekStart.toISOString().split('T')[0];
        // If week start is before the actual start date, use the start date itself
        const newPeriodStart = weekStartStr < dateRange.startDate ? dateRange.startDate : weekStartStr;
        setCurrentPeriodStart(newPeriodStart);
      }
    }
  }, [dateRange?.startDate, use4Weeks]);

  if (isLoading) {
    return (
      <div className={styles.chartContainer}>
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>Loading orders data...</p>
        </div>
      </div>
    );
  }

  // Process data based on grouping
  // If data is empty or all zeros, show empty state
  const hasData = data && Array.isArray(data) && data.length > 0 && 
    data.some(item => (parseInt(item.order_count) || 0) > 0 || (parseFloat(item.revenue) || 0) > 0);
  
  const chartDataProcessed = use4Weeks 
    ? process4WeeksData(data, currentPeriodStart)
    : processWeekData(data, currentPeriodStart);

  // Check if there's no data to display
  if (!hasData || !chartDataProcessed || chartDataProcessed.length === 0) {
    const periodLabel = use4Weeks ? 'month' : 'week';
    return (
      <div className={styles.chartContainer}>
        <div className={styles.chartHeader}>
          <h3>Orders Sold Over Time</h3>
        </div>
        <div className={styles.emptyState}>
          <p>No sales this {periodLabel}</p>
        </div>
      </div>
    );
  }

  // Check if we can navigate
  const canGoPrevious = use4Weeks
    ? (dateRange?.startDate ? new Date(getPreviousMonth(currentPeriodStart)) >= new Date(getMonthStart(dateRange.startDate)) : true)
    : (dateRange?.startDate ? new Date(getPreviousWeek(currentPeriodStart)) >= new Date(dateRange.startDate) : true);
  const canGoNext = use4Weeks
    ? (dateRange?.endDate ? getNextMonth(currentPeriodStart, dateRange.endDate) !== null : true)
    : (dateRange?.endDate ? getNextWeek(currentPeriodStart, dateRange.endDate) !== null : true);

  // Prepare chart data - ensure zero values show as minimal visible bars
  const maxOrders = Math.max(...chartDataProcessed.map(item => parseInt(item.order_count) || 0), 1);
  const maxRevenue = Math.max(...chartDataProcessed.map(item => parseFloat(item.revenue) || 0), 1);
  
  // Use a very small percentage for zero values (just enough to see the edge)
  const zeroBarHeight = 0.005; // 0.5% - minimal visible height
  
  const chartData = {
    labels: chartDataProcessed.map(item => item.displayDate),
    datasets: [
      {
        label: 'Orders',
        data: chartDataProcessed.map(item => {
          const value = parseInt(item.order_count) || 0;
          // If zero, show as minimal height (0.5% of max) just to see the edge
          return value === 0 ? maxOrders * zeroBarHeight : value;
        }),
        backgroundColor: chartDataProcessed.map(item => {
          const value = parseInt(item.order_count) || 0;
          return value === 0 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.8)';
        }),
        borderColor: '#10B981',
        borderWidth: 1,
        borderRadius: 6,
        borderSkipped: false,
        hoverBackgroundColor: 'rgba(16, 185, 129, 1)',
      },
      {
        label: 'Revenue',
        data: chartDataProcessed.map(item => {
          const value = parseFloat(item.revenue) || 0;
          // If zero, show as minimal height (0.5% of max) just to see the edge
          return value === 0 ? maxRevenue * zeroBarHeight : value;
        }),
        backgroundColor: chartDataProcessed.map(item => {
          const value = parseFloat(item.revenue) || 0;
          return value === 0 ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.8)';
        }),
        borderColor: '#3B82F6',
        borderWidth: 1,
        borderRadius: 6,
        borderSkipped: false,
        hoverBackgroundColor: 'rgba(59, 130, 246, 1)',
        yAxisID: 'y1',
      }
    ]
  };

  const options = {
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
            const dataIndex = context.dataIndex;
            const actualValue = chartDataProcessed[dataIndex];
            
            if (context.dataset.label === 'Revenue') {
              const revenue = parseFloat(actualValue.revenue) || 0;
              return `Revenue: ${formatPrice(revenue)}`;
            } else {
              const orders = parseInt(actualValue.order_count) || 0;
              return `${context.dataset.label}: ${orders}`;
            }
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: false
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 11,
            weight: '500'
          },
          maxRotation: 45,
          minRotation: 0
        }
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
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
          stepSize: 1,
          callback: function(value) {
            return Math.round(value); // Ensure integers
          }
        },
        title: {
          display: true,
          text: 'Orders',
          color: '#374151',
          font: {
            size: 13,
            weight: '600'
          }
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        beginAtZero: true,
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 12,
            weight: '500'
          },
          callback: function(value) {
            return formatPrice(value);
          }
        },
        title: {
          display: true,
          text: 'Revenue',
          color: '#374151',
          font: {
            size: 13,
            weight: '600'
          }
        }
      }
    },
    interaction: {
      mode: 'index',
      intersect: false,
    }
  };

  // Calculate summary data
  const totalOrders = chartDataProcessed.reduce((sum, item) => sum + (parseInt(item.order_count) || 0), 0);
  const totalRevenue = chartDataProcessed.reduce((sum, item) => sum + (parseFloat(item.revenue) || 0), 0);
  const avgOrdersPerPeriod = chartDataProcessed.length > 0 ? totalOrders / chartDataProcessed.length : 0;

  const handlePreviousPeriod = () => {
    if (canGoPrevious) {
      if (use4Weeks) {
        setCurrentPeriodStart(getPreviousMonth(currentPeriodStart));
      } else {
        setCurrentPeriodStart(getPreviousWeek(currentPeriodStart));
      }
    }
  };

  const handleNextPeriod = () => {
    if (canGoNext) {
      if (use4Weeks) {
        const next = getNextMonth(currentPeriodStart, dateRange?.endDate);
        if (next) {
          setCurrentPeriodStart(next);
        }
      } else {
        const next = getNextWeek(currentPeriodStart, dateRange?.endDate);
        if (next) {
          setCurrentPeriodStart(next);
        }
      }
    }
  };


  const periodEndDate = use4Weeks 
    ? (() => {
        // For 4-week view, show the month name and year
        const monthDate = new Date(currentPeriodStart);
        return monthDate;
      })()
    : (() => {
        const end = new Date(currentPeriodStart);
        end.setDate(end.getDate() + 6);
        return end;
      })();

  // Check if date range > 1 month to show grouping option (daysDiff already declared above)
  const showGroupingOption = daysDiff > 30 && onGroupByChange;

  return (
    <div className={styles.chartContainer}>
      <div className={styles.chartHeader}>
        <h3>Orders Sold Over Time</h3>
        <div className={styles.chartInfo}>
          {/* Grouping Option (only show if date range > 1 month) */}
          {showGroupingOption && (
            <div style={{ marginRight: '1rem' }}>
              <select
                value={groupBy}
                onChange={(e) => onGroupByChange(e.target.value)}
                style={{
                  padding: '0.5rem 0.75rem',
                  borderRadius: '6px',
                  border: '2px solid #e2e8f0',
                  backgroundColor: 'white',
                  color: '#374151',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
              >
                <option value="day">By Day</option>
                <option value="4weeks">4 Weeks (8 bars)</option>
              </select>
            </div>
          )}
          {/* Period Navigation */}
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={handlePreviousPeriod}
              disabled={!canGoPrevious}
              style={{
                padding: '0.5rem 0.75rem',
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
                backgroundColor: canGoPrevious ? 'white' : '#f3f4f6',
                color: canGoPrevious ? '#374151' : '#9ca3af',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: canGoPrevious ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s'
              }}
            >
              ← Previous {use4Weeks ? 'Month' : 'Week'}
            </button>
            {/* Date Display */}
            <div style={{ 
              fontSize: '0.875rem', 
              color: '#374151',
              fontWeight: '600',
              padding: '0.5rem 1rem',
              minWidth: '200px',
              textAlign: 'center'
            }}>
              {use4Weeks 
                ? new Date(currentPeriodStart).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                : (() => {
                    const weekStart = new Date(currentPeriodStart);
                    const weekEnd = new Date(weekStart);
                    weekEnd.setDate(weekStart.getDate() + 6);
                    return `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
                  })()
              }
            </div>
            <button
              onClick={handleNextPeriod}
              disabled={!canGoNext}
              style={{
                padding: '0.5rem 0.75rem',
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
                backgroundColor: canGoNext ? 'white' : '#f3f4f6',
                color: canGoNext ? '#374151' : '#9ca3af',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: canGoNext ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s'
              }}
            >
              Next {use4Weeks ? 'Month' : 'Week'} →
            </button>
          </div>
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
          <div style={{ color: '#64748b', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>Total Orders</div>
          <div style={{ color: '#0f172a', fontSize: '20px', fontWeight: '700' }}>
            {Math.round(totalOrders).toLocaleString()}
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#64748b', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>Total Revenue</div>
          <div style={{ color: '#0f172a', fontSize: '20px', fontWeight: '700' }}>
            {formatPrice(totalRevenue)}
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#64748b', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>Avg Orders/{use4Weeks ? 'Period' : 'Day'}</div>
          <div style={{ color: '#0f172a', fontSize: '20px', fontWeight: '700' }}>
            {Math.round(avgOrdersPerPeriod)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrdersBarChart;

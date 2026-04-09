import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { Pie } from 'react-chartjs-2';
import styles from './charts.module.css';

// Register Chart.js components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

const PieChart = ({ 
  data = [], 
  isLoading = false, 
  title = "Data Distribution",
  chartType = "pie" // "pie" or "doughnut"
}) => {
  if (isLoading) {
    return (
      <div className={styles.chartContainer}>
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>Loading chart data...</p>
        </div>
      </div>
    );
  }

  // Default sample data - you can replace this with real data later
  const defaultData = [
    { label: 'Category A', value: 30, color: '#3B82F6' },
    { label: 'Category B', value: 25, color: '#10B981' },
    { label: 'Category C', value: 20, color: '#F59E0B' },
    { label: 'Category D', value: 15, color: '#EF4444' },
    { label: 'Category E', value: 10, color: '#8B5CF6' }
  ];

  const chartData = data.length > 0 ? data : defaultData;

  if (!chartData || chartData.length === 0) {
    return (
      <div className={styles.chartContainer}>
        <div className={styles.emptyState}>
          <p>No data available for the chart</p>
        </div>
      </div>
    );
  }

  // Generate colors if not provided
  const colors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1',
    '#14B8A6', '#F43F5E', '#A855F7', '#0EA5E9', '#22C55E'
  ];

  const chartConfig = {
    labels: chartData.map(item => item.label || item.name || 'Unknown'),
    datasets: [
      {
        data: chartData.map(item => item.value || item.count || 0),
        backgroundColor: chartData.map((item, index) => 
          item.color || colors[index % colors.length]
        ),
        borderColor: '#1F2937',
        borderWidth: 2,
        hoverOffset: 4,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: '#374151',
          font: {
            size: 12,
            weight: '500'
          },
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 15,
          generateLabels: function(chart) {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              return data.labels.map((label, i) => {
                const dataset = data.datasets[0];
                const value = dataset.data[i];
                const total = dataset.data.reduce((a, b) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                
                return {
                  text: `${label} (${percentage}%)`,
                  fillStyle: dataset.backgroundColor[i],
                  strokeStyle: dataset.borderColor,
                  lineWidth: dataset.borderWidth,
                  pointStyle: 'circle',
                  hidden: false,
                  index: i
                };
              });
            }
            return [];
          }
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
            const label = context.label || '';
            const value = context.parsed;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    }
  };

  // Calculate total
  const total = chartData.reduce((sum, item) => sum + (item.value || item.count || 0), 0);

  return (
    <div className={styles.chartContainer}>
      <div className={styles.chartHeader}>
        <h3>{title}</h3>
        <div className={styles.chartInfo}>
          <span>Total: {total.toLocaleString()}</span>
        </div>
      </div>
      <div className={styles.chartWrapper}>
        {chartType === "doughnut" ? (
          <Pie 
            data={chartConfig} 
            options={{
              ...options,
              cutout: '60%'
            }} 
          />
        ) : (
          <Pie data={chartConfig} options={options} />
        )}
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
        {chartData.slice(0, 3).map((item, index) => (
          <div key={index} style={{ textAlign: 'center' }}>
            <div style={{ 
              color: '#64748b', 
              fontSize: '13px', 
              fontWeight: '600',
              marginBottom: '4px'
            }}>
              {item.label || item.name || `Item ${index + 1}`}
            </div>
            <div style={{ 
              color: '#0f172a', 
              fontSize: '20px', 
              fontWeight: '700' 
            }}>
              {item.value || item.count || 0}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PieChart;

import React from 'react';
import { Card } from '../shared/Card';

interface ChartData {
  label: string;
  value: number;
  color?: string;
}

interface AnalyticsChartProps {
  title: string;
  data: ChartData[];
  type: 'bar' | 'line' | 'pie' | 'area';
  height?: number;
  showValues?: boolean;
}

export const AnalyticsChart: React.FC<AnalyticsChartProps> = ({
  title,
  data,
  type,
  height = 300,
  showValues = true
}) => {
  const maxValue = Math.max(...data.map(d => d.value));
  const colors = ['#1E3A8A', '#D4AF37', '#059669', '#DC2626', '#7C3AED', '#EA580C'];

  const renderBarChart = () => (
    <div className="flex items-end justify-between h-full space-x-2">
      {data.map((item, index) => {
        const barHeight = (item.value / maxValue) * 100;
        const color = item.color || colors[index % colors.length];
        
        return (
          <div key={index} className="flex flex-col items-center flex-1">
            <div className="relative w-full flex items-end justify-center" style={{ height: height - 60 }}>
              <div
                className="w-full rounded-t-md transition-all duration-500 ease-out"
                style={{
                  height: `${barHeight}%`,
                  backgroundColor: color,
                  minHeight: item.value > 0 ? '4px' : '0px'
                }}
              />
              {showValues && item.value > 0 && (
                <div className="absolute -top-6 text-xs font-medium text-gray-600">
                  {item.value.toLocaleString()}
                </div>
              )}
            </div>
            <div className="mt-2 text-xs text-center text-gray-600 truncate w-full">
              {item.label}
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderLineChart = () => {
    const points = data.map((item, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = 100 - (item.value / maxValue) * 80; // 80% of height for chart area
      return `${x},${y}`;
    }).join(' ');

    return (
      <div className="relative w-full" style={{ height }}>
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <polyline
            fill="none"
            stroke="#1E3A8A"
            strokeWidth="0.5"
            points={points}
            className="drop-shadow-sm"
          />
          {data.map((item, index) => {
            const x = (index / (data.length - 1)) * 100;
            const y = 100 - (item.value / maxValue) * 80;
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="1"
                fill="#D4AF37"
                className="drop-shadow-sm"
              />
            );
          })}
        </svg>
        <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-600">
          {data.map((item, index) => (
            <span key={index} className="truncate">
              {item.label}
            </span>
          ))}
        </div>
      </div>
    );
  };

  const renderPieChart = () => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let currentAngle = 0;

    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <div className="relative">
          <svg width="200" height="200" viewBox="0 0 200 200">
            {data.map((item, index) => {
              const percentage = (item.value / total) * 100;
              const angle = (item.value / total) * 360;
              const color = item.color || colors[index % colors.length];
              
              const startAngle = currentAngle;
              const endAngle = currentAngle + angle;
              currentAngle += angle;

              const startAngleRad = (startAngle * Math.PI) / 180;
              const endAngleRad = (endAngle * Math.PI) / 180;

              const largeArcFlag = angle > 180 ? 1 : 0;

              const x1 = 100 + 80 * Math.cos(startAngleRad);
              const y1 = 100 + 80 * Math.sin(startAngleRad);
              const x2 = 100 + 80 * Math.cos(endAngleRad);
              const y2 = 100 + 80 * Math.sin(endAngleRad);

              const pathData = [
                `M 100 100`,
                `L ${x1} ${y1}`,
                `A 80 80 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                'Z'
              ].join(' ');

              return (
                <path
                  key={index}
                  d={pathData}
                  fill={color}
                  className="hover:opacity-80 transition-opacity"
                />
              );
            })}
          </svg>
        </div>
        <div className="ml-6 space-y-2">
          {data.map((item, index) => {
            const percentage = ((item.value / total) * 100).toFixed(1);
            const color = item.color || colors[index % colors.length];
            
            return (
              <div key={index} className="flex items-center space-x-2 text-sm">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span className="text-gray-700">
                  {item.label}: {percentage}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderAreaChart = () => {
    const points = data.map((item, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = 100 - (item.value / maxValue) * 80;
      return `${x},${y}`;
    }).join(' ');

    const areaPoints = `0,100 ${points} 100,100`;

    return (
      <div className="relative w-full" style={{ height }}>
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1E3A8A" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#1E3A8A" stopOpacity="0.1" />
            </linearGradient>
          </defs>
          <polygon
            fill="url(#areaGradient)"
            points={areaPoints}
          />
          <polyline
            fill="none"
            stroke="#1E3A8A"
            strokeWidth="0.5"
            points={points}
          />
        </svg>
        <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-600">
          {data.map((item, index) => (
            <span key={index} className="truncate">
              {item.label}
            </span>
          ))}
        </div>
      </div>
    );
  };

  const renderChart = () => {
    switch (type) {
      case 'bar':
        return renderBarChart();
      case 'line':
        return renderLineChart();
      case 'pie':
        return renderPieChart();
      case 'area':
        return renderAreaChart();
      default:
        return renderBarChart();
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
      {data.length > 0 ? (
        renderChart()
      ) : (
        <div className="flex items-center justify-center h-64 text-gray-500">
          No data available
        </div>
      )}
    </Card>
  );
};
import { useState } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface ChartData {
  name: string;
  value: number;
}

interface PortfolioChartProps {
  data: ChartData[];
}

const PortfolioChart = ({ data }: PortfolioChartProps) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  
  // Define colors based on our theme
  const COLORS = [
    '#3b82f6', // blue-500
    '#6366f1', // indigo-500
    '#8b5cf6', // violet-500
    '#a855f7', // purple-500
    '#ec4899', // pink-500
    '#14b8a6', // teal-500
    '#06b6d4', // cyan-500
    '#0ea5e9', // sky-500
  ];
  
  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 px-3 py-2 border border-gray-700 rounded shadow-lg">
          <p className="text-sm font-medium text-white">{payload[0].name}</p>
          <p className="text-sm text-gray-300">
            ${payload[0].value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-gray-400">
            {((payload[0].value / data.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(2)}%
          </p>
        </div>
      );
    }
    return null;
  };
  
  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };
  
  const onPieLeave = () => {
    setActiveIndex(null);
  };
  
  // If there's no data, show empty state
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-gray-500">
        <p>No portfolio data available</p>
      </div>
    );
  }
  
  return (
    <motion.div 
      className="h-60 w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
            onMouseEnter={onPieEnter}
            onMouseLeave={onPieLeave}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index % COLORS.length]} 
                stroke="transparent"
                opacity={activeIndex === null || activeIndex === index ? 1 : 0.7}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      
      <div className="flex flex-wrap justify-center mt-2 gap-3">
        {data.map((entry, index) => (
          <div 
            key={`legend-${index}`} 
            className="flex items-center"
            onMouseEnter={() => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(null)}
          >
            <div 
              className="w-3 h-3 rounded-full mr-1.5" 
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            <span className="text-xs text-gray-300">{entry.name}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default PortfolioChart;

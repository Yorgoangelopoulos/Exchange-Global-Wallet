import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExternalLink, Info } from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid 
} from 'recharts';
import { CryptoCurrency } from '@shared/schema';

interface CoinInfoProps {
  currency: CryptoCurrency;
  price: number;
  priceChange24h: number;
}

// Mock data for the charts
const generateChartData = (basePrice: number, days: number) => {
  const data = [];
  const now = new Date();
  const volatility = basePrice * 0.2; // 20% volatility
  
  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    // Create some price movement
    const randomChange = (Math.random() - 0.5) * 2 * volatility / days;
    const price = basePrice + randomChange * i;
    
    data.push({
      date: date.toISOString().split('T')[0],
      price: parseFloat(price.toFixed(2))
    });
  }
  
  return data;
};

const CoinInfo = ({ currency, price, priceChange24h }: CoinInfoProps) => {
  const [chartTimeframe, setChartTimeframe] = useState('1d');
  const [chartData, setChartData] = useState<any[]>([]);
  
  // Generate chart data based on timeframe
  useEffect(() => {
    const days = {
      '1d': 1,
      '1w': 7,
      '1m': 30,
      '3m': 90,
      '1y': 365
    }[chartTimeframe] || 1;
    
    setChartData(generateChartData(price, days));
  }, [chartTimeframe, price]);
  
  // Custom tooltip for chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 p-2 border border-gray-700 rounded shadow-lg">
          <p className="text-xs text-gray-300">{label}</p>
          <p className="text-sm font-semibold text-white">
            ${payload[0].value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      );
    }
    return null;
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <Card className="bg-gray-900/60 backdrop-blur-md border-gray-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl text-gray-100">Price Chart</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-2xl font-bold text-white">
                ${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
              <p className={`text-sm font-medium ${priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {priceChange24h >= 0 ? '+' : ''}{priceChange24h.toFixed(2)}% (24h)
              </p>
            </div>
            
            <Tabs defaultValue="1d" className="w-auto" onValueChange={setChartTimeframe}>
              <TabsList className="bg-gray-800 border border-gray-700">
                <TabsTrigger value="1d" className="text-xs">1D</TabsTrigger>
                <TabsTrigger value="1w" className="text-xs">1W</TabsTrigger>
                <TabsTrigger value="1m" className="text-xs">1M</TabsTrigger>
                <TabsTrigger value="3m" className="text-xs">3M</TabsTrigger>
                <TabsTrigger value="1y" className="text-xs">1Y</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="#9ca3af" 
                  fontSize={12}
                  tickFormatter={(value) => {
                    if (chartTimeframe === '1d') return value.split('-')[2]; // Just day
                    if (chartTimeframe === '1w') return value.split('-').slice(1).join('/'); // Month/Day
                    return value; // Full date
                  }}
                  tickLine={false}
                />
                <YAxis 
                  stroke="#9ca3af" 
                  fontSize={12}
                  tickFormatter={(value) => `$${value}`}
                  tickLine={false}
                  axisLine={false}
                  domain={['dataMin - 1%', 'dataMax + 1%']}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="price" 
                  stroke="#3b82f6" 
                  strokeWidth={2} 
                  dot={false}
                  activeDot={{ r: 6, fill: '#3b82f6', stroke: '#1e40af', strokeWidth: 2 }}
                  fill="url(#colorPrice)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-gray-900/60 backdrop-blur-md border-gray-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl text-gray-100">About {currency.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-gray-300">
              {currency.description || `${currency.name} (${currency.symbol}) is a cryptocurrency that exists on the blockchain.`}
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm text-gray-400 mb-1">Market Cap</h4>
                <p className="text-white font-medium">$47.2B</p>
              </div>
              <div>
                <h4 className="text-sm text-gray-400 mb-1">24h Volume</h4>
                <p className="text-white font-medium">$1.8B</p>
              </div>
              <div>
                <h4 className="text-sm text-gray-400 mb-1">Circulating Supply</h4>
                <p className="text-white font-medium">18.9M {currency.symbol}</p>
              </div>
              <div>
                <h4 className="text-sm text-gray-400 mb-1">Max Supply</h4>
                <p className="text-white font-medium">21M {currency.symbol}</p>
              </div>
            </div>
            
            <div className="pt-2">
              <a 
                href={`https://coinmarketcap.com/currencies/${currency.name.toLowerCase()}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center text-blue-400 hover:text-blue-300 text-sm"
              >
                <ExternalLink className="w-4 h-4 mr-1.5" />
                View on CoinMarketCap
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default CoinInfo;

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Star } from 'lucide-react';
import { CryptoCurrency } from '@shared/schema';

interface CryptoCardProps {
  currency: CryptoCurrency;
  balance: number;
  price: number;
  priceChange24h: number;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
}

const CryptoCard = ({
  currency,
  balance,
  price,
  priceChange24h,
  isFavorite,
  onToggleFavorite
}: CryptoCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const totalValue = balance * price;
  
  // Format currency with 2 decimal places and commas for thousands
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  // Format crypto balance with appropriate decimal places
  const formatCryptoBalance = (value: number): string => {
    if (value < 0.001) {
      return value.toFixed(8);
    } else if (value < 1) {
      return value.toFixed(6);
    } else if (value < 1000) {
      return value.toFixed(4);
    } else {
      return value.toFixed(2);
    }
  };

  return (
    <Link href={`/wallet/${currency.id}`}>
      <motion.div
        whileHover={{ scale: 1.02, y: -5 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className="cursor-pointer"
      >
        <Card className="overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 shadow-lg hover:shadow-xl transition-all">
          <CardContent className="p-5 relative">
            {/* Favorite star button */}
            <button 
              className="absolute top-3 right-3 text-gray-400 hover:text-yellow-400 transition-colors"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleFavorite(currency.id);
              }}
            >
              <Star className={`w-5 h-5 ${isFavorite ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400'}`} />
            </button>
            
            <div className="flex items-center mb-4">
              <div className="crypto-icon-container mr-3">
                <img
                  src={`https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@master/svg/color/${currency.symbol.toLowerCase()}.svg`}
                  alt={currency.name}
                  className="crypto-icon"
                  onError={(e) => {
                    // Fallback if the icon is not available
                    const target = e.target as HTMLImageElement;
                    target.src = `https://ui-avatars.com/api/?name=${currency.symbol}&background=random&color=fff`;
                  }}
                />
              </div>
              <div>
                <h3 className="font-bold text-white">{currency.name}</h3>
                <p className="text-sm text-gray-400">{currency.symbol}</p>
              </div>
            </div>
            
            <div className="mb-3">
              <p className="text-xl font-bold text-white">{formatCryptoBalance(balance)} {currency.symbol}</p>
              <p className="text-sm text-gray-400">{formatCurrency(totalValue)}</p>
            </div>
            
            <div className="flex justify-between items-center">
              <p className="text-sm font-medium text-white">{formatCurrency(price)}</p>
              <p className={`text-sm font-medium ${priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {priceChange24h >= 0 ? '+' : ''}{priceChange24h.toFixed(2)}%
              </p>
            </div>
            
            {/* Animated background gradient on hover */}
            {isHovered && (
              <motion.div 
                className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-lg z-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              />
            )}
          </CardContent>
        </Card>
      </motion.div>
    </Link>
  );
};

export default CryptoCard;

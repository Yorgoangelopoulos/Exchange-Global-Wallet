import React from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import NavigationBar from '@/components/wallet/NavigationBar';
import PortfolioChart from '@/components/wallet/PortfolioChart';
import Background from '@/components/wallet/Background';
import { useCryptoPrice } from '@/hooks/use-crypto-price';
import { useWallet } from '@/hooks/use-wallet';

const PortfolioPage = () => {
  const { wallet } = useWallet();
  const { prices } = useCryptoPrice();
  
  // Calculate portfolio total value
  const portfolioValue = wallet.balances.reduce((total, balance) => {
    const price = prices.find(p => p.id === balance.currencyId)?.price || 0;
    return total + (balance.amount * price);
  }, 0);

  return (
    <div className="min-h-screen w-full overflow-hidden relative">
      <Background />
      
      <div className="relative z-10">
        <NavigationBar />
        
        <div className="container mx-auto px-4 py-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="bg-gray-900/60 backdrop-blur-md border-gray-800 mb-8">
              <CardHeader>
                <CardTitle className="text-2xl text-gray-100">Portfolio Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <h2 className="text-4xl font-bold text-white mb-2">
                    ${portfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </h2>
                  <p className="text-gray-400">Total Portfolio Value</p>
                </div>
                
                <div className="h-80 w-full">
                  <PortfolioChart data={wallet.balances.map(balance => {
                    const currency = wallet.currencies.find(c => c.id === balance.currencyId);
                    const price = prices.find(p => p.id === balance.currencyId)?.price || 0;
                    return {
                      name: currency?.symbol || '',
                      value: balance.amount * price
                    };
                  })} />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-900/60 backdrop-blur-md border-gray-800">
              <CardHeader>
                <CardTitle className="text-xl text-gray-100">Asset Allocation</CardTitle>
              </CardHeader>
              <CardContent>
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left py-3 text-gray-400 font-medium">Asset</th>
                      <th className="text-left py-3 text-gray-400 font-medium">Amount</th>
                      <th className="text-left py-3 text-gray-400 font-medium">Value</th>
                      <th className="text-right py-3 text-gray-400 font-medium">% of Portfolio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {wallet.balances.map((balance, index) => {
                      const currency = wallet.currencies.find(c => c.id === balance.currencyId);
                      const price = prices.find(p => p.id === balance.currencyId)?.price || 0;
                      const value = balance.amount * price;
                      const percentage = portfolioValue > 0 ? (value / portfolioValue) * 100 : 0;
                      
                      return (
                        <tr key={index} className="border-b border-gray-800">
                          <td className="py-3">
                            <div className="flex items-center">
                              <div className="crypto-icon-container mr-3">
                                <img
                                  src={`https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@master/svg/color/${currency?.symbol.toLowerCase()}.svg`}
                                  alt={currency?.name}
                                  className="crypto-icon"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = `https://ui-avatars.com/api/?name=${currency?.symbol}&background=random&color=fff&rounded=true&bold=true`;
                                  }}
                                />
                              </div>
                              <div>
                                <p className="font-medium text-white">{currency?.name}</p>
                                <p className="text-sm text-gray-400">{currency?.symbol}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 text-white">
                            {balance.amount.toLocaleString()} {currency?.symbol}
                          </td>
                          <td className="py-3 text-white">
                            ${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="py-3 text-right text-white">
                            {percentage.toFixed(2)}%
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioPage;
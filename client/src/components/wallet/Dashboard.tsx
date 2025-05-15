import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { CryptoCurrency } from '@shared/schema';
import CryptoCard from './CryptoCard';
import NavigationBar from './NavigationBar';
import PortfolioChart from './PortfolioChart';
import TransactionHistory from './TransactionHistory';
import Background from './Background';
import { useCryptoPrice } from '@/hooks/use-crypto-price';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useWallet } from '@/hooks/use-wallet';

const Dashboard = () => {
  const { wallet, toggleFavorite } = useWallet();
  const { prices } = useCryptoPrice();
  const [activeView, setActiveView] = useState('all'); // 'all', 'favorites'
  const [forceUpdate, setForceUpdate] = useState(0);
  
  // Cüzdan değişikliklerini dinle ve zorunlu yeniden render yap
  useEffect(() => {
    const handleWalletChange = () => {
      console.log("Dashboard: Wallet changed event received");
      // Force rerender
      setForceUpdate(prev => prev + 1);
    };
    
    window.addEventListener('wallet-changed', handleWalletChange);
    return () => window.removeEventListener('wallet-changed', handleWalletChange);
  }, []);
  
  // Portfolio total value calculation
  const portfolioValue = wallet.balances.reduce((total, balance) => {
    const currencyPrice = prices.find(p => p.id === balance.currencyId)?.price || 0;
    return total + (parseFloat(balance.amount) * currencyPrice);
  }, 0);
  
  // List of cryptocurrencies with balances and prices
  const cryptoList = wallet.balances.map(balance => {
    const currency = wallet.currencies.find(c => c.id === balance.currencyId);
    const priceData = prices.find(p => p.id === balance.currencyId);
    
    if (!currency || !priceData) return null;
    
    return {
      currency,
      balance: balance.amount,
      price: priceData.price,
      priceChange24h: priceData.change24h,
      isFavorite: wallet.favorites.includes(balance.currencyId)
    };
  }).filter(Boolean);
  
  // Filter based on active view
  const filteredCryptoList = activeView === 'favorites'
    ? cryptoList.filter(item => item?.isFavorite)
    : cryptoList;
  
  // Animation variants for staggered children
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div className="min-h-screen w-full overflow-hidden relative">
      <Background />
      
      <div className="relative z-10">
        <NavigationBar />
        
        <div className="container mx-auto px-4 py-6">

          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-8"
          >
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="bg-gray-800/60 border border-gray-700 mb-4">
                <TabsTrigger value="all" onClick={() => setActiveView('all')}>
                  All Assets
                </TabsTrigger>
                <TabsTrigger value="favorites" onClick={() => setActiveView('favorites')}>
                  Favorites
                </TabsTrigger>
              </TabsList>
            </Tabs>
            
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              {filteredCryptoList.map((item, index) => (
                item && (
                  <motion.div key={item.currency.id} variants={itemVariants}>
                    <CryptoCard
                      currency={item.currency}
                      balance={parseFloat(item.balance)}
                      price={item.price}
                      priceChange24h={item.priceChange24h}
                      isFavorite={item.isFavorite}
                      onToggleFavorite={toggleFavorite}
                    />
                  </motion.div>
                )
              ))}
              
              {filteredCryptoList.length === 0 && (
                <motion.div 
                  className="col-span-full text-center py-12"
                  variants={itemVariants}
                >
                  <p className="text-gray-400">
                    {activeView === 'favorites' ? 'No favorite assets yet.' : 'No assets found.'}
                  </p>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="bg-gray-900/60 backdrop-blur-md border-gray-800">
              <CardHeader>
                <CardTitle className="text-xl text-gray-100">Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <TransactionHistory transactions={wallet.transactions} currencies={wallet.currencies} />
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

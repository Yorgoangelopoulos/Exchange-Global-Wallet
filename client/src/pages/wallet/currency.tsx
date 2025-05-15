import { useState } from 'react';
import { useRoute, Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Download, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Background from '@/components/wallet/Background';
import NavigationBar from '@/components/wallet/NavigationBar';
import CoinInfo from '@/components/wallet/CoinInfo';
import TransactionHistory from '@/components/wallet/TransactionHistory';
import SendReceivePanel from '@/components/wallet/SendReceivePanel';
import { Card, CardContent } from '@/components/ui/card';
import { useWallet } from '@/hooks/use-wallet';
import { useCryptoPrice } from '@/hooks/use-crypto-price';

const CurrencyDetailPage = () => {
  const [_, params] = useRoute('/wallet/:id');
  const { wallet, toggleFavorite } = useWallet();
  const { prices } = useCryptoPrice();
  const [showSendReceive, setShowSendReceive] = useState<boolean>(false);
  
  // Find the currency by ID
  const currencyId = params?.id || '';
  const currency = wallet.currencies.find(c => c.id === currencyId);
  
  // Get balance and price data
  const balance = wallet.balances.find(b => b.currencyId === currencyId)?.amount || 0;
  const priceData = prices.find(p => p.id === currencyId);
  
  // Get filtered transactions for this currency
  const currencyTransactions = wallet.transactions.filter(
    tx => tx.currencyId === currencyId
  );
  
  if (!currency || !priceData) {
    return (
      <div className="min-h-screen w-full">
        <Background />
        <NavigationBar />
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Currency Not Found</h2>
            <Link href="/wallet">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  const isFavorite = wallet.favorites.includes(currencyId);
  
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
            className="mb-6"
          >
            <div className="flex items-center mb-6">
              <Link href="/wallet">
                <Button variant="ghost" className="text-gray-300 hover:text-white -ml-2">
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Back
                </Button>
              </Link>
              <div className="ml-2">
                <div className="flex items-center">
                  <div className="w-10 h-10 mr-3 flex items-center justify-center bg-gray-800 rounded-full">
                    <img
                      src={`https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@master/svg/color/${currency.symbol.toLowerCase()}.svg`}
                      alt={currency.name}
                      className="w-6 h-6"
                      onError={(e) => {
                        // Fallback if the icon is not available
                        const target = e.target as HTMLImageElement;
                        target.src = `https://ui-avatars.com/api/?name=${currency.symbol}&background=random&color=fff`;
                      }}
                    />
                  </div>
                  <h1 className="text-2xl font-bold text-white">{currency.name}</h1>
                </div>
              </div>
            </div>
            
            <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 shadow-lg mb-6">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Your Balance</p>
                    <h2 className="text-3xl font-bold text-white">
                      {balance} {currency.symbol}
                    </h2>
                    <p className="text-gray-400 mt-1">
                      ${(balance * priceData.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  
                  <Button
                    className={`ml-auto ${isFavorite ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-gray-700 hover:bg-gray-600'} text-white`}
                    onClick={() => toggleFavorite(currencyId)}
                  >
                    {isFavorite ? 'Favorite' : 'Add to Favorites'}
                  </Button>
                </div>
                
                <div className="flex gap-4 mt-6">
                  <Button 
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => setShowSendReceive(true)}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Send
                  </Button>
                  <Button 
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white"
                    onClick={() => setShowSendReceive(true)}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Receive
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <CoinInfo 
                currency={currency} 
                price={priceData.price} 
                priceChange24h={priceData.change24h} 
              />
            </div>
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card className="bg-gray-900/60 backdrop-blur-md border-gray-800">
                  <CardContent className="p-4">
                    <h3 className="text-xl font-semibold text-white mb-4">Transaction History</h3>
                    <TransactionHistory 
                      transactions={currencyTransactions} 
                      currencies={wallet.currencies} 
                    />
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
      
      <AnimatePresence>
        {showSendReceive && (
          <SendReceivePanel 
            currency={currency}
            balance={balance}
            onClose={() => setShowSendReceive(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default CurrencyDetailPage;

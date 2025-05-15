import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, ArrowLeft, Plus, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { CryptoCurrency } from '@shared/schema';
import { generateWalletAddress } from '@/lib/wallet-service';

interface TokensPanelProps {
  currency: CryptoCurrency;
  onClose: () => void;
}

// Mock token data based on currency network
const getTokensForNetwork = (currencyId: string) => {
  switch(currencyId) {
    case 'ethereum':
      return [
        { symbol: 'USDT', name: 'Tether USD (ERC20)', balance: 125.5, value: 125.5 },
        { symbol: 'UNI', name: 'Uniswap', balance: 10.25, value: 52.78 },
        { symbol: 'LINK', name: 'Chainlink', balance: 7.8, value: 89.7 }
      ];
    case 'solana':
      return [
        { symbol: 'USDT', name: 'Tether USD (SPL)', balance: 75.2, value: 75.2 },
        { symbol: 'RAY', name: 'Raydium', balance: 45.6, value: 62.1 }
      ];
    case 'tron':
      return [
        { symbol: 'USDT', name: 'Tether USD (TRC20)', balance: 215.75, value: 215.75 },
        { symbol: 'BTT', name: 'BitTorrent', balance: 5000, value: 25.0 },
        { symbol: 'JST', name: 'JUST', balance: 325.5, value: 9.8 }
      ];
    default:
      return [];
  }
};

const TokensPanel = ({ currency, onClose }: TokensPanelProps) => {
  const [tokens, setTokens] = useState<any[]>([]);
  const [walletAddress, setWalletAddress] = useState('');
  const [isAddingToken, setIsAddingToken] = useState(false);
  const [newTokenAddress, setNewTokenAddress] = useState('');
  const { toast } = useToast();
  
  useEffect(() => {
    // Load tokens for this network
    setTokens(getTokensForNetwork(currency.id));
    
    // Generate wallet address
    const demoMnemonic = "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";
    try {
      const networkMap: {[key: string]: string} = {
        'bitcoin': 'btc',
        'ethereum': 'eth',
        'solana': 'sol',
        'tron': 'trx',
      };
      
      const networkCode = networkMap[currency.id] || 'eth';
      const wallet = generateWalletAddress(demoMnemonic, networkCode);
      setWalletAddress(wallet.address);
    } catch (error) {
      console.error("Error generating address:", error);
      setWalletAddress('Error generating address');
    }
  }, [currency]);

  const handleAddToken = () => {
    if (!newTokenAddress.trim()) return;
    
    // In a real app, this would validate the token contract and fetch its details
    toast({
      title: "Token Added",
      description: "Custom token has been added to your wallet.",
      variant: "default"
    });
    
    // Simulate adding a new token
    const randomBalance = (Math.random() * 100).toFixed(2);
    const newToken = {
      symbol: 'CUSTOM',
      name: `Custom Token (${newTokenAddress.substring(0, 6)}...)`,
      balance: parseFloat(randomBalance),
      value: parseFloat(randomBalance)
    };
    
    setTokens([...tokens, newToken]);
    setNewTokenAddress('');
    setIsAddingToken(false);
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div 
        className="bg-gray-900 border border-gray-800 rounded-lg shadow-2xl w-full max-w-md overflow-hidden my-auto"
        initial={{ scale: 0.9, y: 0 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-800">
          <button 
            className="text-gray-400 hover:text-white transition-colors"
            onClick={onClose}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center">
            <img
              src={`https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@master/svg/color/${currency.symbol.toLowerCase()}.svg`}
              alt={currency.name}
              className="w-6 h-6 mr-2"
              onError={(e) => {
                // Fallback if the icon is not available
                const target = e.target as HTMLImageElement;
                target.src = `https://ui-avatars.com/api/?name=${currency.symbol}&background=random&color=fff&rounded=true&bold=true&size=32`;
              }}
            />
            <h2 className="text-xl font-semibold text-white">{currency.name} Tokens</h2>
          </div>
          <button 
            className="text-gray-400 hover:text-white transition-colors"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-5">
          <div className="mb-4">
            <p className="text-sm text-gray-400 mb-2">Your {currency.name} Address</p>
            <code className="block p-3 bg-gray-800 rounded text-sm text-gray-300 font-mono break-all">
              {walletAddress}
            </code>
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium text-white">{tokens.length > 0 ? 'Your Tokens' : 'No Tokens Found'}</h3>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs border-gray-700 text-gray-300 hover:bg-gray-800"
                onClick={() => setIsAddingToken(true)}
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add Token
              </Button>
            </div>
            
            {tokens.length > 0 ? (
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {tokens.map((token, index) => (
                  <div key={index} className="p-3 bg-gray-800 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center mr-2">
                            <span className="text-xs font-bold">{token.symbol[0]}</span>
                          </div>
                          <div>
                            <p className="font-medium text-white">{token.symbol}</p>
                            <p className="text-xs text-gray-400">{token.name}</p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-white">{token.balance.toFixed(2)}</p>
                        <p className="text-xs text-gray-400">${token.value.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 bg-gray-800/50 rounded-lg text-center mb-4">
                <p className="text-gray-400 mb-2">No tokens found in this wallet</p>
                <Button
                  variant="outline"
                  className="border-gray-700 text-gray-300 hover:bg-gray-800"
                  onClick={() => setIsAddingToken(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Custom Token
                </Button>
              </div>
            )}
          </div>
          
          {isAddingToken && (
            <motion.div 
              className="bg-gray-800 rounded-lg p-4 mb-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h4 className="font-medium text-white mb-3">Add Custom Token</h4>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="token-address">Token Contract Address</Label>
                  <Input
                    id="token-address"
                    placeholder={`Enter token contract on ${currency.name} network`}
                    value={newTokenAddress}
                    onChange={(e) => setNewTokenAddress(e.target.value)}
                    className="bg-gray-700 border-gray-600 focus:border-blue-500 text-white mt-1"
                  />
                </div>
                
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-gray-700 text-gray-300 hover:bg-gray-700"
                    onClick={() => {
                      setIsAddingToken(false);
                      setNewTokenAddress('');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={handleAddToken}
                    disabled={!newTokenAddress.trim()}
                  >
                    Add Token
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
          
          <Separator className="my-4 bg-gray-800" />
          
          <div className="text-sm text-gray-400">
            <p className="mb-2">
              <strong className="text-gray-300">How to receive tokens:</strong> Send tokens to your {currency.name} address above.
            </p>
            {currency.id === 'ethereum' && (
              <p>Supports ERC20 tokens on the Ethereum network</p>
            )}
            {currency.id === 'solana' && (
              <p>Supports SPL tokens on the Solana network</p>
            )}
            {currency.id === 'tron' && (
              <p>Supports TRC10 and TRC20 tokens on the Tron network</p>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default TokensPanel;
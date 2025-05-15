import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, ArrowLeft, Plus, Copy, Download, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { generateMnemonic, generateWalletAddress } from '@/lib/wallet-service';

interface CreateWalletPanelProps {
  onClose: () => void;
  onWalletCreated: (walletName: string) => void;
}

// Generate a real-world compatible seed phrase using BIP39
const generateSeedPhrase = (wordCount: number): string => {
  const strength = wordCount === 24 ? 256 : 128; // 128 bits for 12 words, 256 bits for 24 words
  return generateMnemonic(strength);
};

const CreateWalletPanel = ({ onClose, onWalletCreated }: CreateWalletPanelProps) => {
  const [walletName, setWalletName] = useState('');
  const [seedPhrase] = useState(generateSeedPhrase(12));
  const [isBackedUp, setIsBackedUp] = useState(false);
  const { toast } = useToast();

  const handleCopySeed = () => {
    navigator.clipboard.writeText(seedPhrase).then(() => {
      toast({
        title: "Seed Phrase Copied",
        description: "Recovery phrase copied to clipboard. Store it safely!",
        variant: "default"
      });
    });
  };

  const handleDownloadSeed = () => {
    const element = document.createElement('a');
    const file = new Blob([`Recovery Phrase (KEEP SECURE!):\n\n${seedPhrase}`], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = 'recovery-phrase.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    toast({
      title: "Seed Phrase Downloaded",
      description: "Recovery phrase downloaded. Store it in a secure location!",
      variant: "default"
    });
  };

  const handleCreateWallet = () => {
    if (!walletName.trim()) {
      toast({
        title: "Wallet Name Required",
        description: "Please enter a name for your new wallet.",
        variant: "destructive"
      });
      return;
    }
    
    if (!isBackedUp) {
      toast({
        title: "Backup Required",
        description: "Please confirm that you've backed up your recovery phrase.",
        variant: "destructive"
      });
      return;
    }
    
    // Create real cryptocurrency addresses from the seed
    try {
      // Generate addresses for main cryptocurrencies
      const btcWallet = generateWalletAddress(seedPhrase, 'btc');
      const ethWallet = generateWalletAddress(seedPhrase, 'eth');
      const solWallet = generateWalletAddress(seedPhrase, 'sol');
      const trxWallet = generateWalletAddress(seedPhrase, 'trx'); // Add Tron support
      
      console.log('Bitcoin address:', btcWallet.address);
      console.log('Ethereum address:', ethWallet.address);
      console.log('Solana address:', solWallet.address);
      console.log('Tron address:', trxWallet.address);
      
      onWalletCreated(walletName);
      onClose();
      
      toast({
        title: "Wallet Created",
        description: `Your new wallet "${walletName}" has been created successfully with real cryptocurrency addresses.`,
        variant: "default"
      });
    } catch (error) {
      console.error('Error creating wallet addresses:', error);
      
      toast({
        title: "Wallet Creation Error",
        description: `There was an error creating the wallet: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    }
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
        className="bg-gray-900 border border-gray-800 rounded-lg shadow-2xl w-full max-w-xl overflow-hidden my-auto"
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
          <h2 className="text-xl font-semibold text-white">Create New Wallet</h2>
          <button 
            className="text-gray-400 hover:text-white transition-colors"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div>
            <Label htmlFor="wallet-name">Wallet Name</Label>
            <Input
              id="wallet-name"
              placeholder="My Wallet"
              value={walletName}
              onChange={(e) => setWalletName(e.target.value)}
              className="bg-gray-800 border-gray-700 focus:border-blue-500 text-white mt-1.5"
            />
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <Label>Recovery Phrase</Label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs border-gray-700 text-gray-300 hover:bg-gray-800"
                  onClick={handleCopySeed}
                >
                  <Copy className="w-3.5 h-3.5 mr-1" />
                  Copy
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs border-gray-700 text-gray-300 hover:bg-gray-800"
                  onClick={handleDownloadSeed}
                >
                  <Download className="w-3.5 h-3.5 mr-1" />
                  Download
                </Button>
              </div>
            </div>
            
            <div className="bg-gray-800 border border-gray-700 rounded-md p-4">
              <div className="grid grid-cols-3 gap-2">
                {seedPhrase.split(' ').map((word, index) => (
                  <div key={index} className="bg-gray-700 rounded p-2 text-center">
                    <span className="text-xs text-gray-400">{index + 1}.</span>
                    <span className="ml-1 text-sm text-white font-mono">{word}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-amber-900/20 border border-amber-900/30 rounded-md flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-gray-300">
                <strong className="font-medium text-amber-500 block mb-1">Important!</strong>
                Write down or save these 12 words in a secure location. This recovery phrase is the only way to restore your wallet if you lose access. Never share it with anyone.
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="backup-confirm"
              checked={isBackedUp}
              onChange={(e) => setIsBackedUp(e.target.checked)}
              className="rounded border-gray-700 bg-gray-800 text-blue-600 focus:ring-blue-600"
            />
            <Label htmlFor="backup-confirm" className="text-sm font-normal">
              I confirm that I have securely backed up my recovery phrase
            </Label>
          </div>
        </div>
        
        <div className="p-4 border-t border-gray-800 flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-gray-700 text-gray-300 hover:bg-gray-800"
          >
            Cancel
          </Button>
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={handleCreateWallet}
            disabled={!isBackedUp || !walletName.trim()}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Wallet
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CreateWalletPanel;
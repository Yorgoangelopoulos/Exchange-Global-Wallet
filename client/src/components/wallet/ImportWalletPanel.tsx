import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, ArrowLeft, Upload, Key, FileText, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

interface ImportWalletPanelProps {
  onClose: () => void;
  onWalletImported: (walletName: string) => void;
}

const ImportWalletPanel = ({ onClose, onWalletImported }: ImportWalletPanelProps) => {
  const [activeTab, setActiveTab] = useState('mnemonic');
  const [walletName, setWalletName] = useState('');
  const [mnemonicPhrase, setMnemonicPhrase] = useState('');
  const [mnemonicLength, setMnemonicLength] = useState('12');
  const [privateKey, setPrivateKey] = useState('');
  const { toast } = useToast();

  // Validate mnemonic by checking the word count
  const validateMnemonic = (phrase: string) => {
    const wordCount = phrase.trim().split(/\s+/).length;
    return wordCount === parseInt(mnemonicLength);
  };

  // Validate private key format (simple check for demo purposes)
  const validatePrivateKey = (key: string) => {
    // For demo: check if it matches a simple hex format
    return /^[0-9a-fA-F]{64}$/.test(key);
  };

  const handleImport = () => {
    // Basic validation
    if (!walletName) {
      toast({
        title: "Missing Wallet Name",
        description: "Please provide a name for your wallet.",
        variant: "destructive"
      });
      return;
    }

    if (activeTab === 'mnemonic') {
      if (!validateMnemonic(mnemonicPhrase)) {
        toast({
          title: "Invalid Recovery Phrase",
          description: `Please enter a valid ${mnemonicLength}-word recovery phrase.`,
          variant: "destructive"
        });
        return;
      }
    } else if (activeTab === 'privateKey') {
      if (!validatePrivateKey(privateKey)) {
        toast({
          title: "Invalid Private Key",
          description: "Please enter a valid private key (64 hex characters).",
          variant: "destructive"
        });
        return;
      }
    }

    // In a real app, we would import the wallet using the provided credentials
    // For this demo, we'll just show a success message
    toast({
      title: "Wallet Imported",
      description: `Your wallet "${walletName}" has been successfully imported.`,
      variant: "default"
    });

    // Call the callback function for the parent component
    onWalletImported(walletName);
    onClose();
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
          <h2 className="text-xl font-semibold text-white">Import Wallet</h2>
          <button 
            className="text-gray-400 hover:text-white transition-colors"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="bg-amber-900/20 border border-amber-800/30 rounded-lg p-4 mb-4">
            <div className="flex gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-gray-300">
                Never share your recovery phrase or private keys with anyone. Anyone with this information can steal your assets.
              </p>
            </div>
          </div>
          
          <div className="space-y-4">
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
            
            <Tabs defaultValue="mnemonic" className="w-full" onValueChange={setActiveTab}>
              <TabsList className="w-full grid grid-cols-2 bg-gray-800 rounded-md">
                <TabsTrigger value="mnemonic" className="data-[state=active]:bg-blue-600">
                  <FileText className="w-4 h-4 mr-2" />
                  Recovery Phrase
                </TabsTrigger>
                <TabsTrigger value="privateKey" className="data-[state=active]:bg-blue-600">
                  <Key className="w-4 h-4 mr-2" />
                  Private Key
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="mnemonic" className="mt-4">
                <div className="space-y-4">
                  <div>
                    <Label>Recovery Phrase Length</Label>
                    <RadioGroup 
                      defaultValue="12"
                      className="flex space-x-4 mt-1.5"
                      value={mnemonicLength}
                      onValueChange={setMnemonicLength}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="12" id="r1" />
                        <Label htmlFor="r1" className="font-normal">12 words</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="24" id="r2" />
                        <Label htmlFor="r2" className="font-normal">24 words</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  <div>
                    <Label htmlFor="mnemonic-phrase">Recovery Phrase</Label>
                    <textarea
                      id="mnemonic-phrase"
                      placeholder="Enter your recovery phrase (separated by spaces)"
                      value={mnemonicPhrase}
                      onChange={(e) => setMnemonicPhrase(e.target.value)}
                      className="w-full h-32 mt-1.5 bg-gray-800 border border-gray-700 rounded-md p-3 text-white focus:border-blue-500 focus:ring-0 resize-none"
                    />
                    <p className="text-xs text-gray-400 mt-1.5">
                      Enter your {mnemonicLength}-word recovery phrase with words separated by spaces.
                    </p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="privateKey" className="mt-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="private-key">Private Key</Label>
                    <Input
                      id="private-key"
                      placeholder="Enter your private key"
                      value={privateKey}
                      onChange={(e) => setPrivateKey(e.target.value)}
                      className="bg-gray-800 border-gray-700 focus:border-blue-500 text-white mt-1.5 font-mono"
                    />
                    <p className="text-xs text-gray-400 mt-1.5">
                      Enter your private key in hexadecimal format (64 characters).
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
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
            onClick={handleImport}
          >
            <Upload className="w-4 h-4 mr-2" />
            Import Wallet
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ImportWalletPanel;
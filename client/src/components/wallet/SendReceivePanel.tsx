import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Download, ArrowLeft, Copy, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { CryptoCurrency } from '@shared/schema';
import { QRCodeSVG } from 'qrcode.react';

interface SendReceivePanelProps {
  currency: CryptoCurrency;
  balance: number;
  onClose: () => void;
}

const SendReceivePanel = ({ currency, balance, onClose }: SendReceivePanelProps) => {
  const [activeTab, setActiveTab] = useState('send');
  const [sendAmount, setSendAmount] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const { toast } = useToast();
  
  // Mock wallet address for this cryptocurrency
  const walletAddress = `${currency.symbol.toLowerCase()}1qaz2wsx3edc4rfv5tgb6yhn7ujm8ik9ol0p`;
  
  const handleSend = () => {
    // Validate inputs
    if (!sendAmount || isNaN(Number(sendAmount)) || Number(sendAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount to send.",
        variant: "destructive"
      });
      return;
    }
    
    if (!recipientAddress) {
      toast({
        title: "Missing Address",
        description: "Please enter a recipient address.",
        variant: "destructive"
      });
      return;
    }
    
    if (Number(sendAmount) > balance) {
      toast({
        title: "Insufficient Balance",
        description: `You do not have enough ${currency.symbol} to complete this transaction.`,
        variant: "destructive"
      });
      return;
    }
    
    // In a real application, we would send the transaction here
    // For this demo, we'll just show a success message
    toast({
      title: "Transaction Initiated",
      description: `Sending ${sendAmount} ${currency.symbol} to ${recipientAddress.substring(0, 10)}...`,
      variant: "default"
    });
    
    // Close the panel after sending
    setTimeout(() => {
      onClose();
    }, 2000);
  };
  
  const handleCopyAddress = () => {
    navigator.clipboard.writeText(walletAddress).then(() => {
      toast({
        title: "Address Copied",
        description: "Wallet address copied to clipboard.",
        variant: "default"
      });
    });
  };

  return (
    <motion.div
      className="fixed inset-0 z-30 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div 
        className="bg-gray-900 border border-gray-800 rounded-lg shadow-2xl w-full max-w-md overflow-hidden"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
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
          <h2 className="text-lg font-semibold text-white">{currency.name}</h2>
          <button 
            className="text-gray-400 hover:text-white transition-colors"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <Tabs defaultValue="send" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-2 bg-gray-800 rounded-none">
            <TabsTrigger value="send" className="data-[state=active]:bg-blue-600">
              <Send className="w-4 h-4 mr-2" />
              Send
            </TabsTrigger>
            <TabsTrigger value="receive" className="data-[state=active]:bg-blue-600">
              <Download className="w-4 h-4 mr-2" />
              Receive
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="send" className="p-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="amount" className="text-gray-300">Amount</Label>
                <div className="relative mt-1.5">
                  <Input
                    id="amount"
                    type="text"
                    value={sendAmount}
                    onChange={(e) => setSendAmount(e.target.value)}
                    placeholder="0.00"
                    className="bg-gray-800 border-gray-700 focus:border-blue-500 text-white pl-3 pr-16"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {currency.symbol}
                  </div>
                </div>
                <div className="flex justify-between mt-1.5">
                  <span className="text-xs text-gray-500">Available: {balance} {currency.symbol}</span>
                  <button 
                    className="text-xs text-blue-500 hover:text-blue-400"
                    onClick={() => setSendAmount(balance.toString())}
                  >
                    MAX
                  </button>
                </div>
              </div>
              
              <div>
                <Label htmlFor="recipient" className="text-gray-300">Recipient Address</Label>
                <Input
                  id="recipient"
                  type="text"
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  placeholder={`${currency.name} Address`}
                  className="bg-gray-800 border-gray-700 focus:border-blue-500 text-white mt-1.5"
                />
              </div>
              
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                onClick={handleSend}
              >
                <Send className="w-4 h-4 mr-2" />
                Send {currency.symbol}
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="receive" className="p-6">
            <div className="space-y-4 flex flex-col items-center">
              <div className="bg-white p-4 rounded-lg">
                <QRCodeSVG value={walletAddress} size={200} />
              </div>
              
              <div className="w-full">
                <Label htmlFor="walletAddress" className="text-gray-300">Your {currency.name} Address</Label>
                <div className="relative mt-1.5">
                  <Input
                    id="walletAddress"
                    type="text"
                    value={walletAddress}
                    readOnly
                    className="bg-gray-800 border-gray-700 text-white pr-10 font-mono text-sm"
                  />
                  <button 
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500"
                    onClick={handleCopyAddress}
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                onClick={handleCopyAddress}
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Address
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
};

export default SendReceivePanel;

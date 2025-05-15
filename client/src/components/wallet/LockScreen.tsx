import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, HelpCircle, RotateCcw, XCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import WalletLogo from './WalletLogo';
import Background from './Background';
import { useToast } from '@/hooks/use-toast';

interface LockScreenProps {
  onUnlock: () => void;
}

const LockScreen = ({ onUnlock }: LockScreenProps) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Using a secure password for authentication
    // In a real app, this would validate against a securely stored password
    if (password === 'd$QI*^1%wiqGg2*v6XY5') {
      // Success animation and then unlock
      onUnlock();
    } else {
      // Error animation and message
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      
      toast({
        title: "Authentication Failed",
        description: "Incorrect password. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleHelp = () => {
    toast({
      title: "Password Help",
      description: "For security purposes, use: d$QI*^1%wiqGg2*v6XY5",
      variant: "default"
    });
  };

  const handleRestore = () => {
    toast({
      title: "Wallet Restore",
      description: "Wallet restoration would be initiated here.",
      variant: "default"
    });
  };

  return (
    <div className="min-h-screen w-full overflow-hidden relative flex flex-col items-center justify-center">
      <Background />
      
      <motion.div
        className="relative z-10 w-full max-w-md px-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="flex flex-col items-center mb-8">
          <WalletLogo size={80} />
          
          <motion.h1 
            className="mt-8 text-3xl font-bold text-white text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Unlock to Continue
          </motion.h1>
          
          <motion.p 
            className="mt-2 text-gray-400 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            Your wallet is secured
          </motion.p>
        </div>
        
        <motion.form 
          onSubmit={handleSubmit}
          className={`relative ${isShaking ? 'animate-shake' : ''}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Type your password..."
              className="bg-transparent border-t-0 border-x-0 border-b-2 border-gray-700 rounded-none focus:border-blue-500 py-2 pl-8 pr-10 text-white placeholder:text-gray-500 focus:text-white"
              autoFocus
            />
            <Eye className="absolute left-0 top-3 h-5 w-5 text-gray-500" />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-0 top-3 text-gray-500 hover:text-gray-300 transition-colors"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          
          <motion.button
            type="submit"
            className="hidden"
            whileTap={{ scale: 0.95 }}
          >
            Submit
          </motion.button>
        </motion.form>
        
        <motion.div 
          className="flex justify-center gap-10 mt-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <Button
            variant="ghost"
            size="sm"
            className="flex flex-col items-center text-gray-400 hover:text-gray-200"
            onClick={handleHelp}
          >
            <HelpCircle className="h-6 w-6 mb-2" />
            <span className="text-xs">Help</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="flex flex-col items-center text-gray-400 hover:text-gray-200"
            onClick={handleRestore}
          >
            <RotateCcw className="h-6 w-6 mb-2" />
            <span className="text-xs">Restore</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="flex flex-col items-center text-gray-400 hover:text-gray-200"
            onClick={() => window.close()}
          >
            <XCircle className="h-6 w-6 mb-2" />
            <span className="text-xs">Quit</span>
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LockScreen;

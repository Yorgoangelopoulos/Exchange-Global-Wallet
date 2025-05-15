import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'wouter';
import { 
  Home, 
  Settings, 
  Menu, 
  X, 
  BarChart2, 
  LogOut,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import WalletLogo from './WalletLogo';
import WalletSwitcher from './WalletSwitcher';
import { useToast } from '@/hooks/use-toast';

const NavigationBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [location] = useLocation();
  const { toast } = useToast();
  
  const navItems = [
    { label: 'Dashboard', icon: <Home className="w-5 h-5" />, path: '/wallet' },
    { label: 'Portfolio', icon: <BarChart2 className="w-5 h-5" />, path: '/wallet/portfolio' },
    { label: 'Settings', icon: <Settings className="w-5 h-5" />, path: '/wallet/settings' }
  ];
  
  const isActive = (path: string) => {
    if (path === '/wallet' && location === '/wallet') return true;
    return location.startsWith(path) && path !== '/wallet';
  };
  
  const handleLogout = () => {
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
      variant: "default"
    });
    
    // In a real application, we would handle proper logout logic here
    // For this demo, we'll redirect to the lock screen after a brief delay
    setTimeout(() => {
      window.location.href = '/';
    }, 1000);
  };
  
  return (
    <div className="sticky top-0 z-20 w-full backdrop-blur-md bg-gray-900/80 border-b border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <Link href="/wallet">
              <div className="flex items-center cursor-pointer">
                <WalletLogo size={32} />
                <span className="ml-2 text-lg font-bold text-white hidden sm:block">CryptoVault</span>
              </div>
            </Link>
            
            <div className="hidden md:block">
              <WalletSwitcher />
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-1">
            {navItems.map((item) => (
              <Button
                key={item.path}
                variant={isActive(item.path) ? "default" : "ghost"}
                size="sm"
                className={`flex items-center gap-2 ${isActive(item.path) ? 'bg-blue-600 hover:bg-blue-700' : 'text-gray-300 hover:text-white'}`}
                asChild
              >
                <Link href={item.path}>
                  <div className="flex items-center gap-2">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                </Link>
              </Button>
            ))}
          </div>
          
          {/* User Menu */}
          <div className="flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-gray-300 hover:text-white"
                >
                  <User className="w-5 h-5 mr-2" />
                  <span className="hidden sm:inline">User</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700 text-gray-200">
                <DropdownMenuItem className="hover:bg-gray-700 cursor-pointer" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  <span>Lock Wallet</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden text-gray-300 hover:text-white ml-2"
              onClick={() => setIsMenuOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed inset-0 z-50 bg-gray-900/95 flex flex-col"
          >
            <div className="flex justify-between items-center p-4 border-b border-gray-800">
              <div className="flex items-center">
                <WalletLogo size={32} />
                <span className="ml-2 text-lg font-bold text-white">CryptoVault</span>
              </div>
              <div className="mt-6">
                <WalletSwitcher />
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsMenuOpen(false)}
                className="text-gray-300 hover:text-white"
              >
                <X className="w-6 h-6" />
              </Button>
            </div>
            
            <div className="flex flex-col py-6 px-4 space-y-2 flex-grow">
              {navItems.map((item) => (
                <Button
                  key={item.path}
                  variant={isActive(item.path) ? "default" : "ghost"}
                  size="lg"
                  className={`justify-start ${isActive(item.path) ? 'bg-blue-600 hover:bg-blue-700' : 'text-gray-300 hover:text-white'}`}
                  onClick={() => setIsMenuOpen(false)}
                  asChild
                >
                  <Link href={item.path}>
                    <div className="flex items-center gap-3">
                      {item.icon}
                      <span className="text-lg">{item.label}</span>
                    </div>
                  </Link>
                </Button>
              ))}
            </div>
            
            <div className="p-4 border-t border-gray-800">
              <Button 
                variant="outline" 
                className="w-full justify-start text-red-400 border-red-500/30 hover:bg-red-500/10 hover:text-red-300"
                onClick={() => {
                  setIsMenuOpen(false);
                  handleLogout();
                }}
              >
                <LogOut className="w-5 h-5 mr-2" />
                <span>Lock Wallet</span>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NavigationBar;

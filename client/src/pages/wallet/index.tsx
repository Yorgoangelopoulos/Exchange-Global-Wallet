import { useState } from 'react';
import Dashboard from '@/components/wallet/Dashboard';
import LockScreen from '@/components/wallet/LockScreen';

const WalletPage = () => {
  const [isLocked, setIsLocked] = useState(true);
  
  const handleUnlock = () => {
    setIsLocked(false);
  };
  
  return (
    <div className="min-h-screen w-full">
      {isLocked ? (
        <LockScreen onUnlock={handleUnlock} />
      ) : (
        <Dashboard />
      )}
    </div>
  );
};

export default WalletPage;

import { useState, useEffect } from 'react';
import Dashboard from '@/components/wallet/Dashboard';
import LockScreen from '@/components/wallet/LockScreen';

const WalletPage = () => {
  // Use sessionStorage to maintain unlock state across page refreshes
  const [isLocked, setIsLocked] = useState(() => {
    const unlocked = sessionStorage.getItem('walletUnlocked');
    return unlocked !== 'true';
  });
  
  const handleUnlock = () => {
    sessionStorage.setItem('walletUnlocked', 'true');
    setIsLocked(false);
  };

  // Use effect to update localStorage when lock state changes
  useEffect(() => {
    if (!isLocked) {
      sessionStorage.setItem('walletUnlocked', 'true');
    }
  }, [isLocked]);
  
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

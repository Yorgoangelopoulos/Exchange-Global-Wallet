import { useState, useEffect } from 'react';
import Dashboard from '@/components/wallet/Dashboard';
import LockScreen from '@/components/wallet/LockScreen';

const WalletPage = () => {
  // Her uygulama başlangıcında kilitli durumda başlasın
  const [isLocked, setIsLocked] = useState(true);
  
  const handleUnlock = () => {
    // Şifre doğru girildiğinde kilit açılır ve oturum başlar
    sessionStorage.setItem('walletUnlocked', 'true');
    sessionStorage.setItem('unlockTime', Date.now().toString());
    setIsLocked(false);
  };

  // Oturum süresini kontrol et (20 dakika sonra otomatik kilit)
  useEffect(() => {
    // Oturum açıksa, oturum zamanını kontrol et
    const checkSessionValidity = () => {
      const unlocked = sessionStorage.getItem('walletUnlocked');
      const unlockTime = sessionStorage.getItem('unlockTime');
      
      if (unlocked === 'true' && unlockTime) {
        const now = Date.now();
        const unlockTimeMs = parseInt(unlockTime);
        const sessionDuration = 20 * 60 * 1000; // 20 dakika
        
        // 20 dakikadan fazla geçtiyse kilitle, değilse kilidi aç
        if (now - unlockTimeMs > sessionDuration) {
          sessionStorage.removeItem('walletUnlocked');
          sessionStorage.removeItem('unlockTime');
          setIsLocked(true);
        } else {
          setIsLocked(false);
        }
      }
    };
    
    // Başlangıçta ve her 1 dakikada bir kontrol et
    checkSessionValidity();
    const interval = setInterval(checkSessionValidity, 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);
  
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

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

  // Başlangıçta sessionStorage'daki tüm verileri temizle ve her zaman kilitli başla
  useEffect(() => {
    // Her başlangıçta oturum verilerini temizle, şifre ekranının her zaman görünmesini sağlar
    sessionStorage.removeItem('walletUnlocked');
    sessionStorage.removeItem('unlockTime');
    setIsLocked(true);
    
    // Oturum açıksa, oturum zamanını kontrol et (20 dakika sonra otomatik kilit)
    const checkSessionValidity = () => {
      const unlocked = sessionStorage.getItem('walletUnlocked');
      const unlockTime = sessionStorage.getItem('unlockTime');
      
      if (unlocked === 'true' && unlockTime) {
        const now = Date.now();
        const unlockTimeMs = parseInt(unlockTime);
        const sessionDuration = 20 * 60 * 1000; // 20 dakika
        
        // 20 dakikadan fazla geçtiyse kilitle
        if (now - unlockTimeMs > sessionDuration) {
          console.log('Oturum süresi doldu, cüzdan kilitleniyor...');
          sessionStorage.removeItem('walletUnlocked');
          sessionStorage.removeItem('unlockTime');
          setIsLocked(true);
        }
      }
    };
    
    // Her 1 dakikada bir oturum süresini kontrol et
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

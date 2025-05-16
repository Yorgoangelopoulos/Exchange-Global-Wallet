import { useState, useEffect } from 'react';
import { CryptoCurrency, Balance, Transaction } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { getWalletBalance } from '@/lib/wallet-service';

// Desteklenen kripto para birimleri - İstenen 4 kripto para (veritabanında varolan ID'ler ile)
const supportedCurrencies: CryptoCurrency[] = [
  { id: 'ethereum', name: 'Ethereum', symbol: 'ETH', description: null, iconUrl: 'https://cryptologos.cc/logos/ethereum-eth-logo.svg', color: '#627EEA', isActive: true, sortOrder: 1 },
  { id: 'bnb', name: 'BNB Smart Chain', symbol: 'BNB', description: null, iconUrl: 'https://cryptologos.cc/logos/bnb-bnb-logo.svg', color: '#F3BA2F', isActive: true, sortOrder: 2 },
  { id: 'solana', name: 'Solana', symbol: 'SOL', description: null, iconUrl: 'https://cryptologos.cc/logos/solana-sol-logo.svg', color: '#00FFA3', isActive: true, sortOrder: 3 },
  { id: 'tron', name: 'TRON', symbol: 'TRX', description: null, iconUrl: 'https://cryptologos.cc/logos/tron-trx-logo.svg', color: '#FF0013', isActive: true, sortOrder: 4 }
];

// Varsayılan boş başlangıç durumları
const emptyBalances: Balance[] = [];
const emptyTransactions: Transaction[] = [];
const defaultFavorites: string[] = ['ethereum', 'bsc', 'tron'];

// Type for our wallet state
interface WalletState {
  currencies: CryptoCurrency[];
  balances: Balance[];
  transactions: Transaction[];
  favorites: string[];
}

// Hook for wallet operations
export const useWallet = () => {
  // Initial state
  const [wallet, setWallet] = useState<WalletState>({
    currencies: supportedCurrencies,
    balances: emptyBalances,
    transactions: emptyTransactions,
    favorites: defaultFavorites
  });
  
  // Cüzdanın mnemonic anahtarlarını saklamak için state
  const [walletMnemonics, setWalletMnemonics] = useState<{[walletId: string]: string}>({});
  
  // Load active wallet ID from localStorage and refresh cüzdan içeriği
  useEffect(() => {
    // Cüzdan verilerini güncelle
    const refreshWalletData = async () => {
      console.log("Cüzdan verilerini güncelliyorum...");
      try {
        // Önce bir manuel istekle cüzdan bilgilerine erişmeyi deneyelim
        const response = await fetch('/api/wallets/1');
        const data = await response.json();
        console.log("Doğrudan fetch ile alınan cüzdan verileri:", data);
        
        // Doğrudan veriyi kullanalım - apiRequest ile sorun yaşanıyor 
        // API yanıtını kullan
        const walletInfo = data.wallets[0];
        console.log("Doğrudan fetch ile alınan cüzdan verileri kullanılıyor:", walletInfo);
        
        // Aktif cüzdan ID'sini güncelleyerek doğru cüzdanın verilerini çek
        const activeWalletId = walletInfo.id.toString();
        localStorage.setItem('active_wallet_id', activeWalletId);
        
        // Desteklenen tüm kripto paraları göster
        const currencies = supportedCurrencies.map(c => c.id);
        console.log("Desteklenen para birimleri:", currencies);
        
        // Gerçek bakiyelerin sorgulanması gerçek bilgilere dayanacak, ancak 
        // şimdilik gerçekçi değerler gösterelim
        console.log("Gerçek bakiyeler yerine test bakiyeleri gösteriliyor");
        
        // Gerçek blockchain bakiyeleri yerine boş bakiyeler ile başlayalım
        // Not: Gerçek uygulamada bu değerler blockchain API'lerinden çekilecek
        const initialBalances: Balance[] = currencies.map((currency, index) => {
          return {
            id: index + 1, 
            walletId: parseInt(activeWalletId),
            currencyId: currency,
            amount: "0" // Gerçek blockchain verisi olmadığında 0 değeri göster
          };
        });
        
        // Wallet durumunu boş bakiyelerle güncelle 
        setWallet(prev => ({
          ...prev,
          balances: initialBalances,
          transactions: emptyTransactions
        }));
          
        // Cüzdan mnemonic bilgisini sakla
        if (walletInfo.mnemonic) {
          setWalletMnemonics(prev => ({
            ...prev,
            [activeWalletId]: walletInfo.mnemonic
          }));
        }
        
        // Cüzdan adreslerini API'den getir
        const addressesResponse: any = await apiRequest(`/api/wallet/${activeWalletId}/addresses`);
        let addresses: any[] = addressesResponse && addressesResponse.addresses ? addressesResponse.addresses : [];
        
        // Eğer adresler boşsa, cüzdanın mnemonic'ini kullanarak adresler oluşturalım
        if (!addresses || addresses.length === 0) {
          console.log("Cüzdan için adres bulunamadı, adresler oluşturuluyor...");
          
          if (walletInfo.mnemonic) {
            const mnemonic = walletInfo.mnemonic;
            
            // Önce desteklenen tüm kripto para birimleri için adres oluştur
            for (const currency of supportedCurrencies) {
              try {
                // API'ye POST isteği ile adres oluşturma
                const newAddressResponse: any = await apiRequest(
                  `/api/wallet/${activeWalletId}/create-address`,
                  {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                      currencyId: currency.id,
                      mnemonic: mnemonic
                    })
                  }
                );
                
                if (newAddressResponse && newAddressResponse.address) {
                  console.log(`${currency.name} için adres oluşturuldu: ${newAddressResponse.address.address}`);
                }
              } catch (error) {
                console.error(`${currency.id} için adres oluşturulamadı:`, error);
              }
            }
            
            // Şimdi tekrar adresleri çekelim
            const updatedAddressesResponse: any = await apiRequest(`/api/wallet/${activeWalletId}/addresses`);
            addresses = updatedAddressesResponse && updatedAddressesResponse.addresses 
              ? updatedAddressesResponse.addresses 
              : [];
            
            if (!addresses || addresses.length === 0) {
              console.log("Adres oluşturma başarısız, boş bakiye ile devam ediliyor");
              setWallet(prev => ({
                ...prev,
                balances: emptyBalances,
                transactions: emptyTransactions
              }));
              return;
            }
          } else {
            console.log("Cüzdan için mnemonic bilgisi bulunamadı, boş bakiye ile devam ediliyor");
            setWallet(prev => ({
              ...prev,
              balances: emptyBalances,
              transactions: emptyTransactions
            }));
            return;
          }
        }
        
        // Her bir desteklenen kripto para için bakiye hesapla
        const allBalances: Balance[] = [];
        
        for (const currency of supportedCurrencies) {
          const address = addresses.find((a) => a.currencyId === currency.id);
          
          if (address) {
            try {
              // Gerçek blockchain'den bakiye sorgula
              const balance = await getWalletBalance(address.address, currency.id);
              
              allBalances.push({
                id: Math.floor(Date.now() + Math.random()), // Basit bir ID
                walletId: parseInt(activeWalletId),
                currencyId: currency.id,
                amount: balance.toString()
              });
            } catch (error) {
              console.error(`${currency.id} için bakiye sorgulama hatası:`, error);
              allBalances.push({
                id: Math.floor(Date.now() + Math.random()),
                walletId: parseInt(activeWalletId),
                currencyId: currency.id,
                amount: "0"
              });
            }
          }
        }
        
        // İşlemleri API'den getir
        const transactionsResponse: any = await apiRequest(`/api/wallet/${activeWalletId}/transactions`);
        const transactions: Transaction[] = transactionsResponse && transactionsResponse.transactions 
          ? transactionsResponse.transactions 
          : [];
        
        setWallet(prev => ({
          ...prev,
          balances: allBalances,
          transactions: transactions
        }));
      } catch (error) {
        console.error("Cüzdan verilerini getirirken hata:", error);
      }
    };
    
    // Initial load
    refreshWalletData();
    
    // Storage event dinle (başka tablar için)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'active_wallet_id') {
        refreshWalletData();
      }
    };
    
    // Custom event dinle (aynı penceredeki değişiklikleri tespit etmek için)
    const handleWalletChange = () => {
      console.log("Wallet hook: wallet-changed event received");
      refreshWalletData();
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('wallet-changed', handleWalletChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('wallet-changed', handleWalletChange);
    };
  }, []);
  
  // Function to toggle a cryptocurrency as favorite
  const toggleFavorite = (currencyId: string) => {
    setWallet(prevWallet => {
      const favorites = prevWallet.favorites.includes(currencyId)
        ? prevWallet.favorites.filter(id => id !== currencyId)
        : [...prevWallet.favorites, currencyId];
      
      return {
        ...prevWallet,
        favorites
      };
    });
  };
  
  // Function to add a new transaction
  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction = {
      ...transaction,
      id: `t${Date.now()}`, // Generate a simple ID
      walletId: transaction.walletId || 1, // Default wallet ID
      timestamp: new Date(),
      hash: transaction.hash || null,
      fee: transaction.fee || null,
      confirmed: false
    };
    
    setWallet(prevWallet => {
      // Update the balance
      const balances = [...prevWallet.balances];
      const balanceIndex = balances.findIndex(b => b.currencyId === transaction.currencyId);
      
      if (balanceIndex >= 0) {
        const currentAmount = parseFloat(balances[balanceIndex].amount);
        const transactionAmount = parseFloat(transaction.amount);
        const balanceChange = transaction.type === 'receive' 
          ? transactionAmount 
          : -transactionAmount;
        
        const newAmount = Math.max(0, currentAmount + balanceChange).toString();
        
        balances[balanceIndex] = {
          ...balances[balanceIndex],
          amount: newAmount
        };
      }
      
      return {
        ...prevWallet,
        balances,
        transactions: [newTransaction, ...prevWallet.transactions]
      };
    });
  };
  
  return {
    wallet,
    toggleFavorite,
    addTransaction
  };
};

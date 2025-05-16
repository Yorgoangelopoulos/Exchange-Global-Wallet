import { useState, useEffect } from 'react';
import { getMultipleCoinPrices } from '@/lib/api-service';

export interface PriceData {
  id: string;
  price: number;
  change24h: number;
}

// A hook to fetch real cryptocurrency prices using CoinGecko API
export const useCryptoPrice = () => {
  const [prices, setPrices] = useState<PriceData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        setIsLoading(true);
        
        // Sadece kullandığımız 4 kripto para birimini ekleyelim
        const coinIds = [
          'ethereum', 'solana', 'tron', 'bnb'
        ];
        
        // Fetch real prices from CoinGecko
        const apiData = await getMultipleCoinPrices(coinIds);
        
        if (Object.keys(apiData).length > 0) {
          // Convert API response to our price format
          const livePrices: PriceData[] = [];
          
          for (const coinId in apiData) {
            const data = apiData[coinId];
            livePrices.push({
              id: coinId,
              price: data.usd,
              change24h: data.usd_24h_change || 0
            });
          }
          
          setPrices(livePrices);
          setError(null);
        } else {
          // If API fails, use fallback data
          console.warn("API returned no data, using fallback prices");
          setError('Could not fetch live prices. Using fallback data.');
          useFallbackPrices();
        }
      } catch (err) {
        setError('Failed to fetch cryptocurrency prices');
        console.error(err);
        useFallbackPrices();
      } finally {
        setIsLoading(false);
      }
    };
    
    // Varsayılan fiyat verileri - Sadece desteklenen 4 kripto para birimi
    const useFallbackPrices = () => {
      const fallbackPrices: PriceData[] = [
        { id: 'ethereum', price: 1925.37, change24h: -0.8 },
        { id: 'solana', price: 42.18, change24h: 3.5 },
        { id: 'tron', price: 0.13, change24h: 1.95 },
        { id: 'bnb', price: 215.64, change24h: 0.9 }
      ];
      
      setPrices(fallbackPrices);
    };
    
    fetchPrices();
    
    // Poll for price updates every 60 seconds
    const intervalId = setInterval(() => {
      fetchPrices();
    }, 60000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Function to add small realtime price fluctuations between API calls
  const simulatePriceChange = () => {
    setPrices(prevPrices => 
      prevPrices.map(price => {
        // Random price change between -0.5% and +0.5%
        const changePercent = (Math.random() * 1) - 0.5;
        const newPrice = price.price * (1 + (changePercent / 100));
        
        // Small adjustment to 24h change
        let newChange = price.change24h + ((Math.random() * 0.1) - 0.05);
        
        return {
          ...price,
          price: parseFloat(newPrice.toFixed(2)),
          change24h: parseFloat(newChange.toFixed(2))
        };
      })
    );
  };
  
  // Simulate small price fluctuations every 15 seconds between API calls
  useEffect(() => {
    const intervalId = setInterval(() => {
      simulatePriceChange();
    }, 15000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  return { prices, isLoading, error };
};

import { useState, useEffect } from 'react';

interface PriceData {
  id: string;
  price: number;
  change24h: number;
}

// A hook to simulate fetching cryptocurrency prices
// In a real app, this would make API calls to services like CoinGecko or CoinMarketCap
export const useCryptoPrice = () => {
  const [prices, setPrices] = useState<PriceData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        setIsLoading(true);
        
        // In a real app, we would fetch from an API like:
        // const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,...');
        
        // For this demo, we'll use mock data
        const mockPrices: PriceData[] = [
          { id: 'bitcoin', price: 36289.42, change24h: 1.2 },
          { id: 'ethereum', price: 1925.37, change24h: -0.8 },
          { id: 'solana', price: 42.18, change24h: 3.5 },
          { id: 'avalanche', price: 21.75, change24h: 2.1 },
          { id: 'monero', price: 157.92, change24h: -1.3 },
          { id: 'tether', price: 1.00, change24h: 0.01 },
          { id: 'binancecoin', price: 215.64, change24h: 0.9 },
          { id: 'ripple', price: 0.62, change24h: -2.1 }
        ];
        
        setPrices(mockPrices);
        setError(null);
      } catch (err) {
        setError('Failed to fetch cryptocurrency prices');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPrices();
    
    // Poll for price updates every 60 seconds
    const intervalId = setInterval(() => {
      fetchPrices();
    }, 60000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Function to add random price fluctuations for simulation
  const simulatePriceChange = () => {
    setPrices(prevPrices => 
      prevPrices.map(price => {
        // Random price change between -2% and +2%
        const changePercent = (Math.random() * 4) - 2;
        const newPrice = price.price * (1 + (changePercent / 100));
        
        // Adjust 24h change slightly
        let newChange = price.change24h + ((Math.random() * 0.4) - 0.2);
        // Keep change within reasonable bounds
        newChange = Math.min(Math.max(newChange, -10), 10);
        
        return {
          ...price,
          price: parseFloat(newPrice.toFixed(2)),
          change24h: parseFloat(newChange.toFixed(2))
        };
      })
    );
  };
  
  // Simulate small price changes every 10 seconds
  useEffect(() => {
    const intervalId = setInterval(() => {
      simulatePriceChange();
    }, 10000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  return { prices, isLoading, error };
};

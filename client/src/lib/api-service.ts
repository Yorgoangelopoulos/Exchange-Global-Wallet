// API service for fetching cryptocurrency data from CoinGecko
// No API key required for basic endpoints

const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3';

// Map our internal currency IDs to CoinGecko IDs
const COIN_ID_MAP: {[key: string]: string} = {
  'bitcoin': 'bitcoin',
  'ethereum': 'ethereum',
  'solana': 'solana',
  'tron': 'tron',
  'avalanche': 'avalanche-2',
  'bnb': 'binancecoin',
  'xrp': 'ripple',
  'cardano': 'cardano',
  'polkadot': 'polkadot',
  'dogecoin': 'dogecoin'
};

// Fetch price data for multiple coins at once
export async function getMultipleCoinPrices(coinIds: string[]): Promise<{[key: string]: {usd: number, usd_24h_change: number}}> {
  try {
    // Map our internal IDs to CoinGecko IDs
    const geckoIds = coinIds.map(id => COIN_ID_MAP[id] || id).join(',');
    
    const response = await fetch(
      `${COINGECKO_API_URL}/simple/price?ids=${geckoIds}&vs_currencies=usd&include_24hr_change=true`
    );
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Convert back to our internal IDs
    const result: {[key: string]: {usd: number, usd_24h_change: number}} = {};
    
    for (const [ourId, geckoId] of Object.entries(COIN_ID_MAP)) {
      if (data[geckoId] && coinIds.includes(ourId)) {
        result[ourId] = data[geckoId];
      }
    }
    
    return result;
  } catch (error) {
    console.error('Error fetching coin prices:', error);
    // Return empty object in case of error
    return {};
  }
}

// Fetch detailed data for a single coin
export async function getCoinDetails(coinId: string): Promise<any> {
  try {
    const geckoId = COIN_ID_MAP[coinId] || coinId;
    
    const response = await fetch(
      `${COINGECKO_API_URL}/coins/${geckoId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false`
    );
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching details for ${coinId}:`, error);
    return null;
  }
}

// Fetch token prices (like USDT, UNI, etc)
export async function getTokenPrices(platform: string, tokenAddresses: string[]): Promise<{[address: string]: {usd: number}}> {
  if (tokenAddresses.length === 0) {
    return {};
  }
  
  try {
    // Map platform to CoinGecko platform ID
    const platformId = platform === 'ethereum' ? 'ethereum' : 
                       platform === 'solana' ? 'solana' :
                       platform === 'tron' ? 'tron' : 'ethereum';
    
    const addressesStr = tokenAddresses.join(',');
    
    const response = await fetch(
      `${COINGECKO_API_URL}/simple/token_price/${platformId}?contract_addresses=${addressesStr}&vs_currencies=usd`
    );
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching token prices:', error);
    return {};
  }
}

// Get trending coins (useful for homepage or suggestions)
export async function getTrendingCoins(): Promise<any[]> {
  try {
    const response = await fetch(`${COINGECKO_API_URL}/search/trending`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.coins || [];
  } catch (error) {
    console.error('Error fetching trending coins:', error);
    return [];
  }
}

// Get global crypto market data
export async function getGlobalData(): Promise<any> {
  try {
    const response = await fetch(`${COINGECKO_API_URL}/global`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching global data:', error);
    return null;
  }
}
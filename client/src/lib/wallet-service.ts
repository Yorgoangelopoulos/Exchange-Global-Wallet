import { ethers } from 'ethers';
import * as bip39 from 'bip39';
import * as bitcoin from 'bitcoinjs-lib';
import * as bs58 from 'bs58';
import { mnemonicToSeedSync } from 'bip39';
import HDKey from 'hdkey';
import { publicToAddress, toChecksumAddress } from 'ethereumjs-util';
import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import * as ecc from 'tiny-secp256k1';
import { ECPairFactory } from 'ecpair';

export type WalletAddress = {
  address: string;
  path: string;
  privateKey: string;
};

// Supported networks
const NETWORKS = {
  bitcoin: {
    mainnet: bitcoin.networks.bitcoin,
    testnet: bitcoin.networks.testnet
  },
  ethereum: {
    mainnet: 'homestead',
    testnet: 'sepolia'
  },
  solana: {
    mainnet: 'https://api.mainnet-beta.solana.com',
    testnet: 'https://api.devnet.solana.com'
  }
};

// Generate a mnemonic (seed phrase)
export function generateMnemonic(strength: 128 | 256 = 128): string {
  return bip39.generateMnemonic(strength);
}

// Validate mnemonic
export function validateMnemonic(mnemonic: string): boolean {
  return bip39.validateMnemonic(mnemonic);
}

// Generate seed from mnemonic
function mnemonicToSeed(mnemonic: string): Buffer {
  return mnemonicToSeedSync(mnemonic);
}

// Generate HD wallet from seed
export function generateHDWallet(mnemonic: string, password: string = ''): HDKey {
  const seed = mnemonicToSeed(mnemonic);
  return HDKey.fromMasterSeed(seed);
}

// Bitcoin Wallet
export function generateBitcoinWallet(mnemonic: string, account: number = 0, isTestnet: boolean = false): WalletAddress {
  const seed = mnemonicToSeed(mnemonic);
  const network = isTestnet ? NETWORKS.bitcoin.testnet : NETWORKS.bitcoin.mainnet;
  
  // BIP44 path for Bitcoin: m/44'/0'/account'/0/0
  const path = `m/44'/0'/${account}'/0/0`;
  const hdWallet = HDKey.fromMasterSeed(seed);
  const childKey = hdWallet.derive(path);
  
  // Use ECPairFactory for Bitcoin lib v6+
  const ECPair = ECPairFactory(ecc);
  const keyPair = ECPair.fromPrivateKey(childKey.privateKey, { network });
  
  const { address } = bitcoin.payments.p2pkh({ 
    pubkey: keyPair.publicKey,
    network 
  });
  
  return {
    address: address || '',
    path,
    privateKey: childKey.privateKey.toString('hex')
  };
}

// Ethereum Wallet
export function generateEthereumWallet(mnemonic: string, account: number = 0): WalletAddress {
  // BIP44 path for Ethereum: m/44'/60'/0'/0/account
  const path = `m/44'/60'/0'/0/${account}`;
  
  // Using ethers.js Wallet
  const hdNode = ethers.utils.HDNode.fromMnemonic(mnemonic);
  const wallet = hdNode.derivePath(path);
  
  return {
    address: wallet.address,
    path,
    privateKey: wallet.privateKey.substring(2) // Remove '0x' prefix
  };
}

// Solana Wallet
export function generateSolanaWallet(mnemonic: string, account: number = 0): WalletAddress {
  const seed = mnemonicToSeed(mnemonic);
  
  // BIP44 path for Solana: m/44'/501'/account'/0'
  const path = `m/44'/501'/${account}'/0'`;
  const hdWallet = HDKey.fromMasterSeed(seed);
  const childKey = hdWallet.derive(path);
  
  // Create Solana keypair from private key
  const keypair = Keypair.fromSeed(childKey.privateKey);
  
  return {
    address: keypair.publicKey.toString(),
    path,
    privateKey: Buffer.from(keypair.secretKey).toString('hex')
  };
}

// Get balance for Bitcoin address
export async function getBitcoinBalance(address: string, isTestnet: boolean = false): Promise<number> {
  try {
    const network = isTestnet ? 'testnet' : 'mainnet';
    const response = await fetch(`https://blockstream.info/${network}/api/address/${address}`);
    const data = await response.json();
    
    // Convert satoshis to BTC
    return data.chain_stats.funded_txo_sum / 100000000;
  } catch (error) {
    console.error('Error fetching Bitcoin balance:', error);
    return 0;
  }
}

// Get balance for Ethereum address
export async function getEthereumBalance(address: string, isTestnet: boolean = false): Promise<number> {
  try {
    const network = isTestnet ? NETWORKS.ethereum.testnet : NETWORKS.ethereum.mainnet;
    const provider = new ethers.providers.JsonRpcProvider(`https://${network}.infura.io/v3/YOUR_INFURA_KEY`);
    
    const balance = await provider.getBalance(address);
    // Convert wei to ETH
    return parseFloat(ethers.utils.formatEther(balance));
  } catch (error) {
    console.error('Error fetching Ethereum balance:', error);
    return 0;
  }
}

// Get balance for Solana address
export async function getSolanaBalance(address: string, isTestnet: boolean = false): Promise<number> {
  try {
    const endpoint = isTestnet ? NETWORKS.solana.testnet : NETWORKS.solana.mainnet;
    const connection = new Connection(endpoint);
    
    const publicKey = new PublicKey(address);
    const balance = await connection.getBalance(publicKey);
    
    // Convert lamports to SOL
    return balance / LAMPORTS_PER_SOL;
  } catch (error) {
    console.error('Error fetching Solana balance:', error);
    return 0;
  }
}

// Generate a wallet address for a specific currency
export function generateWalletAddress(mnemonic: string, currency: string, account: number = 0): WalletAddress {
  switch (currency.toLowerCase()) {
    case 'btc':
    case 'bitcoin':
      return generateBitcoinWallet(mnemonic, account);
      
    case 'eth':
    case 'ethereum':
      return generateEthereumWallet(mnemonic, account);
      
    case 'sol':
    case 'solana':
      return generateSolanaWallet(mnemonic, account);
      
    default:
      throw new Error(`Unsupported currency: ${currency}`);
  }
}

// Get specific currency balance
export async function getWalletBalance(address: string, currency: string, isTestnet: boolean = false): Promise<number> {
  switch (currency.toLowerCase()) {
    case 'btc':
    case 'bitcoin':
      return getBitcoinBalance(address, isTestnet);
      
    case 'eth':
    case 'ethereum':
      return getEthereumBalance(address, isTestnet);
      
    case 'sol':
    case 'solana':
      return getSolanaBalance(address, isTestnet);
      
    default:
      throw new Error(`Unsupported currency: ${currency}`);
  }
}
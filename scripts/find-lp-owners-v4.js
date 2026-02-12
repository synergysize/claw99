import { Connection, PublicKey } from '@solana/web3.js';

const connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed');
const POOL_ADDRESS = new PublicKey('6CiwGie3YbLMaXt9PFAmu4sf9t1dWyVdky9KJRrFAeBW');
const METEORA_DLMM = new PublicKey('LBUZKhRxPF3XUpBCjp4YzTKgLccjZhTSDM9YuVaPwxo');

async function main() {
  console.log('Pool:', POOL_ADDRESS.toBase58());
  
  // Get pool account info
  const poolInfo = await connection.getAccountInfo(POOL_ADDRESS);
  console.log('Pool data size:', poolInfo.data.length);
  
  // Parse pool data to find token reserves
  // Meteora DLMM LbPair layout has reserve info
  const data = poolInfo.data;
  
  // LbPair layout (approximate offsets):
  // Various fields... then token mints, reserves, etc.
  
  // Let's just get recent signatures and look for patterns
  console.log('\nFetching recent transactions (just signatures)...');
  const sigs = await connection.getSignaturesForAddress(POOL_ADDRESS, { limit: 100 });
  
  console.log(`\nLast 100 transactions found.`);
  console.log(`Most recent: ${new Date(sigs[0].blockTime * 1000).toISOString()}`);
  console.log(`Oldest in batch: ${new Date(sigs[sigs.length-1].blockTime * 1000).toISOString()}`);
  
  // Just parse one transaction to see the structure
  console.log('\nAnalyzing first transaction...');
  const firstTx = await connection.getParsedTransaction(sigs[0].signature, {
    maxSupportedTransactionVersion: 0,
  });
  
  if (firstTx) {
    const accounts = firstTx.transaction.message.accountKeys;
    console.log('\nAccounts involved:');
    accounts.slice(0, 5).forEach((acc, i) => {
      console.log(`  ${i}: ${acc.pubkey.toBase58()} ${acc.signer ? '(SIGNER)' : ''}`);
    });
    
    const logs = firstTx.meta?.logMessages || [];
    console.log('\nLog preview:');
    logs.slice(0, 5).forEach(log => console.log(`  ${log.slice(0, 80)}...`));
  }
  
  // Based on what we saw on Solscan, the main LP was:
  // CY3zwTwYW8YW7qcFWisa9cuavXDmLhDqjrPGBM1SPf2s - removed most liquidity
  
  console.log('\n=== KNOWN LP FROM SOLSCAN ANALYSIS ===');
  console.log('Main LP who removed ~$10.7K 8 days ago:');
  console.log('  CY3zwTwYW8YW7qcFWisa9cuavXDmLhDqjrPGBM1SPf2s');
  console.log('  https://solscan.io/account/CY3zwTwYW8YW7qcFWisa9cuavXDmLhDqjrPGBM1SPf2s');
  
  console.log('\nRemaining $68.78 TVL is likely dust or unclaimed fees.');
  console.log('To find if you own it, connect your wallet to app.meteora.ag and check "Your Positions"');
}

main().catch(console.error);

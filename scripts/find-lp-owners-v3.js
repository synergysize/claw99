import { Connection, PublicKey } from '@solana/web3.js';

// Use public RPC but be more targeted
const connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed');

const POOL_ADDRESS = new PublicKey('6CiwGie3YbLMaXt9PFAmu4sf9t1dWyVdky9KJRrFAeBW');

async function checkRecentActivity() {
  console.log('Checking recent activity for pool:', POOL_ADDRESS.toBase58());
  console.log('Looking for ADD_LIQUIDITY events...\n');

  const sigs = await connection.getSignaturesForAddress(POOL_ADDRESS, { limit: 200 });
  console.log(`Found ${sigs.length} recent transactions\n`);

  const liquidityEvents = new Map(); // wallet -> {adds: [], removes: []}

  for (let i = 0; i < Math.min(sigs.length, 50); i++) {
    const sig = sigs[i];
    
    try {
      const tx = await connection.getParsedTransaction(sig.signature, {
        maxSupportedTransactionVersion: 0,
      });
      
      if (!tx) continue;
      
      const logs = tx.meta?.logMessages || [];
      const logsStr = logs.join(' ');
      
      const isAddLiq = logsStr.includes('AddLiquidity') || logsStr.includes('add_liquidity');
      const isRemoveLiq = logsStr.includes('RemoveLiquidity') || logsStr.includes('remove_liquidity');
      
      if (isAddLiq || isRemoveLiq) {
        // Find the fee payer (usually the LP provider)
        const feePayer = tx.transaction.message.accountKeys[0]?.pubkey?.toBase58();
        
        if (!liquidityEvents.has(feePayer)) {
          liquidityEvents.set(feePayer, { adds: [], removes: [] });
        }
        
        const event = {
          sig: sig.signature,
          time: new Date(sig.blockTime * 1000).toISOString(),
          type: isAddLiq ? 'ADD' : 'REMOVE',
        };
        
        if (isAddLiq) {
          liquidityEvents.get(feePayer).adds.push(event);
        }
        if (isRemoveLiq) {
          liquidityEvents.get(feePayer).removes.push(event);
        }
        
        console.log(`${event.time} | ${event.type.padEnd(6)} | ${feePayer.slice(0, 8)}...${feePayer.slice(-4)}`);
      }
      
      // Rate limit
      await new Promise(r => setTimeout(r, 100));
      
    } catch (e) {
      // Skip errors
    }
  }

  console.log('\n=== LIQUIDITY PROVIDERS SUMMARY ===\n');
  
  for (const [wallet, events] of liquidityEvents) {
    const netAdds = events.adds.length - events.removes.length;
    const status = netAdds > 0 ? '🟢 LIKELY HAS OPEN POSITION' : 
                   netAdds === 0 ? '⚪ FULLY WITHDRAWN' : 
                   '🔴 MORE REMOVES THAN ADDS (weird)';
    
    console.log(`Wallet: ${wallet}`);
    console.log(`  Adds: ${events.adds.length} | Removes: ${events.removes.length}`);
    console.log(`  Status: ${status}`);
    console.log(`  Solscan: https://solscan.io/account/${wallet}`);
    console.log('');
  }
  
  // Find wallets with likely open positions
  const openPositions = [...liquidityEvents.entries()]
    .filter(([_, e]) => e.adds.length > e.removes.length);
  
  if (openPositions.length > 0) {
    console.log('=== WALLETS WITH LIKELY OPEN POSITIONS ===\n');
    for (const [wallet, _] of openPositions) {
      console.log(wallet);
    }
  }
}

checkRecentActivity();

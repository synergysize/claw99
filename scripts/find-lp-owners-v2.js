import { Connection, PublicKey } from '@solana/web3.js';

// Use Helius free tier RPC (better for large queries)
const connection = new Connection('https://mainnet.helius-rpc.com/?api-key=1d8740dc-e5f4-421c-b823-e1bad1889eff', 'confirmed');

const METEORA_DLMM_PROGRAM = new PublicKey('LBUZKhRxPF3XUpBCjp4YzTKgLccjZhTSDM9YuVaPwxo');
const POOL_ADDRESS = new PublicKey('6CiwGie3YbLMaXt9PFAmu4sf9t1dWyVdky9KJRrFAeBW');

// Position account discriminator for Meteora DLMM
const POSITION_DISCRIMINATOR = Buffer.from([170, 188, 143, 228, 122, 64, 247, 208]);

async function findPositions() {
  console.log('Searching for LP positions in pool:', POOL_ADDRESS.toBase58());
  console.log('Using Helius RPC for better query support...\n');

  try {
    // Method 1: Search by discriminator + pool reference
    const accounts = await connection.getProgramAccounts(METEORA_DLMM_PROGRAM, {
      filters: [
        {
          memcmp: {
            offset: 0,
            bytes: POSITION_DISCRIMINATOR.toString('base64'),
            encoding: 'base64',
          },
        },
        {
          memcmp: {
            offset: 8, // After discriminator, pool pubkey
            bytes: POOL_ADDRESS.toBase58(),
          },
        },
      ],
    });

    console.log(`Found ${accounts.length} position accounts\n`);

    if (accounts.length === 0) {
      console.log('No open positions found for this pool.');
      console.log('The remaining liquidity might be in bin arrays or protocol reserves.');
      return;
    }

    const owners = new Map();

    for (const { pubkey, account } of accounts) {
      const data = account.data;
      
      // Position layout:
      // 0-8: discriminator
      // 8-40: lb_pair (pool)
      // 40-72: owner
      const owner = new PublicKey(data.slice(40, 72)).toBase58();
      
      if (!owners.has(owner)) {
        owners.set(owner, []);
      }
      owners.get(owner).push(pubkey.toBase58());

      console.log(`Position: ${pubkey.toBase58()}`);
      console.log(`  Owner: ${owner}`);
    }

    console.log('\n=== Summary ===');
    console.log(`Total positions: ${accounts.length}`);
    console.log(`Unique owners: ${owners.size}`);
    
    for (const [owner, positions] of owners) {
      console.log(`\nOwner: ${owner}`);
      console.log(`  Positions: ${positions.length}`);
      console.log(`  Solscan: https://solscan.io/account/${owner}`);
    }

  } catch (error) {
    console.error('Error:', error.message);
    
    // Fallback: Try getting recent signatures for the pool
    console.log('\nFallback: Checking recent transactions...');
    await checkRecentTxs();
  }
}

async function checkRecentTxs() {
  const sigs = await connection.getSignaturesForAddress(POOL_ADDRESS, { limit: 100 });
  
  const addLiquidityTxs = [];
  
  for (const sig of sigs) {
    const tx = await connection.getParsedTransaction(sig.signature, {
      maxSupportedTransactionVersion: 0,
    });
    
    if (!tx) continue;
    
    // Look for AddLiquidity instructions
    const logs = tx.meta?.logMessages || [];
    const hasAddLiquidity = logs.some(log => 
      log.includes('AddLiquidity') || log.includes('add_liquidity')
    );
    
    if (hasAddLiquidity) {
      const signer = tx.transaction.message.accountKeys.find(k => k.signer)?.pubkey.toBase58();
      addLiquidityTxs.push({
        sig: sig.signature,
        signer,
        time: new Date(sig.blockTime * 1000).toISOString(),
      });
    }
  }
  
  console.log(`\nRecent AddLiquidity transactions:`);
  for (const tx of addLiquidityTxs.slice(0, 10)) {
    console.log(`  ${tx.time} - ${tx.signer?.slice(0, 8)}...`);
    console.log(`    https://solscan.io/tx/${tx.sig}`);
  }
}

findPositions();

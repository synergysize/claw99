import { Connection, PublicKey } from '@solana/web3.js';

const METEORA_DLMM_PROGRAM = new PublicKey('LBUZKhRxPF3XUpBCjp4YzTKgLccjZhTSDM9YuVaPwxo');
const POOL_ADDRESS = new PublicKey('6CiwGie3YbLMaXt9PFAmu4sf9t1dWyVdky9KJRrFAeBW');

const connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed');

async function findPositionAccounts() {
  console.log('Searching for LP positions in pool:', POOL_ADDRESS.toBase58());
  console.log('Meteora DLMM Program:', METEORA_DLMM_PROGRAM.toBase58());
  console.log('---');

  // Get all accounts owned by Meteora DLMM program that reference this pool
  // Position accounts have the pool address in their data
  
  const accounts = await connection.getProgramAccounts(METEORA_DLMM_PROGRAM, {
    filters: [
      {
        memcmp: {
          offset: 8, // After discriminator
          bytes: POOL_ADDRESS.toBase58(),
        },
      },
    ],
  });

  console.log(`Found ${accounts.length} position accounts\n`);

  if (accounts.length === 0) {
    console.log('No positions found. Trying alternative search...');
    
    // Try getting all accounts and filtering manually
    const allAccounts = await connection.getProgramAccounts(METEORA_DLMM_PROGRAM, {
      filters: [
        { dataSize: 8120 }, // Position account size for DLMM
      ],
    });
    
    console.log(`Found ${allAccounts.length} position-sized accounts total`);
    
    for (const { pubkey, account } of allAccounts) {
      const data = account.data;
      // Check if this position references our pool (pool pubkey at offset 8)
      const poolInData = new PublicKey(data.slice(8, 40));
      if (poolInData.equals(POOL_ADDRESS)) {
        const owner = new PublicKey(data.slice(40, 72));
        console.log(`Position: ${pubkey.toBase58()}`);
        console.log(`  Owner: ${owner.toBase58()}`);
      }
    }
    return;
  }

  for (const { pubkey, account } of accounts) {
    const data = account.data;
    
    // Meteora DLMM Position layout (approximate):
    // 0-8: discriminator
    // 8-40: lb_pair (pool address)
    // 40-72: owner
    
    const owner = new PublicKey(data.slice(40, 72));
    
    console.log(`Position Account: ${pubkey.toBase58()}`);
    console.log(`  Owner Wallet: ${owner.toBase58()}`);
    console.log(`  Data Size: ${data.length} bytes`);
    console.log('');
  }
}

async function getPoolInfo() {
  console.log('=== Pool Info ===');
  const poolAccount = await connection.getAccountInfo(POOL_ADDRESS);
  
  if (!poolAccount) {
    console.log('Pool not found!');
    return;
  }
  
  console.log(`Pool Data Size: ${poolAccount.data.length} bytes`);
  console.log(`Pool Owner: ${poolAccount.owner.toBase58()}`);
  console.log('');
}

async function main() {
  try {
    await getPoolInfo();
    await findPositionAccounts();
  } catch (error) {
    console.error('Error:', error.message);
    
    if (error.message.includes('429')) {
      console.log('\nRate limited. Try with a different RPC endpoint.');
    }
  }
}

main();

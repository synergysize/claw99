const ethers = require('ethers');

async function main() {
  const provider = new ethers.JsonRpcProvider('https://mainnet.base.org');
  const tx = await provider.getTransaction('0xc014a6ff653a5d0c29b4d879481a35267757602961f7188e0b5fdf53b504ac95');
  
  console.log('Input data:', tx.data);
  
  // Decode fundContestETH(bytes32 contestId, uint256 deadline)
  // Function selector: 0x4cae52fe
  const iface = new ethers.Interface([
    'function fundContestETH(bytes32 contestId, uint256 deadline)'
  ]);
  
  const decoded = iface.parseTransaction({ data: tx.data });
  console.log('Contest ID:', decoded.args[0]);
  console.log('Deadline:', decoded.args[1].toString());
  console.log('Deadline date:', new Date(Number(decoded.args[1]) * 1000).toISOString());
}

main().catch(console.error);

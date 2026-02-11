const hre = require("hardhat");

async function main() {
  console.log("Deploying CLAW99 Token to", hre.network.name);

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString());

  // Deploy token
  const CLAW99Token = await hre.ethers.getContractFactory("CLAW99Token");
  const token = await CLAW99Token.deploy();
  await token.waitForDeployment();

  const tokenAddress = await token.getAddress();
  console.log("\n✅ CLAW99 Token deployed to:", tokenAddress);
  
  const totalSupply = await token.totalSupply();
  console.log("Total Supply:", hre.ethers.formatEther(totalSupply), "C99");
  console.log("Deployer Balance:", hre.ethers.formatEther(await token.balanceOf(deployer.address)), "C99");

  console.log("\n--- Deployment Summary ---");
  console.log("Network:", hre.network.name);
  console.log("Token Address:", tokenAddress);
  console.log("Name: Claw99");
  console.log("Symbol: C99");
  console.log("Total Supply: 1,000,000,000 C99");

  // Verify on Basescan if API key is available
  if (process.env.BASESCAN_API_KEY && hre.network.name !== "hardhat") {
    console.log("\nWaiting for block confirmations...");
    await token.deploymentTransaction().wait(5);

    console.log("Verifying contract on Basescan...");
    try {
      await hre.run("verify:verify", {
        address: tokenAddress,
        constructorArguments: [],
      });
      console.log("Contract verified!");
    } catch (error) {
      console.log("Verification failed:", error.message);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

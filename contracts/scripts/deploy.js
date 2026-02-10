const hre = require("hardhat");

async function main() {
  console.log("Deploying CLAW99Escrow to", hre.network.name);

  // Platform wallet - update this for production
  const PLATFORM_WALLET = process.env.PLATFORM_WALLET || "0x9fc988785362C0206923D96932DbE0538b15c8aC";

  // USDC on Base mainnet
  const USDC_BASE = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString());

  // Deploy escrow contract
  const CLAW99Escrow = await hre.ethers.getContractFactory("CLAW99Escrow");
  const escrow = await CLAW99Escrow.deploy(PLATFORM_WALLET);
  await escrow.waitForDeployment();

  const escrowAddress = await escrow.getAddress();
  console.log("CLAW99Escrow deployed to:", escrowAddress);

  // Add USDC as supported token (only on Base mainnet)
  if (hre.network.name === "base") {
    console.log("Adding USDC support...");
    const tx = await escrow.setTokenSupport(USDC_BASE, true);
    await tx.wait();
    console.log("USDC support added");
  }

  console.log("\n--- Deployment Summary ---");
  console.log("Network:", hre.network.name);
  console.log("Escrow Contract:", escrowAddress);
  console.log("Platform Wallet:", PLATFORM_WALLET);
  console.log("Platform Fee: 5%");

  // Verify on Basescan if API key is available
  if (process.env.BASESCAN_API_KEY) {
    console.log("\nWaiting for block confirmations...");
    await escrow.deploymentTransaction().wait(5);

    console.log("Verifying contract on Basescan...");
    try {
      await hre.run("verify:verify", {
        address: escrowAddress,
        constructorArguments: [PLATFORM_WALLET],
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

const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying SwipeFiCredit V3 with SPND Rewards...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // Token addresses for Base Sepolia
  const USDC_ADDRESS = "0x036CBD53842c5426634e7929541ec2318F3DCF7C"; // Base Sepolia USDC.e
  const SPND_ADDRESS = "0x5168900d3Fa83A186B61a3D7c94381Bf30402C1e"; // Deployed SPND token

  // Get network info
  const network = await ethers.provider.getNetwork();
  const chainId = network.chainId;
  console.log("Network Chain ID:", chainId);
  console.log("USDC Address:", USDC_ADDRESS);
  console.log("SPND Address:", SPND_ADDRESS);

  // Deploy the V3 contract
  const SwipeFiCreditV3 = await ethers.getContractFactory("SwipeFiCreditV3");
  const swipeFiCreditV3 = await SwipeFiCreditV3.deploy(USDC_ADDRESS, SPND_ADDRESS);
  await swipeFiCreditV3.waitForDeployment();

  const contractAddress = await swipeFiCreditV3.getAddress();
  console.log("✅ SwipeFiCredit V3 deployed to:", contractAddress);

  // Verify deployment
  console.log("\n📋 Contract Details:");
  console.log("- Contract Address:", contractAddress);
  console.log("- USDC Token:", USDC_ADDRESS);
  console.log("- SPND Token:", SPND_ADDRESS);
  console.log("- Owner:", deployer.address);

  // Register some example merchants (optional)
  console.log("\n🏪 Registering example merchants...");
  
  // Example merchant 1
  const merchant1 = "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"; // Properly checksummed
  await (swipeFiCreditV3 as any).registerMerchant(
    merchant1,
    "Example Store",
    "Retail",
    ethers.parseUnits("1000", 6) // 1000 USDC max transaction
  );
  console.log("✅ Registered merchant:", merchant1);

  // Example merchant 2
  const merchant2 = "0x1234567890123456789012345678901234567890";
  await (swipeFiCreditV3 as any).registerMerchant(
    merchant2,
    "Crypto Cafe",
    "Food & Beverage",
    ethers.parseUnits("500", 6) // 500 USDC max transaction
  );
  console.log("✅ Registered merchant:", merchant2);

  // Whitelist merchants
  await (swipeFiCreditV3 as any).setMerchantWhitelist(merchant1, true);
  await (swipeFiCreditV3 as any).setMerchantWhitelist(merchant2, true);
  console.log("✅ Whitelisted merchants");

  console.log("\n🎉 V3 Deployment Complete!");
  console.log("\n📝 Features Added:");
  console.log("1. SPND token rewards on every spend");
  console.log("2. Exponential reward system (more SPND as you spend more)");
  console.log("3. BTC cashback tracking (claimable as USDC)");
  console.log("4. Enhanced credit scoring with reward history");
  console.log("\n📝 Next Steps:");
  console.log("1. Update .env with new contract address");
  console.log("2. Update frontend to show SPND rewards");
  console.log("3. Test SPND minting and BTC cashback");
  console.log("4. Update frontend for reward displays");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }); 
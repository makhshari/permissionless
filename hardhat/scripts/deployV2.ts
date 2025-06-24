const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying SwipeFiCredit V2...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // USDC addresses for different networks
  const USDC_ADDRESSES: { [chainId: string]: string } = {
    // Base Sepolia - USDC.e (Bridged USDC)
    "84532": "0x036CBD53842c5426634e7929541ec2318F3DCF7C", // Base Sepolia USDC.e (correctly checksummed)
    // Add other networks as needed
  };

  // Get network info
  const network = await ethers.provider.getNetwork();
  const chainId = network.chainId;
  console.log("Network Chain ID:", chainId);

  // Get USDC address for current network
  const usdcAddress = USDC_ADDRESSES[chainId.toString()];
  if (!usdcAddress) {
    throw new Error(`No USDC address configured for chain ID ${chainId}`);
  }
  console.log("USDC Address:", usdcAddress);

  // Deploy the contract
  const SwipeFiCreditV2 = await ethers.getContractFactory("SwipeFiCreditV2");
  const swipeFiCreditV2 = await SwipeFiCreditV2.deploy(usdcAddress);
  await swipeFiCreditV2.waitForDeployment();

  const contractAddress = await swipeFiCreditV2.getAddress();
  console.log("✅ SwipeFiCredit V2 deployed to:", contractAddress);

  // Verify deployment
  console.log("\n📋 Contract Details:");
  console.log("- Contract Address:", contractAddress);
  console.log("- USDC Token:", usdcAddress);
  console.log("- Owner:", deployer.address);

  // Register some example merchants (optional)
  console.log("\n🏪 Registering example merchants...");
  
  // Example merchant 1
  const merchant1 = "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6";
  await (swipeFiCreditV2 as any).registerMerchant(
    merchant1,
    "Example Store",
    "Retail",
    ethers.parseUnits("1000", 6) // 1000 USDC max transaction
  );
  console.log("✅ Registered merchant:", merchant1);

  // Example merchant 2
  const merchant2 = "0x1234567890123456789012345678901234567890";
  await (swipeFiCreditV2 as any).registerMerchant(
    merchant2,
    "Crypto Cafe",
    "Food & Beverage",
    ethers.parseUnits("500", 6) // 500 USDC max transaction
  );
  console.log("✅ Registered merchant:", merchant2);

  // Whitelist merchants
  await (swipeFiCreditV2 as any).setMerchantWhitelist(merchant1, true);
  await (swipeFiCreditV2 as any).setMerchantWhitelist(merchant2, true);
  console.log("✅ Whitelisted merchants");

  console.log("\n🎉 V2 Deployment Complete!");
  console.log("\n📝 Next Steps:");
  console.log("1. Update .env.local with new contract address");
  console.log("2. Update API client to use V2 functions");
  console.log("3. Test USDC integration");
  console.log("4. Update frontend for USDC approvals");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }); 
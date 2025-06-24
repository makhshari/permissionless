const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 Base Sepolia Testnet USDC Information");
  console.log("========================================");
  
  // Official Base Sepolia USDC.e address - let ethers.js checksum it
  const rawAddress = "0x036cbd53842c5426634e7929541ec2318f3dcf7c";
  const USDC_ADDRESS = ethers.getAddress(rawAddress);
  
  console.log("📋 USDC.e Contract Address:", USDC_ADDRESS);
  console.log("🌐 Network: Base Sepolia (Chain ID: 84532)");
  console.log("🔗 Block Explorer: https://sepolia.basescan.org");
  
  // Get the signer
  const [signer] = await ethers.getSigners();
  console.log("👤 Your Address:", signer.address);
  
  // Check USDC balance
  try {
    const usdcContract = new ethers.Contract(
      USDC_ADDRESS,
      ["function balanceOf(address owner) view returns (uint256)", "function decimals() view returns (uint8)"],
      signer
    );
    
    const balance = await usdcContract.balanceOf(signer.address);
    const decimals = await usdcContract.decimals();
    const formattedBalance = ethers.formatUnits(balance, decimals);
    
    console.log("💰 Your USDC Balance:", formattedBalance, "USDC");
    
    if (parseFloat(formattedBalance) === 0) {
      console.log("\n💡 To get testnet USDC:");
      console.log("1. Visit: https://bridge.base.org/deposit");
      console.log("2. Connect your wallet");
      console.log("3. Bridge USDC from Ethereum Sepolia to Base Sepolia");
      console.log("4. Or use the Base Sepolia faucet for ETH first");
      console.log("5. Then bridge USDC using the ETH for gas fees");
    }
  } catch (error) {
    console.log("❌ Error checking balance:", error.message);
  }
  
  console.log("\n📝 For your deployment script, use this address:");
  console.log(`"84532": "${USDC_ADDRESS}"`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  }); 
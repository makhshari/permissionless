const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying SpendToken (SPND) with account:", deployer.address);

  const SpendToken = await ethers.getContractFactory("SpendToken");
  const spendToken = await SpendToken.deploy();
  await spendToken.waitForDeployment();

  const contractAddress = await spendToken.getAddress();
  console.log("✅ SpendToken (SPND) deployed to:", contractAddress);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
}); 
const hre = require("hardhat");

async function main() {
  console.log("Loaded PRIVATE_KEY:", process.env.PRIVATE_KEY);
  const signers = await hre.ethers.getSigners();
  console.log("Signers:", signers);
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const SwipeFiCredit = await hre.ethers.getContractFactory("SwipeFiCredit");
  const contract = await SwipeFiCredit.deploy();
  await contract.waitForDeployment();
  const address = await contract.getAddress();
  console.log("SwipeFiCredit deployed to:", address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 
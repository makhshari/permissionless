import hre from "hardhat";
const { ethers } = hre;

async function main() {
  const SwipeFiCredit = await ethers.getContractFactory("SwipeFiCredit");
  const contract = await SwipeFiCredit.deploy();
  await contract.waitForDeployment();
  const address = await contract.getAddress();
  console.log("SwipeFiCredit deployed to:", address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 
const { ethers } = require("ethers");
const fs = require("fs");
require('dotenv').config();

async function main() {
  // Load ABI
  const abi = JSON.parse(fs.readFileSync("./backend/SwipeFiCredit.abi.json", "utf8"));

  // Set up provider and contract
  const provider = new ethers.JsonRpcProvider(process.env.BASE_SEPOLIA_RPC_URL);
  const contract = new ethers.Contract(
    process.env.CONTRACT_ADDRESS,
    abi,
    provider
  );

  // Test address (can be any address)
  const testAddress = "0x0000000000000000000000000000000000000000";

  try {
    const result = await contract.getUserCredit(testAddress);
    console.log("getUserCredit result:", result);
  } catch (err) {
    console.error("Error calling getUserCredit:", err);
  }
}

main(); 
import express from "express";
import { contract, provider, adminWallet, abi } from "./contract";
import { ethers } from "ethers";
import * as dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(express.json());

// Helper to get a signer from a private key (for user actions)
function getUserSigner(privateKey: string) {
  return new ethers.Wallet(privateKey, provider);
}

// GET /credit-score/:address
app.get("/credit-score/:address", async (req, res) => {
  try {
    const user = req.params.address;
    const credit = await contract.getUserCredit(user);
    res.json({
      address: user,
      maxCreditLimit: credit.maxCreditLimit.toString(),
      availableCredit: credit.availableCredit.toString(),
      outstandingBalance: credit.outstandingBalance.toString(),
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch credit score", details: err });
  }
});

// GET /transactions/:address (reads Spend/Repay events)
app.get("/transactions/:address", async (req, res) => {
  try {
    const user = req.params.address;
    const spendEvents = await contract.queryFilter(contract.filters.Spend(user));
    const repayEvents = await contract.queryFilter(contract.filters.Repay(user));
    const txs = [
      ...spendEvents.map(e => ({ type: "spend", amount: e.args?.amount.toString(), tx: e.transactionHash, block: e.blockNumber, timestamp: null })),
      ...repayEvents.map(e => ({ type: "repay", amount: e.args?.amount.toString(), tx: e.transactionHash, block: e.blockNumber, timestamp: null })),
    ];
    // Optionally, sort by block number
    txs.sort((a, b) => a.block - b.block);
    res.json(txs);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch transactions", details: err });
  }
});

// POST /spend { privateKey, amount }
app.post("/spend", async (req, res) => {
  try {
    const { privateKey, amount } = req.body;
    const userSigner = getUserSigner(privateKey);
    const userContract = new ethers.Contract(contract.address, abi, userSigner);
    const tx = await userContract.spend(amount);
    await tx.wait();
    res.json({ success: true, tx: tx.hash });
  } catch (err) {
    res.status(500).json({ error: "Failed to spend", details: err });
  }
});

// POST /repay { privateKey, amount }
app.post("/repay", async (req, res) => {
  try {
    const { privateKey, amount } = req.body;
    const userSigner = getUserSigner(privateKey);
    const userContract = new ethers.Contract(contract.address, abi, userSigner);
    const tx = await userContract.repay({ value: amount });
    await tx.wait();
    res.json({ success: true, tx: tx.hash });
  } catch (err) {
    res.status(500).json({ error: "Failed to repay", details: err });
  }
});

// POST /set-credit-limit { user, limit } (admin only)
app.post("/set-credit-limit", async (req, res) => {
  try {
    const { user, limit } = req.body;
    if (!adminWallet) throw new Error("Admin wallet not configured");
    const adminContract = new ethers.Contract(contract.address, abi, adminWallet);
    const tx = await adminContract.setCreditLimit(user, limit);
    await tx.wait();
    res.json({ success: true, tx: tx.hash });
  } catch (err) {
    res.status(500).json({ error: "Failed to set credit limit", details: err });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Onchain backend API listening on port ${PORT}`);
}); 
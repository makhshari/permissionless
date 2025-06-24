import { ethers } from "ethers";
import * as dotenv from "dotenv";
dotenv.config();

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS!;
const BASE_SEPOLIA_RPC_URL = process.env.BASE_SEPOLIA_RPC_URL!;
const ADMIN_PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY!;

// Paste the ABI array here
export const abi = [
  {"inputs":[],"stateMutability":"nonpayable","type":"constructor"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"newOutstanding","type":"uint256"}],"name":"Repay","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"newOutstanding","type":"uint256"}],"name":"Spend","type":"event"},
  {"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"credits","outputs":[{"internalType":"uint256","name":"maxCreditLimit","type":"uint256"},{"internalType":"uint256","name":"availableCredit","type":"uint256"},{"internalType":"uint256","name":"outstandingBalance","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"getUserCredit","outputs":[{"components":[{"internalType":"uint256","name":"maxCreditLimit","type":"uint256"},{"internalType":"uint256","name":"availableCredit","type":"uint256"},{"internalType":"uint256","name":"outstandingBalance","type":"uint256"}],"internalType":"struct SwipeFiCredit.UserCredit","name":"","type":"tuple"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"repay","outputs":[],"stateMutability":"payable","type":"function"},
  {"inputs":[{"internalType":"address","name":"user","type":"address"},{"internalType":"uint256","name":"limit","type":"uint256"}],"name":"setCreditLimit","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"spend","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[],"name":"withdraw","outputs":[],"stateMutability":"nonpayable","type":"function"}
];

export const provider = new ethers.JsonRpcProvider(BASE_SEPOLIA_RPC_URL);
export const adminWallet = ADMIN_PRIVATE_KEY ? new ethers.Wallet(ADMIN_PRIVATE_KEY, provider) : undefined;
export const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, provider); 
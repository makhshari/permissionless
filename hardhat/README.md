# Hardhat Setup for SwipeFi

## Prerequisites
- Node.js >= 16
- npm or yarn

## Install dependencies

```
npm install
```

## Environment Variables
Create a `.env` file in the root with:
```
BASE_SEPOLIA_RPC_URL=YOUR_BASE_SEPOLIA_RPC_URL
PRIVATE_KEY=YOUR_DEPLOYER_PRIVATE_KEY
```

## Compile contracts
```
npx hardhat compile
```

## Deploy to Base Sepolia
```
npx hardhat run scripts/deploy.ts --network base_sepolia
```

## Notes
- The contract is in `../contracts/SwipeFiCredit.sol`.
- Update the deploy script to use the correct contract name and path if needed. 
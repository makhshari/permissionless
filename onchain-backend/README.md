# SwipeFi Onchain Backend API

This backend exposes a REST API that mirrors the original Go backend, but all logic and storage is onchain (Base Sepolia, contract: 0xa1a4b004bd9991027f570469c006b37e492f9f95).

## Setup

1. Copy `.env.example` to `.env` and fill in your values.
2. Install dependencies:
   ```
   npm install
   ```
3. Start the backend:
   ```
   npm run dev
   ```

## Endpoints

- `GET /credit-score/:address` — Get credit info for a user
- `GET /transactions/:address` — Get onchain spend/repay history
- `POST /spend` — Spend credit (body: `{ privateKey, amount }`)
- `POST /repay` — Repay credit (body: `{ privateKey, amount }`)
- `POST /set-credit-limit` — Admin: set user credit limit (body: `{ user, limit }`)

## Notes
- All state is onchain. This backend is a bridge between HTTP and the smart contract.
- The API is compatible with the original Go backend, so your frontend can use it with no changes. 
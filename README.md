# Sample Defi project

This project will use a forked mainet chain to:

1. Deposit collateral ETH/WETH
2. Borrow another asset DAI
3. Repay DAI

Notes: Tradeoffs for forking mainnet

Pros: Quick, easy, resembles what is on the mainnet
Cons: We need an API, some contract are complex to work with (mocks might be better)

## Getting started

```sh
cp .env.example .env # Setup ENV file

yarn install

yarn hardhat run scripts/aaveBorrow.js

```

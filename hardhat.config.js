require("@nomicfoundation/hardhat-toolbox")
require("hardhat-deploy")
require("dotenv").config()
require("hardhat-contract-sizer")
require("@nomicfoundation/hardhat-chai-matchers")

const GOERLI_RPC_URL = process.env.GOERLI_RPC_URL || "https://eth-example"
const PRIVATE_KEY = process.env.PRIVATE_KEY || "0x"
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "key"
const MAINNET_RPC_URL = process.env.MAINNET_RPC_URL || "url"

module.exports = {
    defaultNetwork: "hardhat",
    networks: {
        hardhat: {
            chainId: 31337,
            forking: {
                url: MAINNET_RPC_URL,
            },
            blockConfirmations: 1,
        },
        localhost: {
            chainId: 31337,
            blockConfirmations: 1,
        },
    },
    solidity: {
        compilers: [
            { version: "0.8.17" },
            { version: "0.4.19" },
            { version: "0.6.12" },
            { version: "0.8.0" },
        ],
    },
    namedAccounts: {
        deployer: {
            default: 0,
        },
    },
    mocha: {
        timeout: 300_000, // 200 seconds max until fail
    },
    etherscan: {
        // yarn hardhat verify --network <NETWORK> <CONTRACT_ADDRESS> <CONSTRUCTOR_PARAMETERS>
        apiKey: {
            goerli: ETHERSCAN_API_KEY,
        },
    },
}

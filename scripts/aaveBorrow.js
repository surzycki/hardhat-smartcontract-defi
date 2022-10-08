const { getWeth, AMOUNT } = require("../scripts/getWeth")
const { ethers } = require("hardhat")

async function main() {
    // the protocol treats everything a ERC20 token
    await getWeth()

    const { deployer } = await getNamedAccounts()
    const lendingPool = await getLendingPool(deployer)
    console.log(`LendingPool address ${lendingPool.address}`)

    // deposite
    const wethTokenAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
    // approve
    await approveErc20(wethTokenAddress, lendingPool.address, AMOUNT, deployer)
    console.log("Depositing...")
    await lendingPool.deposit(wethTokenAddress, AMOUNT, deployer, 0)
    console.log("Deposited")

    // Borrow
    // How much we have borrowed, how much we have in collateral, how much we can borrow
    let { availableBorrowsETH, totalDebtETH } = await getBorrowUserData(lendingPool, deployer)
    const daiPrice = await getDaiPrice()
    // magic number 0.95 is so we don't borrow all the eth and can see
    // the call to getUserAccountData below works (ie is not zero) and
    // shows what we can still borrow
    const amountDaiToBorrow = availableBorrowsETH.toString() * 0.95 * (1 / daiPrice.toNumber())
    console.log(`You can borrow ${amountDaiToBorrow} DAI`)
    const amountDaiToBorrowInWei = ethers.utils.parseEther(amountDaiToBorrow.toString())
    const daiTokenAddress = "0x6B175474E89094C44Da98b954EedeAC495271d0F"

    await borrowDai(daiTokenAddress, lendingPool, amountDaiToBorrowInWei, deployer)

    // print userdata
    await getBorrowUserData(lendingPool, deployer)

    await repay(amountDaiToBorrowInWei, daiTokenAddress, lendingPool, deployer)

    // print userdate
    await getBorrowUserData(lendingPool, deployer)
}

async function getLendingPool(account) {
    const lendingPoolAddressProvider = await ethers.getContractAt(
        "ILendingPoolAddressesProvider",
        "0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5",
        account
    )
    const lendingPoolAddress = await lendingPoolAddressProvider.getLendingPool()
    const lendingPool = await ethers.getContractAt("ILendingPool", lendingPoolAddress, account)
    return lendingPool
}

async function approveErc20(contractAddress, spenderAddress, amountToSpend, account) {
    const erc20Token = await ethers.getContractAt("IERC20", contractAddress, account)
    const tx = await erc20Token.approve(spenderAddress, amountToSpend)
    await tx.wait(1)
    console.log("Approved!")
}

async function getBorrowUserData(lendingPool, account) {
    const { totalCollateralETH, totalDebtETH, availableBorrowsETH } =
        await lendingPool.getUserAccountData(account)

    console.log(`You have ${ethers.utils.formatEther(totalCollateralETH)} worth of ETH deposited`)
    console.log(`You have ${ethers.utils.formatEther(totalDebtETH)} worth of ETH borrowed`)
    console.log(`You can borrow ${ethers.utils.formatEther(availableBorrowsETH)} worth of ETH`)
    return { availableBorrowsETH, totalDebtETH }
}

async function getDaiPrice() {
    const daiEthPriceFeed = await ethers.getContractAt(
        "AggregatorV3Interface",
        "0x773616e4d11a78f511299002da57a0a94577f1f4"
    )

    const price = (await daiEthPriceFeed.latestRoundData())[1]
    console.log(`DIA price is ${ethers.utils.formatEther(price.toString())} ETH`)
    return price
}

async function borrowDai(daiAddress, lendingPool, amountDaiToBorrowInWei, account) {
    // Magic number 1, is part of the borrow method signature corresponding to the interest Rate
    // Mode, in this case, stable.
    // Magic number 0, is refferal code, this case 0, there is no middleman
    //
    // @see https://github.com/aave/protocol-v2/blob/master/contracts/interfaces/ILendingPool.sol#L220
    const borrowTx = await lendingPool.borrow(daiAddress, amountDaiToBorrowInWei, 1, 0, account)
    await borrowTx.wait(1)
    console.log("You have borrowed !!")
}

async function repay(amount, daiAddress, lendingPool, account) {
    await approveErc20(daiAddress, lendingPool.address, amount, account)
    // Magic number 1 is part of the repay method signature cooresponding to the rateMode for interest payments
    // In this case it is stable mode, 1
    //
    // @see https://github.com/aave/protocol-v2/blob/master/contracts/interfaces/ILendingPool.sol#L240
    const repayTx = await lendingPool.repay(daiAddress, amount, 1, account)
    await repayTx.wait(1)
    console.log(`You have repayed ${ethers.utils.formatEther(amount)} ETH`)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })

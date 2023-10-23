// 23:15:13 ------> Dynamic SVG On-Chain NFT Part VI ----- Deploy Script

const { network } = require("hardhat")
const { networkConfig, developmentChains } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")
const fs = require("fs")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    const chainId = network.config.chainId
    let ethUsdPriceFeedAddress

    if (developmentChains.includes(network.name)) {
        // Find ETH/USD price feed
        const EthUsdAggregator = await deployments.get("MockV3Aggregator")
        ethUsdPriceFeedAddress = EthUsdAggregator.address
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId].ethUsdPriceFeed
    }

    const lowSVG = fs.readFileSync("./images/dynamicNft/frown.svg", { encoding: "utf8" })
    const highSVG = fs.readFileSync("./images/dynamicNft/happy.svg", { encoding: "utf8" })

    log("----------------------------------------------------")

    args = [ethUsdPriceFeedAddress, lowSVG, highSVG]

    const dynamicSvgNft = await deploy("DynamicSvgNft", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    // Verify the deployment
    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("Verifying...")
        await verify(dynamicSvgNft.address, args)
    }
}

module.exports.tags = ["all", "dynamicsvg", "main"]

// yarn hardhat deploy
// yarn run v1.22.19
// warning package.json: No license field
// $ /home/shadow-walker/hardhat-nft-fcc/node_modules/.bin/hardhat deploy
// Downloading compiler 0.6.6
// Compiled 5 Solidity files successfully
// Local network detected! Deploying mocks...
// deploying "VRFCoordinatorV2Mock" (tx: 0x1f95b6dc03b0f019875a16c4e529a7ce7c20897a493463c3aa4a80a5f053f1af)...: deployed at 0x5FbDB2315678afecb367f032d93F642f64180aa3 with 2543420 gas
// deploying "MockV3Aggregator" (tx: 0x07b11cc60051bd9be3bba6b22675974999ac14b8fc841ae5bf19418b634b86cc)...: deployed at 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512 with 569671 gas
// Mocks Deployed!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// You are deploying to a local network, you'll need a local network running to interact
// Please run `yarn hardhat console --network localhost` to interact with the deployed smart contracts!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// ----------------------------------------
// deploying "BasicNft" (tx: 0xc3f86993ce0b87efd43838641c15a73eac6353b6ecebdc7a83a8f461915164a9)...: deployed at 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0 with 2020837 gas
// ---------------------------------------------
// deploying "RandomIpfsNft" (tx: 0xf03f8602027e48233b34af284767a8bb3ae600fc5d81a793eabcafb4e344a584)...: deployed at 0x5FC8d32690cc91D4c39d9d3abcBD16989F875707 with 3549971 gas
// ------------------------------------------------
// ----------------------------------------------------
// deploying "DynamicSvgNft" (tx: 0x897f7d2db92d2f92da8cd14c228da56b6af6bb65130c9f8c926373f7fd77a471)...: deployed at 0xa513E6E4b8f2a923D98304ec87F64353C4D5C853 with 4602057 gas
// Done in 128.83s.

// 20:50:16 ------ Basic NFT

const { network } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

module.exports = async function({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    log("----------------------------------------")
    const args = []
    const basicNft = await deploy("BasicNft", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.waitConfirmations || 1,
    })

    if(!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY){
        log("Verifying.....................")
        await verify(basicNft.address, args)
        log("------------------------------")
    }
}

module.exports.tags = ["all", "basicnft", "main"]

// yarn hardhat deploy
// Compiled 10 Solidity files successfully
// ----------------------------------------
// deploying "BasicNft" (tx: 0x31e95e0741cb4106e582e3b702252a189fd43efd653a4858627cce0021b59329)...: deployed at 0x5FbDB2315678afecb367f032d93F642f64180aa3 with 2020837 gas
// Done in 435.89s.
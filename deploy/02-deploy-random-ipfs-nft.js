// 21:57:06 ------ Random IPFS NFT part X --> Deploying!!! ---- i splitted it 1

// Since the deployment was successful 
// we can set the .env file UPLOAD_TO_PINATA=true from "true" to "false" i.e from UPLOAD_TO_PINATA=false
// we set it to false bcos we have gotten our tokenUris
// so we can just paste the tokenUris directly 
// i.e let tokenUris = ['ipfs:////QmaVkBn2tKmjbhphU7eyztbvSQU5EXDdqRyXZtRhSGgJGo'...]

// also since we would write test for it 
// we forgot to fund the subscription for vrfCoordinator
// i.e await vrfCoordinatorV2Mock.fundSubscription()

const { network, ethers } = require("hardhat")
const { developmentChains, networkConfig } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")
const { storeImages, storeTokenUriMetadata } = require("../utils/uploadToPinata")

const imagesLocation = "./images/randomNft"

// A metadata template
const metadataTemplate = {
    name: "",
    description: "",
    image: "",
    attributes: [
        {
            trait_type: "Cuteness",
            value: 100,
        },
    ],
}

let tokenUris = [
    'ipfs://QmaVkBn2tKmjbhphU7eyztbvSQU5EXDdqRyXZtRhSGgJGo',
    'ipfs://QmYQC5aGZu2PTH8XzbJrbDnvhj3gVs7ya33H9mqUNvST3d',
    'ipfs://QmZYmH5iDbD6v3U2ixoVAjioSzvWJszDzYdbeCLquGSpVm'
]

const FUND_AMOUNT = "1000000000000000000000" // 10 LINK

module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    // Get the IPFS hashes of our images
    if (process.env.UPLOAD_TO_PINATA == "true") {
        tokenUris = await handleTokenUris()
    }

    let vrfCoordinatorV2Address, subscriptionId, vrfCoordinatorV2Mock

    if (developmentChains.includes(network.name)) {
        // create VRFV2 Subscription
        const vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock")
        vrfCoordinatorV2Address = vrfCoordinatorV2Mock.address
        const tx = await vrfCoordinatorV2Mock.createSubscription()
        const txReceipt = await tx.wait(1)
        subscriptionId = txReceipt.events[0].args.subId
        // Fund the subscription
        // Our mock makes it so we don't actually have to worry about sending fund
        await vrfCoordinatorV2Mock.fundSubscription(subscriptionId, FUND_AMOUNT)
    } else {
        vrfCoordinatorV2Address = networkConfig[chainId].vrfCoordinatorV2
        subscriptionId = networkConfig[chainId].subscriptionId
    }

    log("---------------------------------------------")

    const args = [
        vrfCoordinatorV2Address,
        subscriptionId,
        networkConfig[chainId].gasLane,
        networkConfig[chainId].callbackGasLimit,
        tokenUris,
        networkConfig[chainId].mintFee,
    ]

    const randomIpfsNft = await deploy("RandomIpfsNft", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    // Ensure the RandomIpfsNft contract is a valid consumer of the VRFCoordinatorV2Mock contract.
    if (developmentChains.includes(network.name)) {
        const vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock")
        await vrfCoordinatorV2Mock.addConsumer(subscriptionId, randomIpfsNft.address)
    }

    log("------------------------------------------------")

    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("Verifying.....................")
        await verify(randomIpfsNft.address, args)
        log("--------------------------------------------")
    }
}

/**
 * @notice This function will upload our code to Pinata.
 * @dev It will return an array of tokenUris for us to upload to our smart contract.
 *
 * We need to do two things
 * First ---> we need to store the images in IPFS, to achieve this we would create a store images function
 * which will be located in utils folder. the file name is uploadToPinata.js
 *
 * Second --> We also need to store metadata in IPFS
 */
async function handleTokenUris() {
    tokenUris = []
    // Store the image in IPFS
    // store the metadata in IPFS
    const { responses: imageUploadResponses, files } = await storeImages(imagesLocation)
    for (imageUploadResponsesIndex in imageUploadResponses) {
        // create metadata
        // upload the metadata
        let tokenUriMetadata = { ...metadataTemplate }
        tokenUriMetadata.name = files[imageUploadResponsesIndex].replace(".png", "") // for example pug.png to just pug
        tokenUriMetadata.description = `An adorable ${tokenUriMetadata.name} pup!` // for example it will be An adorable pug pup!
        tokenUriMetadata.image = `ipfs://${imageUploadResponses[imageUploadResponsesIndex].IpfsHash}` // for example it will be like this --> ipfs://bafybeig37ioir76s7mg5oobetncojcm3c3hxasyd4rvid4jqhy4gkaheg4
        console.log(`Uploading ${tokenUriMetadata.name}...`)

        // store the JSON to Pinata / IPFS
        const metadataUploadResponse = await storeTokenUriMetadata(tokenUriMetadata)
        tokenUris.push(`ipfs://${metadataUploadResponse.IpfsHash}`)
    }
    console.log("Token URIs Uploaded They are:")
    console.log(tokenUris)
    return tokenUris
}

module.exports.tags = ["all", "randomipfs", "main"]

// Now when we deploy we set the UPLOAD_TO_PINATA=false bcos we have gotten our tokenUris
// The result of our deploy is down below

// yarn hardhat deploy 
// Local network detected! Deploying mocks...
// deploying "VRFCoordinatorV2Mock" (tx: 0x1f95b6dc03b0f019875a16c4e529a7ce7c20897a493463c3aa4a80a5f053f1af)...: deployed at 0x5FbDB2315678afecb367f032d93F642f64180aa3 with 2543420 gas
// Mocks Deployed!
// ------------------------------------------------
// ----------------------------------------
// deploying "BasicNft" (tx: 0x86770133bf13ec221e4317667963bffa3d64d948b341c5c32fc01233d3c66840)...: deployed at 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512 with 2020837 gas
// ---------------------------------------------
// deploying "RandomIpfsNft" (tx: 0xfc65fed18c78c7496970212836f9ec063087cd9d5b60af0d59bdcddc6ee81e70)...: deployed at 0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9 with 3547821 gas
// ------------------------------------------------
// Done in 58.40s.

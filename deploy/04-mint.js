// 23:22:14 ------> Deploying the NFTs to a Testnet ----- We want to deploy to Opensea

// First we would deploy locally
// Second we would deploy on a Testnet i.e opensea

const { network, ethers } = require("hardhat")

module.exports = async ({ getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    // Basic NFT
    const basicNft = await ethers.getContract("BasicNft", deployer)
    const basicMintTx = await basicNft.mintNft()
    await basicMintTx.wait(1)
    console.log(`Basic NFT index 0 tokenURI: ${await basicNft.tokenURI(0)}`)

    // Dynamic SVG  NFT
    const highValue = ethers.utils.parseEther("4000")
    const dynamicSvgNft = await ethers.getContract("DynamicSvgNft", deployer)
    const dynamicSvgNftMintTx = await dynamicSvgNft.mintNft(highValue)
    await dynamicSvgNftMintTx.wait(1)
    console.log(`Dynamic SVG NFT index 0 tokenURI: ${await dynamicSvgNft.tokenURI(0)}`)

    // Random IPFS NFT
    const randomIpfsNft = await ethers.getContract("RandomIpfsNft", deployer)
    const mintFee = await randomIpfsNft.getMintFee()
    const randomIpfsNftMintTx = await randomIpfsNft.requestNft({ value: mintFee.toString() })
    const randomIpfsNftMintTxReceipt = await randomIpfsNftMintTx.wait(1)
    // Need to listen for response
    await new Promise(async (resolve, reject) => {
        setTimeout(() => reject("Timeout: 'NFTMinted' event did not fire"), 300000) // 5 minute timeout time
        // setup listener for our event
        randomIpfsNft.once("NftMinted", async () => {
            console.log(`Random IPFS NFT index 0 tokenURI: ${await randomIpfsNft.tokenURI(0)}`)
            resolve()
        })
        if (chainId == 31337) {
            const requestId = randomIpfsNftMintTxReceipt.events[1].args.requestId.toString()
            const vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock", deployer)
            await vrfCoordinatorV2Mock.fulfillRandomWords(requestId, randomIpfsNft.address)
        }
    })
}

module.exports.tags = ["all", "mint"]

// yarn hardhat deploy
// yarn run v1.22.19
// warning package.json: No license field
// $ /home/shadow-walker/hardhat-nft-fcc/node_modules/.bin/hardhat deploy
// Nothing to compile
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
// deploying "DynamicSvgNft" (tx: 0x802d66c36accbbe221bd4c7ac14db41cca5af959cb72e0d17672d5d29e8a7414)...: deployed at 0xa513E6E4b8f2a923D98304ec87F64353C4D5C853 with 4585544 gas
// Basic NFT index 0 tokenURI: ipfs://bafybeig37ioir76s7mg5oobetncojcm3c3hxasyd4rvid4jqhy4gkaheg4/?filename=0-PUG.json
// Dynamic SVG NFT index 0 tokenURI: data:application/json;base64,eyJuYW1lIjoiRHluYW1pYyBTVkcgTkZUIiwgImRlc2NyaXB0aW9uIjoiQW4gTkZUIHRoYXQgY2hhbmdlcyBiYXNlZCBvbiB0aGUgQ2hhaW5saW5rIEZlZWQiLCAiYXR0cmlidXRlcyI6IFt7InRyYWl0X3R5cGUiOiAiY29vbG5lc3MiLCAidmFsdWUiOiAxMDB9XSwgImltYWdlIjoiZGF0YTppbWFnZS9zdmcreG1sO2Jhc2U2NCxQRDk0Yld3Z2RtVnljMmx2YmowaU1TNHdJaUJ6ZEdGdVpHRnNiMjVsUFNKdWJ5SS9QZ284YzNabklIZHBaSFJvUFNJeE1ESTBjSGdpSUdobGFXZG9kRDBpTVRBeU5IQjRJaUIyYVdWM1FtOTRQU0l3SURBZ01UQXlOQ0F4TURJMElpQjRiV3h1Y3owaWFIUjBjRG92TDNkM2R5NTNNeTV2Y21jdk1qQXdNQzl6ZG1jaVBnb2dJRHh3WVhSb0lHWnBiR3c5SWlNek16TWlJR1E5SWswMU1USWdOalJETWpZMExqWWdOalFnTmpRZ01qWTBMallnTmpRZ05URXljekl3TUM0MklEUTBPQ0EwTkRnZ05EUTRJRFEwT0MweU1EQXVOaUEwTkRndE5EUTRVemMxT1M0MElEWTBJRFV4TWlBMk5IcHRNQ0E0TWpCakxUSXdOUzQwSURBdE16Y3lMVEUyTmk0MkxUTTNNaTB6TnpKek1UWTJMall0TXpjeUlETTNNaTB6TnpJZ016Y3lJREUyTmk0MklETTNNaUF6TnpJdE1UWTJMallnTXpjeUxUTTNNaUF6TnpKNklpOCtDaUFnUEhCaGRHZ2dabWxzYkQwaUkwVTJSVFpGTmlJZ1pEMGlUVFV4TWlBeE5EQmpMVEl3TlM0MElEQXRNemN5SURFMk5pNDJMVE0zTWlBek56SnpNVFkyTGpZZ016Y3lJRE0zTWlBek56SWdNemN5TFRFMk5pNDJJRE0zTWkwek56SXRNVFkyTGpZdE16Y3lMVE0zTWkwek56SjZUVEk0T0NBME1qRmhORGd1TURFZ05EZ3VNREVnTUNBd0lERWdPVFlnTUNBME9DNHdNU0EwT0M0d01TQXdJREFnTVMwNU5pQXdlbTB6TnpZZ01qY3lhQzAwT0M0eFl5MDBMaklnTUMwM0xqZ3RNeTR5TFRndU1TMDNMalJETmpBMElEWXpOaTR4SURVMk1pNDFJRFU1TnlBMU1USWdOVGszY3kwNU1pNHhJRE01TGpFdE9UVXVPQ0E0T0M0Mll5MHVNeUEwTGpJdE15NDVJRGN1TkMwNExqRWdOeTQwU0RNMk1HRTRJRGdnTUNBd0lERXRPQzA0TGpSak5DNDBMVGcwTGpNZ056UXVOUzB4TlRFdU5pQXhOakF0TVRVeExqWnpNVFUxTGpZZ05qY3VNeUF4TmpBZ01UVXhMalpoT0NBNElEQWdNQ0F4TFRnZ09DNDBlbTB5TkMweU1qUmhORGd1TURFZ05EZ3VNREVnTUNBd0lERWdNQzA1TmlBME9DNHdNU0EwT0M0d01TQXdJREFnTVNBd0lEazJlaUl2UGdvZ0lEeHdZWFJvSUdacGJHdzlJaU16TXpNaUlHUTlJazB5T0RnZ05ESXhZVFE0SURRNElEQWdNU0F3SURrMklEQWdORGdnTkRnZ01DQXhJREF0T1RZZ01IcHRNakkwSURFeE1tTXRPRFV1TlNBd0xURTFOUzQySURZM0xqTXRNVFl3SURFMU1TNDJZVGdnT0NBd0lEQWdNQ0E0SURndU5HZzBPQzR4WXpRdU1pQXdJRGN1T0MwekxqSWdPQzR4TFRjdU5DQXpMamN0TkRrdU5TQTBOUzR6TFRnNExqWWdPVFV1T0MwNE9DNDJjemt5SURNNUxqRWdPVFV1T0NBNE9DNDJZeTR6SURRdU1pQXpMamtnTnk0MElEZ3VNU0EzTGpSSU5qWTBZVGdnT0NBd0lEQWdNQ0E0TFRndU5FTTJOamN1TmlBMk1EQXVNeUExT1RjdU5TQTFNek1nTlRFeUlEVXpNM3B0TVRJNExURXhNbUUwT0NBME9DQXdJREVnTUNBNU5pQXdJRFE0SURRNElEQWdNU0F3TFRrMklEQjZJaTgrQ2p3dmMzWm5QZ289In0=
// Random IPFS NFT index 0 tokenURI: ipfs://QmZYmH5iDbD6v3U2ixoVAjioSzvWJszDzYdbeCLquGSpVm
// Done in 62.88s.

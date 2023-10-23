// 21:47:29 ------ Random IPFS NFT part IX --> Uploading token URIs(metadata) with Pinata

// We would have a function called storeTokenUriMetadata() that will upload our metadata
// to Pinata

const pinataSDK = require("@pinata/sdk")
const path = require("path")
const fs = require("fs")
require("dotenv").config()

const pinataApiKey = process.env.PINATA_API_Key
const pinataApiSecret = process.env.PINATA_API_Secret
const pinata = pinataSDK(pinataApiKey, pinataApiSecret)

async function storeImages(imagesFilePath) {
    const fullImagesPath = path.resolve(imagesFilePath)
    const files = fs.readdirSync(fullImagesPath)
    console.log(files);

    console.log("Uploading to Pinata!");

    let responses = [] // An array for responses from Pinata

    for (fileIndex in files) {

        console.log(`Working on ${fileIndex}...`);

        const readableStreamForFile = fs.createReadStream(`${fullImagesPath}/${files[fileIndex]}`)
        try {
            const response = await pinata.pinFileToIPFS(readableStreamForFile)
            responses.push(response)
        } catch (error) {
            console.log(error)
        }
    }
    return {responses, files}
}

async function storeTokenUriMetadata(metadata) {
    try {
        const response = await pinata.pinJSONToIPFS(metadata)
        return response
    } catch (error) {
        console.log(error)
    }
    return null
}

module.exports = { storeImages, storeTokenUriMetadata }

// yarn hardhat deploy --tags randomipfs,mocks
// Nothing to compile
// Local network detected! Deploying mocks...
// deploying "VRFCoordinatorV2Mock" (tx: 0x1f95b6dc03b0f019875a16c4e529a7ce7c20897a493463c3aa4a80a5f053f1af)...: deployed at 0x5FbDB2315678afecb367f032d93F642f64180aa3 with 2543420 gas
// Mocks Deployed!
// ------------------------------------------------
// [ 'pug.png', 'shiba-inu.png', 'st-bernard.png' ]
// Uploading to Pinata!
// Working on 0...
// Working on 1...
// Working on 2...
// Uploading pug...
// Uploading shiba-inu...
// Uploading st-bernard...
// Token URIs Uploaded They are:
// [
//   'ipfs://QmaVkBn2tKmjbhphU7eyztbvSQU5EXDdqRyXZtRhSGgJGo',
//   'ipfs://QmYQC5aGZu2PTH8XzbJrbDnvhj3gVs7ya33H9mqUNvST3d',
//   'ipfs://QmZYmH5iDbD6v3U2ixoVAjioSzvWJszDzYdbeCLquGSpVm'
// ]
// ---------------------------------------------
// Done in 26.64s.





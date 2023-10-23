// 20:41:04 ------ Basic NFT

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract BasicNft is ERC721 {
    uint256 private s_tokenCounter; // we created our tokenId

    string public constant TOKEN_URI =
        "ipfs://bafybeig37ioir76s7mg5oobetncojcm3c3hxasyd4rvid4jqhy4gkaheg4/?filename=0-PUG.json";

    /**
     * @dev ERC721 comes with a constructor and we initialize the _name and _symbol
     * line 1 --> We initialised the tokedId
     */
    constructor() ERC721("Dogie", "DOG") {
        s_tokenCounter = 0;
    }

    /**
     * @dev We want to create a new DOG by using the mint function from ERC721.sol
     * line 1 --> we mint our NFT
     * line 2 --> After the mint, we update the tokenId by 1
     * line 3 --> it return the tokenId
     */
    function mintNft() public returns (uint256) {
        _safeMint(msg.sender, s_tokenCounter);
        s_tokenCounter = s_tokenCounter + 1;
        return s_tokenCounter;
    }

    function tokenURI(uint256 /*tokenId*/) public view override returns (string memory) {
        // require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");
        return TOKEN_URI;
    }

    function getTokenCounter() public view returns (uint256) {
        return s_tokenCounter;
    }
}

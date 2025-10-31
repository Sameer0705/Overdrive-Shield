// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v5.0.0/contracts/token/ERC20/ERC20.sol";

/**
 * @title MyToken
 * @notice This is a simple ERC20 token for testing.
 * It mints 10 million tokens to the person who deploys it.
 */
contract MyToken is ERC20 {
    constructor(string memory name, string memory symbol) ERC20(name, symbol) {
        // Mints 10,000,000 tokens (with 18 decimals) to the deployer
        _mint(msg.sender, 10_000_000 * 10**18);
    }
}
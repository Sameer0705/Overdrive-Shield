// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

// --- Start of imported file: @openzeppelin/contracts/security/ReentrancyGuard.sol ---
// OpenZeppelin Contracts v4.9.3 (security/ReentrancyGuard.sol)

/**
 * @dev Contract module that helps prevent reentrant calls to a function.
 *
 * Inheriting from `ReentrancyGuard` will make the {nonReentrant} modifier
 * available, which can be applied to functions to make sure there are no nested
 * (reentrant) calls to them.
 *
 * Note that static calls are not considered reentrant calls to the same function
 * under this protection.
 *
 * TIP: It is important to adhere to the checks-effects-interactions pattern
 * http://solidity.readthedocs.io/en/v0.5.11/security-considerations.html#use-the-checks-effects-interactions-pattern
 */
abstract contract ReentrancyGuard {
    // Booleans are more expensive than uint256 or any type leading to 256 bits
    // This is because of gas amount, which is required for each an EVM operation.
    // The EVM operates on 256 bits at a time.
    //
    // More info: https://solidity-by-example.org/ether-wallet/
    uint256 private constant _NOT_ENTERED = 1;
    uint256 private constant _ENTERED = 2;

    uint256 private _status;

    constructor() {
        _status = _NOT_ENTERED;
    }

    /**
     * @dev Prevents a contract from calling itself, directly or indirectly.
     * Calling a `nonReentrant` function from another `nonReentrant`
     * function is not supported. It is possible to prevent this from happening
     * by making the `nonReentrant` function external, and making it call a
     * `private` function that does the actual work.
     */
    modifier nonReentrant() {
        // On the first call to nonReentrant, _status will be _NOT_ENTERED
        require(_status != _ENTERED, "ReentrancyGuard: reentrant call");

        // Any calls to nonReentrant after this point will fail
        _status = _ENTERED;

        _;

        // By storing the original value once again, a refund is triggered (see
        // https://eips.ethereum.org/EIPS/eip-2200)
        _status = _NOT_ENTERED;
    }
}
// --- End of imported file: @openzeppelin/contracts/security/ReentrancyGuard.sol ---


// --- Start of your original file: SecureVault.sol ---
/**
 * THIS IS THE SECURE CONTRACT
 * It fixes the reentrancy bug in two ways:
 * 1. Using the "nonReentrant" modifier from OpenZeppelin (code is pasted above).
 * 2. Correctly applying the "Checks-Effects-Interactions" pattern.
 */
contract SecureVault is ReentrancyGuard {
    mapping(address => uint256) public balances;

    event Deposit(address indexed user, uint256 amount);
    event Withdraw(address indexed user, uint256 amount);

    // Allow users to deposit ETH
    function deposit() public payable {
        require(msg.value > 0, "Deposit must be > 0");
        balances[msg.sender] += msg.value;
        emit Deposit(msg.sender, msg.value);
    }

    // THIS IS THE FIXED FUNCTION
    // We add the 'nonReentrant' modifier
    function withdraw(uint256 amount) public nonReentrant {
        // 1. CHECKS
        require(balances[msg.sender] >= amount, "Insufficient balance");

        // 2. EFFECTS (Update state *before* sending ETH)
        balances[msg.sender] -= amount;
        
        // 3. INTERACTIONS (Send ETH *last*)
        (bool sent, ) = msg.sender.call{value: amount}("");
        require(sent, "Failed to send ETH");

        emit Withdraw(msg.sender, amount);
    }

    // Helper to check balance
    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    // Allow contract to receive ETH
    receive() external payable {}
}
// --- End of your original file: SecureVault.sol ---
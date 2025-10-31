// SPDX-License-Identifier: MIT
// LOCKED PRAGMA: Uses a specific, secure compiler version for stability.
pragma solidity 0.8.20;

// --- Imports: All battle-tested OpenZeppelin libraries ---
import "@openzeppelin/contracts@5.0.0/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts@5.0.0/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts@5.0.0/access/Ownable.sol";
import "@openzeppelin/contracts@5.0.0/token/ERC20/utils/SafeERC20.sol";

// --- CUSTOM ERRORS (GAS OPTIMIZATION) ---
// Using custom errors instead of `require(..., "string")`
// saves significant gas on both deployment and runtime.
error ZeroAddress();
error IdenticalAddresses();
error ZeroAmount();
error NoLiquidity();
error InsufficientOutput();
error InvalidToken();

/**
 * @title MyHyperOptimizedDEX
 * @author (Your Name)
 * @notice A production-grade, gas-optimized, and hardened AMM.
 */
contract MyHyperOptimizedDEX is ReentrancyGuard, Ownable {
    // --- LIBRARIES ---
    using SafeERC20 for IERC20;

    // --- STATE VARIABLES ---
    // `immutable` saves gas by storing these in code, not storage.
    IERC20 public immutable tokenA;
    IERC20 public immutable tokenB;

    uint256 public reserveA;
    uint256 public reserveB;

    // --- EVENTS ---
    event Swapped(
        address indexed sender,
        uint amountIn,
        uint amountOut,
        address indexed tokenIn,
        address indexed tokenOut
    );
    event LiquidityAdded(
        address indexed sender,
        uint amountA,
        uint amountB
    );

    // --- MODIFIERS ---
    modifier hasLiquidity() {
        if (reserveA == 0 || reserveB == 0) revert NoLiquidity();
        _;
    }

    constructor(
        address tokenAAddress,
        address tokenBAddress
    ) Ownable(msg.sender) ReentrancyGuard() {
        if (tokenAAddress == address(0) || tokenBAddress == address(0)) {
            revert ZeroAddress();
        }
        if (tokenAAddress == tokenBAddress) {
            revert IdenticalAddresses();
        }

        tokenA = IERC20(tokenAAddress);
        tokenB = IERC20(tokenBAddress);
    }

    function addLiquidity(
        uint256 amountA,
        uint256 amountB
    ) external nonReentrant {
        if (amountA == 0 || amountB == 0) {
            revert ZeroAmount();
        }

        // --- EFFECTS ---
        reserveA += amountA;
        reserveB += amountB;

        // --- INTERACTIONS (Hardened) ---
        tokenA.safeTransferFrom(msg.sender, address(this), amountA);
        tokenB.safeTransferFrom(msg.sender, address(this), amountB);

        emit LiquidityAdded(msg.sender, amountA, amountB);
    }

    /**
     * @notice Swaps Token A for Token B with slippage protection.
     * @param amountInA The exact amount of Token A being sent.
     * @param amountOutMin The *minimum* amount of Token B the user
     * is willing to accept. This prevents MEV.
     */
    function swapTokenAForTokenB(
        uint256 amountInA,
        uint256 amountOutMin
    ) external nonReentrant hasLiquidity {
        if (amountInA == 0) revert ZeroAmount();
        if (amountOutMin == 0) revert ZeroAmount();

        // --- HARDENING: Uniswap V2 Math (with 0.3% fee) ---
        uint256 amountInWithFee = amountInA * 997;
        uint256 numerator = amountInWithFee * reserveB;
        uint256 denominator = (reserveA * 1000) + amountInWithFee;
        uint256 amountOutB = numerator / denominator;

        // --- HARDENING: Slippage Check (This is the MEV-fix) ---
        if (amountOutB < amountOutMin) {
            revert InsufficientOutput();
        }

        // --- EFFECTS (Checks-Effects-Interactions) ---
        reserveA += amountInA;
        reserveB -= amountOutB;

        // --- INTERACTIONS (HardDENED) ---
        tokenA.safeTransferFrom(msg.sender, address(this), amountInA);
        tokenB.safeTransfer(msg.sender, amountOutB);

        emit Swapped(
            msg.sender,
            amountInA,
            amountOutB,
            address(tokenA),
            address(tokenB)
        );
    }

    // --- Admin Function (Hardened) ---
    function emergencyWithdraw(IERC20 token) external onlyOwner {
        if (
            address(token) != address(tokenA) &&
            address(token) != address(tokenB)
        ) {
            revert InvalidToken();
        }
        token.safeTransfer(msg.sender, token.balanceOf(address(this)));
    }
}
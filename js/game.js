// Game state, level definition, objective logic, and scoring will go here

console.log("game.js loaded");

// --- Game Constants ---
const GRAVITY = 0.5; // Acceleration due to gravity (pixels per frame per frame)

// --- Level Definition ---
// Simple platforms defined by their top-left corner (x, y) and dimensions (width, height)
const platforms = [
    { x: 0, y: 550, width: 800, height: 50, color: '#333' }, // Ground floor
    { x: 100, y: 450, width: 150, height: 20, color: '#555' },
    { x: 350, y: 380, width: 200, height: 20, color: '#555' },
    { x: 600, y: 300, width: 100, height: 20, color: '#555' },
    // Add more platforms as needed
];

// --- Objective --- 
const goal = {
    x: 625,
    y: 260, // Position it slightly above the top-right platform
    width: 50,
    height: 40,
    color: '#00ff00' // Green color for the goal
};

// --- Game State (example - will expand later) ---
let gameTimeStart = 0;
let gameActive = false;

function startGame() {
    // Reset player position
    player.x = 50; // Start near the left side
    player.y = 500;
    player.velocityX = 0;
    player.velocityY = 0;
    player.isGrounded = false;

    // Reset game state
    console.log("Game starting...");
    gameTimeStart = performance.now();
    gameActive = true;
}

// Declare overlay element variables globally (will be assigned later)
let gameOverOverlay = null;
let gameOverMessage = null;
let gameOverTime = null;
let leaderboardElement = null; // Added variable for leaderboard
let gameOverContent = null; // Added gameOverContent variable

function showGameOver(message, timeMs) {
    if (!gameOverOverlay || !gameOverMessage || !gameOverTime || !leaderboardElement || !gameOverContent) {
        console.error("Required overlay elements or leaderboard have not been initialized! Cannot show overlay.");
        return;
    }
    
    gameOverMessage.textContent = message;
    if (timeMs) {
        gameOverTime.textContent = `Your time: ${(timeMs / 1000).toFixed(2)}s`;
        gameOverTime.style.display = 'block';
    } else {
        gameOverTime.style.display = 'none'; // Hide time if not applicable
    }
    
    gameOverOverlay.style.display = 'block'; // Set display to block instead of flex

    // --- Dynamic Positioning v3 --- 
    leaderboardElement.style.display = 'block'; 
    void gameOverContent.offsetWidth; 
    void leaderboardElement.offsetWidth;
    
    const modalRect = gameOverContent.getBoundingClientRect();
    const leaderboardRect = leaderboardElement.getBoundingClientRect(); 
    const horizontalMargin = 15; // Use distinct names for clarity
    const verticalMargin = 30; // Increased vertical space
    const padding = 10; // Space from screen edges

    let modalTop, modalLeft, leaderTop, leaderLeft;
    const isLandscape = window.matchMedia("(orientation: landscape)").matches;
    const totalWidthSideBySide = modalRect.width + horizontalMargin + leaderboardRect.width; // Corrected var name
    const fitsHorizontally = totalWidthSideBySide < (window.innerWidth - 2 * padding);

    // Decide layout: Prefer side-by-side in landscape if width allows
    if (isLandscape && fitsHorizontally) {
        // Landscape & Fits Width: Place side-by-side, centered horizontally as a group
        modalLeft = (window.innerWidth - totalWidthSideBySide) / 2;
        leaderLeft = modalLeft + modalRect.width + horizontalMargin;
        const maxHeight = Math.max(modalRect.height, leaderboardRect.height);
        modalTop = (window.innerHeight - maxHeight) / 2; 
        leaderTop = modalTop; 

    } else {
        // Portrait OR Landscape but too wide: Stack vertically, centered horizontally
        
        // Position Modal first
        modalLeft = (window.innerWidth - modalRect.width) / 2;
        modalTop = padding * 2; 
        // Clamp modal position
        modalTop = Math.max(padding, modalTop);
        modalLeft = Math.max(padding, modalLeft);
        // Apply modal styles *first*
        gameOverContent.style.position = 'fixed'; 
        gameOverContent.style.zIndex = '1002'; 
        gameOverContent.style.top = `${modalTop}px`;
        gameOverContent.style.left = `${modalLeft}px`;

        // Force reflow after positioning modal
        void gameOverContent.offsetHeight;
        
        // Now calculate leaderboard position based on modal's actual place
        const updatedModalRect = gameOverContent.getBoundingClientRect(); // Re-measure!
        leaderLeft = (window.innerWidth - leaderboardRect.width) / 2;
        leaderTop = updatedModalRect.bottom + verticalMargin; // Position below measured bottom
        
        // Clamp leaderboard position
        leaderLeft = Math.max(padding, leaderLeft);
        leaderTop = Math.max(padding, leaderTop);
        if (leaderTop + leaderboardRect.height > window.innerHeight - padding) {
            leaderTop = window.innerHeight - leaderboardRect.height - padding;
        }
        if (leaderLeft + leaderboardRect.width > window.innerWidth - padding) {
            leaderLeft = window.innerWidth - leaderboardRect.width - padding;
        }
        
        console.log(`[DEBUG Portrait] modalBottom: ${updatedModalRect.bottom}, verticalMargin: ${verticalMargin}, calculated leaderTop: ${updatedModalRect.bottom + verticalMargin}, final leaderTop: ${leaderTop}`); // DEBUG Log
    }

    // Apply styles to position modal (if not already done in portrait block)
    if (!(isLandscape && fitsHorizontally)) {
        // Already applied in the portrait 'else' block
    } else {
        // Apply modal styles for landscape case
        gameOverContent.style.position = 'fixed'; 
        gameOverContent.style.zIndex = '1002'; 
        gameOverContent.style.top = `${modalTop}px`;
        gameOverContent.style.left = `${modalLeft}px`;
    }
    
    // Apply styles to position leaderboard
    leaderboardElement.style.position = 'fixed'; 
    leaderboardElement.style.zIndex = '1001'; 
    leaderboardElement.style.top = `${leaderTop}px`;
    leaderboardElement.style.left = `${leaderLeft}px`;
    leaderboardElement.style.display = 'block'; 
}

function endGame(success) {
    if (!gameActive) return; // Prevent multiple ends
    gameActive = false;
    const timeMs = Math.round(performance.now() - gameTimeStart);
    console.log(`Game ended. Success: ${success}. Time: ${timeMs}ms`);
    
    if (success) {
        // Prompt for name and submit score
        const playerName = prompt(`You finished in ${ (timeMs / 1000).toFixed(2)}s! Enter your name for the leaderboard:`, "Player");
        
        const showEndScreen = () => {
            showGameOver("Level Complete!", timeMs);
        };
        
        if (playerName) {
             // Call the submitScore function (defined in supabaseClient.js)
            submitScore(playerName, timeMs).then(() => {
                // Refresh the leaderboard display after successful submission
                displayLeaderboard();
            }).catch(error => {
                console.error("Failed to submit score or refresh leaderboard:", error);
                // Optionally alert the user again if submission fails
                alert("Failed to submit score. See console for details.") // Simple alert for submit error
            }).finally(() => {
                // Show the end screen regardless of submission success/failure
                showEndScreen();
            });
        } else {
            console.log("Score submission cancelled.");
            // Show the end screen even if submission is cancelled
            showEndScreen();
        }
        
        // Remove the old alert
        // alert("Game over! Refresh the page (F5) to play again."); 
    } else {
        // Handle game failure (e.g., falling off screen - not implemented yet)
        // alert("Game over! Refresh the page (F5) to try again."); 
        showGameOver("Try Again?", null); // Show overlay without time for failure
    }

    // Remove the old TODO comment
    // TODO: Prompt for name and call submitScore
}

// --- Drawing Functions ---
function drawPlatforms(ctx) {
    platforms.forEach(platform => {
        ctx.fillStyle = platform.color;
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    });
}

// Draw the goal area
function drawGoal(ctx) {
    ctx.fillStyle = goal.color;
    ctx.fillRect(goal.x, goal.y, goal.width, goal.height);
} 
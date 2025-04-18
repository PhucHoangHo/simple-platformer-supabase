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

function showGameOver(message, timeMs) {
    if (!gameOverOverlay || !gameOverMessage || !gameOverTime) {
        console.error("Overlay elements have not been initialized! Cannot show overlay.");
        return;
    }
    
    gameOverMessage.textContent = message;
    if (timeMs) {
        gameOverTime.textContent = `Your time: ${(timeMs / 1000).toFixed(2)}s`;
        gameOverTime.style.display = 'block';
    } else {
        gameOverTime.style.display = 'none'; // Hide time if not applicable
    }
    
    gameOverOverlay.style.display = 'flex'; // Show the overlay (use flex to center content)
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
// Main game loop and initialization logic will go here

console.log("main.js loaded");

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// --- Input Handling ---
const keysPressed = {}; // Keep track of currently pressed keys

document.addEventListener('keydown', (event) => {
    keysPressed[event.code] = true;
});

document.addEventListener('keyup', (event) => {
    keysPressed[event.code] = false;
});

function handleInput() {
    // Horizontal Movement
    if (keysPressed['ArrowLeft']) {
        player.moveLeft();
    } else if (keysPressed['ArrowRight']) {
        player.moveRight();
    } else {
        player.stopMoving(); // Stop moving if neither left nor right is pressed
    }

    // Jumping
    if (keysPressed['Space']) {
        player.jump(); 
        // Optional: Prevent holding space to continuously jump
        // keysPressed['Space'] = false; // Uncomment if you want one jump per press
    }
}

// --- Collision Detection ---
function checkCollisions() {
    player.isGrounded = false; // Assume not grounded until collision check proves otherwise

    platforms.forEach(platform => {
        // Basic Axis-Aligned Bounding Box (AABB) collision detection
        const playerBottom = player.y + player.height;
        const playerRight = player.x + player.width;
        const platformTop = platform.y;
        const platformBottom = platform.y + platform.height;
        const platformLeft = platform.x;
        const platformRight = platform.x + platform.width;

        // Check for horizontal overlap
        const horizontalOverlap = playerRight > platformLeft && player.x < platformRight;

        // Check for vertical overlap
        const verticalOverlap = playerBottom > platformTop && player.y < platformBottom;

        if (horizontalOverlap && verticalOverlap) {
            // Collision detected, now determine direction
            
            // Check if player was *above* the platform in the previous frame (simple check)
            // And is now intersecting it vertically
            const wasAbove = (player.y + player.height - player.velocityY) <= platformTop;

            if (player.velocityY >= 0 && wasAbove) { 
                // Landing on top of the platform
                player.y = platformTop - player.height;
                player.velocityY = 0;
                player.isGrounded = true;
            } else {
                // TODO: Handle collisions from sides or bottom if necessary
                // For simplicity, we mostly care about landing on top.
                // Example: hitting side could stop horizontal movement
                // if (player.velocityX > 0 && player.x + player.width - player.velocityX <= platformLeft) { 
                //     player.x = platformLeft - player.width; 
                //     player.velocityX = 0; 
                // } else if (player.velocityX < 0 && player.x - player.velocityX >= platformRight) {
                //     player.x = platformRight;
                //     player.velocityX = 0;
                // }
                
                // Example: hitting bottom could bounce player down
                // if (player.velocityY < 0 && player.y - player.velocityY >= platformBottom) { 
                //     player.y = platformBottom;
                //     player.velocityY = 1; // Small bounce down
                // }
            }
        }
    });

    // Also check canvas floor collision if not already grounded
    if (!player.isGrounded && player.y + player.height > canvas.height) {
        player.y = canvas.height - player.height;
        player.velocityY = 0;
        player.isGrounded = true;
    }
     // Basic wall collision (already in player.update, could be moved here)
    if (player.x < 0) {
        player.x = 0;
        player.velocityX = 0;
    }
    if (player.x + player.width > canvas.width) {
            player.x = canvas.width - player.width;
            player.velocityX = 0;
    }
}

// --- Win Condition ---
function checkWinCondition() {
    if (!gameActive) return; // Don't check if game isn't active
    
    // Simple AABB collision check between player and goal
    const playerRight = player.x + player.width;
    const playerBottom = player.y + player.height;
    const goalRight = goal.x + goal.width;
    const goalBottom = goal.y + goal.height;

    if (playerRight > goal.x && 
        player.x < goalRight && 
        playerBottom > goal.y && 
        player.y < goalBottom)
    {
        // Player has reached the goal!
        endGame(true); // End the game with success
    }
}

// --- Game Loop ---
let lastTime = 0;

function gameLoop(timestamp) {
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;

    // Only update game logic if the game is active
    if (gameActive) {
        // 1. Handle Input
        handleInput();

        // 2. Update Game State
        player.update();
        // Add other update logic here (e.g., enemies, objectives)

        // 3. Check Collisions
        checkCollisions();

        // 4. Check Win Condition
        checkWinCondition();
    }

    // 5. Draw Everything (always draw, even if game over)
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background (optional, canvas has default bg color via CSS)
    // ctx.fillStyle = '#d0e0f0'; 
    // ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw platforms
    drawPlatforms(ctx);

    // Draw goal
    drawGoal(ctx);

    // Draw player
    player.draw(ctx);

    // Add other draw logic here (e.g., score display)

    // 6. Request Next Frame
    requestAnimationFrame(gameLoop);
}

// --- Initialization ---
function init() {
    console.log("Initializing game...");
    
    // Get references to overlay elements *after* DOM is loaded
    gameOverOverlay = document.getElementById('gameOverOverlay'); // Assign to global
    gameOverMessage = document.getElementById('gameOverMessage'); // Assign to global
    gameOverTime = document.getElementById('gameOverTime');       // Assign to global
    const replayButton = document.getElementById('replayButton');
    
    if (replayButton && gameOverOverlay) { // Check the global variable now
        replayButton.addEventListener('click', () => {
            gameOverOverlay.style.display = 'none'; // Hide the overlay
            startGame(); // Restart the game
        });
    } else {
        console.error("Replay button or Game Over overlay not found!");
    }

    // Start the actual game
    startGame();
    
    // Start the game loop
    requestAnimationFrame(gameLoop);
}

// Start the game when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', init); 
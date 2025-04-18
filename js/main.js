// Main game loop and initialization logic will go here

console.log("main.js loaded");

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// --- Input Handling ---
const keysPressed = {}; // Keep track of currently pressed keys

// -- Keyboard Listeners --
document.addEventListener('keydown', (event) => {
    keysPressed[event.code] = true;
});

document.addEventListener('keyup', (event) => {
    keysPressed[event.code] = false;
});

// -- Touch Button Listeners (will be added in init) --
function setupTouchControls() {
    const leftButton = document.getElementById('leftButton');
    const rightButton = document.getElementById('rightButton');
    const jumpButton = document.getElementById('jumpButton');

    if (!leftButton || !rightButton || !jumpButton) {
        // Don't fail if buttons aren't present (e.g., desktop view)
        console.log("Mobile control buttons not found, skipping touch setup.");
        return;
    }

    const handleTouchStart = (event, key) => {
        event.preventDefault(); // Prevent default touch behavior (scrolling, zoom)
        keysPressed[key] = true;
    };

    const handleTouchEnd = (event, key) => {
        event.preventDefault(); 
        keysPressed[key] = false;
    };

    // Left Button
    leftButton.addEventListener('touchstart', (e) => handleTouchStart(e, 'ArrowLeft'), { passive: false });
    leftButton.addEventListener('touchend', (e) => handleTouchEnd(e, 'ArrowLeft'), { passive: false });
    leftButton.addEventListener('touchcancel', (e) => handleTouchEnd(e, 'ArrowLeft'), { passive: false }); // Handle cancellation

    // Right Button
    rightButton.addEventListener('touchstart', (e) => handleTouchStart(e, 'ArrowRight'), { passive: false });
    rightButton.addEventListener('touchend', (e) => handleTouchEnd(e, 'ArrowRight'), { passive: false });
    rightButton.addEventListener('touchcancel', (e) => handleTouchEnd(e, 'ArrowRight'), { passive: false });

    // Jump Button
    jumpButton.addEventListener('touchstart', (e) => handleTouchStart(e, 'Space'), { passive: false });
    jumpButton.addEventListener('touchend', (e) => handleTouchEnd(e, 'Space'), { passive: false });
    jumpButton.addEventListener('touchcancel', (e) => handleTouchEnd(e, 'Space'), { passive: false });
    
    console.log("Touch controls setup complete.");
}

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
    gameOverOverlay = document.getElementById('gameOverOverlay'); 
    gameOverMessage = document.getElementById('gameOverMessage'); 
    gameOverTime = document.getElementById('gameOverTime');       
    leaderboardElement = document.getElementById('leaderboard'); 
    gameOverContent = document.getElementById('gameOverContent'); // Assign to global
    const replayButton = document.getElementById('replayButton');
    const mobileControls = document.getElementById('mobileControls'); // Get mobile controls too
        
    if (replayButton && gameOverOverlay && leaderboardElement) { // Check leaderboardElement too
        replayButton.addEventListener('click', () => {
            gameOverOverlay.style.display = 'none'; // Hide the overlay
            
            // Reset dynamic styles for leaderboard and modal
            leaderboardElement.style.position = '';
            leaderboardElement.style.zIndex = '';
            leaderboardElement.style.top = '';
            leaderboardElement.style.left = '';
            gameOverContent.style.position = ''; // Reset modal position
            gameOverContent.style.zIndex = '';
            gameOverContent.style.top = ''; // Reset modal top
            gameOverContent.style.left = ''; // Reset modal left

            // Check if we are in mobile view (by checking if mobile controls are displayed)
            // This uses the CSS computed style, so it reflects the media query results
            if (mobileControls && window.getComputedStyle(mobileControls).display !== 'none') { 
                 leaderboardElement.style.display = 'none'; // Hide leaderboard again on mobile restart
            } else {
                // Ensure leaderboard is visible on desktop after replay
                leaderboardElement.style.display = 'block'; 
            }
            
            startGame(); // Restart the game
        });
    } else {
        console.error("Required elements (Replay button, Game Over overlay, or Leaderboard) not found!");
    }

    // Setup touch controls
    setupTouchControls();

    // Start the actual game
    startGame();
    
    // Start the game loop
    requestAnimationFrame(gameLoop);

    // Add resize listener to readjust layout if game over screen is visible
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            // Check if the updateGameOverLayout function exists (it's in game.js)
            if (typeof updateGameOverLayout === 'function') {
                updateGameOverLayout(); // Call the layout function after resize settles
            }
        }, 250); // Debounce timeout in milliseconds (adjust as needed)
    });
}

// Start the game when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', init); 
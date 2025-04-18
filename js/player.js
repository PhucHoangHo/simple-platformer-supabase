// Player object, movement, and collision logic will go here

console.log("player.js loaded");

const player = {
    x: 100,         // Initial x position
    y: 400,         // Initial y position
    width: 30,     // Player width
    height: 50,    // Player height
    color: '#ff0000', // Player color (red)
    velocityX: 0,  // Horizontal velocity
    velocityY: 0,  // Vertical velocity
    speed: 4,      // Horizontal movement speed
    jumpStrength: 12, // Initial upward velocity on jump
    isGrounded: false, // Whether the player is standing on a platform

    // Update player position based on velocity and apply gravity
    update: function() {
        // Apply gravity
        this.velocityY += GRAVITY;

        // Update position based on velocity
        this.x += this.velocityX;
        this.y += this.velocityY;

        // Basic floor collision (temporary, will be replaced by platform collision)
        // Prevent falling through the bottom of the canvas
        const canvas = document.getElementById('gameCanvas');
        if (this.y + this.height > canvas.height) {
            this.y = canvas.height - this.height;
            this.velocityY = 0;
            this.isGrounded = true; // Assume grounded if on canvas bottom
        }
        
        // Basic wall collision
        if (this.x < 0) {
            this.x = 0;
            this.velocityX = 0;
        }
        if (this.x + this.width > canvas.width) {
             this.x = canvas.width - this.width;
             this.velocityX = 0;
        }

        // Reset horizontal velocity if no input is detected (handled in main.js)
        // this.velocityX = 0; // This will be controlled by input handling
    },

    // Draw the player on the canvas
    draw: function(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    },

    // Initiate a jump
    jump: function() {
        if (this.isGrounded) {
            this.velocityY = -this.jumpStrength;
            this.isGrounded = false;
        }
    },
    
    // Move left
    moveLeft: function() {
        this.velocityX = -this.speed;
    },
    
    // Move right
    moveRight: function() {
        this.velocityX = this.speed;
    },
    
    // Stop horizontal movement
    stopMoving: function() {
        this.velocityX = 0;
    }
}; 
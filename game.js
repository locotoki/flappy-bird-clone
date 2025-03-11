class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 400;
        this.canvas.height = 600;
        
        this.bird = {
            x: 50,
            y: this.canvas.height / 2,
            radius: 20,
            velocity: 0,
            gravity: 0.5,
            jumpForce: -10
        };

        this.pipes = [];
        this.pipeGap = 150;
        this.pipeWidth = 50;
        this.pipeInterval = 1500;
        this.lastPipeTime = 0;

        this.score = 0;
        this.gameOver = false;
        this.isPlaying = false;

        this.bindEvents();
        this.showStartScreen();
    }

    bindEvents() {
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && this.isPlaying) {
                this.birdJump();
            }
        });

        document.addEventListener('click', () => {
            if (this.isPlaying) {
                this.birdJump();
            }
        });

        document.getElementById('startButton').addEventListener('click', () => {
            this.startGame();
        });

        document.getElementById('restartButton').addEventListener('click', () => {
            this.resetGame();
            this.startGame();
        });
    }

    showStartScreen() {
        document.getElementById('startScreen').classList.remove('hidden');
        document.getElementById('gameOverScreen').classList.add('hidden');
    }

    startGame() {
        this.isPlaying = true;
        document.getElementById('startScreen').classList.add('hidden');
        this.gameLoop();
    }

    resetGame() {
        this.bird.y = this.canvas.height / 2;
        this.bird.velocity = 0;
        this.pipes = [];
        this.score = 0;
        this.gameOver = false;
        this.updateScore();
        document.getElementById('gameOverScreen').classList.add('hidden');
    }

    birdJump() {
        this.bird.velocity = this.bird.jumpForce;
    }

    createPipe() {
        const gapStart = Math.random() * (this.canvas.height - this.pipeGap - 100) + 50;
        this.pipes.push({
            x: this.canvas.width,
            gapStart: gapStart,
            passed: false
        });
    }

    updateScore() {
        document.getElementById('score').textContent = `Score: ${this.score}`;
        document.getElementById('finalScore').textContent = this.score;
    }

    update() {
        if (!this.isPlaying || this.gameOver) return;

        // Update bird
        this.bird.velocity += this.bird.gravity;
        this.bird.y += this.bird.velocity;

        // Create new pipes
        const currentTime = Date.now();
        if (currentTime - this.lastPipeTime > this.pipeInterval) {
            this.createPipe();
            this.lastPipeTime = currentTime;
        }

        // Update pipes
        this.pipes.forEach((pipe, index) => {
            pipe.x -= 2;

            // Check for score
            if (!pipe.passed && pipe.x + this.pipeWidth < this.bird.x) {
                pipe.passed = true;
                this.score++;
                this.updateScore();
            }

            // Check for collisions
            if (this.checkCollision(pipe)) {
                this.gameOver = true;
                this.isPlaying = false;
                document.getElementById('gameOverScreen').classList.remove('hidden');
            }
        });

        // Remove off-screen pipes
        this.pipes = this.pipes.filter(pipe => pipe.x + this.pipeWidth > 0);

        // Check if bird is out of bounds
        if (this.bird.y < 0 || this.bird.y > this.canvas.height) {
            this.gameOver = true;
            this.isPlaying = false;
            document.getElementById('gameOverScreen').classList.remove('hidden');
        }
    }

    checkCollision(pipe) {
        const birdRight = this.bird.x + this.bird.radius;
        const birdLeft = this.bird.x - this.bird.radius;
        const birdTop = this.bird.y - this.bird.radius;
        const birdBottom = this.bird.y + this.bird.radius;

        return (
            birdRight > pipe.x &&
            birdLeft < pipe.x + this.pipeWidth &&
            (birdTop < pipe.gapStart || birdBottom > pipe.gapStart + this.pipeGap)
        );
    }

    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw bird
        this.ctx.fillStyle = '#FFD700';
        this.ctx.beginPath();
        this.ctx.arc(this.bird.x, this.bird.y, this.bird.radius, 0, Math.PI * 2);
        this.ctx.fill();

        // Draw pipes
        this.ctx.fillStyle = '#2E8B57';
        this.pipes.forEach(pipe => {
            // Top pipe
            this.ctx.fillRect(pipe.x, 0, this.pipeWidth, pipe.gapStart);
            // Bottom pipe
            this.ctx.fillRect(
                pipe.x,
                pipe.gapStart + this.pipeGap,
                this.pipeWidth,
                this.canvas.height - (pipe.gapStart + this.pipeGap)
            );
        });
    }

    gameLoop() {
        this.update();
        this.draw();

        if (this.isPlaying) {
            requestAnimationFrame(() => this.gameLoop());
        }
    }
}

// Start the game when the page loads
window.onload = () => {
    new Game();
};
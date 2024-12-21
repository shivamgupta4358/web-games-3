// Global Variables for Game States
let currentGame = null;
let gameActive = false;

// Game Logos Configuration
const GAME_LOGOS = {
    'tic-tac-toe': 'https://cdn-icons-png.flaticon.com/512/566/566294.png',
    'match-cards': 'https://cdn-icons-png.flaticon.com/512/8002/8002123.png',
    'ping-pong': 'https://cdn-icons-png.flaticon.com/512/2076/2076124.png',
    'wall-break': 'https://cdn-icons-png.flaticon.com/512/2620/2620799.png',
    'wall-break-2': 'https://cdn-icons-png.flaticon.com/512/2620/2620989.png',
    'dino-run': 'https://cdn-icons-png.flaticon.com/512/7838/7838497.png',
    'tower-smash': 'https://cdn-icons-png.flaticon.com/512/2271/2271561.png',
    'snake-game': 'https://cdn-icons-png.flaticon.com/512/867/867329.png',
    '2048': 'https://cdn-icons-png.flaticon.com/512/8002/8002932.png',
    'stack-cake': 'https://cdn-icons-png.flaticon.com/512/3361/3361474.png'
};

// Utility Functions
function initializeSearch() {
    const searchInput = document.querySelector('.search-bar input');
    const searchButton = document.querySelector('.search-bar button');
    const gameCards = document.querySelectorAll('.game-card');

    function performSearch() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        gameCards.forEach(card => {
            const title = card.querySelector('h3').textContent.toLowerCase();
            const description = card.querySelector('p').textContent.toLowerCase();
            if (title.includes(searchTerm) || description.includes(searchTerm)) {
                card.style.display = '';
            } else {
                card.style.display = 'none';
            }
        });
    }

    searchButton.addEventListener('click', performSearch);
    searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') performSearch();
    });
}

function loadGameLogos() {
    document.querySelectorAll('.game-card img').forEach(img => {
        const gameType = img.getAttribute('data-game-type');
        if (GAME_LOGOS[gameType]) {
            img.src = GAME_LOGOS[gameType];
            img.onerror = function() {
                this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTIiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGFsaWdubWVudC1iYXNlbGluZT0ibWlkZGxlIiBmaWxsPSIjOTk5Ij5HYW1lPC90ZXh0Pjwvc3ZnPg==';
            };
        }
    });
}

function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    modal.style.display = 'block';
    currentGame = modalId;
    gameActive = true;
    initializeGame(modalId);

    // Add escape key listener
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') hideModal(modalId);
    });
}

function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    modal.style.display = 'none';
    stopGame(modalId);
    gameActive = false;
}

function showMessage(message, gameId) {
    const messageElement = document.getElementById(`${gameId}-message`);
    if (messageElement) {
        messageElement.textContent = message;
    }
}

function initializeCanvas(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
        console.error(`Canvas with id ${canvasId} not found`);
        return null;
    }
    const context = canvas.getContext('2d');
    if (!context) {
        console.error(`Could not get 2D context for canvas ${canvasId}`);
        return null;
    }
    return { canvas, context };
}

// Initialize Touch Events
function initializeTouchEvents() {
    const touchEnabled = 'ontouchstart' in window;
    if (touchEnabled) {
        document.addEventListener('touchstart', handleTouchStart, false);
        document.addEventListener('touchmove', handleTouchMove, false);
        document.addEventListener('touchend', handleTouchEnd, false);
    }
}

// Touch Event Variables
let touchStartX = 0;
let touchStartY = 0;

function handleTouchStart(evt) {
    const firstTouch = evt.touches[0];
    touchStartX = firstTouch.clientX;
    touchStartY = firstTouch.clientY;
}

function handleTouchMove(evt) {
    if (!touchStartX || !touchStartY) return;

    const xDiff = touchStartX - evt.touches[0].clientX;
    const yDiff = touchStartY - evt.touches[0].clientY;

    if (currentGame) {
        switch(currentGame) {
            case 'ping-pong-modal':
                handlePingPongTouch(xDiff, yDiff);
                break;
            case 'snake-game-modal':
                handleSnakeTouch(xDiff, yDiff);
                break;
            // Add other game touch handlers
        }
    }
}

function handleTouchEnd() {
    touchStartX = null;
    touchStartY = null;
}

// Initialize everything when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Hide loading screen after everything is loaded
    setTimeout(() => {
        const loadingScreen = document.getElementById('loading-screen');
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }, 1000);

    initializeSearch();
    loadGameLogos();
    initializeTouchEvents();

    // Initialize game buttons
    document.querySelectorAll('.game-card button').forEach(button => {
        const gameType = button.closest('.game-card').querySelector('img').getAttribute('data-game-type');
        const modalId = gameButtonMap[gameType];
        if (modalId) {
            button.setAttribute('data-game', modalId);
            button.addEventListener('click', () => showModal(modalId));
        }
    });

    // Initialize close buttons
    document.querySelectorAll('.close-button').forEach(button => {
        button.addEventListener('click', () => {
            const modal = button.closest('.modal');
            if (modal) hideModal(modal.id);
        });
    });

    // Add resize handler
    window.addEventListener('resize', handleResize);
});

// Export necessary functions for HTML
window.showModal = showModal;
window.hideModal = hideModal;
// Match Cards Game Logic
let matchCardsState = {
    cards: [],
    flippedCards: [],
    matchedPairs: 0,
    totalPairs: 6,
    canFlip: true
};

function initMatchCards() {
    matchCardsState = {
        cards: [],
        flippedCards: [],
        matchedPairs: 0,
        totalPairs: 6,
        canFlip: true
    };

    const symbols = ['🎮', '🎲', '🎯', '🎪', '🎨', '🎭'];
    const cardPairs = [...symbols, ...symbols];
    shuffleArray(cardPairs);

    const board = document.getElementById('match-cards-board');
    board.innerHTML = '';
    
    cardPairs.forEach((symbol, index) => {
        const card = document.createElement('div');
        card.className = 'match-card';
        card.dataset.index = index;
        card.dataset.symbol = symbol;
        card.addEventListener('click', handleMatchCardClick);
        board.appendChild(card);
        matchCardsState.cards.push(card);
    });
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function handleMatchCardClick(event) {
    if (!gameActive || !matchCardsState.canFlip) return;
    
    const card = event.target;
    if (card.classList.contains('flipped') || 
        matchCardsState.flippedCards.includes(card)) return;

    card.classList.add('flipped');
    card.textContent = card.dataset.symbol;
    matchCardsState.flippedCards.push(card);

    if (matchCardsState.flippedCards.length === 2) {
        matchCardsState.canFlip = false;
        checkForMatch();
    }
}

function checkForMatch() {
    const [card1, card2] = matchCardsState.flippedCards;
    const match = card1.dataset.symbol === card2.dataset.symbol;

    setTimeout(() => {
        if (match) {
            matchCardsState.matchedPairs++;
            card1.classList.add('matched');
            card2.classList.add('matched');
            
            if (matchCardsState.matchedPairs === matchCardsState.totalPairs) {
                showMessage('Congratulations! You won!', 'match-cards');
                gameActive = false;
            }
        } else {
            card1.classList.remove('flipped');
            card2.classList.remove('flipped');
            card1.textContent = '';
            card2.textContent = '';
        }

        matchCardsState.flippedCards = [];
        matchCardsState.canFlip = true;
    }, 1000);
}

function stopMatchCards() {
    matchCardsState.cards.forEach(card => {
        card.removeEventListener('click', handleMatchCardClick);
    });
    gameActive = false;
}

// Ping Pong Game Logic
let pingPongState = {
    canvas: null,
    context: null,
    ball: {
        x: 0,
        y: 0,
        radius: 10,
        speedX: 5,
        speedY: 5
    },
    paddle: {
        width: 10,
        height: 100,
        player: { y: 0, score: 0 },
        ai: { y: 0, score: 0 }
    },
    gameLoop: null
};

// Continue with other game implementations...
// Continue Ping Pong Implementation
function initPingPong() {
    const { canvas, context } = initializeCanvas('ping-pong-canvas');
    if (!canvas || !context) return;

    pingPongState.canvas = canvas;
    pingPongState.context = context;
    
    // Initialize ball
    pingPongState.ball = {
        x: canvas.width / 2,
        y: canvas.height / 2,
        radius: 10,
        speedX: 5,
        speedY: 5
    };

    // Initialize paddles
    pingPongState.paddle = {
        width: 10,
        height: 100,
        player: { y: canvas.height / 2 - 50, score: 0 },
        ai: { y: canvas.height / 2 - 50, score: 0 }
    };

    // Start game loop
    if (pingPongState.gameLoop) cancelAnimationFrame(pingPongState.gameLoop);
    updatePingPong();

    // Add event listeners
    canvas.addEventListener('mousemove', handlePingPongMouseMove);
    canvas.addEventListener('touchmove', handlePingPongTouch);
}

function updatePingPong() {
    if (!gameActive) return;

    const { canvas, context, ball, paddle } = pingPongState;

    // Move ball
    ball.x += ball.speedX;
    ball.y += ball.speedY;

    // Ball collision with walls
    if (ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0) {
        ball.speedY = -ball.speedY;
    }

    // Ball collision with paddles
    if (ball.x - ball.radius < paddle.width && 
        ball.y > paddle.player.y && 
        ball.y < paddle.player.y + paddle.height) {
        ball.speedX = Math.abs(ball.speedX);
    }

    if (ball.x + ball.radius > canvas.width - paddle.width && 
        ball.y > paddle.ai.y && 
        ball.y < paddle.ai.y + paddle.height) {
        ball.speedX = -Math.abs(ball.speedX);
    }

    // AI paddle movement
    const aiCenter = paddle.ai.y + paddle.height / 2;
    if (aiCenter < ball.y - 35) {
        paddle.ai.y += 4;
    } else if (aiCenter > ball.y + 35) {
        paddle.ai.y -= 4;
    }

    // Score points
    if (ball.x < 0) {
        paddle.ai.score++;
        resetBall();
    } else if (ball.x > canvas.width) {
        paddle.player.score++;
        resetBall();
    }

    // Check for game over
    if (paddle.player.score >= 5 || paddle.ai.score >= 5) {
        const winner = paddle.player.score >= 5 ? 'Player' : 'AI';
        showMessage(`Game Over! ${winner} wins!`, 'ping-pong');
        gameActive = false;
        return;
    }

    // Draw everything
    drawPingPong();

    // Continue game loop
    pingPongState.gameLoop = requestAnimationFrame(updatePingPong);
}

function drawPingPong() {
    const { canvas, context, ball, paddle } = pingPongState;

    // Clear canvas
    context.fillStyle = '#000';
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Draw middle line
    context.strokeStyle = '#fff';
    context.setLineDash([5, 15]);
    context.beginPath();
    context.moveTo(canvas.width / 2, 0);
    context.lineTo(canvas.width / 2, canvas.height);
    context.stroke();
    context.setLineDash([]);

    // Draw ball
    context.fillStyle = '#fff';
    context.beginPath();
    context.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    context.fill();

    // Draw paddles
    context.fillRect(0, paddle.player.y, paddle.width, paddle.height);
    context.fillRect(canvas.width - paddle.width, paddle.ai.y, paddle.width, paddle.height);

    // Draw scores
    context.font = '32px Arial';
    context.fillText(paddle.player.score, canvas.width / 4, 50);
    context.fillText(paddle.ai.score, 3 * canvas.width / 4, 50);
}

function resetBall() {
    const { canvas, ball } = pingPongState;
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.speedX = 5 * (Math.random() > 0.5 ? 1 : -1);
    ball.speedY = 5 * (Math.random() > 0.5 ? 1 : -1);
}

function handlePingPongMouseMove(event) {
    if (!gameActive) return;
    const rect = pingPongState.canvas.getBoundingClientRect();
    const mouseY = event.clientY - rect.top;
    updatePlayerPaddlePosition(mouseY);
}

function handlePingPongTouch(event) {
    if (!gameActive) return;
    event.preventDefault();
    const rect = pingPongState.canvas.getBoundingClientRect();
    const touchY = event.touches[0].clientY - rect.top;
    updatePlayerPaddlePosition(touchY);
}

function updatePlayerPaddlePosition(y) {
    const { canvas, paddle } = pingPongState;
    paddle.player.y = Math.max(0, Math.min(y - paddle.height / 2, canvas.height - paddle.height));
}

function stopPingPong() {
    if (pingPongState.gameLoop) {
        cancelAnimationFrame(pingPongState.gameLoop);
    }
    if (pingPongState.canvas) {
        pingPongState.canvas.removeEventListener('mousemove', handlePingPongMouseMove);
        pingPongState.canvas.removeEventListener('touchmove', handlePingPongTouch);
    }
    gameActive = false;
}
// Wall Break Game Logic
let wallBreakState = {
    canvas: null,
    context: null,
    ball: {
        x: 0,
        y: 0,
        radius: 8,
        speedX: 4,
        speedY: -4
    },
    paddle: {
        width: 80,
        height: 10,
        x: 0,
        y: 0
    },
    bricks: [],
    score: 0,
    gameLoop: null,
    brickRowCount: 5,
    brickColumnCount: 8,
    brickWidth: 40,
    brickHeight: 20,
    brickPadding: 10,
    brickOffsetTop: 30,
    brickOffsetLeft: 30
};

function initWallBreak() {
    const { canvas, context } = initializeCanvas('wall-break-canvas');
    if (!canvas || !context) return;

    wallBreakState.canvas = canvas;
    wallBreakState.context = context;
    wallBreakState.score = 0;
    
    // Initialize ball
    wallBreakState.ball = {
        x: canvas.width / 2,
        y: canvas.height - 30,
        radius: 8,
        speedX: 4,
        speedY: -4
    };
    
    // Initialize paddle
    wallBreakState.paddle = {
        width: 80,
        height: 10,
        x: (canvas.width - 80) / 2,
        y: canvas.height - 20
    };
    
    // Initialize bricks
    initializeBricks();
    
    // Start game loop
    if (wallBreakState.gameLoop) cancelAnimationFrame(wallBreakState.gameLoop);
    updateWallBreak();
    
    // Add event listeners
    canvas.addEventListener('mousemove', handleWallBreakMouseMove);
    canvas.addEventListener('touchmove', handleWallBreakTouch);
}

function initializeBricks() {
    const state = wallBreakState;
    state.bricks = [];
    
    for(let c = 0; c < state.brickColumnCount; c++) {
        state.bricks[c] = [];
        for(let r = 0; r < state.brickRowCount; r++) {
            state.bricks[c][r] = { 
                x: 0, 
                y: 0, 
                status: 1,
                color: getRandomBrickColor()
            };
        }
    }
}

function getRandomBrickColor() {
    const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF'];
    return colors[Math.floor(Math.random() * colors.length)];
}

function updateWallBreak() {
    if (!gameActive) return;
    
    const state = wallBreakState;
    const { canvas, ball, paddle } = state;
    
    // Move ball
    ball.x += ball.speedX;
    ball.y += ball.speedY;
    
    // Ball collision with walls
    if(ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) {
        ball.speedX = -ball.speedX;
    }
    if(ball.y - ball.radius < 0) {
        ball.speedY = -ball.speedY;
    }
    
    // Ball collision with ground (game over)
    if(ball.y + ball.radius > canvas.height) {
        showMessage(`Game Over! Score: ${state.score}`, 'wall-break');
        stopWallBreak();
        return;
    }
    
    // Ball collision with paddle
    if(ball.y + ball.radius > paddle.y && 
       ball.x > paddle.x && 
       ball.x < paddle.x + paddle.width) {
        ball.speedY = -ball.speedY;
        
        // Add angle based on where ball hits paddle
        const hitPos = (ball.x - paddle.x) / paddle.width;
        ball.speedX = 8 * (hitPos - 0.5);
    }
    
    // Ball collision with bricks
    collisionDetection();
    
    // Draw everything
    drawWallBreak();
    
    // Continue game loop
    state.gameLoop = requestAnimationFrame(updateWallBreak);
}

function collisionDetection() {
    const state = wallBreakState;
    
    for(let c = 0; c < state.brickColumnCount; c++) {
        for(let r = 0; r < state.brickRowCount; r++) {
            const brick = state.bricks[c][r];
            if(brick.status === 1) {
                const brickX = (c * (state.brickWidth + state.brickPadding)) + state.brickOffsetLeft;
                const brickY = (r * (state.brickHeight + state.brickPadding)) + state.brickOffsetTop;
                brick.x = brickX;
                brick.y = brickY;
                
                if(state.ball.x > brickX && 
                   state.ball.x < brickX + state.brickWidth && 
                   state.ball.y > brickY && 
                   state.ball.y < brickY + state.brickHeight) {
                    state.ball.speedY = -state.ball.speedY;
                    brick.status = 0;
                    state.score += 10;
                    
                    // Check if all bricks are destroyed
                    if(checkWin()) {
                        showMessage(`Congratulations! Score: ${state.score}`, 'wall-break');
                        stopWallBreak();
                    }
                }
            }
        }
    }
}

// ... (continuing in next message)
// Continue Wall Break Implementation
function checkWin() {
    const state = wallBreakState;
    for(let c = 0; c < state.brickColumnCount; c++) {
        for(let r = 0; r < state.brickRowCount; r++) {
            if(state.bricks[c][r].status === 1) {
                return false;
            }
        }
    }
    return true;
}

function drawWallBreak() {
    const state = wallBreakState;
    const { canvas, context, ball, paddle } = state;
    
    // Clear canvas
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw bricks
    for(let c = 0; c < state.brickColumnCount; c++) {
        for(let r = 0; r < state.brickRowCount; r++) {
            const brick = state.bricks[c][r];
            if(brick.status === 1) {
                context.fillStyle = brick.color;
                context.fillRect(brick.x, brick.y, state.brickWidth, state.brickHeight);
            }
        }
    }
    
    // Draw ball
    context.beginPath();
    context.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    context.fillStyle = '#0095DD';
    context.fill();
    context.closePath();
    
    // Draw paddle
    context.fillStyle = '#0095DD';
    context.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
    
    // Draw score
    context.font = '16px Arial';
    context.fillStyle = '#0095DD';
    context.fillText(`Score: ${state.score}`, 8, 20);
}

function handleWallBreakMouseMove(event) {
    if (!gameActive) return;
    const rect = wallBreakState.canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    updatePaddlePosition(mouseX);
}

function handleWallBreakTouch(event) {
    if (!gameActive) return;
    event.preventDefault();
    const rect = wallBreakState.canvas.getBoundingClientRect();
    const touchX = event.touches[0].clientX - rect.left;
    updatePaddlePosition(touchX);
}

function updatePaddlePosition(x) {
    const state = wallBreakState;
    const paddleX = x - state.paddle.width / 2;
    state.paddle.x = Math.max(0, Math.min(paddleX, state.canvas.width - state.paddle.width));
}

function stopWallBreak() {
    if (wallBreakState.gameLoop) {
        cancelAnimationFrame(wallBreakState.gameLoop);
    }
    if (wallBreakState.canvas) {
        wallBreakState.canvas.removeEventListener('mousemove', handleWallBreakMouseMove);
        wallBreakState.canvas.removeEventListener('touchmove', handleWallBreakTouch);
    }
    gameActive = false;
}

// Wall Break 2.0 Game Logic (Enhanced version with power-ups)
let wallBreak2State = {
    ...wallBreakState,
    powerUps: [],
    activePowerUps: {
        wide: false,
        fast: false,
        multi: false
    }
};

function initWallBreak2() {
    const { canvas, context } = initializeCanvas('wall-break-2-canvas');
    if (!canvas || !context) return;

    wallBreak2State.canvas = canvas;
    wallBreak2State.context = context;
    wallBreak2State.score = 0;
    wallBreak2State.powerUps = [];
    wallBreak2State.activePowerUps = {
        wide: false,
        fast: false,
        multi: false
    };
    
    // Initialize ball
    wallBreak2State.ball = {
        x: canvas.width / 2,
        y: canvas.height - 30,
        radius: 8,
        speedX: 4,
        speedY: -4
    };
    
    // Initialize paddle
    wallBreak2State.paddle = {
        width: 80,
        height: 10,
        x: (canvas.width - 80) / 2,
        y: canvas.height - 20
    };
    
    // Initialize bricks with power-ups
    initializeBricks2();
    
    // Start game loop
    if (wallBreak2State.gameLoop) cancelAnimationFrame(wallBreak2State.gameLoop);
    updateWallBreak2();
    
    // Add event listeners
    canvas.addEventListener('mousemove', handleWallBreak2MouseMove);
    canvas.addEventListener('touchmove', handleWallBreak2Touch);
}

// ... (continuing in next message) 
// Continue Wall Break 2.0 Implementation
function initializeBricks2() {
    const state = wallBreak2State;
    state.bricks = [];
    
    for(let c = 0; c < state.brickColumnCount; c++) {
        state.bricks[c] = [];
        for(let r = 0; r < state.brickRowCount; r++) {
            state.bricks[c][r] = { 
                x: 0, 
                y: 0, 
                status: 1,
                color: getRandomBrickColor(),
                powerUp: Math.random() < 0.2 ? getRandomPowerUp() : null
            };
        }
    }
}

function getRandomPowerUp() {
    const powerUps = ['wide', 'fast', 'multi'];
    return powerUps[Math.floor(Math.random() * powerUps.length)];
}

function updateWallBreak2() {
    if (!gameActive) return;
    
    const state = wallBreak2State;
    
    // Update ball position
    state.ball.x += state.ball.speedX;
    state.ball.y += state.ball.speedY;
    
    // Update power-ups
    updatePowerUps();
    
    // Handle collisions
    handleCollisions2();
    
    // Draw everything
    drawWallBreak2();
    
    // Continue game loop
    state.gameLoop = requestAnimationFrame(updateWallBreak2);
}

function updatePowerUps() {
    const state = wallBreak2State;
    
    // Update falling power-ups
    for(let i = state.powerUps.length - 1; i >= 0; i--) {
        const powerUp = state.powerUps[i];
        powerUp.y += 2;
        
        // Check if power-up is caught
        if(powerUp.y + 10 > state.paddle.y && 
           powerUp.x > state.paddle.x && 
           powerUp.x < state.paddle.x + state.paddle.width) {
            activatePowerUp(powerUp.type);
            state.powerUps.splice(i, 1);
        }
        
        // Remove if off screen
        if(powerUp.y > state.canvas.height) {
            state.powerUps.splice(i, 1);
        }
    }
}

function activatePowerUp(type) {
    const state = wallBreak2State;
    state.activePowerUps[type] = true;
    
    switch(type) {
        case 'wide':
            state.paddle.width = 120;
            break;
        case 'fast':
            state.ball.speedX *= 1.5;
            state.ball.speedY *= 1.5;
            break;
        case 'multi':
            // Add multi-ball functionality here
            break;
    }
    
    // Deactivate after 10 seconds
    setTimeout(() => {
        state.activePowerUps[type] = false;
        if(type === 'wide') state.paddle.width = 80;
        if(type === 'fast') {
            state.ball.speedX /= 1.5;
            state.ball.speedY /= 1.5;
        }
    }, 10000);
}

function handleCollisions2() {
    const state = wallBreak2State;
    
    // Wall collisions
    if(state.ball.x + state.ball.radius > state.canvas.width || 
       state.ball.x - state.ball.radius < 0) {
        state.ball.speedX = -state.ball.speedX;
    }
    if(state.ball.y - state.ball.radius < 0) {
        state.ball.speedY = -state.ball.speedY;
    }
    
    // Game over check
    if(state.ball.y + state.ball.radius > state.canvas.height) {
        showMessage(`Game Over! Score: ${state.score}`, 'wall-break-2');
        stopWallBreak2();
        return;
    }
    
    // Paddle collision
    if(state.ball.y + state.ball.radius > state.paddle.y && 
       state.ball.x > state.paddle.x && 
       state.ball.x < state.paddle.x + state.paddle.width) {
        state.ball.speedY = -state.ball.speedY;
        const hitPos = (state.ball.x - state.paddle.x) / state.paddle.width;
        state.ball.speedX = 8 * (hitPos - 0.5);
    }
    
    // Brick collisions
    for(let c = 0; c < state.brickColumnCount; c++) {
        for(let r = 0; r < state.brickRowCount; r++) {
            const brick = state.bricks[c][r];
            if(brick.status === 1) {
                const brickX = (c * (state.brickWidth + state.brickPadding)) + state.brickOffsetLeft;
                const brickY = (r * (state.brickHeight + state.brickPadding)) + state.brickOffsetTop;
                
                if(state.ball.x > brickX && 
                   state.ball.x < brickX + state.brickWidth && 
                   state.ball.y > brickY && 
                   state.ball.y < brickY + state.brickHeight) {
                    state.ball.speedY = -state.ball.speedY;
                    brick.status = 0;
                    state.score += 10;
                    
                    // Release power-up if brick had one
                    if(brick.powerUp) {
                        state.powerUps.push({
                            x: brickX + state.brickWidth/2,
                            y: brickY + state.brickHeight,
                            type: brick.powerUp
                        });
                    }
                }
            }
        }
    }
}

function drawWallBreak2() {
    const state = wallBreak2State;
    const { canvas, context } = state;
    
    // Clear canvas
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw bricks
    drawBricks2();
    
    // Draw power-ups
    drawPowerUps();
    
    // Draw ball
    context.beginPath();
    context.arc(state.ball.x, state.ball.y, state.ball.radius, 0, Math.PI * 2);
    context.fillStyle = '#0095DD';
    context.fill();
    
    // Draw paddle
    context.fillStyle = state.activePowerUps.wide ? '#FF0000' : '#0095DD';
    context.fillRect(state.paddle.x, state.paddle.y, state.paddle.width, state.paddle.height);
    
    // Draw score
    context.font = '16px Arial';
    context.fillStyle = '#0095DD';
    context.fillText(`Score: ${state.score}`, 8, 20);
}

function drawBricks2() {
    const state = wallBreak2State;
    
    for(let c = 0; c < state.brickColumnCount; c++) {
        for(let r = 0; r < state.brickRowCount; r++) {
            const brick = state.bricks[c][r];
            if(brick.status === 1) {
                const brickX = (c * (state.brickWidth + state.brickPadding)) + state.brickOffsetLeft;
                const brickY = (r * (state.brickHeight + state.brickPadding)) + state.brickOffsetTop;
                
                context.fillStyle = brick.color;
                context.fillRect(brickX, brickY, state.brickWidth, state.brickHeight);
                
                if(brick.powerUp) {
                    context.fillStyle = '#FFD700';
                    context.beginPath();
                    context.arc(brickX + state.brickWidth/2, brickY + state.brickHeight/2, 5, 0, Math.PI * 2);
                    context.fill();
                }
            }
        }
    }
}

function drawPowerUps() {
    const state = wallBreak2State;
    
    state.powerUps.forEach(powerUp => {
        context.fillStyle = '#FFD700';
        context.beginPath();
        context.arc(powerUp.x, powerUp.y, 8, 0, Math.PI * 2);
        context.fill();
    });
}

function handleWallBreak2MouseMove(event) {
    if (!gameActive) return;
    const rect = wallBreak2State.canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    updatePaddlePosition2(mouseX);
}

function handleWallBreak2Touch(event) {
    if (!gameActive) return;
    event.preventDefault();
    const rect = wallBreak2State.canvas.getBoundingClientRect();
    const touchX = event.touches[0].clientX - rect.left;
    updatePaddlePosition2(touchX);
}

function updatePaddlePosition2(x) {
    const state = wallBreak2State;
    const paddleX = x - state.paddle.width / 2;
    state.paddle.x = Math.max(0, Math.min(paddleX, state.canvas.width - state.paddle.width));
}

function stopWallBreak2() {
    if (wallBreak2State.gameLoop) {
        cancelAnimationFrame(wallBreak2State.gameLoop);
    }
    if (wallBreak2State.canvas) {
        wallBreak2State.canvas.removeEventListener('mousemove', handleWallBreak2MouseMove);
        wallBreak2State.canvas.removeEventListener('touchmove', handleWallBreak2Touch);
    }
    gameActive = false;
}
// Dino Run Game Logic
let dinoRunState = {
    canvas: null,
    context: null,
    dino: {
        x: 50,
        y: 0,
        width: 40,
        height: 60,
        jumping: false,
        velocity: 0,
        gravity: 0.8,
        jumpStrength: -15
    },
    obstacles: [],
    score: 0,
    gameLoop: null,
    speed: 6,
    groundY: 0,
    clouds: []
};

function initDinoRun() {
    const { canvas, context } = initializeCanvas('dino-run-canvas');
    if (!canvas || !context) return;

    dinoRunState.canvas = canvas;
    dinoRunState.context = context;
    dinoRunState.groundY = canvas.height - 60;
    dinoRunState.dino.y = dinoRunState.groundY - dinoRunState.dino.height;
    dinoRunState.obstacles = [];
    dinoRunState.score = 0;
    dinoRunState.speed = 6;
    dinoRunState.clouds = createInitialClouds();

    // Add event listeners
    document.addEventListener('keydown', handleDinoKeyPress);
    canvas.addEventListener('touchstart', handleDinoTouch);

    // Start game loop
    if (dinoRunState.gameLoop) cancelAnimationFrame(dinoRunState.gameLoop);
    updateDinoRun();
}

function createInitialClouds() {
    const clouds = [];
    for (let i = 0; i < 3; i++) {
        clouds.push({
            x: Math.random() * dinoRunState.canvas.width,
            y: Math.random() * (dinoRunState.groundY / 2),
            width: 60 + Math.random() * 40,
            speed: 1 + Math.random()
        });
    }
    return clouds;
}

function updateDinoRun() {
    if (!gameActive) return;

    const state = dinoRunState;
    
    // Update dino position
    if (state.dino.jumping) {
        state.dino.velocity += state.dino.gravity;
        state.dino.y += state.dino.velocity;

        if (state.dino.y >= state.groundY - state.dino.height) {
            state.dino.y = state.groundY - state.dino.height;
            state.dino.jumping = false;
            state.dino.velocity = 0;
        }
    }

    // Generate obstacles
    if (Math.random() < 0.02) {
        const obstacle = {
            x: state.canvas.width,
            y: state.groundY - 40,
            width: 20,
            height: 40
        };
        state.obstacles.push(obstacle);
    }

    // Update obstacles
    for (let i = state.obstacles.length - 1; i >= 0; i--) {
        state.obstacles[i].x -= state.speed;
        
        // Remove off-screen obstacles
        if (state.obstacles[i].x + state.obstacles[i].width < 0) {
            state.obstacles.splice(i, 1);
            state.score++;
            // Increase speed every 10 points
            if (state.score % 10 === 0) {
                state.speed += 0.5;
            }
        }
    }

    // Update clouds
    state.clouds.forEach(cloud => {
        cloud.x -= cloud.speed;
        if (cloud.x + cloud.width < 0) {
            cloud.x = state.canvas.width;
            cloud.y = Math.random() * (state.groundY / 2);
        }
    });

    // Check collisions
    if (checkDinoCollision()) {
        showMessage(`Game Over! Score: ${state.score}`, 'dino-run');
        stopDinoRun();
        return;
    }

    // Draw everything
    drawDinoRun();

    // Continue game loop
    state.gameLoop = requestAnimationFrame(updateDinoRun);
}

function checkDinoCollision() {
    const { dino, obstacles } = dinoRunState;
    return obstacles.some(obstacle => 
        dino.x < obstacle.x + obstacle.width &&
        dino.x + dino.width > obstacle.x &&
        dino.y < obstacle.y + obstacle.height &&
        dino.y + dino.height > obstacle.y
    );
}

function drawDinoRun() {
    const state = dinoRunState;
    const { canvas, context, dino } = state;

    // Clear canvas
    context.fillStyle = '#87CEEB'; // Sky blue
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Draw clouds
    context.fillStyle = '#FFFFFF';
    state.clouds.forEach(cloud => {
        context.beginPath();
        context.arc(cloud.x, cloud.y, cloud.width/3, 0, Math.PI * 2);
        context.arc(cloud.x + cloud.width/3, cloud.y - cloud.width/6, cloud.width/3, 0, Math.PI * 2);
        context.arc(cloud.x + cloud.width/2, cloud.y, cloud.width/3, 0, Math.PI * 2);
        context.fill();
    });

    // Draw ground
    context.fillStyle = '#8B4513';
    context.fillRect(0, state.groundY, canvas.width, canvas.height - state.groundY);

    // Draw dino
    context.fillStyle = '#32CD32';
    context.fillRect(dino.x, dino.y, dino.width, dino.height);

    // Draw obstacles
    context.fillStyle = '#8B4513';
    state.obstacles.forEach(obstacle => {
        context.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });

    // Draw score
    context.fillStyle = '#000000';
    context.font = '20px Arial';
    context.fillText(`Score: ${state.score}`, 10, 30);
}

function handleDinoKeyPress(event) {
    if (!gameActive) return;
    if (event.code === 'Space' && !dinoRunState.dino.jumping) {
        dinoRunState.dino.jumping = true;
        dinoRunState.dino.velocity = dinoRunState.dino.jumpStrength;
    }
}

function handleDinoTouch(event) {
    if (!gameActive) return;
    event.preventDefault();
    if (!dinoRunState.dino.jumping) {
        dinoRunState.dino.jumping = true;
        dinoRunState.dino.velocity = dinoRunState.dino.jumpStrength;
    }
}

function stopDinoRun() {
    if (dinoRunState.gameLoop) {
        cancelAnimationFrame(dinoRunState.gameLoop);
    }
    document.removeEventListener('keydown', handleDinoKeyPress);
    if (dinoRunState.canvas) {
        dinoRunState.canvas.removeEventListener('touchstart', handleDinoTouch);
    }
    gameActive = false;
}
// Tower Smash Game Logic
let towerSmashState = {
    canvas: null,
    context: null,
    blocks: [],
    currentBlock: null,
    gravity: 0.5,
    blockWidth: 60,
    blockHeight: 20,
    score: 0,
    gameLoop: null,
    movingSpeed: 3,
    movingDirection: 1,
    lastBlockPosition: null,
    gameStarted: false,
    perfectDrops: 0
};

function initTowerSmash() {
    const { canvas, context } = initializeCanvas('tower-smash-canvas');
    if (!canvas || !context) return;

    towerSmashState.canvas = canvas;
    towerSmashState.context = context;
    towerSmashState.blocks = [];
    towerSmashState.score = 0;
    towerSmashState.perfectDrops = 0;
    towerSmashState.gameStarted = false;
    
    // Add base block
    const baseBlock = {
        x: (canvas.width - towerSmashState.blockWidth) / 2,
        y: canvas.height - towerSmashState.blockHeight,
        width: towerSmashState.blockWidth,
        height: towerSmashState.blockHeight,
        color: getRandomColor()
    };
    towerSmashState.blocks.push(baseBlock);
    towerSmashState.lastBlockPosition = baseBlock;
    
    // Create first moving block
    createNewBlock();
    
    // Start game loop
    if (towerSmashState.gameLoop) cancelAnimationFrame(towerSmashState.gameLoop);
    updateTowerSmash();
    
    // Add event listeners
    canvas.addEventListener('click', handleTowerSmashClick);
    canvas.addEventListener('touchstart', handleTowerSmashClick);
}

function createNewBlock() {
    const state = towerSmashState;
    const lastBlock = state.lastBlockPosition;
    
    state.currentBlock = {
        x: 0,
        y: lastBlock.y - state.blockHeight,
        width: state.blockWidth,
        height: state.blockHeight,
        color: getRandomColor(),
        moving: true
    };
    
    // Increase difficulty
    state.movingSpeed += 0.2;
}

function updateTowerSmash() {
    if (!gameActive) return;
    
    const state = towerSmashState;
    const { canvas, currentBlock, movingSpeed, movingDirection } = state;
    
    // Move current block
    if (currentBlock && currentBlock.moving) {
        currentBlock.x += movingSpeed * movingDirection;
        
        // Bounce off walls
        if (currentBlock.x + currentBlock.width > canvas.width) {
            state.movingDirection = -1;
        } else if (currentBlock.x < 0) {
            state.movingDirection = 1;
        }
    }
    
    // Draw everything
    drawTowerSmash();
    
    // Continue game loop
    state.gameLoop = requestAnimationFrame(updateTowerSmash);
}

function handleTowerSmashClick(event) {
    if (!gameActive) return;
    event.preventDefault();
    
    const state = towerSmashState;
    if (!state.currentBlock || !state.currentBlock.moving) return;
    
    state.gameStarted = true;
    state.currentBlock.moving = false;
    
    // Calculate overlap with previous block
    const prevBlock = state.lastBlockPosition;
    const overlap = calculateOverlap(prevBlock, state.currentBlock);
    
    if (overlap <= 0) {
        // Game over - block missed
        showMessage(`Game Over! Score: ${state.score}`, 'tower-smash');
        stopTowerSmash();
        return;
    }
    
    // Perfect drop bonus
    const perfectDrop = Math.abs(prevBlock.x - state.currentBlock.x) < 2;
    if (perfectDrop) {
        state.perfectDrops++;
        state.score += 50;
        showTemporaryMessage('Perfect!', 1000);
    }
    
    // Adjust block size based on overlap
    state.currentBlock.width = overlap;
    state.currentBlock.x = Math.max(prevBlock.x, state.currentBlock.x);
    
    // Add block to stack
    state.blocks.push(state.currentBlock);
    state.lastBlockPosition = state.currentBlock;
    state.score += 10;
    
    // Create new block
    createNewBlock();
}

function calculateOverlap(block1, block2) {
    const left = Math.max(block1.x, block2.x);
    const right = Math.min(block1.x + block1.width, block2.x + block2.width);
    return right - left;
}

function drawTowerSmash() {
    const state = towerSmashState;
    const { canvas, context, blocks, currentBlock } = state;
    
    // Clear canvas
    context.fillStyle = '#87CEEB'; // Sky blue
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw blocks
    blocks.forEach(block => {
        context.fillStyle = block.color;
        context.fillRect(block.x, block.y, block.width, block.height);
    });
    
    // Draw current moving block
    if (currentBlock) {
        context.fillStyle = currentBlock.color;
        context.fillRect(currentBlock.x, currentBlock.y, currentBlock.width, currentBlock.height);
    }
    
    // Draw score
    context.fillStyle = '#000';
    context.font = '20px Arial';
    context.fillText(`Score: ${state.score}`, 10, 30);
    context.fillText(`Perfect Drops: ${state.perfectDrops}`, 10, 60);
    
    // Draw instructions if game hasn't started
    if (!state.gameStarted) {
        context.fillStyle = 'rgba(0, 0, 0, 0.7)';
        context.font = '24px Arial';
        context.textAlign = 'center';
        context.fillText('Click or Tap to Stack!', canvas.width/2, canvas.height/2);
        context.textAlign = 'left';
    }
}

function getRandomColor() {
    const colors = [
        '#FF0000', '#00FF00', '#0000FF', 
        '#FFFF00', '#FF00FF', '#00FFFF',
        '#FFA500', '#800080', '#008000'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
}

function stopTowerSmash() {
    if (towerSmashState.gameLoop) {
        cancelAnimationFrame(towerSmashState.gameLoop);
    }
    if (towerSmashState.canvas) {
        towerSmashState.canvas.removeEventListener('click', handleTowerSmashClick);
        towerSmashState.canvas.removeEventListener('touchstart', handleTowerSmashClick);
    }
    gameActive = false;
}
// Snake Game Logic
let snakeState = {
    canvas: null,
    context: null,
    snake: [],
    food: { x: 0, y: 0 },
    direction: 'right',
    gridSize: 20,
    gameLoop: null,
    score: 0,
    speed: 150
};

function initSnakeGame() {
    const { canvas, context } = initializeCanvas('snake-game-canvas');
    if (!canvas || !context) return;

    snakeState.canvas = canvas;
    snakeState.context = context;
    snakeState.snake = [
        { x: 3, y: 1 },
        { x: 2, y: 1 },
        { x: 1, y: 1 }
    ];
    snakeState.direction = 'right';
    snakeState.score = 0;
    snakeState.speed = 150;

    placeFood();
    
    // Start game loop
    if (snakeState.gameLoop) clearInterval(snakeState.gameLoop);
    snakeState.gameLoop = setInterval(updateSnake, snakeState.speed);

    // Add event listeners
    document.addEventListener('keydown', handleSnakeKeyPress);
    canvas.addEventListener('touchstart', handleSnakeTouch);
}

function placeFood() {
    const { canvas, gridSize, snake } = snakeState;
    const maxX = Math.floor(canvas.width / gridSize);
    const maxY = Math.floor(canvas.height / gridSize);
    
    let newFood;
    do {
        newFood = {
            x: Math.floor(Math.random() * maxX),
            y: Math.floor(Math.random() * maxY)
        };
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    
    snakeState.food = newFood;
}

function updateSnake() {
    if (!gameActive) return;
    
    const { snake, direction, gridSize, canvas } = snakeState;
    
    // Calculate new head position
    const head = { ...snake[0] };
    switch(direction) {
        case 'up': head.y--; break;
        case 'down': head.y++; break;
        case 'left': head.x--; break;
        case 'right': head.x++; break;
    }
    
    // Check for collisions
    if (head.x < 0 || head.x >= canvas.width / gridSize ||
        head.y < 0 || head.y >= canvas.height / gridSize ||
        snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        showMessage(`Game Over! Score: ${snakeState.score}`, 'snake-game');
        stopSnakeGame();
        return;
    }
    
    // Add new head
    snake.unshift(head);
    
    // Check if food is eaten
    if (head.x === snakeState.food.x && head.y === snakeState.food.y) {
        snakeState.score += 10;
        placeFood();
        // Increase speed
        if (snakeState.speed > 50) {
            snakeState.speed -= 5;
            clearInterval(snakeState.gameLoop);
            snakeState.gameLoop = setInterval(updateSnake, snakeState.speed);
        }
    } else {
        // Remove tail if no food eaten
        snake.pop();
    }
    
    // Draw everything
    drawSnake();
}

function drawSnake() {
    const { canvas, context, snake, food, gridSize } = snakeState;
    
    // Clear canvas
    context.fillStyle = '#000';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw snake
    context.fillStyle = '#0f0';
    snake.forEach((segment, index) => {
        context.fillRect(
            segment.x * gridSize + 1,
            segment.y * gridSize + 1,
            gridSize - 2,
            gridSize - 2
        );
        
        // Draw eyes on head
        if (index === 0) {
            context.fillStyle = '#000';
            const eyeSize = 3;
            const eyeOffset = 4;
            
            // Left eye
            context.fillRect(
                segment.x * gridSize + eyeOffset,
                segment.y * gridSize + eyeOffset,
                eyeSize,
                eyeSize
            );
            
            // Right eye
            context.fillRect(
                segment.x * gridSize + gridSize - eyeOffset - eyeSize,
                segment.y * gridSize + eyeOffset,
                eyeSize,
                eyeSize
            );
            
            context.fillStyle = '#0f0';
        }
    });
    
    // Draw food
    context.fillStyle = '#f00';
    context.fillRect(
        food.x * gridSize,
        food.y * gridSize,
        gridSize,
        gridSize
    );
    
    // Draw score
    context.fillStyle = '#fff';
    context.font = '20px Arial';
    context.fillText(`Score: ${snakeState.score}`, 10, 30);
}

function handleSnakeKeyPress(event) {
    if (!gameActive) return;
    
    const { direction } = snakeState;
    switch(event.key) {
        case 'ArrowUp':
            if (direction !== 'down') snakeState.direction = 'up';
            break;
        case 'ArrowDown':
            if (direction !== 'up') snakeState.direction = 'down';
            break;
        case 'ArrowLeft':
            if (direction !== 'right') snakeState.direction = 'left';
            break;
        case 'ArrowRight':
            if (direction !== 'left') snakeState.direction = 'right';
            break;
    }
}

function handleSnakeTouch(event) {
    if (!gameActive) return;
    event.preventDefault();
    
    const touch = event.touches[0];
    const rect = snakeState.canvas.getBoundingClientRect();
    const touchX = touch.clientX - rect.left;
    const touchY = touch.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Calculate angle from center
    const angle = Math.atan2(touchY - centerY, touchX - centerX);
    const degrees = angle * 180 / Math.PI;
    
    // Convert angle to direction
    const { direction } = snakeState;
    if (degrees > -45 && degrees <= 45 && direction !== 'left') {
        snakeState.direction = 'right';
    } else if (degrees > 45 && degrees <= 135 && direction !== 'up') {
        snakeState.direction = 'down';
    } else if ((degrees > 135 || degrees <= -135) && direction !== 'right') {
        snakeState.direction = 'left';
    } else if (degrees > -135 && degrees <= -45 && direction !== 'down') {
        snakeState.direction = 'up';
    }
}

function stopSnakeGame() {
    if (snakeState.gameLoop) {
        clearInterval(snakeState.gameLoop);
    }
    document.removeEventListener('keydown', handleSnakeKeyPress);
    if (snakeState.canvas) {
        snakeState.canvas.removeEventListener('touchstart', handleSnakeTouch);
    }
    gameActive = false;
}
// 2048 Game Logic
let game2048State = {
    board: [],
    score: 0,
    size: 4,
    gameLoop: null,
    touchStartX: null,
    touchStartY: null
};

function init2048() {
    gameActive = true;
    game2048State.board = Array(4).fill().map(() => Array(4).fill(0));
    game2048State.score = 0;
    
    // Add initial tiles
    addNewTile();
    addNewTile();
    
    // Add event listeners
    document.addEventListener('keydown', handle2048KeyPress);
    const container = document.getElementById('game-2048-container');
    container.addEventListener('touchstart', handle2048TouchStart);
    container.addEventListener('touchmove', handle2048TouchMove);
    container.addEventListener('touchend', handle2048TouchEnd);
    
    render2048();
}

function addNewTile() {
    const availableCells = [];
    for(let i = 0; i < 4; i++) {
        for(let j = 0; j < 4; j++) {
            if(game2048State.board[i][j] === 0) {
                availableCells.push({x: i, y: j});
            }
        }
    }
    
    if(availableCells.length > 0) {
        const {x, y} = availableCells[Math.floor(Math.random() * availableCells.length)];
        game2048State.board[x][y] = Math.random() < 0.9 ? 2 : 4;
    }
}

function render2048() {
    const board = document.getElementById('game-2048-board');
    board.innerHTML = '';
    
    game2048State.board.forEach((row, i) => {
        row.forEach((cell, j) => {
            const tile = document.createElement('div');
            tile.className = `game-2048-tile value-${cell}`;
            tile.textContent = cell || '';
            tile.style.backgroundColor = getTileColor(cell);
            board.appendChild(tile);
        });
    });
    
    document.getElementById('2048-message').textContent = `Score: ${game2048State.score}`;
}

function getTileColor(value) {
    const colors = {
        0: '#cdc1b4',
        2: '#eee4da',
        4: '#ede0c8',
        8: '#f2b179',
        16: '#f59563',
        32: '#f67c5f',
        64: '#f65e3b',
        128: '#edcf72',
        256: '#edcc61',
        512: '#edc850',
        1024: '#edc53f',
        2048: '#edc22e'
    };
    return colors[value] || '#edc22e';
}

function move2048(direction) {
    let moved = false;
    const board = game2048State.board;
    
    // Helper function to merge tiles
    function mergeTiles(row) {
        const newRow = row.filter(cell => cell !== 0);
        for(let i = 0; i < newRow.length - 1; i++) {
            if(newRow[i] === newRow[i + 1]) {
                newRow[i] *= 2;
                game2048State.score += newRow[i];
                newRow.splice(i + 1, 1);
                moved = true;
            }
        }
        while(newRow.length < 4) newRow.push(0);
        return newRow;
    }
    
    // Move and merge tiles based on direction
    switch(direction) {
        case 'up':
            for(let j = 0; j < 4; j++) {
                let column = board.map(row => row[j]);
                let newColumn = mergeTiles(column);
                for(let i = 0; i < 4; i++) {
                    if(board[i][j] !== newColumn[i]) {
                        moved = true;
                        board[i][j] = newColumn[i];
                    }
                }
            }
            break;
            
        case 'down':
            for(let j = 0; j < 4; j++) {
                let column = board.map(row => row[j]).reverse();
                let newColumn = mergeTiles(column).reverse();
                for(let i = 0; i < 4; i++) {
                    if(board[i][j] !== newColumn[i]) {
                        moved = true;
                        board[i][j] = newColumn[i];
                    }
                }
            }
            break;
            
        case 'left':
            for(let i = 0; i < 4; i++) {
                let newRow = mergeTiles([...board[i]]);
                if(board[i].join(',') !== newRow.join(',')) {
                    moved = true;
                    board[i] = newRow;
                }
            }
            break;
            
        case 'right':
            for(let i = 0; i < 4; i++) {
                let newRow = mergeTiles([...board[i]].reverse()).reverse();
                if(board[i].join(',') !== newRow.join(',')) {
                    moved = true;
                    board[i] = newRow;
                }
            }
            break;
    }
    
    if(moved) {
        addNewTile();
        render2048();
        
        if(checkGameOver2048()) {
            showMessage('Game Over!', '2048');
            stop2048();
        }
        
        if(hasWon2048()) {
            showMessage('Congratulations! You\'ve reached 2048!', '2048');
            stop2048();
        }
    }
}

function handle2048KeyPress(event) {
    if(!gameActive) return;
    
    switch(event.key) {
        case 'ArrowUp': move2048('up'); break;
        case 'ArrowDown': move2048('down'); break;
        case 'ArrowLeft': move2048('left'); break;
        case 'ArrowRight': move2048('right'); break;
    }
}

function handle2048TouchStart(event) {
    if(!gameActive) return;
    const touch = event.touches[0];
    game2048State.touchStartX = touch.clientX;
    game2048State.touchStartY = touch.clientY;
}

function handle2048TouchMove(event) {
    if(!gameActive) return;
    event.preventDefault();
}

function handle2048TouchEnd(event) {
    if(!gameActive || !game2048State.touchStartX || !game2048State.touchStartY) return;
    
    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - game2048State.touchStartX;
    const deltaY = touch.clientY - game2048State.touchStartY;
    
    if(Math.abs(deltaX) > Math.abs(deltaY)) {
        if(Math.abs(deltaX) > 30) {
            move2048(deltaX > 0 ? 'right' : 'left');
        }
    } else {
        if(Math.abs(deltaY) > 30) {
            move2048(deltaY > 0 ? 'down' : 'up');
        }
    }
    
    game2048State.touchStartX = null;
    game2048State.touchStartY = null;
}

function checkGameOver2048() {
    // Check for empty cells
    for(let i = 0; i < 4; i++) {
        for(let j = 0; j < 4; j++) {
            if(game2048State.board[i][j] === 0) return false;
        }
    }
    
    // Check for possible merges
    for(let i = 0; i < 4; i++) {
        for(let j = 0; j < 4; j++) {
            const current = game2048State.board[i][j];
            if((i < 3 && current === game2048State.board[i + 1][j]) ||
               (j < 3 && current === game2048State.board[i][j + 1])) {
                return false;
            }
        }
    }
    
    return true;
}

function hasWon2048() {
    return game2048State.board.some(row => row.some(cell => cell === 2048));
}

function stop2048() {
    gameActive = false;
    document.removeEventListener('keydown', handle2048KeyPress);
    const container = document.getElementById('game-2048-container');
    container.removeEventListener('touchstart', handle2048TouchStart);
    container.removeEventListener('touchmove', handle2048TouchMove);
    container.removeEventListener('touchend', handle2048TouchEnd);
}// Stack Cake Game Logic
let stackCakeState = {
    canvas: null,
    context: null,
    cakes: [],
    currentCake: null,
    gravity: 0.5,
    cakeWidth: 80,
    cakeHeight: 30,
    score: 0,
    gameLoop: null,
    movingSpeed: 3,
    movingDirection: 1,
    lastCakePosition: null,
    gameStarted: false,
    perfectStacks: 0,
    cakeColors: [
        { fill: '#FFB6C1', frosting: '#FF69B4' },  // Pink cake
        { fill: '#98FB98', frosting: '#32CD32' },  // Green cake
        { fill: '#87CEEB', frosting: '#4169E1' },  // Blue cake
        { fill: '#DDA0DD', frosting: '#9400D3' },  // Purple cake
        { fill: '#F0E68C', frosting: '#DAA520' }   // Yellow cake
    ]
};

function initStackCake() {
    const { canvas, context } = initializeCanvas('stack-cake-canvas');
    if (!canvas || !context) return;

    stackCakeState.canvas = canvas;
    stackCakeState.context = context;
    stackCakeState.cakes = [];
    stackCakeState.score = 0;
    stackCakeState.perfectStacks = 0;
    stackCakeState.gameStarted = false;
    stackCakeState.movingSpeed = 3;
    
    // Add base cake
    const baseCake = {
        x: (canvas.width - stackCakeState.cakeWidth) / 2,
        y: canvas.height - stackCakeState.cakeHeight,
        width: stackCakeState.cakeWidth,
        height: stackCakeState.cakeHeight,
        colors: getRandomCakeColors()
    };
    stackCakeState.cakes.push(baseCake);
    stackCakeState.lastCakePosition = baseCake;
    
    // Create first moving cake
    createNewCake();
    
    // Start game loop
    if (stackCakeState.gameLoop) cancelAnimationFrame(stackCakeState.gameLoop);
    updateStackCake();
    
    // Add event listeners
    canvas.addEventListener('click', handleStackCakeClick);
    canvas.addEventListener('touchstart', handleStackCakeClick);
}

function getRandomCakeColors() {
    return stackCakeState.cakeColors[
        Math.floor(Math.random() * stackCakeState.cakeColors.length)
    ];
}

function createNewCake() {
    const state = stackCakeState;
    const lastCake = state.lastCakePosition;
    
    state.currentCake = {
        x: 0,
        y: lastCake.y - state.cakeHeight,
        width: state.cakeWidth,
        height: state.cakeHeight,
        colors: getRandomCakeColors(),
        moving: true
    };
    
    // Increase difficulty
    state.movingSpeed += 0.1;
}

function updateStackCake() {
    if (!gameActive) return;
    
    const state = stackCakeState;
    const { canvas, currentCake, movingSpeed, movingDirection } = state;
    
    // Move current cake
    if (currentCake && currentCake.moving) {
        currentCake.x += movingSpeed * movingDirection;
        
        // Bounce off walls
        if (currentCake.x + currentCake.width > canvas.width) {
            state.movingDirection = -1;
        } else if (currentCake.x < 0) {
            state.movingDirection = 1;
        }
    }
    
    // Draw everything
    drawStackCake();
    
    // Continue game loop
    state.gameLoop = requestAnimationFrame(updateStackCake);
}

function drawStackCake() {
    const state = stackCakeState;
    const { canvas, context, cakes, currentCake } = state;
    
    // Clear canvas
    context.fillStyle = '#FFF5EE'; // Cream background
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw stacked cakes
    cakes.forEach(cake => drawCake(context, cake));
    
    // Draw current moving cake
    if (currentCake) {
        drawCake(context, currentCake);
    }
    
    // Draw score
    context.fillStyle = '#8B4513';
    context.font = '20px Arial';
    context.fillText(`Score: ${state.score}`, 10, 30);
    context.fillText(`Perfect Stacks: ${state.perfectStacks}`, 10, 60);
    
    // Draw instructions if game hasn't started
    if (!state.gameStarted) {
        context.fillStyle = 'rgba(139, 69, 19, 0.7)';
        context.font = '24px Arial';
        context.textAlign = 'center';
        context.fillText('Click or Tap to Stack the Cake!', canvas.width/2, canvas.height/2);
        context.textAlign = 'left';
    }
}

function drawCake(context, cake) {
    // Draw main cake body
    context.fillStyle = cake.colors.fill;
    context.beginPath();
    context.roundRect(cake.x, cake.y, cake.width, cake.height, 5);
    context.fill();
    
    // Draw frosting
    context.fillStyle = cake.colors.frosting;
    context.beginPath();
    context.moveTo(cake.x, cake.y);
    for(let i = 0; i <= cake.width; i += 10) {
        context.quadraticCurveTo(
            cake.x + i + 5, cake.y - 5,
            cake.x + i + 10, cake.y
        );
    }
    context.lineTo(cake.x + cake.width, cake.y + 5);
    context.lineTo(cake.x, cake.y + 5);
    context.fill();
}

function handleStackCakeClick(event) {
    if (!gameActive) return;
    event.preventDefault();
    
    const state = stackCakeState;
    if (!state.currentCake || !state.currentCake.moving) return;
    
    state.gameStarted = true;
    state.currentCake.moving = false;
    
    // Calculate overlap with previous cake
    const prevCake = state.lastCakePosition;
    const overlap = calculateCakeOverlap(prevCake, state.currentCake);
    
    if (overlap <= 0) {
        // Game over - cake missed
        showMessage(`Game Over! Score: ${state.score}`, 'stack-cake');
        stopStackCake();
        return;
    }
    
    // Perfect stack bonus
    const perfectStack = Math.abs(prevCake.x - state.currentCake.x) < 2;
    if (perfectStack) {
        state.perfectStacks++;
        state.score += 50;
        showTemporaryMessage('Perfect Stack!', 1000);
    }
    
    // Adjust cake size based on overlap
    state.currentCake.width = overlap;
    state.currentCake.x = Math.max(prevCake.x, state.currentCake.x);
    
    // Add cake to stack
    state.cakes.push(state.currentCake);
    state.lastCakePosition = state.currentCake;
    state.score += 10;
    
    // Create new cake
    createNewCake();
}

function calculateCakeOverlap(cake1, cake2) {
    const left = Math.max(cake1.x, cake2.x);
    const right = Math.min(cake1.x + cake1.width, cake2.x + cake2.width);
    return right - left;
}

function stopStackCake() {
    if (stackCakeState.gameLoop) {
        cancelAnimationFrame(stackCakeState.gameLoop);
    }
    if (stackCakeState.canvas) {
        stackCakeState.canvas.removeEventListener('click', handleStackCakeClick);
        stackCakeState.canvas.removeEventListener('touchstart', handleStackCakeClick);
    }
    gameActive = false;
}

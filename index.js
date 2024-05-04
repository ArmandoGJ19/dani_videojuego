const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 600;

let player = {
    x: canvas.width / 2 - 15,
    y: canvas.height - 70,
    width: 50,
    height: 50,
    speed: 12
};
let bullets = [];
let enemies = [];
let killCount = 0;  // Variable para contar los enemigos eliminados
let missedEnemies = 0;  // Variable para contar los enemigos perdidos
let missedLimit = 15;  // Límite de enemigos perdidos antes de perder
let victoryPointGoal = 40; // Puedes ajustar este número según la dificultad deseada

let gameOver = false;
let enemyImage = new Image();
enemyImage.src = 'prueba.png';
let playerImage = new Image();
document.getElementById('playerSelect').addEventListener('change', function() {
    changePlayerImage();
});
let shootImage = new Image();
shootImage.src = 'shoot.png';
 let imagesLoaded = 0;
enemyImage.onload = imageLoaded;
playerImage.onload = imageLoaded;
shootImage.onload = imageLoaded;

function startGame() {
    changePlayerImage(); // Asegura que se carga la imagen seleccionada
    const modal = document.getElementById('playerSelectionModal');
    modal.style.display = 'none'; // Oculta el modal de selección de jugador

    gameOver = false; // Establece el estado de Game Over
    missedEnemies = 0; // Reiniciar el conteo de enemigos perdidos
    killCount = 0; // Reiniciar el conteo de enemigos eliminados

    createEnemies(1); // Crea un enemigo inicial para comenzar
    updateGame(); // Inicia el loop del juego
    spawnEnemies(); // Comienza a generar enemigos solo después de seleccionar el jugador
}

function changePlayerImage() {
    let selectedOption = document.getElementById('playerSelect').value;
    playerImage.src = selectedOption; // Asegúrate de que las rutas coincidan con las opciones de valor
}
function imageLoaded() {
    imagesLoaded++;
    if (imagesLoaded === 3) { // Comprueba si todas las imágenes necesarias están cargadas
        changePlayerImage();  // Establece la imagen del jugador inicial
        createEnemies(3);
        updateGame();
        spawnEnemies();
    }
}


function createEnemies(count) {
    for (let i = 0; i < count; i++) {
        enemies.push({
            x: Math.random() * (canvas.width - 50),
            y: Math.random() * 100,
            width: 70,
            height: 70,
            speed: 0.2
        });
    }
}

function spawnEnemies() {
    if (!gameOver) {
        const newEnemiesCount = Math.floor(Math.random() * 4) + 1;
        createEnemies(newEnemiesCount);
        setTimeout(spawnEnemies, Math.random() * 4000 + 3000);
    }
}
function drawPlayer() {
    const playerRatio = playerImage.naturalWidth / playerImage.naturalHeight;
    const playerHeight = player.width / playerRatio;
    ctx.drawImage(playerImage, player.x, player.y, player.width, playerHeight);

}

function drawEnemies() {
    enemies.forEach((enemy, index) => {
        if (enemy.y >= canvas.height) {
            enemies.splice(index, 1);
            missedEnemies++;
            if (missedEnemies >= missedLimit) {
                gameOver = true;
                return;
            }
        }
        // Asegura mantener la proporción original de la imagen del enemigo
        const enemyRatio = enemyImage.naturalWidth / enemyImage.naturalHeight;
        const enemyHeight = enemy.width / enemyRatio;
        ctx.drawImage(enemyImage, enemy.x, enemy.y, enemy.width, enemyHeight);
        enemy.y += enemy.speed;
    });
}

function createBullet() {
    bullets.push({
        x: player.x + player.width / 2 - 5,  // Asegura que el disparo salga del centro del jugador
        y: player.y,
        width: 30,
        height: 30,
        speed: 3
    });
}

function drawBullets() {
    bullets.forEach(bullet => {
        ctx.drawImage(shootImage, bullet.x, bullet.y, bullet.width, bullet.height);
        bullet.y -= bullet.speed;  // Mueve el disparo hacia arriba
    });

    // Elimina los disparos que salen del canvas
    bullets = bullets.filter(bullet => bullet.y + bullet.height > 0);
}
function checkCollisions() {
    bullets.forEach(bullet => {
        enemies.forEach((enemy, index) => {
            if (bullet.x < enemy.x + enemy.width &&
                bullet.x + bullet.width > enemy.x &&
                bullet.y < enemy.y + enemy.height &&
                bullet.y + bullet.height > enemy.y) {
                // Colisión detectada, elimina el enemigo y el disparo
                enemies.splice(index, 1);
                bullets = bullets.filter(b => b !== bullet);
                killCount += 1;  // Incrementa el contador de enemigos eliminados
                if (killCount >= victoryPointGoal) {
                    showVictoryModal();  // Muestra el modal de victoria si se alcanza el objetivo
                }
            }
        });
    });
}
function showVictoryModal() {
    const victoryModal = document.getElementById('victoryModal');
    const victoryMessage = document.getElementById('victoryMessage');
    let selectedOptionText = document.querySelector("#playerSelect option:checked").text; // Obtiene el texto del personaje seleccionado

    victoryMessage.textContent = `¡Has ganado una photocard de ${selectedOptionText}!`; // Personaliza el mensaje con el nombre del personaje
    victoryModal.style.display = 'flex'; // Muestra el modal de victoria

    gameOver = true; // Para el juego
}

function drawKillCount() {
    ctx.fillStyle = 'yellow';
    ctx.font = '20px Arial';
    ctx.fillText('Enemigos eliminados: ' + killCount, 10, 30);  // Muestra el contador en la parte superior izquierda del canvas
}
function drawEnemiesMissed() {
    ctx.fillStyle = 'red';
    ctx.font = '20px Arial';
    ctx.fillText('Enemigos perdidos: ' + missedEnemies, 10, 60);
}
function showGameOverModal() {
    const modal = document.getElementById('gameOverModal');
    modal.style.display = 'flex'; // Muestra el modal
}
function restartGame() {
    const gameOverModal = document.getElementById('gameOverModal');
    const victoryModal = document.getElementById('victoryModal');

    victoryModal.style.display = 'none'; // Oculta el modal de victoria
    gameOverModal.style.display = 'none'; // Oculta el modal de Game Over

    const playerSelectionModal = document.getElementById('playerSelectionModal');
    playerSelectionModal.style.display = 'flex'; // Muestra el modal de selección de jugador para elegir de nuevo

    gameOver = false;
    missedEnemies = 0;
    killCount = 0;
    enemies = [];  // Limpia la lista de enemigos
    bullets = [];  // Limpia la lista de balas

}
function updateGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPlayer();
    drawEnemies();
    drawBullets();
    drawKillCount();
    checkCollisions();
    drawEnemiesMissed();
    if (gameOver) {
        ctx.fillStyle = 'red';
        ctx.font = '40px Arial';
        ctx.fillText('GAME OVER', canvas.width / 2 - 100, canvas.height / 2);
        showGameOverModal();
    } else {
        requestAnimationFrame(updateGame);
    }
}

document.addEventListener('keydown', function(event) {
    if (!gameOver) {
        if (event.key === 'ArrowLeft' && player.x > 0) {
            player.x -= player.speed;
        } else if (event.key === 'ArrowRight' && player.x + player.width < canvas.width) {
            player.x += player.speed;
        } else if (event.key === ' ') {
            createBullet();
        }
    }
});



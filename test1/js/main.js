const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 900;
canvas.height = 600;

// 全局变量
let gameGrid = [];
let plants = [];
let zombies = [];
let projectiles = [];
let suns = [];
let frame = 0;
let score = 0;
let sunAmount = 100; // 初始阳光
let gameOver = false;
let selectedPlantType = null;

// 鼠标控制
const mouse = {
    x: undefined,
    y: undefined,
    width: 0.1,
    height: 0.1,
    clicked: false
};

// UI 元素
const sunElement = document.getElementById('sun-amount');
const plantCards = document.querySelectorAll('.plant-card');
const gameOverScreen = document.getElementById('game-over-screen');

// 初始化网格
function createGrid() {
    for (let y = TOP_OFFSET; y < canvas.height; y += CELL_HEIGHT) {
        for (let x = 0; x < canvas.width; x += CELL_WIDTH) {
            gameGrid.push(new Cell(x, y));
        }
    }
}
createGrid();

// 事件监听
canvas.addEventListener('mousemove', function(e) {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
});

canvas.addEventListener('mouseleave', function() {
    mouse.x = undefined;
    mouse.y = undefined;
});

canvas.addEventListener('click', function(e) {
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    
    // 收集阳光
    let sunClicked = false;
    for (let i = suns.length - 1; i >= 0; i--) {
        const sun = suns[i];
        const dx = clickX - sun.x;
        const dy = clickY - sun.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 30) {
            sunAmount += sun.value;
            suns.splice(i, 1);
            sunClicked = true;
            updateSunDisplay();
            break;
        }
    }

    if (!sunClicked && selectedPlantType) {
        // 尝试放置植物
        const gridPositionX = clickX - (clickX % CELL_WIDTH);
        const gridPositionY = clickY - ((clickY - TOP_OFFSET) % CELL_HEIGHT) + (clickY < TOP_OFFSET ? (TOP_OFFSET - clickY) : 0);
        
        if (clickY < TOP_OFFSET) return; // 点击了上方区域

        // 检查该位置是否有植物
        let occupied = false;
        for (let i = 0; i < plants.length; i++) {
            if (plants[i].x === gridPositionX && plants[i].y === gridPositionY) {
                occupied = true;
                break;
            }
        }

        if (!occupied) {
            let cost = 0;
            if (selectedPlantType === 'peashooter') cost = 100;
            else if (selectedPlantType === 'sunflower') cost = 50;
            else if (selectedPlantType === 'wallnut') cost = 50;

            if (sunAmount >= cost) {
                if (selectedPlantType === 'peashooter') {
                    plants.push(new Peashooter(gridPositionX, gridPositionY));
                } else if (selectedPlantType === 'sunflower') {
                    plants.push(new Sunflower(gridPositionX, gridPositionY));
                } else if (selectedPlantType === 'wallnut') {
                    plants.push(new WallNut(gridPositionX, gridPositionY));
                }
                sunAmount -= cost;
                updateSunDisplay();
            }
        }
    }
});

function selectPlant(type) {
    selectedPlantType = type;
    plantCards.forEach(card => card.classList.remove('selected'));
    document.querySelector(`.plant-card[data-plant="${type}"]`).classList.add('selected');
}

function updateSunDisplay() {
    sunElement.innerText = sunAmount;
}

// 辅助函数：碰撞检测
function collision(first, second) {
    if (    !(  first.x > second.x + second.width ||
                first.x + first.width < second.x ||
                first.y > second.y + second.height ||
                first.y + first.height < second.y)
    ) {
        return true;
    }
    return false;
}

// 游戏循环
function animate() {
    if (gameOver) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 绘制网格
    for (let i = 0; i < gameGrid.length; i++) {
        gameGrid[i].draw(ctx, mouse.x, mouse.y);
    }

    // 处理植物
    for (let i = 0; i < plants.length; i++) {
        plants[i].draw(ctx);
        
        // 寻找同一行的僵尸
        let laneZombies = zombies.filter(z => z.y === plants[i].y);
        plants[i].update(projectiles, laneZombies, suns);
        
        // 检查植物是否死亡
        if (plants[i].health <= 0) {
            plants.splice(i, 1);
            i--;
        }
    }

    // 处理僵尸
    if (frame % 200 === 0) { // 每200帧生成一个僵尸
        const verticalPosition = Math.floor(Math.random() * 5) * CELL_HEIGHT + TOP_OFFSET;
        zombies.push(new Zombie(verticalPosition));
    }

    for (let i = 0; i < zombies.length; i++) {
        zombies[i].draw(ctx);
        if (zombies[i].update(plants)) {
            // 僵尸到达左侧
            gameOver = true;
            gameOverScreen.classList.remove('hidden');
        }
        
        // 僵尸攻击植物
        zombies[i].isAttacking = false;
        for (let j = 0; j < plants.length; j++) {
            if (collision(zombies[i], plants[j])) {
                zombies[i].isAttacking = true;
                zombies[i].speed = 0; // 停止移动
                plants[j].health -= zombies[i].damage;
            }
        }
        if (!zombies[i].isAttacking) {
            zombies[i].speed = zombies[i].movementSpeed;
        }

        if (zombies[i].health <= 0) {
            zombies.splice(i, 1);
            score += 10;
            i--;
        }
    }

    // 处理投射物
    for (let i = 0; i < projectiles.length; i++) {
        projectiles[i].update();
        projectiles[i].draw(ctx);

        // 投射物击中僵尸
        for (let j = 0; j < zombies.length; j++) {
            if (collision(projectiles[i], zombies[j])) {
                zombies[j].health -= projectiles[i].power;
                projectiles[i].markedForDeletion = true;
                break; // 一个豌豆只能打一个僵尸
            }
        }

        if (projectiles[i].markedForDeletion) {
            projectiles.splice(i, 1);
            i--;
        }
    }

    // 处理阳光（自然掉落）
    if (frame % 500 === 0 && frame > 0) {
        let x = Math.random() * (canvas.width - 50);
        suns.push(new Sun(x, -50, 25));
    }

    for (let i = 0; i < suns.length; i++) {
        suns[i].update();
        suns[i].draw(ctx);
    }

    frame++;
    requestAnimationFrame(animate);
}

function restartGame() {
    plants = [];
    zombies = [];
    projectiles = [];
    suns = [];
    frame = 0;
    score = 0;
    sunAmount = 100;
    gameOver = false;
    updateSunDisplay();
    gameOverScreen.classList.add('hidden');
    animate();
}

// 启动游戏
animate();

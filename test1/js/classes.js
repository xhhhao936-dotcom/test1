class Cell {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = CELL_WIDTH;
        this.height = CELL_HEIGHT;
    }

    draw(ctx, mouseX, mouseY) {
        ctx.strokeStyle = 'black';
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        
        // 简单的格子颜色交替
        // 计算行和列
        let col = this.x / CELL_WIDTH;
        let row = (this.y - TOP_OFFSET) / CELL_HEIGHT;
        if ((row + col) % 2 === 0) {
            ctx.fillStyle = COLORS.GRASS_LIGHT;
        } else {
            ctx.fillStyle = COLORS.GRASS_DARK;
        }
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // 鼠标悬停效果
        if (mouse && mouse.x >= this.x && mouse.x < this.x + this.width &&
            mouse.y >= this.y && mouse.y < this.y + this.height) {
            ctx.fillStyle = COLORS.HOVER;
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }
}

class Plant {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = CELL_WIDTH - 10;
        this.height = CELL_HEIGHT - 10;
        this.health = 100;
        this.timer = 0;
    }

    draw(ctx) {
        // 基类绘制方法，子类应覆盖
        ctx.fillStyle = 'green';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // 绘制血条
        ctx.fillStyle = 'red';
        ctx.fillRect(this.x, this.y, this.width, 5);
        ctx.fillStyle = 'green';
        ctx.fillRect(this.x, this.y, this.width * (this.health / this.maxHealth), 5);
    }

    update() {
        // 基类更新逻辑
    }
}

class Peashooter extends Plant {
    constructor(x, y) {
        super(x, y);
        this.health = 100;
        this.maxHealth = 100;
        this.cost = 100;
        this.shootInterval = 100; // 射击间隔（帧数）
    }

    draw(ctx) {
        // 绘制豌豆射手 (绿色圆形)
        ctx.fillStyle = '#00cc00';
        ctx.beginPath();
        ctx.arc(this.x + 50, this.y + 50, 35, 0, Math.PI * 2);
        ctx.fill();
        
        // 嘴巴
        ctx.fillStyle = '#006600';
        ctx.beginPath();
        ctx.arc(this.x + 70, this.y + 40, 10, 0, Math.PI * 2);
        ctx.fill();
        
        super.draw(ctx);
    }

    update(projectiles, laneZombies) {
        this.timer++;
        // 只有当该行有僵尸时才射击
        if (this.timer % this.shootInterval === 0) {
            if (laneZombies && laneZombies.length > 0) {
                projectiles.push(new Projectile(this.x + 70, this.y + 40));
            }
        }
    }
}

class Sunflower extends Plant {
    constructor(x, y) {
        super(x, y);
        this.health = 80;
        this.maxHealth = 80;
        this.cost = 50;
        this.sunInterval = 500; // 产生阳光间隔
    }

    draw(ctx) {
        // 绘制向日葵 (黄色圆形)
        ctx.fillStyle = '#ffeb3b';
        ctx.beginPath();
        ctx.arc(this.x + 50, this.y + 50, 35, 0, Math.PI * 2);
        ctx.fill();
        
        // 花瓣 (简单表示)
        ctx.strokeStyle = '#ff9800';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(this.x + 50, this.y + 50, 40, 0, Math.PI * 2);
        ctx.stroke();
        ctx.lineWidth = 1;

        super.draw(ctx);
    }

    update(projectiles, laneZombies, suns) {
        this.timer++;
        if (this.timer % this.sunInterval === 0) {
            suns.push(new Sun(this.x + 50, this.y + 50, 25));
        }
    }
}

class WallNut extends Plant {
    constructor(x, y) {
        super(x, y);
        this.health = 400; // 高血量
        this.maxHealth = 400;
        this.cost = 50;
    }

    draw(ctx) {
        // 绘制坚果 (棕色椭圆)
        ctx.fillStyle = '#8b4513';
        ctx.beginPath();
        ctx.ellipse(this.x + 50, this.y + 50, 30, 40, 0, 0, Math.PI * 2);
        ctx.fill();

        // 眼睛
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(this.x + 40, this.y + 40, 8, 0, Math.PI * 2);
        ctx.arc(this.x + 60, this.y + 40, 8, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(this.x + 42, this.y + 40, 3, 0, Math.PI * 2);
        ctx.arc(this.x + 62, this.y + 40, 3, 0, Math.PI * 2);
        ctx.fill();

        super.draw(ctx);
    }

    update() {
        // 坚果不做任何事，就是挡着
    }
}

class Projectile {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 10;
        this.height = 10;
        this.speed = 5;
        this.power = 20;
        this.markedForDeletion = false;
    }

    update() {
        this.x += this.speed;
        if (this.x > 900) this.markedForDeletion = true;
    }

    draw(ctx) {
        ctx.fillStyle = '#0f0';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.width, 0, Math.PI * 2);
        ctx.fill();
    }
}

class Zombie {
    constructor(verticalPosition) {
        this.x = 900;
        this.y = verticalPosition;
        this.width = CELL_WIDTH - 10;
        this.height = CELL_HEIGHT - 10;
        this.movementSpeed = Math.random() * 0.1 + 0.2;
        this.speed = this.movementSpeed;
        this.health = 100;
        this.maxHealth = 100;
        this.damage = 1; // 每帧伤害
        this.attackInterval = 60;
        this.timer = 0;
        this.markedForDeletion = false;
        this.isAttacking = false;
    }

    update(gamePlants) {
        // 移动
        if (!this.isAttacking) {
            this.x -= this.speed;
        }

        if (this.x < 0) {
            // 僵尸到达左侧，游戏结束
            return true; // 返回 true 表示触发 Game Over
        }
        return false;
    }

    draw(ctx) {
        // 绘制僵尸图片
        ctx.drawImage(zombieImage, this.x, this.y, this.width, this.height);

        // 绘制血条
        ctx.fillStyle = 'red';
        ctx.fillRect(this.x, this.y - 10, this.width, 5);
        ctx.fillStyle = 'green';
        ctx.fillRect(this.x, this.y - 10, this.width * (this.health / this.maxHealth), 5);
    }
}

class Sun {
    constructor(x, y, value) {
        this.x = x;
        this.y = y;
        this.value = value;
        this.width = 50;
        this.height = 50;
        this.markedForDeletion = false;
        this.targetY = y; // 目标位置（如果是天上掉下来的）
        
        // 如果是从天上掉下来的，初始Y是负数，目标Y是随机位置
        if (y < 0) {
            this.targetY = Math.random() * 500 + 50;
        }
    }

    update() {
        if (this.y < this.targetY) {
            this.y += 2;
        }
    }

    draw(ctx) {
        ctx.fillStyle = '#ffff00';
        ctx.beginPath();
        ctx.arc(this.x, this.y, 25, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffa500';
        ctx.stroke();
    }
}

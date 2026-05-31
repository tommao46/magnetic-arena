// ============================================================
//  金币 — 金币收集品
//  仿照 kkk/gameplay/collectibles/Coin.gd 设计
// ============================================================

class Coin {
    constructor(x, y, value = 1) {
        this.x = x;
        this.y = y;
        this.value = value;
        this.radius = 10;
        this.collected = false;
        this.bobOffset = 0;
        this.bobSpeed = 0.05 + Math.random() * 0.03;
        this.bobPhase = Math.random() * Math.PI * 2;
    }

    update(delta, time) {
        this.bobOffset = Math.sin(time * this.bobSpeed + this.bobPhase) * 3;
    }

    draw(ctx, time) {
        if (this.collected) return;

        const drawY = this.y + this.bobOffset;

        // 光晕
        const glowAlpha = 0.2 + Math.sin(time * 3) * 0.1;
        ctx.fillStyle = `rgba(255, 200, 0, ${glowAlpha})`;
        ctx.beginPath();
        ctx.arc(this.x, drawY, this.radius + 4, 0, Math.PI * 2);
        ctx.fill();

        // 金币本体渐变色
        const grad = ctx.createRadialGradient(this.x - 1, drawY - 1, 1, this.x, drawY, this.radius);
        grad.addColorStop(0, '#fff8c0');
        grad.addColorStop(0.4, '#ffd700');
        grad.addColorStop(1, '#b8860b');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(this.x, drawY, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // $ 符号
        ctx.fillStyle = '#8b6914';
        ctx.font = '10px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.value > 1 ? '$' + this.value : '$', this.x, drawY);
        ctx.textAlign = 'start';
        ctx.textBaseline = 'alphabetic';
    }

    // 检测与玩家碰撞
    checkCollision(playerPos, playerRadius) {
        if (this.collected) return false;
        const dx = this.x - playerPos.x;
        const dy = this.y - playerPos.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        return dist < (this.radius + playerRadius);
    }

    // 收集
    collect() {
        this.collected = true;
        return this.value;
    }
}

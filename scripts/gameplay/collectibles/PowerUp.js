// ============================================================
//  道具 — 临时磁力增强道具
//  仿照 kkk/gameplay/collectibles/PowerUp.gd 设计
// ============================================================

class PowerUp {
    constructor(x, y, type = 'magnetic') {
        this.x = x;
        this.y = y;
        this.type = type;
        this.radius = 14;
        this.collected = false;
        this.rotation = 0;
    }

    update(delta) {
        this.rotation += delta * 2;
    }

    draw(ctx) {
        if (this.collected) return;

        // 旋转的菱形
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        const half = 10;
        ctx.fillStyle = 'rgba(170, 60, 240, 0.6)';
        ctx.beginPath();
        ctx.moveTo(0, -half);
        ctx.lineTo(half, 0);
        ctx.lineTo(0, half);
        ctx.lineTo(-half, 0);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = 'rgba(200, 100, 255, 0.8)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // ? 符号
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('?', 0, 0);

        ctx.restore();
    }

    checkCollision(playerPos, playerRadius) {
        if (this.collected) return false;
        const dx = this.x - playerPos.x;
        const dy = this.y - playerPos.y;
        return (dx * dx + dy * dy) < (this.radius + playerRadius) * (this.radius + playerRadius);
    }

    collect(player) {
        this.collected = true;
        // 临时增强磁力
        const originalForce = player.magneticForce;
        player.magneticForce = originalForce * 3;
        setTimeout(() => {
            player.magneticForce = originalForce;
        }, 5000);
        return this.type;
    }
}

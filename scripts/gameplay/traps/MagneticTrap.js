// ============================================================
//  MagneticTrap — 磁力陷阱系统
//  陷阱类型：减速区、极性反转区、排斥爆发区、吸引漩涡
// ============================================================

const TRAP_TYPES = {
    slow:       { name: '减速区',   color: '#ff6644', glowColor: '#ff4400', effect: 'slow',  icon: '🐌' },
    reverse:    { name: '反极区',   color: '#cc66ff', glowColor: '#8822cc', effect: 'reverse', icon: '🔄' },
    repelBurst: { name: '排斥爆发', color: '#ff4466', glowColor: '#cc0033', effect: 'repelBurst', icon: '💥' },
    attract:    { name: '吸引漩涡', color: '#4488ff', glowColor: '#0044cc', effect: 'attract', icon: '🌀' },
};

class MagneticTrap {
    constructor(x, y, tileSize, mapChar, id) {
        this.x = x;
        this.y = y;
        this.w = tileSize;
        this.h = tileSize;
        this.cx = x + tileSize / 2;
        this.cy = y + tileSize / 2;
        this.id = id || 0;
        this.triggerRadius = tileSize * 0.6;
        this.cooldownMap = new Map();

        // 根据地图字符分配陷阱类型
        const trapKeys = Object.keys(TRAP_TYPES);
        const idx = (mapChar.charCodeAt(0) + id) % trapKeys.length;
        this.typeKey = trapKeys[idx];
        this.type = TRAP_TYPES[this.typeKey];

        this.pulsePhase = Math.random() * Math.PI * 2;
        this.particleTimer = 0;
    }

    getCooldown(playerId) {
        return this.cooldownMap.get(playerId) || 0;
    }

    setCooldown(playerId, time) {
        this.cooldownMap.set(playerId, time);
    }

    update(delta) {
        this.pulsePhase += delta * 3;
        // 更新所有玩家的冷却
        for (const [pid, cd] of this.cooldownMap) {
            if (cd > 0) {
                this.cooldownMap.set(pid, Math.max(0, cd - delta));
            }
        }
    }

    trigger(player, delta) {
        const pid = player.playerId;
        const cd = this.getCooldown(pid);
        if (cd > 0) return null;

        this.setCooldown(pid, 1.5);

        switch (this.type.effect) {
            case 'slow':
                return { type: 'slow', player: pid, msg: '🐌 减速!' };

            case 'reverse':
                return { type: 'reverse', player: pid, msg: '🔄 极反转!' };

            case 'repelBurst': {
                const dirX = player.x - this.cx;
                const dirY = player.y - this.cy;
                const len = Math.sqrt(dirX * dirX + dirY * dirY) || 1;
                return { type: 'repelBurst', player: pid, msg: '💥 排斥爆发!',
                    vx: (dirX / len) * 500, vy: (dirY / len) * 500 };
            }

            case 'attract':
                return { type: 'attract', player: pid, msg: '🌀 吸引漩涡!',
                    cx: this.cx, cy: this.cy, force: 400 };
        }
        return null;
    }

    checkCollision(px, py, radius) {
        const dx = Math.abs(px - this.cx);
        const dy = Math.abs(py - this.cy);
        const dist = Math.sqrt(dx * dx + dy * dy);
        return dist < (this.triggerRadius + radius);
    }

    draw(ctx, time) {
        const pulse = 0.6 + Math.sin(this.pulsePhase) * 0.4;
        const t = this.type;
        const halfW = this.w / 2;
        const halfH = this.h / 2;

        // 底部脉冲光晕
        ctx.fillStyle = t.glowColor.replace(')', `,${0.15 * pulse})`).replace('rgb', 'rgba');
        ctx.beginPath();
        ctx.arc(this.cx, this.cy, halfW * 0.8 * (1 + 0.2 * pulse), 0, Math.PI * 2);
        ctx.fill();

        // 陷阱主体 — 菱形旋转
        ctx.save();
        ctx.translate(this.cx, this.cy);
        ctx.rotate(time * 0.5 + this.id * 0.7);

        ctx.fillStyle = t.glowColor.replace(')', `,${0.3 * pulse})`).replace('rgb', 'rgba');
        ctx.beginPath();
        const r = halfW * 0.7;
        ctx.moveTo(0, -r);
        ctx.lineTo(r, 0);
        ctx.lineTo(0, r);
        ctx.lineTo(-r, 0);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = t.color;
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.restore();

        // 图标
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.globalAlpha = 0.8;
        ctx.fillText(t.icon, this.cx, this.cy);
        ctx.globalAlpha = 1;
        ctx.textAlign = 'start';
        ctx.textBaseline = 'alphabetic';
    }
}

// ============================================================
//  特效生成器 — 管理游戏内粒子/文字特效
//  包含：浮动文字、金币粒子爆发、传送波纹、冲刺火花
//  仿照 kkk/gameplay/effects/EffectSpawner.gd 设计
// ============================================================

class EffectSpawner {
    constructor() {
        this.effects = [];
        this.particles = [];
    }

    // 在指定位置生成收集文字特效（上浮+缩放+淡出）
    spawnCollectText(x, y, text, color = '#ffd700') {
        this.effects.push({
            type: 'floatText',
            x, y,
            text,
            color,
            life: 1.2,
            maxLife: 1.2,
            vy: -70,
            scale: 1,
            scaleSpeed: 0.3
        });
        SignalBus.emit('effectSpawned', 'collectText', x, y);
    }

    // 金币收集粒子爆发
    spawnCoinBurst(x, y) {
        const count = 8;
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const speed = 60 + Math.random() * 80;
            this.particles.push({
                type: 'coinParticle',
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 0.5 + Math.random() * 0.3,
                maxLife: 0.5 + Math.random() * 0.3,
                size: 2 + Math.random() * 3,
                color: Math.random() > 0.5 ? '#ffd700' : '#fff8c0'
            });
        }
    }

    // 传送特效
    spawnTeleportEffect(x, y) {
        this.effects.push({
            type: 'teleport',
            x, y,
            life: 0.5,
            maxLife: 0.5
        });
        // 传送粒子环
        const count = 12;
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const speed = 100 + Math.random() * 50;
            this.particles.push({
                type: 'tpParticle',
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 0.4,
                maxLife: 0.4,
                size: 2 + Math.random() * 3,
                color: '#cc66ff'
            });
        }
        SignalBus.emit('effectSpawned', 'teleport', x, y);
    }

    // 冲刺碰撞火花
    spawnDashSpark(x, y) {
        const count = 6;
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
            const speed = 120 + Math.random() * 100;
            this.particles.push({
                type: 'spark',
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 0.3 + Math.random() * 0.2,
                maxLife: 0.3 + Math.random() * 0.2,
                size: 2 + Math.random() * 3,
                color: '#ffff55'
            });
        }
    }

    // 结算抵达特效
    spawnSettleEffect(x, y) {
        const count = 16;
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const speed = 50 + Math.random() * 60;
            this.particles.push({
                type: 'settleParticle',
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 0.8 + Math.random() * 0.4,
                maxLife: 0.8 + Math.random() * 0.4,
                size: 2 + Math.random() * 4,
                color: Math.random() > 0.3 ? '#55ff55' : '#ffffff'
            });
        }
    }

    // 更新所有特效
    update(delta) {
        // 更新文字特效
        for (let i = this.effects.length - 1; i >= 0; i--) {
            const ef = this.effects[i];
            ef.life -= delta;
            if (ef.life <= 0) {
                this.effects.splice(i, 1);
                continue;
            }
            if (ef.type === 'floatText') {
                ef.y += ef.vy * delta;
                ef.scale += ef.scaleSpeed * delta;
            }
        }

        // 更新粒子
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.life -= delta;
            if (p.life <= 0) {
                this.particles.splice(i, 1);
                continue;
            }
            p.x += p.vx * delta;
            p.y += p.vy * delta;
            p.vx *= 0.96;
            p.vy *= 0.96;
        }
    }

    // 绘制所有特效
    draw(ctx) {
        // 绘制粒子
        for (const p of this.particles) {
            const alpha = Math.max(0, p.life / p.maxLife) * 0.8;
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * (p.life / p.maxLife), 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        // 绘制文字特效
        for (const ef of this.effects) {
            const alpha = Math.max(0, ef.life / ef.maxLife);

            if (ef.type === 'floatText') {
                ctx.save();
                ctx.globalAlpha = alpha;
                ctx.fillStyle = ef.color;
                ctx.font = `${16 * ef.scale}px "Press Start 2P"`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                // 文字阴影增强可读性
                ctx.shadowColor = 'rgba(0,0,0,0.6)';
                ctx.shadowBlur = 4;
                ctx.fillText(ef.text, ef.x, ef.y);
                ctx.shadowBlur = 0;
                ctx.restore();
            } else if (ef.type === 'teleport') {
                const progress = 1 - (ef.life / ef.maxLife);
                const radius = progress * 40;
                ctx.save();
                ctx.globalAlpha = alpha * 0.5;
                ctx.strokeStyle = '#cc66ff';
                ctx.lineWidth = 3;
                ctx.setLineDash([4, 4]);
                ctx.beginPath();
                ctx.arc(ef.x, ef.y, radius, 0, Math.PI * 2);
                ctx.stroke();
                ctx.setLineDash([]);
                ctx.restore();
            }
        }
    }
}

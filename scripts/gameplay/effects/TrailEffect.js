// ============================================================
//  TrailEffect — 玩家拖尾粒子特效系统
//  多种视觉风格可选：火花/能量/霓虹/冰霜/火焰
// ============================================================

const TRAIL_STYLES = {
    spark:     { name: '火花',   color1: '#ffdd44', color2: '#ff6600', size: 2, life: 0.4, rate: 3, glow: '#ffcc00' },
    energy:    { name: '能量',   color1: '#44ff88', color2: '#00cc44', size: 2, life: 0.5, rate: 3, glow: '#00ff66' },
    neon:      { name: '霓虹',   color1: '#ff44ff', color2: '#4488ff', size: 2, life: 0.5, rate: 4, glow: '#ff44ff' },
    ice:       { name: '冰霜',   color1: '#88eeff', color2: '#44aaff', size: 2, life: 0.6, rate: 2, glow: '#aaddff' },
    fire:      { name: '火焰',   color1: '#ff4400', color2: '#ffaa00', size: 3, life: 0.35, rate: 4, glow: '#ff6600' },
    pink:      { name: '粉红',   color1: '#ff88cc', color2: '#ff4488', size: 2, life: 0.5, rate: 3, glow: '#ff88cc' },
    gold:      { name: '金色',   color1: '#ffd700', color2: '#ff8800', size: 2, life: 0.45, rate: 3, glow: '#ffd700' },
};

class TrailEffect {
    constructor(playerId) {
        this.playerId = playerId;
        this.particles = [];
        this.styleKey = playerId === 1 ? 'spark' : 'energy';
        this.style = TRAIL_STYLES[this.styleKey];
        this.frameCount = 0;
        this.maxParticles = 80;
        this.enabled = true;
    }

    setStyle(key) {
        if (TRAIL_STYLES[key]) {
            this.styleKey = key;
            this.style = TRAIL_STYLES[key];
        }
    }

    emit(x, y, vx, vy) {
        if (!this.enabled) return;
        this.frameCount++;

        if (this.frameCount % Math.max(1, Math.round(6 / this.style.rate)) !== 0) return;

        // 每次发射 1-2 个粒子
        const count = 1 + Math.floor(Math.random() * 2);
        for (let i = 0; i < count; i++) {
            if (this.particles.length >= this.maxParticles) {
                this.particles.shift();
            }

            const angle = Math.random() * Math.PI * 2;
            const speed = 20 + Math.random() * 40;
            const s = this.style;

            this.particles.push({
                x: x + (Math.random() - 0.5) * 8,
                y: y + (Math.random() - 0.5) * 8,
                vx: -vx * 0.15 + Math.cos(angle) * speed * 0.3,
                vy: -vy * 0.15 + Math.sin(angle) * speed * 0.3,
                life: s.life * (0.7 + Math.random() * 0.6),
                maxLife: s.life,
                size: s.size * (0.6 + Math.random() * 0.8),
                color: Math.random() > 0.5 ? s.color1 : s.color2,
            });
        }
    }

    update(delta) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.life -= delta;
            p.x += p.vx * delta;
            p.y += p.vy * delta;
            p.vx *= 0.95;
            p.vy *= 0.95;

            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    draw(ctx) {
        const s = this.style;
        for (const p of this.particles) {
            const alpha = Math.max(0, p.life / p.maxLife);
            const size = p.size * alpha;

            // 光晕
            ctx.globalAlpha = alpha * 0.4;
            ctx.fillStyle = s.glow;
            ctx.beginPath();
            ctx.arc(p.x, p.y, size * 2.5, 0, Math.PI * 2);
            ctx.fill();

            // 核心粒子
            ctx.globalAlpha = alpha * 0.9;
            const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, size);
            grad.addColorStop(0, p.color);
            grad.addColorStop(1, 'transparent');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(p.x, p.y, size * 1.8, 0, Math.PI * 2);
            ctx.fill();

            ctx.globalAlpha = 1;
        }
    }

    clear() {
        this.particles = [];
    }

    getTrailStyleNames() {
        return Object.entries(TRAIL_STYLES).map(([k, v]) => ({ key: k, name: v.name }));
    }
}

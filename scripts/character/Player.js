// ============================================================
//  玩家主类 — 管理单个玩家的状态、移动、磁力和绘制
//  仿照 kkk/character/player/Player.gd 设计
//  对抗规则：到达目的地后消失
//  支持拖尾特效和磁力陷阱
// ============================================================

class Player {
    constructor(playerId, config = {}) {
        this.playerId = playerId;
        this.x = 0;
        this.y = 0;
        this.radius = 18;

        // 磁极: 0=N极(红), 1=S极(蓝)
        this.polarity = playerId === 1 ? 0 : 1;

        this.moveSpeed = config.moveSpeed || 300;
        this.magneticForce = config.magneticForce || 50000;
        this.magneticCalculator = new MagneticForceCalculator();

        // 到达终点后消失
        this.arrived = false;
        this.arrivalTime = 0;

        // 激发磁性（按住持续）
        this.boostActive = false;

        // 陷阱减速状态
        this.slowTimer = 0;
        this.trapKnockback = null;

        this.mapAPI = null;
        this.graphics = new CharacterGraphics();
        this.interaction = null;
        this.inputHelper = null;
        this.other = null;
        this.trailEffect = null;
        this.traps = null;
        this.teleportCooldown = 0;
        this.lastVx = 0;
        this.lastVy = 0;
    }

    setup(otherPlayer, mapAPI, interaction, inputHelper) {
        this.other = otherPlayer;
        this.mapAPI = mapAPI;
        this.interaction = interaction;
        this.inputHelper = inputHelper;
    }

    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }

    switchPolarity() {
        this.polarity = this.polarity === 0 ? 1 : 0;
        SignalBus.emit('playerSwitchedPolarity', this.playerId, this.polarity);
    }

    getPos() {
        return { x: this.x, y: this.y };
    }

    // 到达终点
    markArrived(time) {
        this.arrived = true;
        this.arrivalTime = time;
        GameManager.recordArrival(this.playerId, time);
        SignalBus.emit('playerArrived', this.playerId, time);
    }

    update(delta) {
        if (this.arrived) return;
        if (!this.other || !this.inputHelper) return;

        if (this.teleportCooldown > 0) {
            this.teleportCooldown -= delta;
        }

        if (this.slowTimer > 0) {
            this.slowTimer -= delta;
        }

        if (this.inputHelper.isSwitchJustPressed(this.playerId)) {
            this.switchPolarity();
        }

        this.boostActive = this.inputHelper.isBoostHeld(this.playerId);

        const dir = this.inputHelper.getDirection(this.playerId);
        const speedMul = this.slowTimer > 0 ? 0.4 : 1.0;
        let vx = dir.x * this.moveSpeed * speedMul;
        let vy = dir.y * this.moveSpeed * speedMul;

        if (this.trapKnockback) {
            vx += this.trapKnockback.vx;
            vy += this.trapKnockback.vy;
            this.trapKnockback = null;
        }

        // 对方已到达则不再受磁力影响
        if (!this.other.arrived) {
            const otherPos = this.other.getPos();
            const effectiveForce = this.boostActive ? this.magneticForce * 5 : this.magneticForce;
            const magVel = this.magneticCalculator.calcMagneticVelocity(
                this.interaction,
                { x: this.x, y: this.y },
                otherPos,
                this.polarity,
                this.other.polarity,
                effectiveForce,
                delta
            );
            vx += magVel.x;
            vy += magVel.y;
        }

        // 两球间距检测 — 防止震荡和穿透
        if (this.interaction && !this.other.arrived) {
            const otherPos = this.other.getPos();
            const dx = this.x - otherPos.x;
            const dy = this.y - otherPos.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const minSep = this.radius * 2 + 2;

            if (dist < minSep && dist > 0.001) {
                // 直接推开到安全距离
                const overlap = minSep - dist;
                const nx = dx / dist;
                const ny = dy / dist;
                this.x += nx * overlap * 0.5;
                this.y += ny * overlap * 0.5;
                // 对方也被推开（由对方自己的update处理，但这里也给速度减震）
                const relVx = vx - (this.other.lastVx || 0);
                const relVy = vy - (this.other.lastVy || 0);
                const relMag = Math.sqrt(relVx * relVx + relVy * relVy);
                if (relMag > 600) {
                    // 两球高速对冲，大幅减速防止穿透
                    const damp = 600 / relMag;
                    vx *= damp;
                    vy *= damp;
                }
            }
        }

        // 速度上限防止穿透墙壁
        const speed = Math.sqrt(vx * vx + vy * vy);
        const maxSpeed = 600;
        if (speed > maxSpeed) {
            const scale = maxSpeed / speed;
            vx *= scale;
            vy *= scale;
        }

        let newX = this.x + vx * delta;
        let newY = this.y + vy * delta;

        // 墙壁碰撞 — 精确推出到边缘而非简单回退
        if (this.mapAPI) {
            newX = this.resolveWallCollision({ x: newX, y: this.y }, this.x, true);
            newY = this.resolveWallCollision({ x: this.x, y: newY }, this.y, false);

            if (this.teleportCooldown <= 0) {
                const dest = this.mapAPI.checkTeleporter({ x: newX, y: newY }, this.radius);
                if (dest) {
                    newX = dest.x;
                    newY = dest.y;
                    this.teleportCooldown = 0.5;
                    SignalBus.emit('playerTeleported', this.playerId);
                }
            }

            const clamped = this.mapAPI.clampToBoundary({ x: newX, y: newY }, this.radius);
            newX = clamped.x;
            newY = clamped.y;
        }

        this.lastVx = (newX - this.x) / Math.max(delta, 0.001);
        this.lastVy = (newY - this.y) / Math.max(delta, 0.001);

        this.x = newX;
        this.y = newY;

        if (this.trailEffect) {
            this.trailEffect.emit(this.x, this.y, this.lastVx, this.lastVy);
            this.trailEffect.update(delta);
        }

        if (this.traps) {
            this.checkTrapCollisions(delta);
        }
    }

    // 精确墙壁碰撞解析 — 推到边缘而非回退
    resolveWallCollision(newPos, oldAxis, isX) {
        const allRects = this.mapAPI.getAllRects ? this.mapAPI.getAllRects() : [];
        for (const rect of allRects) {
            if (!CollisionDetector.prototype.circleRectCollision(newPos.x, newPos.y, this.radius, rect.x, rect.y, rect.w, rect.h)) {
                continue;
            }
            // 有碰撞 → 推到矩形边缘
            const closestX = Math.max(rect.x, Math.min(newPos.x, rect.x + rect.w));
            const closestY = Math.max(rect.y, Math.min(newPos.y, rect.y + rect.h));
            const dx = newPos.x - closestX;
            const dy = newPos.y - closestY;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const pushDist = this.radius - dist;
            if (pushDist > 0) {
                newPos.x += (dx / dist) * pushDist;
                newPos.y += (dy / dist) * pushDist;
            }
        }
        return isX ? newPos.x : newPos.y;
    }

    checkTrapCollisions(delta) {
        for (const trap of this.traps) {
            if (!trap.checkCollision(this.x, this.y, this.radius)) continue;

            const result = trap.trigger(this, delta);
            if (!result) continue;

            switch (result.type) {
                case 'slow':
                    this.slowTimer = 2.0;
                    SignalBus.emit('effectSpawned', {
                        type: 'floatText', x: this.x, y: this.y - 20,
                        text: result.msg, color: '#ff8844'
                    });
                    break;

                case 'reverse':
                    this.switchPolarity();
                    SignalBus.emit('effectSpawned', {
                        type: 'floatText', x: this.x, y: this.y - 20,
                        text: result.msg, color: '#cc66ff'
                    });
                    break;

                case 'repelBurst':
                    this.trapKnockback = { vx: result.vx, vy: result.vy };
                    SignalBus.emit('effectSpawned', {
                        type: 'floatText', x: this.x, y: this.y - 20,
                        text: result.msg, color: '#ff4466'
                    });
                    break;

                case 'attract':
                    const dx = result.cx - this.x;
                    const dy = result.cy - this.y;
                    const d = Math.sqrt(dx * dx + dy * dy) || 1;
                    this.x += (dx / d) * (result.force * delta) * 0.5;
                    this.y += (dy / d) * (result.force * delta) * 0.5;
                    break;
            }
            break;
        }
    }

    draw(ctx) {
        if (this.arrived) return;

        // 先绘制拖尾粒子（在玩家下方）
        if (this.trailEffect) {
            this.trailEffect.draw(ctx);
        }

        const bodyColor = this.graphics.getBodyColor(this.polarity, this.boostActive);
        const outlineColor = this.graphics.getOutlineColor();
        const outlineWidth = this.graphics.getOutlineWidth();
        const radius = this.graphics.getRadius(this.boostActive);

        // 减速视觉（蓝色拖影）
        if (this.slowTimer > 0) {
            const slowAlpha = this.slowTimer / 2.0 * 0.6;
            const slowGrad = ctx.createRadialGradient(this.x, this.y, radius, this.x, this.y, radius + 16);
            slowGrad.addColorStop(0, `rgba(100, 150, 255, ${slowAlpha})`);
            slowGrad.addColorStop(1, 'rgba(100, 150, 255, 0)');
            ctx.fillStyle = slowGrad;
            ctx.beginPath();
            ctx.arc(this.x, this.y, radius + 16, 0, Math.PI * 2);
            ctx.fill();
        }

        if (this.boostActive) {
            const flicker = 0.3 + Math.sin(Date.now() / 40) * 0.2;
            const glowGrad = ctx.createRadialGradient(this.x, this.y, radius, this.x, this.y, radius + 14);
            const gR = this.polarity === 0 ? 255 : 80;
            const gG = this.polarity === 0 ? 60 : 140;
            const gB = this.polarity === 0 ? 40 : 255;
            glowGrad.addColorStop(0, `rgba(${gR}, ${gG}, ${gB}, ${flicker + 0.2})`);
            glowGrad.addColorStop(1, `rgba(${gR}, ${gG}, ${gB}, 0)`);
            ctx.fillStyle = glowGrad;
            ctx.beginPath();
            ctx.arc(this.x, this.y, radius + 14, 0, Math.PI * 2);
            ctx.fill();

            const ringR = radius + 8 + Math.sin(Date.now() / 60) * 4;
            ctx.strokeStyle = `rgba(${gR}, ${gG}, ${gB}, 0.5)`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(this.x, this.y, ringR, 0, Math.PI * 2);
            ctx.stroke();
        }

        ctx.fillStyle = bodyColor;
        ctx.beginPath();
        ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = outlineColor;
        ctx.lineWidth = outlineWidth;
        ctx.beginPath();
        ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
        ctx.stroke();

        const label = this.graphics.polarityToText(this.polarity);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, this.x, this.y);

        if (this.boostActive) {
            ctx.fillStyle = '#ffff00';
            ctx.font = 'bold 14px "Press Start 2P"';
            ctx.fillText('⚡', this.x, this.y - radius - 22);
        }

        ctx.fillStyle = this.playerId === 1 ? '#ff6666' : '#66aaff';
        ctx.font = '10px "Press Start 2P"';
        ctx.fillText('P' + this.playerId, this.x, this.y - radius - 12);

        ctx.textAlign = 'start';
        ctx.textBaseline = 'alphabetic';
    }

    get isBoosted() { return this.boostActive; }
    polarityText() { return this.graphics.polarityToText(this.polarity); }
}

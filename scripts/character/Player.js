// ============================================================
//  玩家主类 — 管理单个玩家的状态、移动、磁力和绘制
//  仿照 kkk/character/player/Player.gd 设计
//  对抗规则：到达目的地后消失
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

        this.mapAPI = null;
        this.graphics = new CharacterGraphics();
        this.interaction = null;
        this.inputHelper = null;
        this.other = null;
        this.teleportCooldown = 0;
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

        if (this.inputHelper.isSwitchJustPressed(this.playerId)) {
            this.switchPolarity();
        }

        this.boostActive = this.inputHelper.isBoostHeld(this.playerId);

        const dir = this.inputHelper.getDirection(this.playerId);
        let vx = dir.x * this.moveSpeed;
        let vy = dir.y * this.moveSpeed;

        // 对方已到达则不再受磁力影响
        if (!this.other.arrived) {
            const otherPos = this.other.getPos();
            const effectiveForce = this.boostActive ? this.magneticForce * 3 : this.magneticForce;
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

        let newX = this.x + vx * delta;
        let newY = this.y + vy * delta;

        // 玩家碰撞推开（对方未到达时才有效）
        if (this.interaction && !this.other.arrived) {
            const otherPos = this.other.getPos();
            const push = this.interaction.calcPushApart({ x: newX, y: newY }, otherPos, 38);
            newX += push.x;
            newY += push.y;
        }

        if (this.mapAPI) {
            if (this.mapAPI.checkWallCollision({ x: newX, y: this.y }, this.radius)) newX = this.x;
            if (this.mapAPI.checkWallCollision({ x: this.x, y: newY }, this.radius)) newY = this.y;
            if (this.mapAPI.checkBarrierCollision({ x: newX, y: this.y }, this.radius)) newX = this.x;
            if (this.mapAPI.checkBarrierCollision({ x: this.x, y: newY }, this.radius)) newY = this.y;

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

        this.x = newX;
        this.y = newY;
    }

    draw(ctx) {
        if (this.arrived) return;

        const bodyColor = this.graphics.getBodyColor(this.polarity, this.boostActive);
        const outlineColor = this.graphics.getOutlineColor();
        const outlineWidth = this.graphics.getOutlineWidth();
        const radius = this.graphics.getRadius(this.boostActive);

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

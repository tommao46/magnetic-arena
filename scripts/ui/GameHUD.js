// ============================================================
//  HUD — 磁性激发状态、金币显示、计时器、到达状态、对抗结算
//  仿照 kkk/ui/hud/GameHUD.gd 设计
//  对抗规则：金币分 + 时间分 = 总分，高分者胜
// ============================================================

class GameHUD {
    constructor(canvasWidth, canvasHeight) {
        this.canvasW = canvasWidth;
        this.canvasH = canvasHeight;
        this.fontRegular = '10px "Press Start 2P"';
        this.fontSmall = '7px "Press Start 2P"';
        this.fontTiny = '6px "Press Start 2P"';
    }

    // 绘制磁性激发状态指示
    drawBoostStatus(ctx, player, x, y, labelPrefix, labelKey, labelColor) {
        // 已到达的玩家不显示
        if (player.arrived) return;

        const pw = 190, ph = 26;
        ctx.fillStyle = 'rgba(6, 10, 20, 0.75)';
        this.roundRect(ctx, x, y, pw, ph, 4);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.lineWidth = 1;
        this.roundRect(ctx, x, y, pw, ph, 4);
        ctx.stroke();

        ctx.font = this.fontSmall;

        if (player.isBoosted) {
            const flicker = 0.7 + Math.sin(Date.now() / 60) * 0.3;
            ctx.fillStyle = `rgba(255, 255, 60, ${flicker})`;
            ctx.fillText(labelPrefix + ' ⚡ 激发中(×3)', x + 6, y + 12);
        } else {
            ctx.fillStyle = labelColor;
            ctx.fillText(labelPrefix + ' [' + labelKey + '] 按住激发', x + 6, y + 12);
        }
    }

    // 绘制金币统计（居中面板）
    drawCoins(ctx, coinP1, coinP2) {
        const pw = 260, ph = 30;
        const px = this.canvasW / 2 - pw / 2, py = 8;

        ctx.fillStyle = 'rgba(6, 10, 20, 0.75)';
        this.roundRect(ctx, px, py, pw, ph, 5);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.lineWidth = 1;
        this.roundRect(ctx, px, py, pw, ph, 5);
        ctx.stroke();

        ctx.font = this.fontRegular;

        ctx.fillStyle = '#ff6666';
        ctx.textAlign = 'center';
        ctx.fillText('💰 P1: ' + coinP1, this.canvasW / 2 - 70, py + 21);

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.beginPath();
        ctx.moveTo(this.canvasW / 2, py + 5);
        ctx.lineTo(this.canvasW / 2, py + ph - 5);
        ctx.stroke();

        ctx.fillStyle = '#66aaff';
        ctx.fillText('💰 P2: ' + coinP2, this.canvasW / 2 + 70, py + 21);

        ctx.textAlign = 'start';
    }

    // 绘制计时器（右上角）
    drawTimer(ctx, time) {
        const seconds = time.toFixed(1);
        const pw = 140, ph = 30;
        const px = this.canvasW - pw - 8, py = 8;

        ctx.fillStyle = 'rgba(6, 10, 20, 0.75)';
        this.roundRect(ctx, px, py, pw, ph, 5);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.lineWidth = 1;
        this.roundRect(ctx, px, py, pw, ph, 5);
        ctx.stroke();

        ctx.fillStyle = '#55ff88';
        ctx.font = this.fontRegular;
        ctx.textAlign = 'center';
        ctx.fillText('⏱ ' + seconds + 's', px + pw / 2, py + 21);
        ctx.textAlign = 'start';
    }

    // 绘制到达状态（右侧中部）
    drawArrivalStatus(ctx, p1, p2) {
        const pw = 160, ph = 52;
        const px = this.canvasW - pw - 8, py = 84;

        ctx.fillStyle = 'rgba(6, 10, 20, 0.75)';
        this.roundRect(ctx, px, py, pw, ph, 5);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.lineWidth = 1;
        this.roundRect(ctx, px, py, pw, ph, 5);
        ctx.stroke();

        ctx.font = this.fontSmall;

        // P1 状态
        if (p1.arrived) {
            ctx.fillStyle = '#55ff55';
            ctx.fillText('✅ P1 到达!', px + 8, py + 12);
            ctx.fillStyle = '#aaffaa';
            ctx.fillText('  ' + p1.arrivalTime.toFixed(1) + 's', px + 8, py + 26);
        } else {
            ctx.fillStyle = '#ff8866';
            ctx.fillText('⏳ P1 行进中...', px + 8, py + 12);
        }

        // 分隔线
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.beginPath();
        ctx.moveTo(px + 4, py + 30);
        ctx.lineTo(px + pw - 4, py + 30);
        ctx.stroke();

        // P2 状态
        if (p2.arrived) {
            ctx.fillStyle = '#55ff55';
            ctx.fillText('✅ P2 到达!', px + 8, py + 40);
            ctx.fillStyle = '#aaffaa';
            ctx.fillText('  ' + p2.arrivalTime.toFixed(1) + 's', px + 8, py + 54);
        } else {
            ctx.fillStyle = '#88aaff';
            ctx.fillText('⏳ P2 行进中...', px + 8, py + 40);
        }
    }

    // 绘制极性状态（左下角）
    drawPolarityStatus(ctx, player1, player2) {
        const px = 8, py = this.canvasH - 60, pw = 210, ph = 30;

        ctx.fillStyle = 'rgba(6, 10, 20, 0.75)';
        this.roundRect(ctx, px, py, pw, ph, 4);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.lineWidth = 1;
        this.roundRect(ctx, px, py, pw, ph, 4);
        ctx.stroke();

        ctx.font = this.fontSmall;

        ctx.fillStyle = '#ff6666';
        ctx.fillText('P1[' + player1.polarityText() + ']', px + 8, py + 13);

        const same = player1.polarity === player2.polarity;
        ctx.fillStyle = same ? '#ff6666' : '#5dade2';
        ctx.textAlign = 'center';
        ctx.fillText(same ? '⟹ 排斥' : '⟸ 吸引', px + pw / 2, py + 13);
        ctx.textAlign = 'start';

        ctx.fillStyle = '#66aaff';
        ctx.fillText('P2[' + player2.polarityText() + ']', px + pw - 70, py + 13);
    }

    // 绘制磁力线（流动粒子效果）
    drawMagneticLine(ctx, p1, p2) {
        if (p1.arrived || p2.arrived) return;

        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 1) return;

        const same = p1.polarity === p2.polarity;

        const glowAlpha = 0.15 + Math.sin(Date.now() / 800) * 0.05;
        ctx.strokeStyle = same ? `rgba(255, 60, 60, ${glowAlpha})` : `rgba(60, 100, 255, ${glowAlpha})`;
        ctx.lineWidth = Math.max(0.5, Math.min(8, (8000 / (dist * dist)) * 4));
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();

        const lineAlpha = 0.35 + Math.sin(Date.now() / 600) * 0.1;
        ctx.strokeStyle = same ? `rgba(255, 80, 80, ${lineAlpha})` : `rgba(80, 140, 255, ${lineAlpha})`;
        const lineWidth = Math.max(0.5, Math.min(4, (6000 / (dist * dist)) * 3));
        ctx.lineWidth = lineWidth;
        const dashLen = 10 + Math.sin(Date.now() / 400) * 3;
        ctx.setLineDash([dashLen, dashLen * 1.2]);
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
        ctx.setLineDash([]);

        const t = (Date.now() / 600) % 1;
        for (let i = 0; i < 3; i++) {
            const progress = (t + i / 3) % 1;
            const px = p1.x + dx * progress;
            const py = p1.y + dy * progress;
            ctx.fillStyle = same ? 'rgba(255, 120, 120, 0.7)' : 'rgba(120, 180, 255, 0.7)';
            ctx.beginPath();
            ctx.arc(px, py, 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // 绘制结算提示（大面板）— 已废弃，保留空壳
    drawSettlePrompt(ctx, settledStates, timer) {
    }

    // 绘制对抗结算屏幕（仓库原版风格）
    // score = 金币×10 + floor(600/秒数)
    drawGameOver(ctx, coinP1, coinP2, time1, time2) {
        // 全屏暗色背景
        ctx.fillStyle = 'rgba(4, 8, 18, 0.9)';
        ctx.fillRect(0, 0, this.canvasW, this.canvasH);

        // 计算分数
        const cs1 = coinP1 * 10;
        const cs2 = coinP2 * 10;
        const ts1 = Math.floor(600 / Math.max(time1, 0.1));
        const ts2 = Math.floor(600 / Math.max(time2, 0.1));
        const total1 = cs1 + ts1;
        const total2 = cs2 + ts2;
        const winner = total1 > total2 ? 1 : (total2 > total1 ? 2 : 0);

        // 中央面板
        const pw = 480, ph = 380;
        const px = this.canvasW / 2 - pw / 2, py = this.canvasH / 2 - ph / 2;

        ctx.fillStyle = 'rgba(8, 14, 28, 0.95)';
        this.roundRect(ctx, px, py, pw, ph, 10);
        ctx.fill();

        ctx.strokeStyle = 'rgba(255, 215, 0, 0.6)';
        ctx.lineWidth = 2;
        ctx.shadowColor = 'rgba(255, 215, 0, 0.4)';
        ctx.shadowBlur = 12;
        this.roundRect(ctx, px, py, pw, ph, 10);
        ctx.stroke();
        ctx.shadowBlur = 0;

        // 标题行
        const pulse = 0.8 + Math.sin(Date.now() / 400) * 0.2;
        ctx.font = '20px "Press Start 2P"';
        ctx.textAlign = 'center';

        if (winner === 1) {
            ctx.fillStyle = '#ff4444';
            ctx.shadowColor = `rgba(255, 50, 50, ${pulse})`;
            ctx.shadowBlur = 12;
            ctx.fillText('🏆 P1 对决胜利！', this.canvasW / 2, py + 40);
        } else if (winner === 2) {
            ctx.fillStyle = '#4488ff';
            ctx.shadowColor = `rgba(50, 100, 255, ${pulse})`;
            ctx.shadowBlur = 12;
            ctx.fillText('🏆 P2 对决胜利！', this.canvasW / 2, py + 40);
        } else {
            ctx.fillStyle = '#ffd700';
            ctx.shadowColor = `rgba(255, 215, 0, ${pulse})`;
            ctx.shadowBlur = 12;
            ctx.fillText('🤝 平局！', this.canvasW / 2, py + 40);
        }
        ctx.shadowBlur = 0;

        // 关卡名
        ctx.fillStyle = '#5dade2';
        ctx.font = '11px "Press Start 2P"';
        ctx.fillText(GameManager.currentLevelName, this.canvasW / 2, py + 70);

        // P1 分数面板
        const cardW = 200, cardH = 160;
        const cardY = py + 90;

        // P1 卡片
        const p1CardX = px + 30;
        ctx.fillStyle = winner === 1 ? 'rgba(255, 50, 50, 0.15)' : 'rgba(255, 50, 50, 0.06)';
        this.roundRect(ctx, p1CardX, cardY, cardW, cardH, 6);
        ctx.fill();
        ctx.strokeStyle = winner === 1 ? 'rgba(255, 100, 100, 0.7)' : 'rgba(255, 80, 80, 0.3)';
        ctx.lineWidth = winner === 1 ? 2 : 1;
        this.roundRect(ctx, p1CardX, cardY, cardW, cardH, 6);
        ctx.stroke();

        ctx.fillStyle = '#ff6666';
        ctx.font = '9px "Press Start 2P"';
        ctx.fillText('P1', p1CardX + cardW / 2, cardY + 20);

        ctx.fillStyle = '#ffffff';
        ctx.font = '6px "Press Start 2P"';
        ctx.fillText('⏱ 用时: ' + time1.toFixed(1) + 's', p1CardX + cardW / 2, cardY + 46);
        ctx.fillText('💰 金币: ' + coinP1 + ' × 10 = ' + cs1, p1CardX + cardW / 2, cardY + 64);
        ctx.fillText('⚡ 时间: floor(600/' + time1.toFixed(1) + ') = ' + ts1, p1CardX + cardW / 2, cardY + 82);

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.beginPath();
        ctx.moveTo(p1CardX + 10, cardY + 94);
        ctx.lineTo(p1CardX + cardW - 10, cardY + 94);
        ctx.stroke();

        ctx.fillStyle = '#ffd700';
        ctx.font = '11px "Press Start 2P"';
        ctx.fillText('总分: ' + total1, p1CardX + cardW / 2, cardY + 120);

        if (winner === 1) {
            ctx.fillStyle = '#ffd700';
            ctx.font = '8px "Press Start 2P"';
            ctx.fillText('👑 冠军！', p1CardX + cardW / 2, cardY + 145);
        }

        // VS 分隔
        ctx.fillStyle = '#8899aa';
        ctx.font = '12px "Press Start 2P"';
        ctx.fillText('VS', this.canvasW / 2, cardY + cardH / 2);

        // P2 卡片
        const p2CardX = px + pw - cardW - 30;
        ctx.fillStyle = winner === 2 ? 'rgba(50, 80, 255, 0.15)' : 'rgba(50, 80, 255, 0.06)';
        this.roundRect(ctx, p2CardX, cardY, cardW, cardH, 6);
        ctx.fill();
        ctx.strokeStyle = winner === 2 ? 'rgba(100, 140, 255, 0.7)' : 'rgba(80, 120, 255, 0.3)';
        ctx.lineWidth = winner === 2 ? 2 : 1;
        this.roundRect(ctx, p2CardX, cardY, cardW, cardH, 6);
        ctx.stroke();

        ctx.fillStyle = '#66aaff';
        ctx.font = '9px "Press Start 2P"';
        ctx.fillText('P2', p2CardX + cardW / 2, cardY + 20);

        ctx.fillStyle = '#ffffff';
        ctx.font = '6px "Press Start 2P"';
        ctx.fillText('⏱ 用时: ' + time2.toFixed(1) + 's', p2CardX + cardW / 2, cardY + 46);
        ctx.fillText('💰 金币: ' + coinP2 + ' × 10 = ' + cs2, p2CardX + cardW / 2, cardY + 64);
        ctx.fillText('⚡ 时间: floor(600/' + time2.toFixed(1) + ') = ' + ts2, p2CardX + cardW / 2, cardY + 82);

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.beginPath();
        ctx.moveTo(p2CardX + 10, cardY + 94);
        ctx.lineTo(p2CardX + cardW - 10, cardY + 94);
        ctx.stroke();

        ctx.fillStyle = '#ffd700';
        ctx.font = '11px "Press Start 2P"';
        ctx.fillText('总分: ' + total2, p2CardX + cardW / 2, cardY + 120);

        if (winner === 2) {
            ctx.fillStyle = '#ffd700';
            ctx.font = '8px "Press Start 2P"';
            ctx.fillText('👑 冠军！', p2CardX + cardW / 2, cardY + 145);
        }

        // 重新开始按钮（红色3D按钮效果）
        const btnW = 200, btnH = 38;
        const btnX = this.canvasW / 2 - btnW / 2, btnY = cardY + cardH + 14;

        ctx.fillStyle = '#660000';
        this.roundRect(ctx, btnX, btnY + 3, btnW, btnH, 6);
        ctx.fill();

        const btnGrad = ctx.createLinearGradient(btnX, btnY, btnX, btnY + btnH);
        btnGrad.addColorStop(0, '#ff6b6b');
        btnGrad.addColorStop(1, '#c0392b');
        ctx.fillStyle = btnGrad;
        this.roundRect(ctx, btnX, btnY, btnW, btnH, 6);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = '10px "Press Start 2P"';
        ctx.fillText('按 [R] 重新对决', this.canvasW / 2, btnY + 24);

        ctx.fillStyle = '#8899aa';
        ctx.font = '7px "Press Start 2P"';
        ctx.fillText('按 1-4 切换关卡', this.canvasW / 2, btnY + btnH + 14);

        ctx.textAlign = 'start';
    }

    // 绘制关卡标题（入场动画）
    drawLevelTitle(ctx, levelName, alpha) {
        if (alpha <= 0) return;
        ctx.save();
        ctx.globalAlpha = alpha;

        ctx.fillStyle = 'rgba(6, 10, 20, 0.8)';
        this.roundRect(ctx, this.canvasW / 2 - 180, 48, 360, 36, 5);
        ctx.fill();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 1;
        this.roundRect(ctx, this.canvasW / 2 - 180, 48, 360, 36, 5);
        ctx.stroke();

        ctx.fillStyle = '#ffd700';
        ctx.font = '12px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(255, 215, 0, 0.4)';
        ctx.shadowBlur = 4;
        ctx.fillText(levelName, this.canvasW / 2, 72);
        ctx.shadowBlur = 0;
        ctx.textAlign = 'start';

        ctx.restore();
    }

    // 辅助：绘制圆角矩形
    roundRect(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.arcTo(x + w, y, x + w, y + r, r);
        ctx.lineTo(x + w, y + h - r);
        ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
        ctx.lineTo(x + r, y + h);
        ctx.arcTo(x, y + h, x, y + h - r, r);
        ctx.lineTo(x, y + r);
        ctx.arcTo(x, y, x + r, y, r);
        ctx.closePath();
    }
}

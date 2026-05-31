// ============================================================
//  磁力计算器 — 计算玩家之间的磁力作用
//  仿照 kkk/character/movement/MagneticForceCalculator.gd 设计
// ============================================================

class MagneticForceCalculator {
    // 计算磁力对速度的增量
    // 线性衰减 force/dist，确保效果明显可见
    calcMagneticVelocity(interaction, selfPos, targetPos, selfPolarity, targetPolarity, magneticForce, delta) {
        if (interaction) {
            return interaction.calcMagneticVelocity(selfPos, targetPos, selfPolarity, targetPolarity, magneticForce, delta);
        }

        // 内置 fallback（单向 delta，Player统一乘）
        const dx = targetPos.x - selfPos.x;
        const dy = targetPos.y - selfPos.y;
        const distSq = dx * dx + dy * dy;
        if (distSq < 1) return { x: 0, y: 0 };

        const dist = Math.sqrt(distSq);
        const dirX = dx / dist;
        const dirY = dy / dist;

        const force = magneticForce / dist;
        const sign = (selfPolarity === targetPolarity) ? -1 : 1;

        return {
            x: dirX * force * sign,
            y: dirY * force * sign
        };
    }
}

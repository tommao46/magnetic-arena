// ============================================================
//  交互层 API — 对外暴露磁力、碰撞等公共接口
//  仿照 kkk/interaction/api/InteractionAPI.gd 设计
//  公式：单向 delta，线性衰减 magneticForce / dist
// ============================================================

class InteractionAPI {
    constructor() {
        this.collisionDetector = new CollisionDetector();
    }

    registerObstacle(obs) {
        this.collisionDetector.registerObstacle(obs);
    }

    registerBarrier(bar) {
        this.collisionDetector.registerBarrier(bar);
    }

    clear() {
        this.collisionDetector.clear();
    }

    // 计算磁力对速度的增量
    // 返回速度增量（不含 delta），Player.js 中统一乘 delta
    // force = magneticForce / dist，距离越近力越大
    calcMagneticVelocity(selfPos, targetPos, selfPolarity, targetPolarity, magneticForce, delta) {
        const dx = targetPos.x - selfPos.x;
        const dy = targetPos.y - selfPos.y;
        const distSq = dx * dx + dy * dy;

        // 距离太近不产生方向力，改由碰撞系统推开
        if (distSq < 1) return { x: 0, y: 0 };

        const dist = Math.sqrt(distSq);

        // 方向向量（自身 → 对方）
        const dirX = dx / dist;
        const dirY = dy / dist;

        // 磁力大小：线性衰减，距离越近越强
        // 不下限距离，让近处力很大推开重叠
        const force = magneticForce / dist;

        // 同极排斥（远离对方），异极吸引（靠近对方）
        const sign = (selfPolarity === targetPolarity) ? -1 : 1;

        return {
            x: dirX * force * sign,
            y: dirY * force * sign
        };
    }

    // 玩家间碰撞推开向量（防止重叠）
    calcPushApart(selfPos, targetPos, minDist = 40) {
        const dx = selfPos.x - targetPos.x;
        const dy = selfPos.y - targetPos.y;
        const distSq = dx * dx + dy * dy;

        // 不重叠则不需要推开
        if (distSq >= minDist * minDist || distSq < 0.001) return { x: 0, y: 0 };

        const dist = Math.sqrt(distSq);
        const overlap = minDist - dist;

        // 推开方向：target → self
        const dirX = dx / dist;
        const dirY = dy / dist;

        return {
            x: dirX * overlap * 0.5,
            y: dirY * overlap * 0.5
        };
    }

    // 保留兼容
    calcDashDirection(selfPos, targetPos, selfPolarity, targetPolarity) {
        const dx = targetPos.x - selfPos.x;
        const dy = targetPos.y - selfPos.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 1) return { x: 1, y: 0 };
        const normX = dx / dist;
        const normY = dy / dist;
        if (selfPolarity === targetPolarity) {
            return { x: -normX, y: -normY };
        }
        return { x: normX, y: normY };
    }
}

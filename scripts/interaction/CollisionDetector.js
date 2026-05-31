// ============================================================
//  碰撞检测器 — 处理障碍物、屏障的碰撞判断
//  仿照 kkk/interaction/core/CollisionObstacle.gd 设计
// ============================================================

class CollisionDetector {
    constructor() {
        this.obstacles = [];
        this.barriers = [];
    }

    // 注册障碍物
    registerObstacle(obs) {
        this.obstacles.push(obs);
    }

    // 注册磁力屏障
    registerBarrier(bar) {
        this.barriers.push(bar);
    }

    // 清空所有记录
    clear() {
        this.obstacles = [];
        this.barriers = [];
    }

    // 检测圆与矩形碰撞
    circleRectCollision(cx, cy, cr, rx, ry, rw, rh) {
        const closestX = Math.max(rx, Math.min(cx, rx + rw));
        const closestY = Math.max(ry, Math.min(cy, ry + rh));
        const dx = cx - closestX;
        const dy = cy - closestY;
        return (dx * dx + dy * dy) < (cr * cr);
    }

    // 检测玩家与障碍物碰撞
    checkObstacleCollision(pos, radius) {
        for (const obs of this.obstacles) {
            if (this.circleRectCollision(pos.x, pos.y, radius, obs.x, obs.y, obs.w, obs.h)) {
                return true;
            }
        }
        return false;
    }

    // 检测玩家与磁力屏障碰撞
    checkBarrierCollision(pos, radius) {
        for (const bar of this.barriers) {
            if (this.circleRectCollision(pos.x, pos.y, radius, bar.x, bar.y, bar.w, bar.h)) {
                return true;
            }
        }
        return false;
    }

    // 获取碰撞法线方向（用于推出玩家）
    getPushOutVector(pos, radius) {
        let result = { x: 0, y: 0 };
        const allRects = [...this.obstacles, ...this.barriers];

        for (const rect of allRects) {
            const closestX = Math.max(rect.x, Math.min(pos.x, rect.x + rect.w));
            const closestY = Math.max(rect.y, Math.min(pos.y, rect.y + rect.h));
            const dx = pos.x - closestX;
            const dy = pos.y - closestY;
            const distSq = dx * dx + dy * dy;

            if (distSq < radius * radius && distSq > 0.001) {
                const dist = Math.sqrt(distSq);
                const overlap = radius - dist;
                result.x += (dx / dist) * overlap;
                result.y += (dy / dist) * overlap;
            } else if (distSq < 0.001) {
                // 玩家中心在矩形内，推向最近边
                const toLeft = pos.x - rect.x;
                const toRight = (rect.x + rect.w) - pos.x;
                const toTop = pos.y - rect.y;
                const toBottom = (rect.y + rect.h) - pos.y;
                const minD = Math.min(toLeft, toRight, toTop, toBottom);
                if (minD === toLeft) result.x -= radius;
                else if (minD === toRight) result.x += radius;
                else if (minD === toTop) result.y -= radius;
                else result.y += radius;
            }
        }
        return result;
    }
}

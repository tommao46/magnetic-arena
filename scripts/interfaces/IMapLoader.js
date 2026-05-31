// ============================================================
//  地图载入接口 — 定义地图模块必须实现的方法
//  仿照 kkk/IMapLoader.gd 设计
// ============================================================

class IMapLoader {
    // 返回所有玩家的出生点坐标列表
    // 返回: [{x, y}, {x, y}] — index 0 → P1, index 1 → P2
    getSpawnPoints() {
        throw new Error('IMapLoader: 请覆写 getSpawnPoints()');
    }

    // 返回结算点坐标列表
    // 返回: [{x, y}, ...]
    getSettlePoints() {
        throw new Error('IMapLoader: 请覆写 getSettlePoints()');
    }

    // 返回地图可移动区域边界矩形
    // 返回: {x, y, w, h}
    getBoundary() {
        throw new Error('IMapLoader: 请覆写 getBoundary()');
    }

    // 地图显示名称
    getMapDisplayName() {
        return 'Standard Arena';
    }

    // 结算区域的判定半径
    getSettleRadius() {
        return 30.0;
    }

    // 磁力线是否穿透墙壁
    isMagneticLineBlocked() {
        return false;
    }

    // 将坐标限制在地图边界内
    clampToBoundary(pos, padding = 20) {
        const b = this.getBoundary();
        return {
            x: Math.max(b.x + padding, Math.min(b.x + b.w - padding, pos.x)),
            y: Math.max(b.y + padding, Math.min(b.y + b.h - padding, pos.y))
        };
    }

    // 检查某玩家是否抵达结算点
    isAtSettlePoint(playerPos) {
        const r = this.getSettleRadius();
        const pts = this.getSettlePoints();
        for (const sp of pts) {
            const dx = playerPos.x - sp.x;
            const dy = playerPos.y - sp.y;
            if (Math.sqrt(dx * dx + dy * dy) <= r) {
                return true;
            }
        }
        return false;
    }

    // 获取所有障碍物（用于碰撞检测）
    getObstacles() {
        return [];
    }

    // 获取所有磁力屏障（阻挡物理但允许磁力线穿透）
    getMagneticBarriers() {
        return [];
    }

    // 获取所有传送门
    getTeleporters() {
        return [];
    }

    // 检查点是否与障碍物碰撞
    checkWallCollision(pos, radius) {
        for (const obs of this.getObstacles()) {
            const cx = Math.max(obs.x, Math.min(pos.x, obs.x + obs.w));
            const cy = Math.max(obs.y, Math.min(pos.y, obs.y + obs.h));
            const dx = pos.x - cx;
            const dy = pos.y - cy;
            if (dx * dx + dy * dy < radius * radius) {
                return true;
            }
        }
        return false;
    }

    // 检查点是否与磁力屏障碰撞（只阻挡玩家，不阻挡磁力线）
    checkBarrierCollision(pos, radius) {
        for (const bar of this.getMagneticBarriers()) {
            const cx = Math.max(bar.x, Math.min(pos.x, bar.x + bar.w));
            const cy = Math.max(bar.y, Math.min(pos.y, bar.y + bar.h));
            const dx = pos.x - cx;
            const dy = pos.y - cy;
            if (dx * dx + dy * dy < radius * radius) {
                return true;
            }
        }
        return false;
    }

    // 检查传送门触发
    checkTeleporter(pos, radius) {
        const teleporters = this.getTeleporters();
        for (let i = 0; i < teleporters.length; i++) {
            const tp = teleporters[i];
            const dx = pos.x - tp.x;
            const dy = pos.y - tp.y;
            if (dx * dx + dy * dy < (radius + tp.radius) * (radius + tp.radius)) {
                // 传送到匹配的传送门
                for (let j = 0; j < teleporters.length; j++) {
                    if (j !== i && teleporters[j].pairId === tp.pairId) {
                        return teleporters[j];
                    }
                }
            }
        }
        return null;
    }
}

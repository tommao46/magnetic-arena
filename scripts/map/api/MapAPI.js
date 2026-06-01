// ============================================================
//  地图 API — 对外提供地图数据查询接口
//  仿照 kkk/map/api/MapAPI.gd 设计
// ============================================================

class MapAPI {
    constructor(map) {
        this.map = map;
    }

    // 获取出生点
    getSpawnPoints() {
        return this.map.getSpawnPoints();
    }

    // 获取结算点
    getSettlePoints() {
        return this.map.getSettlePoints();
    }

    // 获取边界
    getBoundary() {
        return this.map.getBoundary();
    }

    // 限制坐标在边界内
    clampToBoundary(pos, padding = 20) {
        return this.map.clampToBoundary(pos, padding);
    }

    // 检查是否抵达结算点
    isAtSettlePoint(pos) {
        return this.map.isAtSettlePoint(pos);
    }

    // 获取障碍物列表
    getObstacles() {
        return this.map.getObstacles();
    }

    // 获取磁力屏障列表
    getMagneticBarriers() {
        return this.map.getMagneticBarriers();
    }

    // 获取传送门列表
    getTeleporters() {
        return this.map.getTeleporters();
    }

    // 检测墙壁碰撞
    checkWallCollision(pos, radius) {
        return this.map.checkWallCollision(pos, radius);
    }

    // 检测屏障碰撞
    checkBarrierCollision(pos, radius) {
        return this.map.checkBarrierCollision(pos, radius);
    }

    // 检测传送门
    checkTeleporter(pos, radius) {
        return this.map.checkTeleporter(pos, radius);
    }

    // 获取所有碰撞矩形（墙壁+屏障）
    getAllRects() {
        return this.map.getAllRects();
    }
}

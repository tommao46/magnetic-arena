// ============================================================
//  地图基类 — 实现 IMapLoader 接口
//  所有具体地图应继承此类
//  仿照 kkk/map/common/MapBase.gd 设计
// ============================================================

class MapBase extends IMapLoader {
    constructor() {
        super();
        this.tileSize = 40;
        this.cols = 20;
        this.rows = 15;
        this.mapData = [];
        this.spawnP1 = null;
        this.spawnP2 = null;
        this.settlePoints = [];
        this.obstacles = [];
        this.magneticBarriers = [];
        this.teleporters = [];
        this.coins = [];
        this.traps = [];
    }

    // 从文本地图加载
    loadFromText(rows) {
        this.mapData = rows;
        this.obstacles = [];
        this.magneticBarriers = [];
        this.teleporters = [];
        this.coins = [];
        this.traps = [];
        this.settlePoints = [];
        this.spawnP1 = null;
        this.spawnP2 = null;

        let tpIndex = 0;

        for (let row = 0; row < rows.length; row++) {
            for (let col = 0; col < rows[row].length; col++) {
                const ch = rows[row][col];
                const x = col * this.tileSize;
                const y = row * this.tileSize;
                const cx = x + this.tileSize / 2;
                const cy = y + this.tileSize / 2;

                switch (ch) {
                    case '#':
                        this.obstacles.push({ x, y, w: this.tileSize, h: this.tileSize });
                        break;
                    case 'B':
                        this.magneticBarriers.push({ x, y, w: this.tileSize, h: this.tileSize });
                        break;
                    case 'T':
                        const pair = tpIndex;
                        this.teleporters.push({ x: cx, y: cy, radius: 16, pairId: pair });
                        tpIndex++;
                        break;
                    case 'P':
                        this.spawnP1 = { x: cx, y: cy };
                        break;
                    case 'Q':
                        this.spawnP2 = { x: cx, y: cy };
                        break;
                    case 'G':
                        this.settlePoints.push({ x: cx, y: cy });
                        break;
                    case 'C':
                        this.coins.push({ x: cx, y: cy, value: 1 });
                        break;
                    case 'M':
                        this.coins.push({ x: cx, y: cy, value: 3 });
                        break;
                    case 'H':
                        this.coins.push({ x: cx, y: cy, value: 5 });
                        break;
                    case 'S':
                        this.coins.push({ x: cx, y: cy, value: 10 });
                        break;
                }
            }
        }
    }

    // 获取出生点
    getSpawnPoints() {
        return [
            this.spawnP1 || { x: 120, y: 360 },
            this.spawnP2 || { x: 680, y: 360 }
        ];
    }

    // 获取结算点
    getSettlePoints() {
        return this.settlePoints;
    }

    // 获取边界
    getBoundary() {
        return { x: 0, y: 0, w: this.cols * this.tileSize, h: this.rows * this.tileSize };
    }

    // 获取障碍物
    getObstacles() {
        return this.obstacles;
    }

    // 获取磁力屏障
    getMagneticBarriers() {
        return this.magneticBarriers;
    }

    // 获取传送门
    getTeleporters() {
        return this.teleporters;
    }

    // 获取金币
    getCoins() {
        return this.coins;
    }

    // 移除金币
    removeCoin(index) {
        this.coins.splice(index, 1);
    }

    // 获取所有碰撞矩形（墙壁+屏障），用于精确推出
    getAllRects() {
        return [...this.obstacles, ...this.magneticBarriers];
    }
}

// ============================================================
//  游戏管理器 — 全局单例
//  负责：关卡切换 / 金币管理 / 时间记录 / 评分计算
//  对抗规则：金币分 + 时间分 = 总分，高分者胜
// ============================================================

const GameManager = {
    coinP1: 0,
    coinP2: 0,

    // 到达时间（秒）
    arrivalTimeP1: 0,
    arrivalTimeP2: 0,

    currentLevelId: 0,
    currentLevelName: '',

    levelList: [
        { id: 0, name: '对决峡谷', description: '两端竞速，收集金币', unlocked: true },
        { id: 1, name: '磁性绕道', description: '屏障挡路，磁力破局', unlocked: true },
        { id: 2, name: '分岔迷宫', description: '双通道迷宫竞速', unlocked: true },
        { id: 3, name: '漩涡竞技场', description: '层层环形，终极对决', unlocked: true },
        { id: 4, name: '陷阱迷宫', description: '陷阱密布，步步惊心', unlocked: true },
        { id: 5, name: '磁暴战场', description: '终极磁暴，全面对决', unlocked: true }
    ],

    init() {
        this.resetCoins();
        this.arrivalTimeP1 = 0;
        this.arrivalTimeP2 = 0;
        this.currentLevelId = 0;
        this.currentLevelName = this.levelList[0].name;
    },

    resetCoins() {
        this.coinP1 = 0;
        this.coinP2 = 0;
        this.arrivalTimeP1 = 0;
        this.arrivalTimeP2 = 0;
    },

    addCoin(playerId, amount = 1) {
        if (playerId === 1) {
            this.coinP1 += amount;
        } else {
            this.coinP2 += amount;
        }
    },

    // 记录到达时间
    recordArrival(playerId, timeSeconds) {
        if (playerId === 1) {
            this.arrivalTimeP1 = Math.max(timeSeconds, 0.1);
        } else {
            this.arrivalTimeP2 = Math.max(timeSeconds, 0.1);
        }
    },

    getCoin(playerId) {
        return playerId === 1 ? this.coinP1 : this.coinP2;
    },

    // 计算玩家分数：金币分 + 时间分
    calcScore(playerId) {
        const coins = playerId === 1 ? this.coinP1 : this.coinP2;
        const arrival = playerId === 1 ? this.arrivalTimeP1 : this.arrivalTimeP2;

        const coinScore = coins * 10;
        const timeScore = Math.floor(600 / Math.max(arrival, 0.1));
        return coinScore + timeScore;
    },

    // 判断胜者
    getWinner() {
        const s1 = this.calcScore(1);
        const s2 = this.calcScore(2);
        if (s1 > s2) return 1;
        if (s2 > s1) return 2;
        return 0; // 平局
    },

    getLevelData(levelId) {
        if (levelId >= 0 && levelId < this.levelList.length) {
            return this.levelList[levelId];
        }
        return null;
    },

    getLevelCount() {
        return this.levelList.length;
    },

    startGame(levelId) {
        if (levelId >= 0 && levelId < this.levelList.length) {
            this.currentLevelId = levelId;
            this.currentLevelName = this.levelList[levelId].name;
            this.resetCoins();
            SignalBus.emit('levelSelected', levelId);
            SignalBus.emit('gameStarted', levelId);
        }
    },

    goToGameOver() {
        SignalBus.emit('gameOver', this.coinP1, this.coinP2);
    }
};

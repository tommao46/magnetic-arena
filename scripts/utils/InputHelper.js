// ============================================================
//  输入辅助 — 键盘状态追踪与玩家输入封装
//  仿照 kkk/InputHelper.gd 设计
// ============================================================

class InputHelper {
    constructor() {
        this._justPressed = new Set();
        this._pressed = new Set();
        this.controlSchemes = {};
        this.enabled = true;
    }

    // 注册玩家控制方案
    // playerId: 1 或 2
    // keys: { up, down, left, right, switchPolarity, dash(激发磁性) }
    registerScheme(playerId, keys) {
        this.controlSchemes[playerId] = keys;
    }

    // 键盘按下处理
    onKeyDown(e) {
        if (!this.enabled) return;
        const key = e.key.toLowerCase();
        if (!this._pressed.has(key)) {
            this._justPressed.add(key);
        }
        this._pressed.add(key);
    }

    // 键盘释放处理
    onKeyUp(e) {
        const key = e.key.toLowerCase();
        this._pressed.delete(key);
        this._justPressed.delete(key);
    }

    // 每帧结束时调用
    endFrame() {
        this._justPressed.clear();
    }

    // 获取玩家水平输入方向
    getHorizontal(playerId) {
        const scheme = this.controlSchemes[playerId];
        if (!scheme) return 0;
        let dir = 0;
        if (this._pressed.has(scheme.left)) dir -= 1;
        if (this._pressed.has(scheme.right)) dir += 1;
        return dir;
    }

    // 获取玩家垂直输入方向
    getVertical(playerId) {
        const scheme = this.controlSchemes[playerId];
        if (!scheme) return 0;
        let dir = 0;
        if (this._pressed.has(scheme.up)) dir -= 1;
        if (this._pressed.has(scheme.down)) dir += 1;
        return dir;
    }

    // 获取玩家输入方向向量
    getDirection(playerId) {
        const x = this.getHorizontal(playerId);
        const y = this.getVertical(playerId);
        const len = Math.sqrt(x * x + y * y);
        if (len < 0.01) return { x: 0, y: 0 };
        return { x: x / len, y: y / len };
    }

    // 检查玩家是否刚按下切换极性键
    isSwitchJustPressed(playerId) {
        const scheme = this.controlSchemes[playerId];
        if (!scheme) return false;
        return this._justPressed.has(scheme.switchPolarity);
    }

    // 检查玩家是否按住激发磁性键（持续按住就持续激发）
    isBoostHeld(playerId) {
        const scheme = this.controlSchemes[playerId];
        if (!scheme) return false;
        return this._pressed.has(scheme.dash);
    }
}

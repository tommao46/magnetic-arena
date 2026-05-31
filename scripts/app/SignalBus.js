// ============================================================
//  全局信号总线 — 所有跨模块通信通过此节点，解耦各系统
//  仿照 kkk/SignalBus.gd 设计
// ============================================================

const SignalBus = {
    // 事件注册表
    _listeners: {},

    // 注册监听器
    on(signal, callback) {
        if (!this._listeners[signal]) {
            this._listeners[signal] = [];
        }
        this._listeners[signal].push(callback);
    },

    // 移除监听器
    off(signal, callback) {
        if (!this._listeners[signal]) return;
        const idx = this._listeners[signal].indexOf(callback);
        if (idx !== -1) {
            this._listeners[signal].splice(idx, 1);
        }
    },

    // 触发信号
    emit(signal, ...args) {
        if (!this._listeners[signal]) return;
        for (const cb of this._listeners[signal]) {
            cb(...args);
        }
    },

    // 一次性监听
    once(signal, callback) {
        const wrapper = (...args) => {
            callback(...args);
            this.off(signal, wrapper);
        };
        this.on(signal, wrapper);
    },

    // 清空某个信号的所有监听器
    clear(signal) {
        delete this._listeners[signal];
    },

    // 清空所有监听器
    clearAll() {
        this._listeners = {};
    }
};

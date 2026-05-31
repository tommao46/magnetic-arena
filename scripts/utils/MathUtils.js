// ============================================================
//  数学工具 — 向量运算、距离计算等通用数学函数
// ============================================================

const MathUtils = {
    // 计算两点间距离
    distance(a, b) {
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        return Math.sqrt(dx * dx + dy * dy);
    },

    // 计算两点间距离的平方（避免开方，性能更优）
    distanceSquared(a, b) {
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        return dx * dx + dy * dy;
    },

    // 归一化向量
    normalize(v) {
        const len = Math.sqrt(v.x * v.x + v.y * v.y);
        if (len < 0.0001) return { x: 1, y: 0 };
        return { x: v.x / len, y: v.y / len };
    },

    // 向量长度
    length(v) {
        return Math.sqrt(v.x * v.x + v.y * v.y);
    },

    // 向量减法：a - b
    subtract(a, b) {
        return { x: a.x - b.x, y: a.y - b.y };
    },

    // 向量加法
    add(a, b) {
        return { x: a.x + b.x, y: a.y + b.y };
    },

    // 向量缩放
    scale(v, s) {
        return { x: v.x * s, y: v.y * s };
    },

    // 钳制值在 [min, max] 范围内
    clamp(val, min, max) {
        return Math.max(min, Math.min(max, val));
    },

    // 线性插值
    lerp(a, b, t) {
        return a + (b - a) * t;
    },

    // 检查两个圆是否相交
    circlesOverlap(a, ar, b, br) {
        return this.distanceSquared(a, b) <= (ar + br) * (ar + br);
    },

    // 检查点是否在矩形内
    pointInRect(px, py, rx, ry, rw, rh) {
        return px >= rx && px <= rx + rw && py >= ry && py <= ry + rh;
    }
};

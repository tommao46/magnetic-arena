// ============================================================
//  物体交互逻辑接口 — 定义磁力和碰撞模块必须实现的方法
//  仿照 kkk/IObjectInteraction.gd 设计
// ============================================================

class IObjectInteraction {
    // 计算被动磁力对速度的增量（每帧叠加）
    // selfPos: 自身坐标 {x, y}
    // targetPos: 对方坐标 {x, y}
    // selfPolarity: 自身磁性 0=N / 1=S
    // targetPolarity: 对方磁性
    // magneticForce: 磁力强度系数
    // delta: 帧间隔
    // 返回: {x, y} 速度增量
    calcMagneticVelocity(selfPos, targetPos, selfPolarity, targetPolarity, magneticForce, delta) {
        throw new Error('IObjectInteraction: 请覆写 calcMagneticVelocity()');
    }

    // 计算磁力冲刺的方向（归一化向量）
    // selfPos: 自身坐标
    // targetPos: 对方坐标
    // selfPolarity: 自身磁性
    // targetPolarity: 对方磁性
    // 返回: {x, y} 归一化方向
    calcDashDirection(selfPos, targetPos, selfPolarity, targetPolarity) {
        throw new Error('IObjectInteraction: 请覆写 calcDashDirection()');
    }

    // 两磁极是否相同
    isSamePolarity(a, b) {
        return a === b;
    }

    // 两实体距离是否足够近触发交互
    isInInteractionRange(dist) {
        return dist >= 1.0;
    }

    // 获取磁性关系描述文本
    polarityRelationshipText(a, b) {
        return this.isSamePolarity(a, b) ? '排斥 REPEL' : '吸引 ATTRACT';
    }
}

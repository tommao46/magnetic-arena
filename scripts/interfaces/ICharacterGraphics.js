// ============================================================
//  角色图形接口 — 定义角色绘制模块必须实现的方法
//  仿照 kkk/ICharacterGraphics.gd 设计
// ============================================================

class ICharacterGraphics {
    // 获取角色主色（根据磁性和是否冲刺）
    // polarity: 0=N极, 1=S极
    // isDashing: 是否冲刺中
    getBodyColor(polarity, isDashing) {
        throw new Error('ICharacterGraphics: 请覆写 getBodyColor()');
    }

    // 获取角色轮廓颜色
    getOutlineColor() {
        throw new Error('ICharacterGraphics: 请覆写 getOutlineColor()');
    }

    // 获取轮廓线宽
    getOutlineWidth() {
        return 2.0;
    }

    // 获取角色半径
    getRadius(isDashing) {
        return isDashing ? 22 : 20;
    }

    // 获取拖尾颜色
    getTrailColor(polarity, isActive) {
        if (!isActive) return 'rgba(255,255,255,0)';
        return polarity === 0 ? 'rgba(255,85,50,0.3)' : 'rgba(70,100,255,0.3)';
    }

    // 获取拖尾尺寸
    getTrailSize() {
        return { w: 16, h: 16 };
    }

    // 磁极文字
    polarityToText(polarity) {
        return polarity === 0 ? 'N' : 'S';
    }
}

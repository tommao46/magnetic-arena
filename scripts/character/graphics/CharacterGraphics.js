// ============================================================
//  角色图形 — 定义两玩家的配色方案和绘制参数
//  仿照 kkk/character/graphics/DefaultGraphics.gd 设计
// ============================================================

class CharacterGraphics extends ICharacterGraphics {
    constructor() {
        super();
        // 基础颜色
        this.colors = {
            0: '#ff4444',  // N极 - 红色
            1: '#4488ff'   // S极 - 蓝色
        };
        this.dashColors = {
            0: '#ff7733',  // N极冲刺 - 橙红
            1: '#5599ff'   // S极冲刺 - 亮蓝
        };
        this.outlineColor = '#ffffff';

        // 玩家标签文字颜色
        this.labelColors = {
            1: '#ff4444',
            2: '#4488ff'
        };
    }

    getBodyColor(polarity, isDashing) {
        if (isDashing) {
            return this.dashColors[polarity] || '#ff7733';
        }
        return this.colors[polarity] || '#ffffff';
    }

    getOutlineColor() {
        return this.outlineColor;
    }

    getOutlineWidth() {
        return 2.0;
    }

    getRadius(isDashing) {
        return isDashing ? 22 : 18;
    }
}

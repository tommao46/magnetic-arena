// ============================================================
//  主游戏场景 — 双人对抗磁力竞技场
//  对抗规则 + 拖尾特效 + 磁力陷阱 + 丰富关卡
// ============================================================

class MainSession {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.canvasW = canvas.width;
        this.canvasH = canvas.height;
        this.tileSize = 40;
        this.running = false;
        this.animFrameId = null;
        this.lastTime = 0;
        this.totalTime = 0;

        this.map = null;
        this.mapAPI = null;
        this.levelId = 0;

        this.player1 = null;
        this.player2 = null;

        this.interactionAPI = new InteractionAPI();
        this.inputHelper = new InputHelper();
        this.coins = [];
        this.powerUps = [];
        this.traps = [];
        this.effectSpawner = new EffectSpawner();
        this.hud = new GameHUD(this.canvasW, this.canvasH);
        this.characterGraphics = new CharacterGraphics();

        // 拖尾特效
        this.trailP1 = new TrailEffect(1);
        this.trailP2 = new TrailEffect(2);

        this.stars = [];
        this.initStars();

        this.titleAlpha = 0;
        this.titleTimer = 0;
        this.gameOver = false;

        this.levelMaps = this.buildLevels();

        // 监听陷阱特效信号
        SignalBus.on('effectSpawned', (data) => {
            if (data.type === 'floatText') {
                this.effectSpawner.spawnCollectText(data.x, data.y, data.text, data.color);
            }
        });
    }

    buildLevels() {
        return [
            {
                name: '对决峡谷',
                map: [
                    '####################',
                    '#P......K..BBB....Q#',
                    '#..####.....##....#',
                    '#..#..C...KC......#',
                    '#..#..BBBB......###',
                    '#..#......K...C..#',
                    '#...####..........#',
                    '#...C...BBBB..K...#',
                    '#...####..........#',
                    '#..#......K.......#',
                    '#..###..BBBB..C..##',
                    '#..#..C.......C..#',
                    '#..##....####..###',
                    '#...K..G.G..K....#',
                    '####################',
                ]
            },
            {
                name: '磁性绕道',
                map: [
                    '####################',
                    '#P....KBBBB......Q#',
                    '#.####........####.#',
                    '#.#...KC..T..K....#',
                    '#.#..####..####.#.#',
                    '#.#..C..........#.#',
                    '#.#..BBBB..BBBB.#.#',
                    '#.#....K......C..#.#',
                    '#.########..####.#',
                    '#......KT.........#',
                    '#..####..BBBB..#.#',
                    '#..CK.........C..#',
                    '#....####..####.#',
                    '#..K...G.G..K....#',
                    '####################',
                ]
            },
            {
                name: '分岔迷宫',
                map: [
                    '####################',
                    '#P......K...BBB..Q#',
                    '#.####.....##.....#',
                    '#.#..C....BBBB..#.#',
                    '#.#..##..C..K...#.#',
                    '#.#..........##.#.#',
                    '#.#..####..T..#.#.#',
                    '#.#..C..........#.#',
                    '#.#..BBBB..####.#.#',
                    '#.#..C......K...#.#',
                    '#.#..##........#.#',
                    '#...#..####..##..#',
                    '#.C....K.........#',
                    '#...K..G.G.......#',
                    '####################',
                ]
            },
            {
                name: '漩涡竞技场',
                map: [
                    '####################',
                    '#P....BBBB..K....Q#',
                    '#..####....####..#',
                    '#..#..........#..#',
                    '#.#..C..BBBB..#.#',
                    '#.#.....K....#.#.#',
                    '#.#..####..T.#.#.#',
                    '#.#..C.......#.#.#',
                    '#.#..BBBB.####.#.#',
                    '#.#..C..K......#.#',
                    '#.#..........##.#',
                    '#..####..####..#',
                    '#....K.G.G.......#',
                    '#....C......C....#',
                    '####################',
                ]
            },
            {
                name: '陷阱迷宫',
                map: [
                    '####################',
                    '#P..K..BBBB.K....Q#',
                    '#.####..........##.#',
                    '#.#..C..K..K..C..#',
                    '#.#..##..BBBB..#.#',
                    '#.#..K..........#.#',
                    '#.#..##..T..##.#.#',
                    '#.#......BBBB.....#',
                    '#.#..K..####..K.#',
                    '#.#..C..........#.#',
                    '#.#..BBBB..T..#.#',
                    '#.#..K......K..#.#',
                    '#....##..####..#',
                    '#.K....G.G.......#',
                    '####################',
                ]
            },
            {
                name: '磁暴战场',
                map: [
                    '####################',
                    '#P....K...BBB..K.Q#',
                    '#..####....####..#',
                    '#..#..........#..#',
                    '#.#..C..KK..C..#.#',
                    '#.#....BBBB....#.#',
                    '#.#..####..T..#.#.#',
                    '#.#..C...K.....#.#',
                    '#.#..BBBB..BBB.#.#',
                    '#.#..C..........#.#',
                    '#.#........K...##.#',
                    '#..####..####..#',
                    '#.....KG.G........#',
                    '#....C......C....#',
                    '####################',
                ]
            }
        ];
    }

    initStars() {
        this.stars = [];
        for (let i = 0; i < 100; i++) {
            this.stars.push({
                x: Math.random() * this.canvasW,
                y: Math.random() * this.canvasH,
                size: 0.3 + Math.random() * 1.8,
                twinkleSpeed: 0.3 + Math.random() * 2.5,
                twinkleOffset: Math.random() * Math.PI * 2
            });
        }
    }

    init(levelId = 0) {
        this.levelId = levelId;
        this.gameOver = false;
        this.running = true;

        this.titleAlpha = 1;
        this.titleTimer = 2.0;

        GameManager.init();
        GameManager.startGame(levelId);

        this.map = new MapBase();
        this.map.loadFromText(this.levelMaps[levelId].map);
        this.mapAPI = new MapAPI(this.map);

        const spawns = this.mapAPI.getSpawnPoints();
        this.player1 = new Player(1, { moveSpeed: 280, magneticForce: 120000 });
        this.player1.setPosition(spawns[0].x, spawns[0].y);

        this.player2 = new Player(2, { moveSpeed: 280, magneticForce: 120000 });
        this.player2.setPosition(spawns[1].x, spawns[1].y);

        this.player1.setup(this.player2, this.mapAPI, this.interactionAPI, this.inputHelper);
        this.player2.setup(this.player1, this.mapAPI, this.interactionAPI, this.inputHelper);

        // 挂载拖尾特效
        this.trailP1.clear();
        this.trailP2.clear();
        this.player1.trailEffect = this.trailP1;
        this.player2.trailEffect = this.trailP2;

        // 创建陷阱
        this.traps = [];
        this.player1.traps = this.traps;
        this.player2.traps = this.traps;
        const rows = this.levelMaps[levelId].map;
        let trapId = 0;
        for (let row = 0; row < rows.length; row++) {
            for (let col = 0; col < rows[row].length; col++) {
                if (rows[row][col] === 'K') {
                    const x = col * this.tileSize;
                    const y = row * this.tileSize;
                    this.traps.push(new MagneticTrap(x, y, this.tileSize, 'K', trapId++));
                }
            }
        }

        this.inputHelper.registerScheme(1, {
            up: 'w', down: 's', left: 'a', right: 'd',
            switchPolarity: 'q', dash: 'g'
        });
        this.inputHelper.registerScheme(2, {
            up: 'arrowup', down: 'arrowdown', left: 'arrowleft', right: 'arrowright',
            switchPolarity: '/', dash: '.'
        });

        this.initCollectibles();
        this.setupInput();
        this.drawFrame();
    }

    initCollectibles() {
        this.coins = [];
        this.powerUps = [];
        const coinSpawns = this.map.getCoins();
        for (const cs of coinSpawns) {
            this.coins.push(new Coin(cs.x, cs.y, cs.value));
        }
        const rows = this.levelMaps[this.levelId].map;
        for (let row = 0; row < rows.length; row++) {
            for (let col = 0; col < rows[row].length; col++) {
                if (rows[row][col] === 'I') {
                    const cx = col * this.tileSize + this.tileSize / 2;
                    const cy = row * this.tileSize + this.tileSize / 2;
                    this.powerUps.push(new PowerUp(cx, cy));
                }
            }
        }
    }

    setupInput() {
        if (this._keydownHandler) document.removeEventListener('keydown', this._keydownHandler);
        if (this._keyupHandler) document.removeEventListener('keyup', this._keyupHandler);

        const gameKeys = ['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',
            'w','a','s','d','q','g','.','/',
            'W','A','S','D','Q','G','r','R','1','2','3','4','5','6','7','8'];

        this._keydownHandler = (e) => {
            if (gameKeys.includes(e.key)) {
                e.preventDefault();
            }
            if (this.gameOver && e.key.toLowerCase() === 'r') { this.restart(); return; }
            this.inputHelper.onKeyDown(e);
            if (!this.gameOver) {
                const num = parseInt(e.key);
                if (num >= 1 && num <= 8 && num - 1 !== this.levelId && (num - 1) < this.levelMaps.length) {
                    this.restart(num - 1);
                }
            }
        };
        this._keyupHandler = (e) => {
            if (gameKeys.includes(e.key)) {
                e.preventDefault();
            }
            this.inputHelper.onKeyUp(e);
        };
        document.addEventListener('keydown', this._keydownHandler);
        document.addEventListener('keyup', this._keyupHandler);
    }

    start(levelId) {
        if (levelId !== undefined) this.levelId = levelId;
        this.init(this.levelId);
        this.lastTime = performance.now();
        this.totalTime = 0;
        this.gameLoop(this.lastTime);
    }

    restart(levelId = null) {
        if (levelId !== null) this.levelId = levelId;
        this.gameOver = false;
        this.init(this.levelId);
        this.lastTime = performance.now();
        this.totalTime = 0;
    }

    gameLoop(timestamp) {
        if (!this.running) return;
        const delta = Math.min((timestamp - this.lastTime) / 1000, 0.05);
        this.lastTime = timestamp;
        if (!this.gameOver) this.totalTime += delta;
        this.update(delta);
        this.drawFrame();
        this.inputHelper.endFrame();
        this.animFrameId = requestAnimationFrame((t) => this.gameLoop(t));
    }

    update(delta) {
        if (this.gameOver) return;

        if (this.titleAlpha > 0 && this.titleTimer > 0) {
            this.titleTimer -= delta;
            if (this.titleTimer <= 0) this.titleAlpha = Math.max(0, this.titleAlpha - delta * 2);
        }

        this.player1.update(delta);
        this.player2.update(delta);
        this.checkCollectibles();
        this.checkSettlePoints();
        this.effectSpawner.update(delta);

        for (const coin of this.coins) coin.update(delta, this.totalTime);
        for (const pu of this.powerUps) pu.update(delta);
        for (const trap of this.traps) trap.update(delta);
    }

    checkCollectibles() {
        const p1pos = this.player1.getPos();
        const p2pos = this.player2.getPos();

        for (let i = this.coins.length - 1; i >= 0; i--) {
            const coin = this.coins[i];
            let collected = false;
            if (!this.player1.arrived && coin.checkCollision(p1pos, this.player1.radius)) {
                const v = coin.collect(); GameManager.addCoin(1, v);
                this.effectSpawner.spawnCollectText(coin.x, coin.y - 12, '+' + v, '#ffd700');
                this.effectSpawner.spawnCoinBurst(coin.x, coin.y);
                collected = true;
            } else if (!this.player2.arrived && coin.checkCollision(p2pos, this.player2.radius)) {
                const v = coin.collect(); GameManager.addCoin(2, v);
                this.effectSpawner.spawnCollectText(coin.x, coin.y - 12, '+' + v, '#ffd700');
                this.effectSpawner.spawnCoinBurst(coin.x, coin.y);
                collected = true;
            }
            if (collected) this.coins.splice(i, 1);
        }

        for (let i = this.powerUps.length - 1; i >= 0; i--) {
            const pu = this.powerUps[i];
            let collected = false;
            if (!this.player1.arrived && pu.checkCollision(p1pos, this.player1.radius)) {
                pu.collect(this.player1);
                this.effectSpawner.spawnCollectText(pu.x, pu.y - 12, '⚡ POWER!', '#cc66ff');
                this.effectSpawner.spawnCoinBurst(pu.x, pu.y);
                collected = true;
            } else if (!this.player2.arrived && pu.checkCollision(p2pos, this.player2.radius)) {
                pu.collect(this.player2);
                this.effectSpawner.spawnCollectText(pu.x, pu.y - 12, '⚡ POWER!', '#cc66ff');
                this.effectSpawner.spawnCoinBurst(pu.x, pu.y);
                collected = true;
            }
            if (collected) this.powerUps.splice(i, 1);
        }
    }

    checkSettlePoints() {
        if (!this.player1.arrived && this.mapAPI.isAtSettlePoint(this.player1.getPos())) {
            this.player1.markArrived(this.totalTime);
            this.effectSpawner.spawnCollectText(this.player1.x, this.player1.y - 20, '✅ P1 到达!', '#55ff55');
            this.effectSpawner.spawnSettleEffect(this.player1.x, this.player1.y);
        }
        if (!this.player2.arrived && this.mapAPI.isAtSettlePoint(this.player2.getPos())) {
            this.player2.markArrived(this.totalTime);
            this.effectSpawner.spawnCollectText(this.player2.x, this.player2.y - 20, '✅ P2 到达!', '#55ff55');
            this.effectSpawner.spawnSettleEffect(this.player2.x, this.player2.y);
        }

        if (this.player1.arrived && this.player2.arrived && !this.gameOver) {
            this.gameOver = true;
            GameManager.goToGameOver();
        }
    }

    drawFrame() {
        const ctx = this.ctx;
        ctx.fillStyle = '#0d1b2a';
        ctx.fillRect(0, 0, this.canvasW, this.canvasH);
        this.drawStars(ctx);

        ctx.strokeStyle = 'rgba(25, 45, 65, 0.25)';
        ctx.lineWidth = 0.5;
        for (let x = 0; x < this.canvasW; x += this.tileSize)
            for (let y = 0; y < this.canvasH; y += this.tileSize)
                ctx.strokeRect(x, y, this.tileSize, this.tileSize);

        this.drawMapElements(ctx);
        for (const coin of this.coins) coin.draw(ctx, this.totalTime);
        for (const pu of this.powerUps) pu.draw(ctx);

        // 绘制陷阱（在玩家下方）
        for (const trap of this.traps) trap.draw(ctx, this.totalTime);

        this.hud.drawMagneticLine(ctx, this.player1, this.player2);

        // 玩家绘制（含拖尾）
        this.player1.draw(ctx);
        this.player2.draw(ctx);

        this.effectSpawner.draw(ctx);

        // HUD（全部紧凑+半透明，不遮挡地图）
        this.hud.drawPolarityStatus(ctx, this.player1, this.player2);
        this.hud.drawCoins(ctx, GameManager.getCoin(1), GameManager.getCoin(2));
        this.hud.drawTimer(ctx, this.totalTime);
        this.hud.drawBoostStatus(ctx, this.player1, 4, this.canvasH - 84, 'P1', 'G', '#ffaa44');
        this.hud.drawBoostStatus(ctx, this.player2, 316, this.canvasH - 84, 'P2', '.', '#6699ff');

        this.hud.drawArrivalStatus(ctx, this.player1, this.player2);

        if (this.titleAlpha > 0) {
            this.hud.drawLevelTitle(ctx, this.levelMaps[this.levelId].name, this.titleAlpha);
        }

        if (this.gameOver) {
            this.hud.drawGameOver(ctx, GameManager.getCoin(1), GameManager.getCoin(2),
                GameManager.arrivalTimeP1, GameManager.arrivalTimeP2);
        }
    }

    drawStars(ctx) {
        for (const s of this.stars) {
            const t = 0.25 + Math.sin(this.totalTime * s.twinkleSpeed + s.twinkleOffset) * 0.35;
            ctx.fillStyle = `rgba(255, 255, 255, ${t})`;
            ctx.beginPath(); ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2); ctx.fill();
        }
    }

    drawMapElements(ctx) {
        const rows = this.levelMaps[this.levelId].map;
        let tpIndex = 0;
        for (let row = 0; row < rows.length; row++) {
            for (let col = 0; col < rows[row].length; col++) {
                const ch = rows[row][col];
                const x = col * this.tileSize, y = row * this.tileSize;
                const cx = x + this.tileSize / 2, cy = y + this.tileSize / 2;
                switch (ch) {
                    case '#': this.drawWall(ctx, x, y); break;
                    case 'B': this.drawBarrier(ctx, x, y, col); break;
                    case 'T': this.drawTeleporter(ctx, cx, cy, tpIndex); tpIndex++; break;
                    case 'P': this.drawSpawn(ctx, cx, cy, '#ff4444', 'P1'); break;
                    case 'Q': this.drawSpawn(ctx, cx, cy, '#4488ff', 'P2'); break;
                    case 'G': this.drawGoal(ctx, cx, cy); break;
                }
            }
        }
    }

    drawWall(ctx, x, y) {
        const w = this.tileSize, h = this.tileSize;
        ctx.fillStyle = '#0d1522'; ctx.fillRect(x + 2, y + 2, w - 4, h - 4);
        ctx.fillStyle = '#1e3050'; ctx.fillRect(x + 1, y + 1, w - 2, h - 2);
        ctx.fillStyle = '#2d4470'; ctx.fillRect(x + 3, y + 3, w - 6, h - 6);
        ctx.fillStyle = '#3e5890'; ctx.fillRect(x + 4, y + 4, w - 8, 2); ctx.fillRect(x + 4, y + 4, 2, h - 8);
        ctx.fillStyle = '#152238'; ctx.fillRect(x + 3, y + h - 5, w - 6, 2); ctx.fillRect(x + w - 5, y + 3, 2, h - 6);
        ctx.strokeStyle = '#284870'; ctx.lineWidth = 1; ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
    }

    drawBarrier(ctx, x, y, col) {
        const w = this.tileSize, h = this.tileSize, time = this.totalTime;
        const pulse = Math.sin(time * 2.5 + col * 0.4) * 0.08;
        ctx.fillStyle = `rgba(20, 80, 180, ${0.22 + pulse})`;
        ctx.fillRect(x + 1, y + 1, w - 2, h - 2);
        ctx.strokeStyle = `rgba(70, 180, 255, ${0.57 + pulse})`;
        ctx.lineWidth = 2; ctx.strokeRect(x + 2, y + 2, w - 4, h - 4);
        ctx.strokeStyle = `rgba(100, 200, 255, ${0.3 + pulse})`;
        ctx.lineWidth = 1; ctx.setLineDash([3, 6]);
        ctx.beginPath(); ctx.moveTo(x + 10, y + 10); ctx.lineTo(x + w - 10, y + h - 10);
        ctx.moveTo(x + w - 10, y + 10); ctx.lineTo(x + 10, y + h - 10); ctx.stroke();
        ctx.setLineDash([]);
        const t = (time + col * 0.5) % 1;
        for (let i = 0; i < 2; i++) {
            const p = (t + i * 0.5) % 1;
            ctx.fillStyle = 'rgba(150, 220, 255, 0.6)';
            ctx.beginPath(); ctx.arc(x + 4 + (w - 8) * p, y + h / 2 + Math.sin(p * Math.PI * 4 + time * 3) * 6, 2, 0, Math.PI * 2); ctx.fill();
        }
    }

    drawTeleporter(ctx, cx, cy, index) {
        const time = this.totalTime * 3 + index * 2.5;
        for (let i = 0; i < 2; i++) {
            ctx.strokeStyle = `rgba(150, 70, 220, ${0.4 - i * 0.15})`;
            ctx.lineWidth = 2; ctx.setLineDash([6, 8]);
            ctx.beginPath(); ctx.arc(cx, cy, 14 + i * 4, time + i * Math.PI, time + i * Math.PI + Math.PI * 1.5); ctx.stroke(); ctx.setLineDash([]);
        }
        const g = ctx.createRadialGradient(cx, cy, 2, cx, cy, 11);
        g.addColorStop(0, 'rgba(200, 100, 255, 0.7)'); g.addColorStop(0.6, 'rgba(100, 30, 180, 0.5)'); g.addColorStop(1, 'rgba(50, 10, 120, 0.3)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, 11, 0, Math.PI * 2); ctx.fill();
    }

    drawSpawn(ctx, cx, cy, color, label) {
        const pulse = Math.sin(this.totalTime * 3) * 0.12;
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${0.2 + pulse})`;
        ctx.beginPath(); ctx.arc(cx, cy, 16, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.6)`;
        ctx.lineWidth = 2; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.arc(cx, cy, 16, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = '#ffffff';
        ctx.font = '8px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, cx, cy);
        ctx.textAlign = 'start';
        ctx.textBaseline = 'alphabetic';
    }

    drawGoal(ctx, cx, cy) {
        const time = this.totalTime * 3;
        const ga = 0.2 + Math.sin(time * 1.2) * 0.1;
        const gg = ctx.createRadialGradient(cx, cy, 4, cx, cy, 22);
        gg.addColorStop(0, `rgba(255, 215, 0, ${ga + 0.2})`); gg.addColorStop(1, 'rgba(255, 215, 0, 0)');
        ctx.fillStyle = gg; ctx.beginPath(); ctx.arc(cx, cy, 22, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#ffd700'; ctx.beginPath();
        for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2 + time * 0.4; const r = i % 2 === 0 ? 14 : 6; const px = cx + Math.cos(a) * r, py = cy + Math.sin(a) * r; if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py); } ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(cx, cy, 4, 0, Math.PI * 2); ctx.fill();
    }

    // 设置拖尾样式
    setTrailStyle(playerId, styleKey) {
        if (playerId === 1) this.trailP1.setStyle(styleKey);
        else this.trailP2.setStyle(styleKey);
    }

    getTrailStyles() {
        return this.trailP1.getTrailStyleNames();
    }

    stop() {
        this.running = false;
        if (this.animFrameId) { cancelAnimationFrame(this.animFrameId); this.animFrameId = null; }
        if (this._keydownHandler) document.removeEventListener('keydown', this._keydownHandler);
        if (this._keyupHandler) document.removeEventListener('keyup', this._keyupHandler);
    }
}

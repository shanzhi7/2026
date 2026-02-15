/**
 * FireworksEngine.js - Mobile Optimized with Explosion Throttling
 */

const PI2 = Math.PI * 2;
const random = (min, max) => Math.random() * (max - min) + min;
const FOCAL_LENGTH = 500;

class Particle {
    constructor() { this.alive = false; }
    spawn(x, y, z, color, vx, vy, vz, friction, gravity, decay, type) {
        this.x3d = x; this.y3d = y; this.z3d = z;
        this.vx = vx; this.vy = vy; this.vz = vz;
        this.lx3d = x; this.ly3d = y; this.lz3d = z;
        this.color = color;
        this.friction = friction;
        this.gravity = gravity;
        this.decay = decay;
        this.type = type; 
        this.alpha = 1;
        this.alive = true;
    }
    update() {
        this.lx3d = this.x3d; this.ly3d = this.y3d; this.lz3d = this.z3d;
        this.vx *= this.friction; this.vy *= this.friction; this.vz *= this.friction;
        this.vy += this.gravity;
        this.x3d += this.vx; this.y3d += this.vy; this.z3d += this.vz;
        this.alpha -= this.decay;
        if (this.alpha <= 0 || this.z3d <= -FOCAL_LENGTH + 20) this.alive = false;
    }
    draw(ctx, w, h) {
        const denom = FOCAL_LENGTH + this.z3d;
        if (denom <= 0) return;
        const scale = FOCAL_LENGTH / denom;
        const x2d = (this.x3d * scale) + w / 2;
        const y2d = (this.y3d * scale) + h / 2;
        if (x2d < -100 || x2d > w + 100 || y2d < -100 || y2d > h + 100) return;
        const lScale = FOCAL_LENGTH / (FOCAL_LENGTH + this.lz3d);
        ctx.globalAlpha = this.alpha;
        ctx.strokeStyle = this.color;
        let baseWidth = (this.type === 'willow' ? 2 : 4) * scale;
        ctx.lineWidth = baseWidth;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo((this.lx3d * lScale) + w / 2, (this.ly3d * lScale) + h / 2);
        ctx.lineTo(x2d, y2d);
        ctx.stroke();
        if (this.alpha > 0.7) {
            ctx.strokeStyle = '#FFF';
            ctx.lineWidth = baseWidth * 0.4;
            ctx.stroke();
        }
    }
}

class TextParticle {
    constructor() { this.alive = false; }
    spawn(sx, sy, sz, tx, ty, tz, color) {
        this.x3d = sx; this.y3d = sy; this.z3d = sz;
        this.tx3d = tx; this.ty3d = ty; this.tz3d = tz;
        this.color = color; this.alive = true;
        this.state = 'gathering'; this.alpha = 0;
    }
    update() {
        if (this.state === 'gathering') {
            this.x3d += (this.tx3d - this.x3d) * 0.07;
            this.y3d += (this.ty3d - this.y3d) * 0.07;
            this.z3d += (this.tz3d - this.z3d) * 0.07;
            this.alpha = Math.min(1, this.alpha + 0.05);
            if (Math.abs(this.z3d - this.tz3d) < 1) this.state = 'holding';
        } else if (this.state === 'dispersing') {
            this.x3d += random(-5, 5); this.y3d += 8; this.z3d -= 12; this.alpha -= 0.02;
            if (this.alpha <= 0 || this.z3d <= -FOCAL_LENGTH + 10) this.alive = false;
        }
    }
    draw(ctx, w, h) {
        const denom = FOCAL_LENGTH + this.z3d;
        if (denom <= 0) return;
        const scale = FOCAL_LENGTH / denom;
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc((this.x3d * scale) + w/2, (this.y3d * scale) + h/2, 3 * scale, 0, PI2);
        ctx.fill();
    }
}

class Rocket {
    constructor() { this.alive = false; }
    spawn(x, y, z, vx, vy, vz, targetY, color, onExplode) {
        this.x3d = x; this.y3d = y; this.z3d = z;
        this.lx3d = x; this.ly3d = y; this.lz3d = z;
        this.vx = vx; this.vy = vy; this.vz = vz;
        this.targetY = targetY; this.color = color;
        this.alive = true; this.onExplode = onExplode;
    }
    update(engine) {
        this.lx3d = this.x3d; this.ly3d = this.y3d; this.lz3d = this.z3d;
        this.x3d += this.vx; this.y3d += this.vy; this.z3d += this.vz;
        if (Math.random() > 0.6) {
            engine.spawnParticle(this.x3d, this.y3d, this.z3d, '#FFD700', random(-1,1), random(1,3), random(-1,1), 0.95, 0.1, 0.03, 'normal');
        }
        if (this.y3d <= this.targetY) { 
            this.alive = false; 
            this.onExplode(this.x3d, this.y3d, this.z3d, this.color); 
        }
    }
    draw(ctx, w, h) {
        const denom = FOCAL_LENGTH + this.z3d;
        if (denom <= 0) return;
        const scale = FOCAL_LENGTH / denom;
        ctx.strokeStyle = 'rgba(255, 255, 200, 0.8)';
        ctx.lineWidth = 2 * scale;
        ctx.beginPath();
        ctx.moveTo((this.lx3d * (FOCAL_LENGTH/(FOCAL_LENGTH+this.lz3d))) + w/2, (this.ly3d * (FOCAL_LENGTH/(FOCAL_LENGTH+this.lz3d))) + h/2);
        ctx.lineTo((this.x3d * scale) + w/2, (this.y3d * scale) + h/2);
        ctx.stroke();
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.arc((this.x3d * scale) + w/2, (this.y3d * scale) + h/2, 3 * scale, 0, PI2);
        ctx.fill();
    }
}

class FireworksEngine {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d', { alpha: false });
        this.textCanvas = document.getElementById('textCanvas');
        this.textCtx = this.textCanvas.getContext('2d');
        this.pool = {
            particles: { active: [], dead: Array.from({length: 12000}, () => new Particle()) },
            textParticles: { active: [], dead: Array.from({length: 8000}, () => new TextParticle()) },
            rockets: { active: [], dead: Array.from({length: 40}, () => new Rocket()) }
        };
        this.colors = ['#FFD700', '#FF4500', '#FF0000', '#00FFFF', '#FFFFFF', '#FF1493', '#ADFF2F'];
        
        // 并发控制变量
        this.lastExplosionTime = 0;
        this.explosionWindowCount = 0;

        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.initInteractions();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.width = window.innerWidth; this.height = window.innerHeight;
    }

    spawnParticle(...args) {
        if (this.pool.particles.dead.length === 0) return;
        const p = this.pool.particles.dead.pop();
        p.spawn(...args);
        this.pool.particles.active.push(p);
    }

    spawnTextParticle(...args) {
        if (this.pool.textParticles.dead.length === 0) return;
        const p = this.pool.textParticles.dead.pop();
        p.spawn(...args);
        this.pool.textParticles.active.push(p);
    }

    spawnRocket(x, y, z, vx, vy, vz, targetY, color, onExplode) {
        if (this.pool.rockets.dead.length === 0) return;
        const p = this.pool.rockets.dead.pop();
        p.spawn(x, y, z, vx, vy, vz, targetY, color, onExplode);
        this.pool.rockets.active.push(p);
    }

    initInteractions() {
        window.addEventListener('pointerdown', (e) => {
            const x = e.clientX - this.width / 2;
            const targetY = e.clientY - this.height / 2;
            this.spawnRocket(x, this.height / 2, 0, 0, -18, 0, targetY, this.colors[Math.floor(Math.random()*this.colors.length)], (ex,ey,ez,c) => {
                this.burst(ex, ey, ez, c);
                if (this.onExplode) this.onExplode();
            });
            if (this.onLaunch) this.onLaunch();
        });
    }

    burst(x, y, z, color) {
        // 并发控制：限制 200ms 内最多触发 2 次大规模爆破
        const now = Date.now();
        if (now - this.lastExplosionTime < 200) {
            this.explosionWindowCount++;
        } else {
            this.lastExplosionTime = now;
            this.explosionWindowCount = 1;
        }
        if (this.explosionWindowCount > 2) return;

        const patterns = ['sphere', 'willow', 'ring'];
        const pattern = patterns[Math.floor(Math.random()*patterns.length)];
        const count = 300; // 减少粒子数
        
        for (let i = 0; i < count; i++) {
            const theta = random(0, PI2), phi = Math.acos(random(-1, 1));
            // 缩小爆炸半径：Strength 从 22 降至 18
            let strength = random(8, 18);
            if (pattern === 'ring') strength = 13;
            const vx = strength * Math.sin(phi) * Math.cos(theta);
            const vy = strength * Math.sin(phi) * Math.sin(theta);
            const vz = strength * Math.cos(phi);
            
            let friction = 0.94, gravity = 0.12, decay = random(0.01, 0.025), type = 'normal';
            if (pattern === 'willow') { friction = 0.97; gravity = 0.1; decay = random(0.006, 0.015); type = 'willow'; }

            this.spawnParticle(x, y, z, color, vx, vy, vz, friction, gravity, decay, type);
        }
    }

    getTextPoints(text) {
        const fontSize = 260; 
        this.textCanvas.width = fontSize * 1.5; this.textCanvas.height = fontSize * 1.5;
        this.textCtx.font = `900 ${fontSize}px "Noto Serif SC"`;
        this.textCtx.fillStyle = "white"; this.textCtx.textAlign = "center"; this.textCtx.textBaseline = "middle";
        this.textCtx.clearRect(0, 0, this.textCanvas.width, this.textCanvas.height);
        this.textCtx.fillText(text, this.textCanvas.width / 2, this.textCanvas.height / 2);
        const imageData = this.textCtx.getImageData(0,0,this.textCanvas.width,this.textCanvas.height).data;
        const pts = [];
        for(let y=0; y<this.textCanvas.height; y+=6) {
            for(let x=0; x<this.textCanvas.width; x+=6) {
                if(imageData[(y*this.textCanvas.width+x)*4+3] > 128) pts.push({x: x-this.textCanvas.width/2, y: y-this.textCanvas.height/2});
            }
        }
        return pts;
    }

    async playGreeting(phrase) {
        for(const char of phrase) {
            const pts = this.getTextPoints(char);
            pts.forEach(pt => {
                this.spawnTextParticle(random(-this.width, this.width), random(-this.height, this.height), 800, pt.x, pt.y, 0, "#D4AF37");
            });
            await new Promise(r => setTimeout(r, 2000));
            this.pool.textParticles.active.forEach(p => p.state = 'dispersing');
            await new Promise(r => setTimeout(r, 600));
        }
    }

    update() {
        this.ctx.fillStyle = 'black';
        this.ctx.globalAlpha = 0.22;
        this.ctx.fillRect(0, 0, this.width, this.height);
        this.ctx.globalAlpha = 1;

        this._updatePool(this.pool.rockets, (r) => r.update(this));
        this._updatePool(this.pool.particles, (p) => p.update());
        this._updatePool(this.pool.textParticles, (tp) => tp.update());

        if (Math.random() < 0.04) {
            const rx = random(-this.width/3, this.width/3);
            const rz = random(0, 300);
            const targetY = random(-this.height/6, -this.height/3);
            this.spawnRocket(rx, this.height / 2, rz, 0, -16, -4, targetY, this.colors[Math.floor(Math.random()*this.colors.length)], (ex,ey,ez,c) => {
                this.burst(ex, ey, ez, c);
                if (this.onExplode) this.onExplode();
            });
            if (this.onLaunch) this.onLaunch();
        }
        requestAnimationFrame(() => this.update());
    }

    _updatePool(group, updateFn) {
        const { active, dead } = group;
        for (let i = active.length - 1; i >= 0; i--) {
            const obj = active[i];
            updateFn(obj);
            if (!obj.alive) {
                const last = active.pop();
                if (i < active.length) active[i] = last;
                dead.push(obj);
            } else {
                obj.draw(this.ctx, this.width, this.height);
            }
        }
    }
}

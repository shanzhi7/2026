/**
 * FireworksEngine.js - Reverted Visuals with Modern Text System
 */

const PI2 = Math.PI * 2;
const random = (min, max) => Math.random() * (max - min) + min;
const FOCAL_LENGTH = 500;

// 1. 恢复：极致美感的烟花粒子类
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
        this.vx *= this.friction;
        this.vy *= this.friction;
        this.vz *= this.friction;
        this.vy += this.gravity;
        this.x3d += this.vx;
        this.y3d += this.vy;
        this.z3d += this.vz;
        this.alpha -= this.decay;

        if (this.alpha <= 0 || this.z3d <= -FOCAL_LENGTH + 20) {
            this.alive = false;
        }
    }

    draw(ctx, w, h) {
        const denom = FOCAL_LENGTH + this.z3d;
        const lDenom = FOCAL_LENGTH + this.lz3d;
        if (denom <= 0 || lDenom <= 0) return;

        const scale = FOCAL_LENGTH / denom;
        const lScale = FOCAL_LENGTH / lDenom;

        const x2d = (this.x3d * scale) + w / 2;
        const y2d = (this.y3d * scale) + h / 2;
        const lx2d = (this.lx3d * lScale) + w / 2;
        const ly2d = (this.ly3d * lScale) + h / 2;

        if (x2d < -200 || x2d > w + 200 || y2d < -200 || y2d > h + 200) return;

        ctx.globalAlpha = this.alpha;
        ctx.strokeStyle = this.color;
        // 恢复：具有体积感的线条宽度
        ctx.lineWidth = Math.min(20, (this.type === 'willow' ? 2 : 5) * scale);
        ctx.lineCap = 'round'; // 恢复：圆润线头
        
        ctx.beginPath();
        ctx.moveTo(lx2d, ly2d);
        ctx.lineTo(x2d, y2d);
        ctx.stroke();

        // 恢复：白色叠绘核心
        if (this.alpha > 0.7) {
            ctx.strokeStyle = '#FFF';
            ctx.lineWidth *= 0.4;
            ctx.stroke();
        }
    }
}

// 2. 恢复：带尾迹的火箭类
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
        this.x3d += this.vx;
        this.y3d += this.vy;
        this.z3d += this.vz;
        
        if (Math.random() > 0.5) {
            const p = engine.getParticle();
            p.spawn(this.x3d, this.y3d, this.z3d, '#FFD700', random(-1,1), random(1,3), random(-1,1), 0.95, 0.1, 0.03, 'normal');
        }

        if (this.y3d <= this.targetY) { 
            this.alive = false; 
            this.onExplode(this.x3d, this.y3d, this.z3d, this.color); 
        }
    }
    draw(ctx, w, h) {
        const denom = FOCAL_LENGTH + this.z3d;
        const lDenom = FOCAL_LENGTH + this.lz3d;
        if (denom <= 0 || lDenom <= 0) return;
        
        const scale = FOCAL_LENGTH / denom;
        const lScale = FOCAL_LENGTH / lDenom;
        
        ctx.strokeStyle = 'rgba(255, 255, 200, 0.8)';
        ctx.lineWidth = 2 * scale;
        ctx.beginPath();
        ctx.moveTo((this.lx3d * lScale) + w/2, (this.ly3d * lScale) + h/2);
        ctx.lineTo((this.x3d * scale) + w/2, (this.y3d * scale) + h/2);
        ctx.stroke();

        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.arc((this.x3d * scale) + w/2, (this.y3d * scale) + h/2, 3 * scale, 0, PI2);
        ctx.fill();
    }
}

// 3. 保留：当前好评的祝福语粒子逻辑
class TextParticle {
    constructor() { this.alive = false; }
    spawn(sx, sy, sz, tx, ty, tz, color) {
        this.x3d = sx; this.y3d = sy; this.z3d = sz;
        this.tx3d = tx; this.ty3d = ty; this.tz3d = tz;
        this.color = color; this.alive = true;
        this.state = 'gathering'; this.alpha = 0;
        this.vx = 0; this.vy = 0;
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

class FireworksEngine {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d', { alpha: false });
        this.textCanvas = document.getElementById('textCanvas');
        this.textCtx = this.textCanvas.getContext('2d');
        
        this.particles = Array.from({length: 15000}, () => new Particle());
        this.tParticles = Array.from({length: 10000}, () => new TextParticle());
        this.rockets = Array.from({length: 40}, () => new Rocket());
        
        this.pIdx = 0; this.tpIdx = 0; this.rIdx = 0;
        this.colors = ['#FFD700', '#FF4500', '#FF0000', '#00FFFF', '#FFFFFF', '#FF1493', '#ADFF2F'];
        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.initInteractions();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.width = window.innerWidth;
        this.height = window.innerHeight;
    }

    getParticle() {
        const p = this.particles[this.pIdx];
        this.pIdx = (this.pIdx + 1) % this.particles.length;
        return p;
    }

    getRocket() {
        const r = this.rockets[this.rIdx];
        this.rIdx = (this.rIdx + 1) % this.rockets.length;
        return r;
    }

    initInteractions() {
        window.addEventListener('pointerdown', (e) => {
            const x = e.clientX - this.width / 2;
            const targetY = e.clientY - this.height / 2;
            this.launch(x, this.height / 2, 0, 0, -16, 0, targetY, this.colors[Math.floor(Math.random()*this.colors.length)]);
        });
    }

    burst(x, y, z, color) {
        // 恢复：多模式爆破逻辑
        const patterns = ['sphere', 'willow', 'ring'];
        const pattern = patterns[Math.floor(Math.random()*patterns.length)];
        const count = 450; 
        for (let i = 0; i < count; i++) {
            const p = this.getParticle();
            const theta = random(0, PI2);
            const phi = Math.acos(random(-1, 1));
            let strength = random(10, 22);
            if (pattern === 'ring') strength = 14;

            const vx = strength * Math.sin(phi) * Math.cos(theta);
            const vy = strength * Math.sin(phi) * Math.sin(theta);
            const vz = strength * Math.cos(phi);

            let friction = 0.94;
            let gravity = 0.12;
            let decay = random(0.01, 0.02);
            let type = 'normal';

            if (pattern === 'willow') {
                friction = 0.97; gravity = 0.1; decay = random(0.005, 0.01); type = 'willow';
            }

            p.spawn(x, y, z, color, vx, vy, vz, friction, gravity, decay, type);
        }
    }

    launch(x, y, z, vx, vy, vz, targetY, color) {
        const r = this.getRocket();
        r.spawn(x, y, z, vx, vy, vz, targetY, color, (ex,ey,ez,c) => {
            this.burst(ex, ey, ez, c);
            if (this.onExplode) this.onExplode();
        });
        if (this.onLaunch) this.onLaunch();
    }

    getTextPoints(text) {
        const fontSize = 400; 
        this.textCanvas.width = fontSize * 1.5; 
        this.textCanvas.height = fontSize * 1.5;
        this.textCtx.font = `900 ${fontSize}px "Noto Serif SC"`;
        this.textCtx.fillStyle = "white"; 
        this.textCtx.textAlign = "center"; 
        this.textCtx.textBaseline = "middle";
        this.textCtx.clearRect(0, 0, this.textCanvas.width, this.textCanvas.height);
        this.textCtx.fillText(text, this.textCanvas.width / 2, this.textCanvas.height / 2);
        const imageData = this.textCtx.getImageData(0,0,this.textCanvas.width,this.textCanvas.height).data;
        const pts = [];
        for(let y=0; y<this.textCanvas.height; y+=4) {
            for(let x=0; x<this.textCanvas.width; x+=4) {
                if(imageData[(y*this.textCanvas.width+x)*4+3] > 128) pts.push({x: x-this.textCanvas.width/2, y: y-this.textCanvas.height/2});
            }
        }
        return pts;
    }

    async playGreeting(phrase) {
        for(const char of phrase) {
            const pts = this.getTextPoints(char);
            const active = [];
            pts.forEach(pt => {
                const p = this.tParticles[this.tpIdx];
                this.tpIdx = (this.tpIdx + 1) % this.tParticles.length;
                const sx = random(-this.width, this.width);
                const sy = random(-this.height, this.height);
                const sz = 800;
                p.spawn(sx, sy, sz, pt.x, pt.y, 0, "#D4AF37");
                active.push(p);
            });
            await new Promise(r => setTimeout(r, 2000));
            active.forEach(p => p.state = 'dispersing');
            await new Promise(r => setTimeout(r, 600));
        }
    }

    update() {
        this.ctx.fillStyle = 'black';
        this.ctx.globalAlpha = 0.22;
        this.ctx.fillRect(0, 0, this.width, this.height);
        this.ctx.globalAlpha = 1;

        for (let i = 0; i < this.rockets.length; i++) {
            if (this.rockets[i].alive) { 
                this.rockets[i].update(this);
                this.rockets[i].draw(this.ctx, this.width, this.height); 
            }
        }
        for (let i = 0; i < this.particles.length; i++) {
            if (this.particles[i].alive) { this.particles[i].update(); this.particles[i].draw(this.ctx, this.width, this.height); }
        }
        for (let i = 0; i < this.tParticles.length; i++) {
            if (this.tParticles[i].alive) { this.tParticles[i].update(); this.tParticles[i].draw(this.ctx, this.width, this.height); }
        }
        
        if (Math.random() < 0.05) {
            const rx = random(-this.width/3, this.width/3);
            const rz = random(0, 300);
            const targetY = random(-this.height/6, -this.height/3);
            this.launch(rx, this.height/2, rz, 0, -16, -4, targetY, this.colors[Math.floor(Math.random()*this.colors.length)]);
        }
        requestAnimationFrame(() => this.update());
    }
}

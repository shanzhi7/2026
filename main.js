/**
 * main.js - Final Unified Controller
 */

class SoundManager {
    constructor() { this.ctx = null; }
    init() {
        if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        if (this.ctx.state === 'suspended') this.ctx.resume();
    }
    playLaunch() {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(100, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.5);
        gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.5);
        osc.connect(gain); gain.connect(this.ctx.destination);
        osc.start(); osc.stop(this.ctx.currentTime + 0.5);
    }
    playExplode() {
        if (!this.ctx) return;
        const buffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.5, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < buffer.length; i++) data[i] = Math.random() * 2 - 1;
        const source = this.ctx.createBufferSource();
        source.buffer = buffer;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1000, this.ctx.currentTime);
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.5);
        source.connect(filter); filter.connect(gain); gain.connect(this.ctx.destination);
        source.start();
        const osc = this.ctx.createOscillator();
        const lowGain = this.ctx.createGain();
        osc.type = 'sine'; osc.frequency.setValueAtTime(60, this.ctx.currentTime);
        lowGain.gain.setValueAtTime(0.2, this.ctx.currentTime);
        osc.connect(lowGain); lowGain.connect(this.ctx.destination);
        osc.start(); osc.stop(this.ctx.currentTime + 0.3);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const sound = new SoundManager();
    const engine = new FireworksEngine('fireworksCanvas');
    engine.onLaunch = () => sound.playLaunch();
    engine.onExplode = () => sound.playExplode();
    engine.update();

    const targetTime = new Date('2026-02-17T00:00:00').getTime();
    const blessings = ["马到成功", "龙马精神", "一马当先", "前程似锦", "万象更新"];

    const DOM = {
        days: document.getElementById('days'),
        hours: document.getElementById('hours'),
        minutes: document.getElementById('minutes'),
        seconds: document.getElementById('seconds'),
        btnLuck: document.getElementById('btn-luck'),
        card: document.getElementById('countdown-card')
    };

    function updateCountdown() {
        const diff = targetTime - Date.now();
        if (diff <= 0) return;
        const d = Math.floor(diff/86400000), h = Math.floor((diff%86400000)/3600000), m = Math.floor((diff%3600000)/60000), s = Math.floor((diff%60000)/1000);
        DOM.days.innerText = d.toString().padStart(2, '0');
        DOM.hours.innerText = h.toString().padStart(2, '0');
        DOM.minutes.innerText = m.toString().padStart(2, '0');
        DOM.seconds.innerText = s.toString().padStart(2, '0');
    }

    let isGreeting = false;
    DOM.btnLuck.addEventListener('click', async () => {
        sound.init();
        if (isGreeting) return;
        isGreeting = true;
        // 1. 发射庆祝烟花 (x, y, z, vx, vy, vz, targetY, color)
        engine.launch(0, engine.height/2, 0, 0, -15, 0, -100, '#D4AF37');
        // 2. 隐藏倒计时卡片
        gsap.to(DOM.card, { opacity: 0, scale: 0.8, duration: 0.5, pointerEvents: 'none' });
        // 3. 播放文字粒子
        await engine.playGreeting(blessings[Math.floor(Math.random() * blessings.length)]);
        // 4. 恢复卡片
        gsap.to(DOM.card, { opacity: 1, scale: 1, duration: 0.5, pointerEvents: 'auto' });
        isGreeting = false;
    });

    // 窗口点击也激活音频 (支持 PC 与 移动端)
    window.addEventListener('pointerdown', () => sound.init());

    // 3D 旋转交互优化，支持触摸与鼠标
    window.addEventListener('pointermove', (e) => {
        if (isGreeting) return; // 播放祝福语时暂停倾斜
        const xAxis = (window.innerWidth / 2 - e.clientX) / 25;
        const yAxis = (window.innerHeight / 2 - e.clientY) / 25;
        gsap.to(DOM.card, { rotationY: xAxis, rotationX: -yAxis, duration: 1 });
    });

    setInterval(updateCountdown, 1000);
    updateCountdown();
});

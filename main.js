/**
 * main.js - Natural Audio Synthesis
 */

class SoundManager {
    constructor() { this.ctx = null; }
    init() {
        if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        if (this.ctx.state === 'suspended') this.ctx.resume();
    }

    // 模拟自然的火箭喷射声 (Noise-based propulsion)
    playLaunch() {
        if (!this.ctx) return;
        
        // 创建噪声源
        const bufferSize = this.ctx.sampleRate * 0.6;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
        
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        // 使用带通滤波器模拟“嘶嘶”声的频率移动
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.Q.value = 5; // 集中频率
        filter.frequency.setValueAtTime(400, this.ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(3000, this.ctx.currentTime + 0.5);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.5);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);
        
        noise.start();
        noise.stop(this.ctx.currentTime + 0.5);
    }

    // 强化拟真爆炸声 (Impact + Rumble)
    playExplode() {
        if (!this.ctx) return;
        
        // 1. 瞬间爆裂冲击 (Crackle)
        const bufferSize = this.ctx.sampleRate * 0.5;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
        
        const crackle = this.ctx.createBufferSource();
        crackle.buffer = buffer;

        const lowpass = this.ctx.createBiquadFilter();
        lowpass.type = 'lowpass';
        lowpass.frequency.setValueAtTime(1500, this.ctx.currentTime);
        lowpass.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.4);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.7, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.5);

        crackle.connect(lowpass);
        lowpass.connect(gain);
        gain.connect(this.ctx.destination);

        // 2. 低频余震 (The Rumble) - 调优为极短的深沉震动
        const osc = this.ctx.createOscillator();
        const rumbleGain = this.ctx.createGain();
        osc.type = 'triangle'; // triangle 比 sine 更厚重一点
        osc.frequency.setValueAtTime(60, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(20, this.ctx.currentTime + 0.3);
        
        rumbleGain.gain.setValueAtTime(0.5, this.ctx.currentTime);
        rumbleGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.3);
        
        osc.connect(rumbleGain);
        rumbleGain.connect(this.ctx.destination);
        
        crackle.start();
        osc.start();
        osc.stop(this.ctx.currentTime + 0.3);
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

        engine.spawnRocket(0, engine.height/2, 0, 0, -18, 0, -150, '#D4AF37', (ex,ey,ez,c) => {
            engine.burst(ex, ey, ez, c);
            if (engine.onExplode) engine.onExplode();
        });

        gsap.to(DOM.card, { opacity: 0, scale: 0.8, duration: 0.5, pointerEvents: 'none' });
        await engine.playGreeting(blessings[Math.floor(Math.random() * blessings.length)]);
        gsap.to(DOM.card, { opacity: 1, scale: 1, duration: 0.5, pointerEvents: 'auto' });
        isGreeting = false;
    });

    window.addEventListener('pointermove', (e) => {
        if (isGreeting) return;
        const xAxis = (window.innerWidth / 2 - e.clientX) / 20;
        const yAxis = (window.innerHeight / 2 - e.clientY) / 20;
        gsap.to(DOM.card, { rotationY: xAxis, rotationX: -yAxis, duration: 1, ease: "power2.out" });
    });

    window.addEventListener('pointerdown', () => sound.init());
    setInterval(updateCountdown, 1000);
    updateCountdown();
});

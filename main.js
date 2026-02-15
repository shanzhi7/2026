/**
 * main.js - High Volume & Optimized Audio
 */

class SoundManager {
    constructor() { this.ctx = null; }
    init() {
        if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        if (this.ctx.state === 'suspended') this.ctx.resume();
    }
    // 提升发射音量
    playLaunch() {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(120, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1400, this.ctx.currentTime + 0.5);
        // 音量从 0.04 提升到 0.15
        gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.5);
        osc.connect(gain); gain.connect(this.ctx.destination);
        osc.start(); osc.stop(this.ctx.currentTime + 0.5);
    }
    // 提升爆炸音量与震感
    playExplode() {
        if (!this.ctx) return;
        const buffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.5, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < buffer.length; i++) data[i] = Math.random() * 2 - 1;
        
        const source = this.ctx.createBufferSource();
        source.buffer = buffer;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1200, this.ctx.currentTime);
        
        const gain = this.ctx.createGain();
        // 爆炸冲击音量从 0.3 提升到 0.8
        gain.gain.setValueAtTime(0.8, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.5);
        
        source.connect(filter); filter.connect(gain); gain.connect(this.ctx.destination);
        source.start();

        // 增强低频余震
        const osc = this.ctx.createOscillator();
        const lowGain = this.ctx.createGain();
        osc.type = 'sine'; osc.frequency.setValueAtTime(60, this.ctx.currentTime);
        // 低频增益从 0.2 提升到 0.6
        lowGain.gain.setValueAtTime(0.6, this.ctx.currentTime);
        lowGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.4);
        osc.connect(lowGain); lowGain.connect(this.ctx.destination);
        osc.start(); osc.stop(this.ctx.currentTime + 0.4);
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
        engine.launch(0, engine.height/2, 0, 0, -18, 0, -100, '#D4AF37');
        gsap.to(DOM.card, { opacity: 0, scale: 0.8, duration: 0.5, pointerEvents: 'none' });
        await engine.playGreeting(blessings[Math.floor(Math.random() * blessings.length)]);
        gsap.to(DOM.card, { opacity: 1, scale: 1, duration: 0.5, pointerEvents: 'auto' });
        isGreeting = false;
    });

    window.addEventListener('pointerdown', () => sound.init());
    setInterval(updateCountdown, 1000);
    updateCountdown();
});

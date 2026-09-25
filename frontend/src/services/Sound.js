// Короткие звуки на Web Audio — без отдельных файлов.
const KEY = "mahjong.sound";

class Sound {
  constructor() {
    this.ctx = null;
    try {
      this.enabled = localStorage.getItem(KEY) !== "off";
    } catch {
      this.enabled = true;
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    try {
      localStorage.setItem(KEY, this.enabled ? "on" : "off");
    } catch {
      /* ничего страшного */
    }
    return this.enabled;
  }

  tone(freq, duration = 0.08, delay = 0, type = "sine", volume = 0.08) {
    if (!this.enabled) return;
    try {
      this.ctx ||= new (window.AudioContext || window.webkitAudioContext)();
      const t = this.ctx.currentTime + delay;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(volume, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
      osc.connect(gain).connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + duration);
    } catch {
      /* звук не обязателен */
    }
  }

  select() {
    this.tone(660, 0.05, 0, "triangle", 0.05);
  }

  match() {
    this.tone(784, 0.08);
    this.tone(1047, 0.12, 0.07);
  }

  wrong() {
    this.tone(180, 0.12, 0, "square", 0.04);
  }

  shuffle() {
    [400, 500, 600, 700].forEach((f, i) => this.tone(f, 0.05, i * 0.04, "triangle", 0.04));
  }

  win() {
    [523, 659, 784, 1047].forEach((f, i) => this.tone(f, 0.2, i * 0.12, "triangle", 0.07));
  }

  lose() {
    [392, 330, 262].forEach((f, i) => this.tone(f, 0.22, i * 0.15, "sawtooth", 0.04));
  }
}

export default new Sound();

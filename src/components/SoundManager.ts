/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

class SoundManagerClass {
  private ctx: AudioContext | null = null;
  private masterVolume: GainNode | null = null;
  private sfxVolume: GainNode | null = null;
  private musicVolume: GainNode | null = null;
  
  // Radio Synth Music variables
  private sequencerTimer: number | null = null;
  private step = 0;
  private activeStation: 'horizon' | 'grid' | 'dusty' | 'none' = 'none';
  private isPlayingMusic = false;
  
  // Active loop oscillators
  private engineOsc: OscillatorNode | null = null;
  private engineGain: GainNode | null = null;
  private sirenOsc: OscillatorNode | null = null;
  private sirenGain: GainNode | null = null;
  private skidOsc: OscillatorNode | null = null;
  private skidGain: GainNode | null = null;

  constructor() {
    // Lazy initialize on first gesture
  }

  init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
      
      this.masterVolume = this.ctx.createGain();
      this.masterVolume.gain.value = 0.8;
      this.masterVolume.connect(this.ctx.destination);

      this.sfxVolume = this.ctx.createGain();
      this.sfxVolume.gain.value = 0.6;
      this.sfxVolume.connect(this.masterVolume);

      this.musicVolume = this.ctx.createGain();
      this.musicVolume.gain.value = 0.4;
      this.musicVolume.connect(this.masterVolume);
      
      this.startLoopingSounds();
    } catch (e) {
      console.warn("Web Audio API not supported", e);
    }
  }

  setVolume(master: number, sfx: number, music: number) {
    this.init();
    if (!this.ctx) return;
    if (this.masterVolume) this.masterVolume.gain.value = master;
    if (this.sfxVolume) this.sfxVolume.gain.value = sfx;
    if (this.musicVolume) this.musicVolume.gain.value = music;
  }

  // SFX Synth Engines

  playShoot(type: 'pistol' | 'smg' | 'shotgun' | 'rocket') {
    this.init();
    if (!this.ctx || !this.sfxVolume) return;

    const now = this.ctx.currentTime;
    
    // Noise buffer for blast texture
    const bufferSize = this.ctx.sampleRate * (type === 'shotgun' ? 0.3 : type === 'rocket' ? 0.5 : 0.15);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    
    const gain = this.ctx.createGain();

    if (type === 'pistol') {
      filter.frequency.setValueAtTime(1000, now);
      filter.Q.setValueAtTime(2, now);
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
    } else if (type === 'smg') {
      filter.frequency.setValueAtTime(1200, now);
      filter.Q.setValueAtTime(3, now);
      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
    } else if (type === 'shotgun') {
      filter.frequency.setValueAtTime(600, now);
      filter.Q.setValueAtTime(1, now);
      gain.gain.setValueAtTime(0.7, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.28);
    } else { // rocket
      filter.frequency.setValueAtTime(300, now);
      filter.Q.setValueAtTime(0.5, now);
      gain.gain.setValueAtTime(0.9, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);
      
      // Low rumble sub-oscillator
      const sub = this.ctx.createOscillator();
      sub.type = 'sawtooth';
      sub.frequency.setValueAtTime(150, now);
      sub.frequency.exponentialRampToValueAtTime(30, now + 0.4);
      
      const subGain = this.ctx.createGain();
      subGain.gain.setValueAtTime(0.8, now);
      subGain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
      
      sub.connect(subGain);
      subGain.connect(this.sfxVolume);
      sub.start(now);
      sub.stop(now + 0.4);
    }

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxVolume);

    noise.start(now);
    noise.stop(now + (type === 'shotgun' ? 0.3 : type === 'rocket' ? 0.5 : 0.15));
  }

  playExplosion() {
    this.init();
    if (!this.ctx || !this.sfxVolume) return;

    const now = this.ctx.currentTime;
    const duration = 0.8;
    
    // Low pass filtered noise
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, now);
    filter.frequency.exponentialRampToValueAtTime(10, now + duration);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(1.0, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxVolume);

    // Deep sub bass boom
    const sub = this.ctx.createOscillator();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(80, now);
    sub.frequency.linearRampToValueAtTime(20, now + 0.5);

    const subGain = this.ctx.createGain();
    subGain.gain.setValueAtTime(1.2, now);
    subGain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);

    sub.connect(subGain);
    subGain.connect(this.sfxVolume);

    noise.start(now);
    noise.stop(now + duration);
    sub.start(now);
    sub.stop(now + 0.6);
  }

  playHit() {
    this.init();
    if (!this.ctx || !this.sfxVolume) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.08);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

    osc.connect(gain);
    gain.connect(this.sfxVolume);
    osc.start(now);
    osc.stop(now + 0.08);
  }

  playCash() {
    this.init();
    if (!this.ctx || !this.sfxVolume) return;
    const now = this.ctx.currentTime;

    // Dual chime
    const o1 = this.ctx.createOscillator();
    const o2 = this.ctx.createOscillator();
    o1.type = 'sine';
    o2.type = 'sine';
    o1.frequency.setValueAtTime(987.77, now); // B5
    o2.frequency.setValueAtTime(1318.51, now); // E6

    const g1 = this.ctx.createGain();
    const g2 = this.ctx.createGain();
    g1.gain.setValueAtTime(0.15, now);
    g1.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
    g2.gain.setValueAtTime(0.15, now + 0.05);
    g2.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

    o1.connect(g1);
    g1.connect(this.sfxVolume);
    o2.connect(g2);
    g2.connect(this.sfxVolume);

    o1.start(now);
    o1.stop(now + 0.15);
    o2.start(now + 0.05);
    o2.stop(now + 0.25);
  }

  // Active loop controls

  private startLoopingSounds() {
    if (!this.ctx || !this.sfxVolume) return;
    const now = this.ctx.currentTime;

    // Engine loop
    this.engineOsc = this.ctx.createOscillator();
    this.engineOsc.type = 'sawtooth';
    this.engineOsc.frequency.setValueAtTime(40, now);
    
    // Low pass to make it rumble
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(120, now);

    this.engineGain = this.ctx.createGain();
    this.engineGain.gain.value = 0.0; // Start off/silent

    this.engineOsc.connect(filter);
    filter.connect(this.engineGain);
    this.engineGain.connect(this.sfxVolume);
    this.engineOsc.start(now);

    // Siren loop
    this.sirenOsc = this.ctx.createOscillator();
    this.sirenOsc.type = 'sine';
    this.sirenOsc.frequency.setValueAtTime(600, now);
    this.sirenGain = this.ctx.createGain();
    this.sirenGain.gain.value = 0.0;
    
    this.sirenOsc.connect(this.sirenGain);
    this.sirenGain.connect(this.sfxVolume);
    this.sirenOsc.start(now);

    // Skid loop
    this.skidOsc = this.ctx.createOscillator();
    this.skidOsc.type = 'triangle';
    this.skidOsc.frequency.setValueAtTime(2800, now);
    this.skidGain = this.ctx.createGain();
    this.skidGain.gain.value = 0.0;

    const skidFilter = this.ctx.createBiquadFilter();
    skidFilter.type = 'bandpass';
    skidFilter.frequency.setValueAtTime(2500, now);
    skidFilter.Q.setValueAtTime(4, now);

    this.skidOsc.connect(skidFilter);
    skidFilter.connect(this.skidGain);
    this.skidGain.connect(this.sfxVolume);
    this.skidOsc.start(now);
  }

  updateEngine(rpmRatio: number, inVehicle: boolean) {
    this.init();
    if (!this.ctx || !this.engineGain || !this.engineOsc) return;

    if (!inVehicle) {
      this.engineGain.gain.setTargetAtTime(0.0, this.ctx.currentTime, 0.1);
      return;
    }

    const now = this.ctx.currentTime;
    const targetFreq = 40 + rpmRatio * 130; // 40Hz to 170Hz rumble
    const targetVol = 0.18 + rpmRatio * 0.12;

    this.engineOsc.frequency.setTargetAtTime(targetFreq, now, 0.05);
    this.engineGain.gain.setTargetAtTime(targetVol, now, 0.05);
  }

  updateSiren(isActive: boolean) {
    this.init();
    if (!this.ctx || !this.sirenGain || !this.sirenOsc) return;

    const now = this.ctx.currentTime;
    if (!isActive) {
      this.sirenGain.gain.setTargetAtTime(0.0, now, 0.15);
      return;
    }

    // Modern dual phase sweep
    const sweep = Math.sin(now * 5.5) * 200 + 750; // Sweeps 550Hz to 950Hz
    this.sirenOsc.frequency.setValueAtTime(sweep, now);
    this.sirenGain.gain.setTargetAtTime(0.12, now, 0.1);
  }

  updateSkid(intensity: number) {
    this.init();
    if (!this.ctx || !this.skidGain || !this.skidOsc) return;

    const now = this.ctx.currentTime;
    if (intensity <= 0.05) {
      this.skidGain.gain.setTargetAtTime(0.0, now, 0.1);
      return;
    }

    // Tire squeal wobble
    const pitch = 2000 + Math.random() * 600 + intensity * 400;
    this.skidOsc.frequency.setValueAtTime(pitch, now);
    this.skidGain.gain.setTargetAtTime(Math.min(intensity * 0.15, 0.15), now, 0.05);
  }

  // Dynamic Radio Station Music Sequencer

  selectRadio(station: 'horizon' | 'grid' | 'dusty' | 'none') {
    this.init();
    this.activeStation = station;

    if (station === 'none') {
      this.stopMusic();
    } else {
      this.startMusic();
    }
  }

  private startMusic() {
    if (this.isPlayingMusic) return;
    this.isPlayingMusic = true;
    this.step = 0;
    this.runSequencer();
  }

  private stopMusic() {
    this.isPlayingMusic = false;
    if (this.sequencerTimer) {
      clearTimeout(this.sequencerTimer);
      this.sequencerTimer = null;
    }
  }

  private runSequencer() {
    if (!this.isPlayingMusic || !this.ctx || !this.musicVolume) return;

    const tempo = this.activeStation === 'grid' ? 140 : this.activeStation === 'horizon' ? 115 : 90;
    const stepDuration = 60 / tempo / 2; // Eighth notes
    const now = this.ctx.currentTime;

    // Trigger synthesis nodes based on the current step and radio station
    this.playBeatStep(this.step, now);

    this.step = (this.step + 1) % 16;

    this.sequencerTimer = window.setTimeout(() => {
      this.runSequencer();
    }, stepDuration * 1000);
  }

  private playBeatStep(step: number, time: number) {
    if (!this.ctx || !this.musicVolume) return;

    // 1. Kick Drum (Synthesised pitch sweep)
    const triggerKick = (step % 4 === 0);
    if (triggerKick) {
      const kick = this.ctx.createOscillator();
      const kickGain = this.ctx.createGain();
      kick.type = 'sine';
      kick.frequency.setValueAtTime(150, time);
      kick.frequency.exponentialRampToValueAtTime(45, time + 0.12);

      kickGain.gain.setValueAtTime(0.5, time);
      kickGain.gain.exponentialRampToValueAtTime(0.01, time + 0.12);

      kick.connect(kickGain);
      kickGain.connect(this.musicVolume);
      kick.start(time);
      kick.stop(time + 0.12);
    }

    // 2. Snare / Hihat (Noise bursts)
    const triggerSnare = (step % 4 === 2);
    const triggerHat = (step % 2 === 1);

    if (triggerSnare || triggerHat) {
      const bufferSize = this.ctx.sampleRate * 0.15;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      if (triggerSnare) {
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1000, time);
        gain.gain.setValueAtTime(0.18, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.15);
      } else {
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(7000, time);
        gain.gain.setValueAtTime(0.06, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.05);
      }

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.musicVolume);
      noise.start(time);
      noise.stop(time + 0.15);
    }

    // 3. Station Melody / Bass Synth
    if (this.activeStation === 'horizon') {
      // Horizon FM: Warm retro synthwave bass
      // Repeating patterns in A-minor: A2, C3, G2, F2
      const notes = [110.00, 110.00, 130.81, 130.81, 98.00, 98.00, 87.31, 87.31];
      const patternIdx = Math.floor(step / 2) % notes.length;
      const freq = notes[patternIdx];

      const bass = this.ctx.createOscillator();
      const bassFilter = this.ctx.createBiquadFilter();
      const bassGain = this.ctx.createGain();

      bass.type = 'sawtooth';
      bass.frequency.setValueAtTime(freq, time);

      bassFilter.type = 'lowpass';
      bassFilter.frequency.setValueAtTime(250 + Math.sin(time) * 100, time);

      bassGain.gain.setValueAtTime(0.12, time);
      bassGain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);

      bass.connect(bassFilter);
      bassFilter.connect(bassGain);
      bassGain.connect(this.musicVolume);
      bass.start(time);
      bass.stop(time + 0.2);

      // Add a sparkling pluck melody sometimes
      if (step === 3 || step === 7 || step === 11 || step === 15) {
        const leadNotes = [440.00, 523.25, 587.33, 659.25];
        const leadFreq = leadNotes[Math.floor(Math.sin(time) * 2 + 2) % leadNotes.length];

        const lead = this.ctx.createOscillator();
        const leadGain = this.ctx.createGain();
        lead.type = 'triangle';
        lead.frequency.setValueAtTime(leadFreq, time);

        leadGain.gain.setValueAtTime(0.08, time);
        leadGain.gain.exponentialRampToValueAtTime(0.005, time + 0.35);

        lead.connect(leadGain);
        leadGain.connect(this.musicVolume);
        lead.start(time);
        lead.stop(time + 0.35);
      }
    } 
    else if (this.activeStation === 'grid') {
      // The Grid: Aggressive Industrial Techno
      // Dark distorted single pedal tone E1 (41Hz) or E2 (82Hz) with filter sweep
      const freq = step % 8 < 4 ? 41.20 : 82.41;

      const synth = this.ctx.createOscillator();
      const dist = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      synth.type = 'square';
      synth.frequency.setValueAtTime(freq, time);

      dist.type = 'peaking';
      dist.frequency.setValueAtTime(400 + Math.sin(step) * 200, time);
      dist.Q.setValueAtTime(5, time);

      gain.gain.setValueAtTime(0.1, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);

      synth.connect(dist);
      dist.connect(gain);
      gain.connect(this.musicVolume);
      synth.start(time);
      synth.stop(time + 0.1);
    }
    else if (this.activeStation === 'dusty') {
      // Dusty Road: Plucked acoustic-like triangle wave
      // Relaxed country chord changes in G-major: G (196Hz), C (261Hz), D (293Hz)
      const chordIdx = Math.floor(step / 4) % 4;
      const rootFreqs = [196.00, 261.63, 293.66, 196.00];
      const freq = rootFreqs[chordIdx] * (step % 2 === 0 ? 1 : 1.5); // Arpeggiate

      const pluck = this.ctx.createOscillator();
      const pluckGain = this.ctx.createGain();

      pluck.type = 'triangle';
      pluck.frequency.setValueAtTime(freq, time);

      pluckGain.gain.setValueAtTime(0.15, time);
      pluckGain.gain.exponentialRampToValueAtTime(0.005, time + 0.4);

      pluck.connect(pluckGain);
      pluckGain.connect(this.musicVolume);
      pluck.start(time);
      pluck.stop(time + 0.4);
    }
  }
}

export const SoundManager = new SoundManagerClass();

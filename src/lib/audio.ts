export function getAudioContext() {
  if (typeof window === "undefined") return null;
  // @ts-ignore
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;

  if (!(window as any).__audioCtx) {
    (window as any).__audioCtx = new AudioContextClass();
  }
  const ctx = (window as any).__audioCtx as AudioContext;
  
  if (ctx.state === "suspended") {
    ctx.resume();
  }
  return ctx;
}

export function playSpinningSound(durationSeconds: number) {
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const startTime = ctx.currentTime;
    const totalTicks = 60; // Total ticks over the duration
    
    for (let i = 0; i < totalTicks; i++) {
      const normalizedProgress = i / totalTicks;
      // easeOut timing to simulate friction/slowing down
      const easeOut = 1 - Math.pow(1 - normalizedProgress, 3);
      const tickTime = startTime + durationSeconds * easeOut;
      
      if (tickTime >= startTime + durationSeconds) break;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      const freq = 800 - (normalizedProgress * 400); // Pitch goes down slightly
      osc.frequency.setValueAtTime(freq, tickTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.5, tickTime + 0.03);

      gain.gain.setValueAtTime(0.05, tickTime);
      gain.gain.exponentialRampToValueAtTime(0.001, tickTime + 0.03);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(tickTime);
      osc.stop(tickTime + 0.03);
    }
  } catch (e) {
    console.error("Audio error", e);
  }
}

export function playWinnerSound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const startTime = ctx.currentTime;
    
    const playNote = (freq: number, timeOffset: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, startTime + timeOffset);
      
      gain.gain.setValueAtTime(0, startTime + timeOffset);
      gain.gain.linearRampToValueAtTime(0.1, startTime + timeOffset + 0.05);
      gain.gain.setValueAtTime(0.1, startTime + timeOffset + duration - 0.5);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + timeOffset + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime + timeOffset);
      osc.stop(startTime + timeOffset + duration);
    };

    // Arpeggio leading to a final chord
    // D4, F#4, A4, D5 (D Major)
    playNote(293.66, 0.0, 0.5);
    playNote(369.99, 0.1, 0.5);
    playNote(440.00, 0.2, 0.5);
    
    // Final chord
    playNote(293.66, 0.3, 2.0); // D4
    playNote(440.00, 0.3, 2.0); // A4
    playNote(587.33, 0.3, 2.0); // D5
    playNote(739.99, 0.3, 2.0); // F#5
  } catch (e) {
    console.error("Audio error", e);
  }
}

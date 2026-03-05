/**
 * Adhan player using a real bundled MP3 recording (offline-capable)
 * Falls back to Web Audio API synthesis if the audio file is unavailable.
 */

let audioElement: HTMLAudioElement | null = null;
let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext || audioContext.state === "closed") {
    audioContext = new AudioContext();
  }
  return audioContext;
}

/**
 * Play the real bundled Adhan MP3 (works fully offline after first load)
 */
export async function playAdhan(): Promise<void> {
  try {
    // Stop any already-playing adhan
    if (audioElement) {
      audioElement.pause();
      audioElement.currentTime = 0;
    }

    const audio = new Audio("/assets/audio/adhan.mp3");
    audio.volume = 1.0;
    audioElement = audio;

    // Resume AudioContext if needed (browser autoplay policy)
    try {
      const ctx = getAudioContext();
      if (ctx.state === "suspended") {
        await ctx.resume();
      }
    } catch {}

    await audio.play();
  } catch (err) {
    console.warn(
      "Adhan MP3 playback failed, falling back to synthesized tone:",
      err,
    );
    await playAdhanSynthesized();
  }
}

/**
 * Stop the adhan if currently playing
 */
export function stopAdhan(): void {
  if (audioElement) {
    audioElement.pause();
    audioElement.currentTime = 0;
    audioElement = null;
  }
}

/**
 * Synthesized fallback Adhan tone (Web Audio API)
 * Used only when the MP3 file is unavailable.
 */
async function playAdhanSynthesized(): Promise<void> {
  try {
    const ctx = getAudioContext();
    if (ctx.state === "suspended") {
      await ctx.resume();
    }

    const now = ctx.currentTime + 0.1;

    const notes = [
      { freq: 293.66, duration: 0.8, startTime: 0, amplitude: 0.35 },
      { freq: 329.63, duration: 0.4, startTime: 0.9, amplitude: 0.3 },
      { freq: 349.23, duration: 1.2, startTime: 1.4, amplitude: 0.35 },
      { freq: 329.63, duration: 0.4, startTime: 2.7, amplitude: 0.3 },
      { freq: 293.66, duration: 0.8, startTime: 3.2, amplitude: 0.35 },
      { freq: 349.23, duration: 0.6, startTime: 4.2, amplitude: 0.3 },
      { freq: 391.99, duration: 1.0, startTime: 4.9, amplitude: 0.35 },
      { freq: 440.0, duration: 1.5, startTime: 6.0, amplitude: 0.4 },
      { freq: 391.99, duration: 0.5, startTime: 7.6, amplitude: 0.3 },
      { freq: 349.23, duration: 0.8, startTime: 8.2, amplitude: 0.3 },
      { freq: 329.63, duration: 1.2, startTime: 9.1, amplitude: 0.35 },
      { freq: 293.66, duration: 2.0, startTime: 10.4, amplitude: 0.3 },
    ];

    for (const note of notes) {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      const filterNode = ctx.createBiquadFilter();

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(note.freq, now + note.startTime);
      oscillator.frequency.linearRampToValueAtTime(
        note.freq * 1.005,
        now + note.startTime + note.duration * 0.6,
      );
      oscillator.frequency.linearRampToValueAtTime(
        note.freq,
        now + note.startTime + note.duration,
      );

      filterNode.type = "lowpass";
      filterNode.frequency.setValueAtTime(1200, now + note.startTime);

      gainNode.gain.setValueAtTime(0, now + note.startTime);
      gainNode.gain.linearRampToValueAtTime(
        note.amplitude,
        now + note.startTime + 0.1,
      );
      gainNode.gain.setValueAtTime(
        note.amplitude,
        now + note.startTime + note.duration - 0.3,
      );
      gainNode.gain.linearRampToValueAtTime(
        0,
        now + note.startTime + note.duration,
      );

      oscillator.connect(filterNode);
      filterNode.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.start(now + note.startTime);
      oscillator.stop(now + note.startTime + note.duration);
    }
  } catch (err) {
    console.warn("Synthesized adhan failed:", err);
  }
}

/**
 * Play a short notification chime
 */
export async function playChime(): Promise<void> {
  try {
    const ctx = getAudioContext();
    if (ctx.state === "suspended") {
      await ctx.resume();
    }
    const now = ctx.currentTime + 0.05;

    const playTone = (
      freq: number,
      start: number,
      dur: number,
      amp: number,
    ) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(amp, start + 0.05);
      gain.gain.linearRampToValueAtTime(0, start + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + dur);
    };

    playTone(523.25, now, 0.5, 0.25);
    playTone(659.25, now + 0.15, 0.5, 0.2);
    playTone(783.99, now + 0.3, 0.8, 0.25);
  } catch (err) {
    console.warn("Chime playback failed:", err);
  }
}

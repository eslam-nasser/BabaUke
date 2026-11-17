"use client";

import { useEffect, useRef, useState } from "react";
import { audioKit, UKE_VOICE } from "@/lib/audio/kit";
import { centsOff, detectPitch, UKE_STRINGS } from "@/lib/audio/pitch";
import { chordColor } from "@/lib/music/chords";
import { Icon } from "./Icon";

type Reading = { string: number; cents: number; hz: number };

const IN_TUNE = 6; // cents either side that count as in tune
const RANGE = 50; // cents shown at each end of the scale
const TICKS = [-50, -25, 0, 25, 50];

export function Tuner() {
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /** null = work out the string automatically. */
  const [locked, setLocked] = useState<number | null>(null);
  const [reading, setReading] = useState<Reading | null>(null);
  const lockedRef = useRef<number | null>(null);
  const stopRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    lockedRef.current = locked;
  }, [locked]);

  useEffect(() => () => stopRef.current?.(), []);

  const start = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
      });
      const ctx = await audioKit.resume();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 4096;
      source.connect(analyser);

      const buffer = new Float32Array(analyser.fftSize);
      const recent: number[] = [];
      let raf = 0;
      let frame = 0;
      let lastHeard = 0;

      const loop = () => {
        raf = requestAnimationFrame(loop);
        if (frame++ % 2) return;
        analyser.getFloatTimeDomainData(buffer);
        const pitch = detectPitch(buffer, ctx.sampleRate);
        const now = performance.now();
        if (!pitch) {
          if (now - lastHeard > 900) {
            recent.length = 0;
            setReading(null);
          }
          return;
        }
        lastHeard = now;
        recent.push(pitch.hz);
        if (recent.length > 5) recent.shift();
        const hz = [...recent].sort((a, b) => a - b)[recent.length >> 1]; // median keeps the marker steady

        let string = lockedRef.current;
        if (string === null) {
          string = 0;
          for (let i = 1; i < UKE_STRINGS.length; i++) {
            if (Math.abs(centsOff(hz, UKE_STRINGS[i].hz)) < Math.abs(centsOff(hz, UKE_STRINGS[string].hz))) string = i;
          }
        }
        setReading({ string, hz, cents: centsOff(hz, UKE_STRINGS[string].hz) });
      };
      loop();

      stopRef.current = () => {
        cancelAnimationFrame(raf);
        source.disconnect();
        stream.getTracks().forEach((t) => t.stop());
        stopRef.current = null;
      };
      setListening(true);
    } catch {
      setError(
        "BabaUke could not use the microphone. Allow microphone access for this site in your browser, then press the button again. You can still tune by ear with the speaker buttons.",
      );
    }
  };

  const stop = () => {
    stopRef.current?.();
    setListening(false);
    setReading(null);
  };

  const hear = async (index: number) => {
    await audioKit.resume();
    const uke = await audioKit.voice(UKE_VOICE);
    uke.start({ note: UKE_STRINGS[index].midi, velocity: 100, duration: 3 });
  };

  const target = reading?.string ?? locked;
  const cents = reading ? Math.max(-RANGE, Math.min(RANGE, reading.cents)) : 0;
  const inTune = !!reading && Math.abs(reading.cents) <= IN_TUNE;

  return (
    <div className="grid gap-x-12 gap-y-10 lg:grid-cols-[minmax(0,1fr)_21rem]">
      <div>
        {/* readout */}
        <div className="flex items-end gap-5">
          {target !== null ? (
            <p
              className="grid h-32 w-32 shrink-0 place-items-center rounded-lg font-display text-[6rem] leading-none text-blot sm:h-36 sm:w-36"
              style={{ background: chordColor(UKE_STRINGS[target].name) }}
              aria-hidden
            >
              {UKE_STRINGS[target].name}
            </p>
          ) : (
            // Nothing heard yet: show the four strings you are about to tune.
            <div className="grid h-32 w-32 shrink-0 grid-cols-2 gap-1 sm:h-36 sm:w-36" aria-hidden>
              {UKE_STRINGS.map((s) => (
                <span
                  key={s.name}
                  className="grid place-items-center rounded-md font-display text-4xl leading-none text-blot"
                  style={{ background: chordColor(s.name) }}
                >
                  {s.name}
                </span>
              ))}
            </div>
          )}
          <div className="min-w-0 pb-1" role="status" aria-live="polite">
            <p className="flex items-center gap-2 text-2xl font-black leading-tight sm:text-3xl">
              {!reading ? (
                listening ? "Pluck a string" : "Microphone is off"
              ) : inTune ? (
                <>
                  <Icon name="check" size={30} weight={3.5} /> {UKE_STRINGS[reading.string].name} is in tune
                </>
              ) : reading.cents < 0 ? (
                <>
                  <Icon name="up" size={30} weight={3.5} /> Too low. Tighten it.
                </>
              ) : (
                <>
                  <Icon name="down" size={30} weight={3.5} /> Too high. Loosen it.
                </>
              )}
            </p>
            <p className="text-lg tabular-nums text-soft">
              {reading
                ? `${reading.hz.toFixed(1)} Hz, ${reading.cents > 0 ? "+" : ""}${reading.cents.toFixed(0)} cents from ${UKE_STRINGS[reading.string].name}`
                : locked === null
                  ? "BabaUke works out which string you are playing."
                  : `Listening for the ${UKE_STRINGS[locked].name} string only.`}
            </p>
          </div>
        </div>

        {/* scale */}
        <div className="relative mt-8 h-20" dir="ltr" aria-hidden>
          <div className="absolute inset-x-0 top-6 h-5 bg-wash" />
          <div
            className="absolute top-6 h-5"
            style={{ left: `${50 - IN_TUNE}%`, width: `${IN_TUNE * 2}%`, background: chordColor("F") }}
          />
          {TICKS.map((tick, i) => (
            <span
              key={tick}
              className="absolute top-12 text-base font-bold tabular-nums text-soft"
              style={{
                left: `${50 + tick}%`,
                transform: `translateX(${i === 0 ? "0" : i === TICKS.length - 1 ? "-100%" : "-50%"})`,
              }}
            >
              {tick > 0 ? `+${tick}` : tick}
            </span>
          ))}
          <div
            className="absolute top-2 h-12 w-2 -translate-x-1/2 rounded-sm bg-ink transition-[left] duration-150 ease-out"
            style={{ left: `${50 + cents}%`, opacity: reading ? 1 : 0.3 }}
          />
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-3">
          <button
            type="button"
            onClick={listening ? stop : start}
            className={`inline-flex min-h-12 items-center gap-2 rounded-lg px-5 text-xl font-extrabold ${
              listening ? "border-2 border-ink hover:bg-wash" : "bg-ink text-paper hover:bg-sun hover:text-blot"
            }`}
          >
            <Icon name={listening ? "micOff" : "mic"} size={22} />
            {listening ? "Turn off microphone" : "Turn on microphone"}
          </button>
          <p className="max-w-[40ch] text-base text-soft">The sound stays on your device. Nothing is recorded or sent anywhere.</p>
        </div>
        {error && (
          <p role="alert" className="mt-4 max-w-[60ch] rounded-lg border-2 border-ink p-3 text-lg font-bold">
            {error}
          </p>
        )}
      </div>

      {/* strings */}
      <div>
        <h2 className="font-display text-3xl">The four strings</h2>
        <p className="mb-3 text-soft">
          From the one nearest your chin to the one nearest the floor. Lock a string if the tuner keeps guessing the wrong one.
        </p>
        <ul className="border-t-2 border-ink" dir="ltr">
          {UKE_STRINGS.map((s, i) => (
            <li key={s.name} className="flex items-center gap-3 border-b border-rule py-2">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-md text-2xl font-black text-blot" style={{ background: chordColor(s.name) }}>
                {s.name}
              </span>
              <span className="min-w-0 flex-1 leading-tight">
                <span className="block font-bold">{s.label}</span>
                <span className="text-base tabular-nums text-soft">{s.hz.toFixed(1)} Hz</span>
              </span>
              <button
                type="button"
                onClick={() => hear(i)}
                aria-label={`Hear the ${s.name} string`}
                className="grid h-11 w-11 place-items-center rounded-md hover:bg-wash"
              >
                <Icon name="speaker" size={22} />
              </button>
              <button
                type="button"
                onClick={() => setLocked(locked === i ? null : i)}
                aria-pressed={locked === i}
                aria-label={locked === i ? `Unlock: listen for any string again` : `Lock the tuner to the ${s.name} string`}
                className={`min-h-11 w-24 rounded-md border-2 px-2 text-base font-bold ${
                  locked === i ? "border-ink bg-ink text-paper" : "border-rule hover:border-ink"
                }`}
              >
                {locked === i ? "Locked" : `Lock to ${s.name}`}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

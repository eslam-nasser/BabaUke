"use client";

import { useState } from "react";
import { audioKit, UKE_VOICE } from "@/lib/audio/kit";
import { getChord } from "@/lib/music/chords";
import { ChordDiagram } from "./ChordDiagram";
import { ChordChip } from "./ChordStrip";
import { Icon } from "./Icon";

/** A chord you can tap to hear. */
export function ChordCard({ name, songs }: { name: string; songs?: number }) {
  const [state, setState] = useState<"idle" | "loading" | "ringing">("idle");
  const tip = getChord(name).tip;

  const play = async () => {
    setState("loading"); // the first tap may have to download the sound
    await audioKit.resume();
    const uke = await audioKit.voice(UKE_VOICE);
    audioKit.strum(uke, name, "D", undefined, 2.5);
    setState("ringing");
    setTimeout(() => setState("idle"), 900);
  };

  return (
    <button
      type="button"
      onClick={play}
      aria-label={`Hear the ${name} chord`}
      className={`group flex w-full flex-col items-start rounded-lg p-3 text-start hover:bg-wash ${state === "ringing" ? "bg-wash" : ""}`}
    >
      <span className="flex w-full items-center justify-between">
        <ChordChip name={name} active={state === "ringing"} className="text-3xl" />
        <span
          className={`grid h-11 w-11 place-items-center rounded-md ${
            state === "ringing" ? "bg-ink text-paper" : "text-soft group-hover:text-ink"
          }`}
        >
          {state === "loading" ? <Icon name="loading" size={22} className="animate-spin" /> : <Icon name="speaker" size={22} />}
        </span>
      </span>
      <ChordDiagram name={name} className="mx-auto my-2 h-40 w-auto" />
      {tip && <span className="text-base leading-snug text-soft">{tip}</span>}
      {songs ? (
        <span className="mt-1 text-base font-bold">
          In {songs} {songs === 1 ? "song" : "songs"}
        </span>
      ) : null}
    </button>
  );
}

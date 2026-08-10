"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Live geluidsniveau (0 = stil, 1 = luid) van een microfoonstream, ververst
 * via requestAnimationFrame — puur voor visuele feedback ("de microfoon
 * pikt me op"), geen onderdeel van de daadwerkelijke uitspraakbeoordeling.
 *
 * Twee gebruiksvormen:
 * - `source` is een bestaande MediaStream (bv. ListenAndSpeak.tsx heeft er
 *   al een via MediaRecorder) — dan wordt die hergebruikt, geen extra
 *   microfoon-aanvraag.
 * - `source` is `"own"` — dan vraagt de hook zelf een stream aan zodra
 *   `active` waar wordt (voor oefeningen die de Web Speech API gebruiken en
 *   dus zelf geen ruwe stream hebben, zoals RepeatAfterMe/SpeakFromPicture).
 */
export function useMicLevel(active: boolean, source: MediaStream | null | "own"): number {
  const [level, setLevel] = useState(0);
  const ownStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!active) {
      setLevel(0);
      return;
    }
    if (typeof window === "undefined" || !navigator.mediaDevices?.getUserMedia) return;

    let cancelled = false;
    let audioContext: AudioContext | null = null;
    let animationFrame: number | null = null;

    async function start() {
      try {
        const stream = source === "own" ? await navigator.mediaDevices.getUserMedia({ audio: true }) : source;
        if (!stream || cancelled) return;
        if (source === "own") ownStreamRef.current = stream;

        const AudioContextCtor =
          window.AudioContext ??
          (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!AudioContextCtor) return;
        audioContext = new AudioContextCtor();
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 512;
        const sourceNode = audioContext.createMediaStreamSource(stream);
        sourceNode.connect(analyser);
        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const tick = () => {
          if (cancelled) return;
          analyser.getByteTimeDomainData(dataArray);
          let sumSquares = 0;
          for (let i = 0; i < dataArray.length; i++) {
            const normalized = ((dataArray[i] ?? 128) - 128) / 128;
            sumSquares += normalized * normalized;
          }
          const rms = Math.sqrt(sumSquares / dataArray.length);
          // Iets opgeschaald zodat normale spreekluidheid zichtbaar uitslaat.
          setLevel(Math.min(1, rms * 4.5));
          animationFrame = requestAnimationFrame(tick);
        };
        tick();
      } catch {
        // Geen microfoontoegang — geen visuele meter, maar de oefening zelf
        // blijft werken via zijn eigen foutafhandeling (hfst. 22).
      }
    }

    void start();

    return () => {
      cancelled = true;
      if (animationFrame !== null) cancelAnimationFrame(animationFrame);
      void audioContext?.close();
      ownStreamRef.current?.getTracks().forEach((track) => track.stop());
      ownStreamRef.current = null;
      setLevel(0);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, source]);

  return level;
}

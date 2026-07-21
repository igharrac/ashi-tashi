"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import type { RecordingPersona } from "@/lib/recordableItems";
import type { ReviewStatus } from "@/types/domain";

export interface RecordingEntryData {
  itemId: string;
  persona: RecordingPersona;
  fileName: string;
  mimeType: string;
  reviewStatus: ReviewStatus;
  recordedAt: string;
}

interface RecorderControlProps {
  itemId: string;
  persona: RecordingPersona;
  entry?: RecordingEntryData;
  /** null = opname verwijderd */
  onChange: (entry: RecordingEntryData | null) => void;
}

type LocalState = "idle" | "requesting" | "recording" | "recorded" | "saving" | "error";

const STATUS_TONE: Record<ReviewStatus, { label: string; className: string }> = {
  CONCEPT: { label: "Concept", className: "bg-sky-200 text-forest-700" },
  TE_REVIEWEN: { label: "Te reviewen", className: "bg-peach-100 text-clay-600" },
  AFGEKEURD: { label: "Afgekeurd", className: "bg-clay-500/15 text-clay-600" },
  GOEDGEKEURD: { label: "Goedgekeurd", className: "bg-mint-100 text-forest-700" },
  GEPUBLICEERD: { label: "Gepubliceerd", className: "bg-forest-500 text-white" },
  GEARCHIVEERD: { label: "Gearchiveerd", className: "bg-border-subtle text-ink-muted" },
};

/**
 * Neemt één opname op (itemId x persona) via de browser-microfoon
 * (MediaRecorder API), speelt af, en stuurt naar /api/studio/recordings.
 * Zie ARCHITECTUUR-OPNAMESTUDIO.md voor de bredere opzet.
 */
export function RecorderControl({ itemId, persona, entry, onChange }: RecorderControlProps) {
  const [state, setState] = useState<LocalState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const recordedBlobRef = useRef<Blob | null>(null);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isSupported =
    typeof window !== "undefined" &&
    typeof navigator !== "undefined" &&
    !!navigator.mediaDevices?.getUserMedia &&
    typeof MediaRecorder !== "undefined";

  async function startRecording() {
    setErrorMessage(null);
    setState("requesting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        recordedBlobRef.current = blob;
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
        setState("recorded");
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setState("recording");
    } catch {
      setErrorMessage("Kon microfoon niet gebruiken. Check de browserpermissie.");
      setState("error");
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
  }

  function discardLocalRecording() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    recordedBlobRef.current = null;
    setState("idle");
  }

  async function saveRecording() {
    if (!recordedBlobRef.current) return;
    setState("saving");
    setErrorMessage(null);

    const formData = new FormData();
    formData.set("itemId", itemId);
    formData.set("persona", persona);
    const extension = recordedBlobRef.current.type.includes("mp4") ? "mp4" : "webm";
    formData.set("audio", recordedBlobRef.current, `opname.${extension}`);

    const response = await fetch("/api/studio/recordings", { method: "POST", body: formData });

    if (!response.ok) {
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      setErrorMessage(data.error ?? "Opslaan mislukt.");
      setState("recorded");
      return;
    }

    const data = (await response.json()) as { entry: RecordingEntryData };
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    recordedBlobRef.current = null;
    setState("idle");
    onChange(data.entry);
  }

  async function setReviewStatus(reviewStatus: ReviewStatus) {
    const response = await fetch("/api/studio/recordings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId, persona, reviewStatus }),
    });
    if (!response.ok) return;
    const data = (await response.json()) as { entry: RecordingEntryData };
    onChange(data.entry);
  }

  async function removeRecording() {
    const response = await fetch("/api/studio/recordings", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId, persona }),
    });
    if (!response.ok) return;
    onChange(null);
  }

  if (!isSupported) {
    return <p className="text-xs text-ink-muted">Opnemen wordt niet ondersteund in deze browser.</p>;
  }

  // Net opgenomen, nog niet opgeslagen: preview + opslaan/opnieuw.
  if (state === "recorded" && previewUrl) {
    return (
      <div className="flex flex-col items-start gap-2">
        <audio src={previewUrl} controls className="h-8 w-48" />
        <div className="flex gap-2">
          <Button variant="primary" className="min-h-[36px] px-4 py-1 text-sm" onClick={saveRecording}>
            Opslaan
          </Button>
          <Button variant="ghost" className="min-h-[36px] px-4 py-1 text-sm" onClick={discardLocalRecording}>
            Opnieuw
          </Button>
        </div>
      </div>
    );
  }

  if (state === "recording") {
    return (
      <div className="flex items-center gap-2">
        <span className="flex items-center gap-1 text-sm font-medium text-clay-500" aria-live="polite">
          <span className="h-2 w-2 animate-pulse rounded-full bg-clay-500" aria-hidden="true" /> Opname loopt…
        </span>
        <Button variant="secondary" size="sm" onClick={stopRecording}>
          Stop
        </Button>
      </div>
    );
  }

  if (state === "requesting" || state === "saving") {
    return <p className="text-sm text-ink-muted">{state === "requesting" ? "Microfoon aanvragen…" : "Opslaan…"}</p>;
  }

  const statusInfo = entry ? STATUS_TONE[entry.reviewStatus] : null;

  return (
    <div className="flex flex-col items-start gap-2">
      {entry && statusInfo && (
        <div className="flex items-center gap-2">
          <audio src={`/audio/recordings/${entry.fileName}`} controls className="h-8 w-48" />
          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${statusInfo.className}`}>
            {statusInfo.label}
          </span>
        </div>
      )}

      {errorMessage && <p className="text-xs font-medium text-clay-500">{errorMessage}</p>}

      <div className="flex flex-wrap gap-2">
        <Button variant={entry ? "secondary" : "primary"} size="sm" onClick={startRecording}>
          {entry ? "Opnieuw opnemen" : "Opnemen"} 🎙️
        </Button>
        {entry && entry.reviewStatus !== "GOEDGEKEURD" && (
          <Button variant="secondary" size="sm" onClick={() => setReviewStatus("GOEDGEKEURD")}>
            Goedkeuren
          </Button>
        )}
        {entry && entry.reviewStatus !== "AFGEKEURD" && (
          <Button variant="ghost" size="sm" onClick={() => setReviewStatus("AFGEKEURD")}>
            Afkeuren
          </Button>
        )}
        {entry && (
          <Button variant="ghost" size="sm" onClick={removeRecording}>
            Verwijderen
          </Button>
        )}
      </div>
    </div>
  );
}

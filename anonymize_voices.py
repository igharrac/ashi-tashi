#!/usr/bin/env python3
"""
anonymize_voices.py — Stemconversie voor ashi-tashi (hfst. 19.1: man / vrouw /
jongen / meisje). Genereert vrouw-, jongen- en meisjesopnames door de
bestaande man-opnames om te zetten naar een andere stem via een any-to-any
voice-conversion-model (FreeVC/VCTK, via Coqui TTS). Kan ook de man-opname
zélf anonimiseren (zelfde model, VCTK-spreker p256) — zie --persona man
hieronder, met verplichte backup vooraf.

BELANGRIJK — draai dit ALLEEN lokaal op je eigen Mac, nooit in de cloud-
sandbox: het downloadt een model (~1GB) bij de eerste run en heeft
internettoegang + rekenkracht nodig. Zie AGENT-WERKWIJZE.md, sectie
"Stemmen-pijplijn (voice-anonymize)".

Vereisten (eenmalig installeren):
    pip install TTS==0.22.0 soundfile librosa numpy
    brew install ffmpeg          # audio-conversie webm <-> wav

Gebruik — vrouw/jongen/meisje (afgeleid van de man-opname, bron blijft
ongewijzigd):

  1) Zonder --apply: converteert en schrijft alleen naar --out-dir, zodat je
     de nieuwe stem eerst kunt beluisteren. Manifest/recordings-dir blijven
     ongemoeid.

        python3 anonymize_voices.py \\
          --recordings-dir ~/Documents/ashi-tashi/public/audio/recordings \\
          --manifest ~/Documents/ashi-tashi/data/recordings-manifest.json \\
          --out-dir ./full-output-vrouw \\
          --persona vrouw --target-speaker p225

  2) Met --apply: doet hetzelfde, en kopieert de resultaten ook naar
     --recordings-dir + werkt --manifest bij (incrementeel: items die al een
     entry "<itemId>__<persona>" hebben worden overgeslagen, tenzij --force).

        python3 anonymize_voices.py \\
          --recordings-dir ~/Documents/ashi-tashi/public/audio/recordings \\
          --manifest ~/Documents/ashi-tashi/data/recordings-manifest.json \\
          --out-dir ./full-output-vrouw \\
          --persona vrouw --target-speaker p225 \\
          --apply --auto-approve

Gebruik — man (zelf-anonimisering, VERVANGT de originele opname):

  Dit is destructief: de originele man-opname wordt overschreven door een
  geconverteerde versie (VCTK p256). Daarom wordt vóór elke --apply-run
  automatisch een backup weggeschreven naar
  backups/man-originals-<datum>/ (zelfde vorm als de vorige keer, zie
  backups/man-originals-20260828/README.md) — dat gebeurt ALLEEN als er ook
  echt nieuwe items verwerkt worden, en de items die nog niet geconverteerd
  zijn worden herkend via het "voiceConverted"-veld (niet via het al dan
  niet bestaan van de __man-entry, want die bestaat altijd).

        python3 anonymize_voices.py \\
          --recordings-dir ~/Documents/ashi-tashi/public/audio/recordings \\
          --manifest ~/Documents/ashi-tashi/data/recordings-manifest.json \\
          --out-dir ./full-output-man \\
          --persona man --target-speaker p256 \\
          --apply --auto-approve

Na afloop: laat het weten zodra je klaar bent — dan werk ik
public/audio-catalog.json bij en commit + push ik alles zelf (staande regel
voor audio-content).
"""

from __future__ import annotations

import argparse
import json
import shutil
import subprocess
import sys
import tempfile
from datetime import datetime, timezone
from pathlib import Path

# Zie AGENT-WERKWIJZE.md § Stemmen-pijplijn: huidige gekozen VCTK-sprekers.
DEFAULT_SPEAKERS = {
    "vrouw": "p225",
    "jongen": "p226",
    "man": "p256",
    "meisje": "p297",
}
DEFAULT_PITCH_SHIFT = {
    "vrouw": 1.0,
    "jongen": 1.0,
    "man": 1.0,
    "meisje": 1.15,
}

VOICE_CONVERSION_MODEL = "voice_conversion_models/multilingual/vctk/freevc24"
REFERENCE_TTS_MODEL = "tts_models/en/vctk/vits"  # alleen om de doelstem-referentie te genereren


def log(msg: str) -> None:
    print(msg, flush=True)


def load_manifest(path: Path) -> dict:
    if not path.exists():
        return {}
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def save_manifest(path: Path, manifest: dict) -> None:
    with open(path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)
        f.write("\n")


def find_man_items(manifest: dict) -> list[str]:
    """Alle itemIds die een man-opname hebben (bron voor elke conversie, incl. zelf-anonimisering)."""
    item_ids = set()
    for key, entry in manifest.items():
        if key.endswith("__man") and entry.get("fileName"):
            item_ids.add(entry["itemId"])
    return sorted(item_ids)


def find_reference_wav(vctk_dir: Path, speaker: str) -> Path:
    """Zoekt een referentieclip voor deze VCTK-spreker in de lokale corpus-map."""
    speaker_dir = vctk_dir / speaker
    if not speaker_dir.exists():
        raise FileNotFoundError(
            f"Kan geen referentieclips voor spreker '{speaker}' vinden in {speaker_dir}. "
            f"Geef --target-reference PAD.wav op, of --vctk-dir naar de juiste corpus-map."
        )
    candidates = sorted(speaker_dir.glob("*.wav")) or sorted(speaker_dir.glob("*.flac"))
    if not candidates:
        raise FileNotFoundError(f"Geen .wav/.flac-bestanden gevonden in {speaker_dir}.")
    return candidates[len(candidates) // 2]


def webm_to_wav(src: Path, dst: Path) -> None:
    subprocess.run(
        ["ffmpeg", "-y", "-i", str(src), "-ar", "24000", "-ac", "1", str(dst)],
        check=True, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE,
    )


def wav_to_webm(src: Path, dst: Path) -> None:
    subprocess.run(
        ["ffmpeg", "-y", "-i", str(src), "-c:a", "libopus", "-f", "webm", str(dst)],
        check=True, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE,
    )


def apply_pitch_shift(wav_path: Path, semitone_factor: float) -> None:
    if abs(semitone_factor - 1.0) < 1e-6:
        return
    import librosa
    import soundfile as sf
    import numpy as np

    y, sr = librosa.load(str(wav_path), sr=None)
    n_steps = 12.0 * np.log2(semitone_factor)
    y_shifted = librosa.effects.pitch_shift(y, sr=sr, n_steps=n_steps)
    sf.write(str(wav_path), y_shifted, sr)


def convert_voice(tts, source_wav: Path, target_ref_wav: Path, output_wav: Path) -> None:
    tts.voice_conversion_to_file(
        source_wav=str(source_wav), target_wav=str(target_ref_wav), file_path=str(output_wav),
    )


def backup_man_originals(repo_root: Path, recordings_dir: Path, manifest: dict, item_ids: list[str]) -> Path:
    """Zelfde vorm als backups/man-originals-20260828/: originele man-bestanden +
    hun manifest-entries wegschrijven vóórdat ze overschreven worden."""
    date_tag = datetime.now().strftime("%Y%m%d")
    backup_dir = repo_root / "backups" / f"man-originals-{date_tag}"
    backup_recordings = backup_dir / "recordings"
    backup_recordings.mkdir(parents=True, exist_ok=True)

    man_entries = {}
    for item_id in item_ids:
        key = f"{item_id}__man"
        entry = manifest.get(key)
        if not entry:
            continue
        man_entries[key] = entry
        src = recordings_dir / entry["fileName"]
        if src.exists():
            shutil.copyfile(src, backup_recordings / entry["fileName"])

    with open(backup_dir / "recordings-manifest-man-entries.json", "w", encoding="utf-8") as f:
        json.dump(man_entries, f, indent=2, ensure_ascii=False)
        f.write("\n")

    readme = backup_dir / "README.md"
    if not readme.exists():
        readme.write_text(
            "# Backup: originele man-opnames (echte stem)\n\n"
            "Dit is een snapshot van de echte, ongewijzigde man-opnames + hun\n"
            "manifest-entries, gemaakt vlak vóórdat ze vervangen werden door een\n"
            "geanonimiseerde versie (stemconversie naar VCTK-spreker p256).\n\n"
            "Herstellen: kopieer `recordings/*.webm` terug naar\n"
            "`public/audio/recordings/`, en zet de entries uit\n"
            "`recordings-manifest-man-entries.json` terug in\n"
            "`data/recordings-manifest.json`.\n",
            encoding="utf-8",
        )
    return backup_dir


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--recordings-dir", required=True)
    parser.add_argument("--manifest", required=True)
    parser.add_argument("--out-dir", required=True)
    parser.add_argument("--persona", required=True, choices=["vrouw", "jongen", "meisje", "man"])
    parser.add_argument("--target-speaker", default=None)
    parser.add_argument("--pitch-shift", type=float, default=None)
    parser.add_argument("--vctk-dir", default=str(Path.home() / "vctk-corpus" / "wav48_silence_trimmed"))
    parser.add_argument("--target-reference", default=None)
    parser.add_argument("--items", default=None)
    parser.add_argument("--force", action="store_true")
    parser.add_argument("--apply", action="store_true")
    parser.add_argument("--auto-approve", action="store_true")
    parser.add_argument("--skip-backup", action="store_true", help="ALLEEN voor --persona man: sla de automatische backup-stap over (afgeraden)")
    args = parser.parse_args()

    recordings_dir = Path(args.recordings_dir).expanduser().resolve()
    manifest_path = Path(args.manifest).expanduser().resolve()
    out_dir = Path(args.out_dir).expanduser().resolve()
    repo_root = manifest_path.parent.parent  # data/recordings-manifest.json -> <repo>/

    persona = args.persona
    speaker = args.target_speaker or DEFAULT_SPEAKERS[persona]
    pitch_shift = args.pitch_shift if args.pitch_shift is not None else DEFAULT_PITCH_SHIFT[persona]
    is_self_replace = persona == "man"

    manifest = load_manifest(manifest_path)
    man_items = find_man_items(manifest)
    if args.items:
        wanted = {i.strip() for i in args.items.split(",") if i.strip()}
        man_items = [i for i in man_items if i in wanted]

    todo = []
    for item_id in man_items:
        key = f"{item_id}__{persona}"
        if is_self_replace:
            # __man bestaat altijd (het is de bron zelf) — incrementeel op basis van
            # het voiceConverted-veld, niet key-existence.
            already_done = bool(manifest.get(key, {}).get("voiceConverted"))
        else:
            already_done = key in manifest
        if already_done and not args.force:
            continue
        todo.append(item_id)

    if not todo:
        log(f"Niets te doen — alle items hebben al een '{persona}'-opname (gebruik --force om te overschrijven).")
        return 0

    log(f"Persona: {persona}  |  VCTK-spreker: {speaker}  |  pitch-shift: {pitch_shift}  |  apply: {args.apply}"
        + ("  |  ZELF-ANONIMISERING (destructief)" if is_self_replace else ""))
    log(f"{len(todo)} item(s) te converteren: {', '.join(todo)}")

    try:
        import torch
        from TTS.api import TTS
    except ImportError:
        log("FOUT: 'TTS' (Coqui) of 'torch' niet geïnstalleerd. Draai eerst:")
        log("    pip install TTS==0.22.0 soundfile librosa numpy")
        return 1

    # Referentiestem: (1) expliciet --target-reference, (2) lokale VCTK-corpusmap als
    # die bestaat, (3) anders zoals het oorspronkelijke script: genereren met het
    # VCTK-VITS-model (wordt automatisch gedownload, geen corpus nodig).
    out_dir.mkdir(parents=True, exist_ok=True)
    refs_dir = out_dir / "_target_refs"
    refs_dir.mkdir(parents=True, exist_ok=True)
    if args.target_reference:
        target_ref_wav = Path(args.target_reference).expanduser().resolve()
        if not target_ref_wav.exists():
            log(f"FOUT: referentiebestand niet gevonden: {target_ref_wav}")
            return 1
    else:
        vctk_dir = Path(args.vctk_dir).expanduser()
        if (vctk_dir / speaker).exists():
            target_ref_wav = find_reference_wav(vctk_dir, speaker)
        else:
            target_ref_wav = refs_dir / f"{persona}_{speaker}_reference.wav"
            if not target_ref_wav.exists():
                log(f"Referentiestem {speaker} genereren met {REFERENCE_TTS_MODEL} (eerste keer: model downloaden) ...")
                ref_tts = TTS(REFERENCE_TTS_MODEL, progress_bar=True)
                ref_tts.tts_to_file(text="Hello, this is a short reference sample.", speaker=speaker, file_path=str(target_ref_wav))
    log(f"Referentiestem: {target_ref_wav}")

    # Backup vóór een destructieve man-zelf-vervanging (alleen als we ook echt gaan --apply'en)
    if is_self_replace and args.apply and not args.skip_backup:
        backup_dir = backup_man_originals(repo_root, recordings_dir, manifest, todo)
        log(f"Backup van originele man-opnames weggeschreven naar: {backup_dir}")

    device = "cuda" if torch.cuda.is_available() else ("mps" if torch.backends.mps.is_available() else "cpu")
    log(f"Model laden op device={device} ({VOICE_CONVERSION_MODEL}) ...")
    tts = TTS(model_name=VOICE_CONVERSION_MODEL, progress_bar=True).to(device)

    out_dir.mkdir(parents=True, exist_ok=True)
    review_status = "GOEDGEKEURD" if args.auto_approve else "TE_REVIEWEN"
    done, failed = [], []

    with tempfile.TemporaryDirectory() as tmp:
        tmp_path = Path(tmp)
        for item_id in todo:
            man_file = recordings_dir / f"{item_id}__man.webm"
            if not man_file.exists():
                log(f"  ⚠ overslaan: {man_file.name} bestaat niet")
                failed.append(item_id)
                continue

            try:
                log(f"  → {item_id}")
                source_wav = tmp_path / f"{item_id}__source.wav"
                converted_wav = tmp_path / f"{item_id}__converted.wav"
                webm_to_wav(man_file, source_wav)
                convert_voice(tts, source_wav, target_ref_wav, converted_wav)
                if pitch_shift and abs(pitch_shift - 1.0) > 1e-6:
                    apply_pitch_shift(converted_wav, pitch_shift)

                out_name = f"{item_id}__{persona}.webm"
                staged_file = out_dir / out_name
                wav_to_webm(converted_wav, staged_file)

                if args.apply:
                    final_file = recordings_dir / out_name  # voor persona=man: overschrijft bewust de bron
                    shutil.copyfile(staged_file, final_file)
                    key = f"{item_id}__{persona}"
                    entry = dict(manifest.get(key, {}))
                    entry.update({
                        "itemId": item_id,
                        "persona": persona,
                        "fileName": out_name,
                        "mimeType": "audio/webm;codecs=opus",
                        "reviewStatus": review_status,
                        "denoised": True,
                    })
                    if is_self_replace:
                        entry["voiceConverted"] = True
                        entry.setdefault("recordedAt", datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"))
                    else:
                        entry["recordedAt"] = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
                    manifest[key] = entry
                done.append(item_id)
            except subprocess.CalledProcessError as e:
                log(f"    ✗ ffmpeg-fout bij {item_id}: {e.stderr.decode(errors='ignore')[-300:] if e.stderr else e}")
                failed.append(item_id)
            except Exception as e:  # noqa: BLE001 — mag nooit halverwege de manifest corrupt achterlaten
                log(f"    ✗ mislukt bij {item_id}: {e}")
                failed.append(item_id)

    if args.apply and done:
        save_manifest(manifest_path, manifest)

    log("")
    log(f"Klaar: {len(done)} geconverteerd, {len(failed)} mislukt/overgeslagen.")
    if failed:
        log(f"Mislukt: {', '.join(failed)}")
    log(f"Bestanden staan in: {out_dir}")
    if args.apply and done:
        log(f"Ook gekopieerd naar {recordings_dir} en manifest bijgewerkt: {manifest_path}")
        log("Beluister de nieuwe opnames in de opnamestudio, en laat het weten zodra je klaar bent.")
    elif done:
        log("Nog NIET toegepast (geen --apply meegegeven) — beluister eerst de bestanden in --out-dir,")
        log("run daarna hetzelfde commando opnieuw met --apply om ze definitief te maken.")
    return 0 if not failed else 1


if __name__ == "__main__":
    sys.exit(main())

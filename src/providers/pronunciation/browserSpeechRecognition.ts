/**
 * Echte spraakcapture + transcriptie via de in de browser ingebouwde Web
 * Speech API (SpeechRecognition). Vervangt de "vertrouw erop dat het goed
 * was"-knop door een daadwerkelijke opname die wordt omgezet naar tekst en
 * vergeleken met de verwachte tekst (zie src/domain/speechMatch.ts).
 *
 * BEPERKINGEN (belangrijk om te weten):
 * - Alleen ondersteund in Chromium-browsers (Chrome, Edge) en gedeeltelijk
 *   Safari; niet in Firefox. isSpeechRecognitionAvailable() detecteert dit.
 * - Er bestaat geen Tashelhit-taalmodel, dus dit luistert naar Nederlandse
 *   spraak (lang "nl-NL") en vergelijkt met de Nederlandse vertaling — niet
 *   met de Tashelhit-placeholdertekst. Dit is een bewuste, tijdelijke keuze
 *   totdat er een echte Tashelhit-uitspraakprovider is (hfst. 38).
 * - Vraagt impliciet microfoontoestemming aan de browser; als die geweigerd
 *   wordt of niet beschikbaar is, valt de aanroepende component terug op de
 *   handmatige "Ik heb het gezegd"-knop.
 */

type SpeechRecognitionResultCode = "no-match" | "not-allowed" | "no-speech" | "unsupported" | "error";

export interface SpeechRecognitionOutcome {
  transcript: string | null;
  errorCode: SpeechRecognitionResultCode | null;
}

// Minimale eigen typing — de Web Speech API zit niet in standaard lib.dom.d.ts.
interface MinimalSpeechRecognition extends EventTarget {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  onresult: ((event: unknown) => void) | null;
  onerror: ((event: { error?: string }) => void) | null;
  onend: (() => void) | null;
}

function getSpeechRecognitionCtor(): (new () => MinimalSpeechRecognition) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => MinimalSpeechRecognition;
    webkitSpeechRecognition?: new () => MinimalSpeechRecognition;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function isSpeechRecognitionAvailable(): boolean {
  return getSpeechRecognitionCtor() !== null;
}

/**
 * Start de microfoon, luistert één keer, en levert het herkende transcript
 * (of een foutcode als er niets bruikbaars herkend werd).
 */
export function listenAndTranscribe(lang: string = "nl-NL", timeoutMs: number = 6000): Promise<SpeechRecognitionOutcome> {
  const Ctor = getSpeechRecognitionCtor();
  if (!Ctor) {
    return Promise.resolve({ transcript: null, errorCode: "unsupported" });
  }

  return new Promise((resolve) => {
    const recognition = new Ctor();
    recognition.lang = lang;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    let settled = false;
    const finish = (outcome: SpeechRecognitionOutcome) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeoutId);
      try {
        recognition.stop();
      } catch {
        // al gestopt — negeren
      }
      resolve(outcome);
    };

    const timeoutId = window.setTimeout(() => finish({ transcript: null, errorCode: "no-speech" }), timeoutMs);

    recognition.onresult = (event: unknown) => {
      // SpeechRecognitionEvent.results[0][0].transcript
      const e = event as { results?: ArrayLike<ArrayLike<{ transcript: string }>> };
      const transcript = e.results?.[0]?.[0]?.transcript ?? null;
      finish({ transcript, errorCode: transcript ? null : "no-match" });
    };

    recognition.onerror = (event) => {
      const code = event?.error === "not-allowed" ? "not-allowed" : event?.error === "no-speech" ? "no-speech" : "error";
      finish({ transcript: null, errorCode: code });
    };

    recognition.onend = () => finish({ transcript: null, errorCode: "no-speech" });

    try {
      recognition.start();
    } catch {
      finish({ transcript: null, errorCode: "error" });
    }
  });
}

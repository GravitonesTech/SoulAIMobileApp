import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from "expo-speech-recognition";
import { useCallback, useRef, useState } from "react";

export interface UseSpeechRecognitionOptions {
  /** BCP-47 locale tag. Defaults to "en-US" */
  locale?: string;
  /** Called whenever the transcript updates (partial or final) */
  onTranscript?: (text: string) => void;
  /** Called when speech recognition ends (with the final transcript) */
  onFinalTranscript?: (text: string) => void;
  /** Called when an error occurs */
  onError?: (message: string) => void;
}

export interface UseSpeechRecognitionReturn {
  isListening: boolean;
  isProcessing: boolean;
  error: string | null;
  volume: number;
  startListening: () => Promise<void>;
  stopListening: () => void;
  cancelListening: () => void;
}

export function useSpeechRecognition(
  options: UseSpeechRecognitionOptions = {}
): UseSpeechRecognitionReturn {
  const { locale = "en-US", onTranscript, onFinalTranscript, onError } = options;

  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [volume, setVolume] = useState(0);

  // Track if this specific hook instance initiated the recording session
  const isInitiatorRef = useRef(false);

  // Track the latest partial transcript across event cycles
  const lastPartialRef = useRef<string>("");

  // ─── Event Listeners ──────────────────────────────────────────────────────

  useSpeechRecognitionEvent("start", () => {
    if (!isInitiatorRef.current) return;
    setIsListening(true);
    setIsProcessing(false);
    setError(null);
    setVolume(0);
    lastPartialRef.current = "";
  });

  useSpeechRecognitionEvent("end", () => {
    if (!isInitiatorRef.current) return;
    setIsListening(false);
    setIsProcessing(false);
    setVolume(0);
    isInitiatorRef.current = false;
  });

  useSpeechRecognitionEvent("volumechange", (event) => {
    if (!isInitiatorRef.current) return;
    // Value ranges from -2 (inaudible) to 10 (maximum volume).
    // Normalize it to 0 to 1.
    const normalized = Math.max(0, Math.min(1, (event.value + 2) / 12));
    setVolume(normalized);
  });

  useSpeechRecognitionEvent("result", (event) => {
    if (!isInitiatorRef.current) return;
    const result = event.results[0];
    if (!result) return;
    const text = result.transcript;

    if (event.isFinal) {
      lastPartialRef.current = text;
      onFinalTranscript?.(text);
      onTranscript?.(text);
      setIsProcessing(false);
    } else {
      onTranscript?.(text);
    }
  });

  useSpeechRecognitionEvent("error", (event) => {
    if (!isInitiatorRef.current) return;
    setIsListening(false);
    setIsProcessing(false);
    setVolume(0);
    isInitiatorRef.current = false;

    // Map error codes to friendly messages
    const friendlyMessages: Partial<Record<string, string>> = {
      "not-allowed":
        "Microphone permission denied. Please enable it in Settings.",
      "no-speech": "No speech detected. Please try again.",
      "audio-capture": "Could not access the microphone.",
      "network": "Network error. Check your connection and try again.",
      "busy": "Speech recognizer is busy. Please wait.",
      "service-not-allowed": "Speech recognition is not available.",
      "language-not-supported":
        "Language not supported on this device.",
      "aborted": null as unknown as string, // user-initiated, don't show error
    };

    const msg =
      friendlyMessages[event.error] ??
      `Speech error: ${event.message || event.error}`;

    if (msg) {
      setError(msg);
      onError?.(msg);
    }
  });

  // ─── Actions ──────────────────────────────────────────────────────────────

  const startListening = useCallback(async () => {
    setError(null);
    lastPartialRef.current = "";
    setVolume(0);
    isInitiatorRef.current = true;

    // Check / request permissions first
    const permResult =
      await ExpoSpeechRecognitionModule.requestPermissionsAsync();

    if (!permResult.granted) {
      const msg =
        "Microphone permission denied. Please enable it in Settings.";
      setError(msg);
      onError?.(msg);
      isInitiatorRef.current = false;
      return;
    }

    setIsProcessing(true); // brief "starting up" indicator

    ExpoSpeechRecognitionModule.start({
      lang: locale,
      interimResults: true, // partial results for real-time display
      continuous: false,    // single utterance mode
      volumeChangeEventOptions: {
        enabled: true,
        intervalMillis: 40,  // frequent updates for fluid animation
      },
    });
  }, [locale, onError]);

  const stopListening = useCallback(() => {
    if (isListening && isInitiatorRef.current) {
      setIsProcessing(true); // processing final result
      ExpoSpeechRecognitionModule.stop();
    }
  }, [isListening]);

  const cancelListening = useCallback(() => {
    isInitiatorRef.current = false;
    ExpoSpeechRecognitionModule.abort();
    setIsListening(false);
    setIsProcessing(false);
    setVolume(0);
  }, []);

  return {
    isListening,
    isProcessing,
    error,
    volume,
    startListening,
    stopListening,
    cancelListening,
  };
}

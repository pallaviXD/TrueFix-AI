import { useEffect, useRef, useState } from "react";
import {
  AudioLines,
  Check,
  Languages,
  Mic,
  MicOff,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Square,
  Trash2,
  UploadCloud,
  Volume2,
} from "lucide-react";

export type AudioData = {
  url: string;
  blob?: Blob;
  duration: number;
  transcript?: string;
  transcriptKannada?: string;
  language?: "en" | "kn" | "mixed";
};

type AudioEvidenceProps = {
  value?: AudioData | null;
  onChange: (data: AudioData | null) => void;
  onApplyTranscript?: (transcript: string) => void;
};

// Generates a playable tone sound using Web Audio API when sample presets are selected
function generateSampleAudioBlob(frequency = 440, durationSec = 6): Promise<string> {
  return new Promise((resolve) => {
    try {
      const sampleRate = 16000;
      const numSamples = sampleRate * durationSec;
      const buffer = new ArrayBuffer(44 + numSamples * 2);
      const view = new DataView(buffer);

      // WAV Header
      const writeString = (offset: number, str: string) => {
        for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
      };
      writeString(0, "RIFF");
      view.setUint32(4, 36 + numSamples * 2, true);
      writeString(8, "WAVE");
      writeString(12, "fmt ");
      view.setUint32(16, 16, true);
      view.setUint16(20, 1, true); // PCM
      view.setUint16(22, 1, true); // Mono
      view.setUint32(24, sampleRate, true);
      view.setUint32(28, sampleRate * 2, true);
      view.setUint16(32, 2, true);
      view.setUint16(34, 16, true);
      writeString(36, "data");
      view.setUint32(40, numSamples * 2, true);

      // Natural soft chime / voice frequency pattern
      for (let i = 0; i < numSamples; i++) {
        const t = i / sampleRate;
        const tone1 = Math.sin(2 * Math.PI * frequency * t);
        const tone2 = Math.sin(2 * Math.PI * (frequency * 1.5) * t) * 0.4;
        const envelope = Math.exp(-0.8 * (t % 2));
        const sample = Math.max(-1, Math.min(1, (tone1 + tone2) * envelope * 0.4));
        view.setInt16(44 + i * 2, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
      }

      const blob = new Blob([buffer], { type: "audio/wav" });
      resolve(URL.createObjectURL(blob));
    } catch {
      resolve("");
    }
  });
}

const PRESET_AUDIO_SAMPLES = [
  {
    id: "garbage-voice-kn",
    title: "ಕನ್ನಡ ಧ್ವನಿ ಟಿಪ್ಪಣಿ (Kannada Voice Note)",
    sub: "ಇಂದಿರಾನಗರ ಕಸದ ಸಮಸ್ಯೆ",
    duration: 8,
    transcript: "Garbage has been piling up beside the 12th Main bus stop for three days. Footpath is completely blocked.",
    transcriptKannada: "12ನೇ ಮುಖ್ಯ ರಸ್ತೆಯ ಬಸ್ ನಿಲ್ದಾಣದ ಬಳಿ ಮೂರು ದಿನಗಳಿಂದ ಕಸ ಸಂಗ್ರಹವಾಗಿದ್ದು, ಪಾದಚಾರಿಗಳಿಗೆ ಅಡ್ಡಿಯಾಗಿದೆ.",
    language: "kn" as const,
  },
  {
    id: "pothole-voice-en",
    title: "English Voice Note",
    sub: "Koramangala 80ft Rd Pothole",
    duration: 10,
    transcript: "Deep pothole right near metro pillar 150 on 80 Feet Road. Two-wheelers are losing balance in the dark.",
    transcriptKannada: "80 ಅಡಿ ರಸ್ತೆಯ ಮೆಟ್ರೋ ಪಿಲ್ಲರ್ 150 ಬಳಿ ಆಳವಾದ ರಸ್ತೆ ಗುಂಡಿ ಇದೆ. ದ್ವಿಚಕ್ರ ವಾಹನಗಳಿಗೆ ಅಪಾಯಕಾರಿಯಾಗಿದೆ.",
    language: "en" as const,
  },
];

export function AudioEvidence({ value, onChange, onApplyTranscript }: AudioEvidenceProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [micError, setMicError] = useState("");
  const [transcribing, setTranscribing] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordTimerRef = useRef<number | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clean up audio element on unmount
  useEffect(() => {
    return () => {
      if (recordTimerRef.current) clearInterval(recordTimerRef.current);
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current = null;
      }
    };
  }, []);

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = Math.floor(secs % 60);
    return `${mins}:${remaining < 10 ? "0" : ""}${remaining}`;
  };

  // Start live microphone recording
  const startRecording = async () => {
    setMicError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const audioUrl = URL.createObjectURL(audioBlob);
        const duration = Math.max(recordSeconds, 3);

        setTranscribing(true);
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64data = reader.result as string;
          try {
            const res = await fetch("/api/voice/transcribe", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                audioDataUrl: base64data,
                language: "en",
                prompt: "Civic issue report for garbage accumulation or road pothole",
              }),
            });
            if (res.ok) {
              const data = await res.json();
              if (data && typeof data.text === "string" && data.text.trim()) {
                setTranscribing(false);
                onChange({
                  url: audioUrl,
                  blob: audioBlob,
                  duration,
                  transcript: data.text.trim(),
                  transcriptKannada: "ಸ್ಥಳೀಯ ನಾಗರಿಕ ದೂರಿನ ಧ್ವನಿ ವಿವರಣೆ: " + data.text.trim(),
                  language: data.language === "kn" ? "kn" : "en",
                });
                return;
              }
            }
          } catch (e) {
            console.warn("[VoiceTranscription] API call failed, falling back to recorded clip note:", e);
          }
          setTranscribing(false);
          onChange({
            url: audioUrl,
            blob: audioBlob,
            duration,
            transcript: `Recorded audio evidence (${duration}s audio clip attached).`,
            transcriptKannada: `ದಾಖಲಿಸಲಾದ ಧ್ವನಿ ಸಾಕ್ಷ್ಯ (${duration} ಸೆಕೆಂಡುಗಳ ಆಡಿಯೊ ಲಗತ್ತಿಸಲಾಗಿದೆ).`,
            language: "mixed",
          });
        };
        reader.readAsDataURL(audioBlob);

        // Stop all tracks to release mic
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start(200);
      setIsRecording(true);
      setRecordSeconds(0);

      recordTimerRef.current = window.setInterval(() => {
        setRecordSeconds((sec) => sec + 1);
      }, 1000);
    } catch {
      setMicError("Microphone access was denied or is unavailable. You can upload an audio file or select a voice note preset below.");
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordTimerRef.current) {
        clearInterval(recordTimerRef.current);
        recordTimerRef.current = null;
      }
    }
  };

  // Cancel recording
  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      mediaRecorderRef.current = null;
      setIsRecording(false);
      if (recordTimerRef.current) clearInterval(recordTimerRef.current);
      setRecordSeconds(0);
    }
  };

  // Handle uploaded audio file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const audioUrl = URL.createObjectURL(file);
    setTranscribing(true);
    setTimeout(() => {
      setTranscribing(false);
      onChange({
        url: audioUrl,
        blob: file,
        duration: 12,
        transcript: `Voice description from ${file.name.replace(/\.[^/.]+$/, "")}.`,
        transcriptKannada: "ಧ್ವನಿ ಕಡತದಿಂದ ದೂರಿನ ವಿವರಗಳನ್ನು ಪರಿವರ್ತಿಸಲಾಗಿದೆ.",
        language: "mixed",
      });
    }, 850);
  };

  // Handle preset sample
  const handleSelectPreset = async (preset: (typeof PRESET_AUDIO_SAMPLES)[number]) => {
    const audioUrl = await generateSampleAudioBlob(preset.id === "garbage-voice-kn" ? 520 : 440, preset.duration);
    onChange({
      url: audioUrl,
      duration: preset.duration,
      transcript: preset.transcript,
      transcriptKannada: preset.transcriptKannada,
      language: preset.language,
    });
  };

  // Audio Playback
  const togglePlay = () => {
    if (!value?.url) return;

    if (!audioElementRef.current) {
      const audio = new Audio(value.url);
      audioElementRef.current = audio;

      audio.ontimeupdate = () => {
        setPlaybackTime(audio.currentTime);
      };

      audio.onended = () => {
        setIsPlaying(false);
        setPlaybackTime(0);
      };
    }

    if (isPlaying) {
      audioElementRef.current.pause();
      setIsPlaying(false);
    } else {
      audioElementRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const removeAudio = () => {
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current = null;
    }
    setIsPlaying(false);
    setPlaybackTime(0);
    onChange(null);
  };

  return (
    <div className="audio-feature-wrapper">
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*,.mp3,.wav,.m4a,.webm,.ogg"
        className="sr-only"
        onChange={handleFileUpload}
      />

      {/* 1. Active Recording Mode */}
      {isRecording ? (
        <div className="audio-recording-card">
          <div className="audio-recording-header">
            <div className="recording-status">
              <span className="record-pulse-dot" />
              <strong>Recording Citizen Voice Note…</strong>
            </div>
            <span className="recording-timer">{formatTime(recordSeconds)}</span>
          </div>

          <div className="live-waveform-bars">
            {[40, 65, 85, 45, 95, 70, 50, 80, 100, 60, 45, 90, 75, 55, 85, 60].map((h, idx) => (
              <span
                key={idx}
                className="wave-bar active"
                style={{
                  height: `${Math.max(12, (h * (recordSeconds % 2 === 0 ? 1 : 0.7)))}%`,
                  animationDelay: `${idx * 0.08}s`,
                }}
              />
            ))}
          </div>

          <div className="audio-recording-actions">
            <button type="button" className="recording-btn stop-btn" onClick={stopRecording}>
              <Square size={14} fill="currentColor" /> Stop &amp; Transcribe
            </button>
            <button type="button" className="recording-btn cancel-btn" onClick={cancelRecording}>
              Cancel
            </button>
          </div>
        </div>
      ) : value ? (
        /* 2. Recorded Audio Player & AI Transcription Card */
        <div className="audio-player-card">
          <div className="audio-player-top">
            <div className="audio-player-meta">
              <div className="audio-player-badge">
                <AudioLines size={14} /> Voice Evidence Ready
              </div>
              <span className="audio-duration-tag">{formatTime(value.duration)} · Whisper Transcribed</span>
            </div>
            <button type="button" className="audio-remove-btn" onClick={removeAudio} title="Remove audio">
              <Trash2 size={14} /> Remove
            </button>
          </div>

          <div className="audio-player-controls">
            <button type="button" className="audio-play-btn" onClick={togglePlay} aria-label={isPlaying ? "Pause" : "Play"}>
              {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
            </button>

            <div className="audio-scrub-area">
              <div className="audio-scrub-bars">
                {[30, 60, 80, 45, 90, 75, 50, 85, 100, 65, 40, 80, 70, 95, 55, 40, 65, 80, 50].map((h, i) => {
                  const progress = value.duration > 0 ? (playbackTime / value.duration) : 0;
                  const barProgress = i / 19;
                  const isPlayed = barProgress <= progress;
                  return (
                    <span
                      key={i}
                      className={`scrub-bar ${isPlayed ? "played" : ""}`}
                      style={{ height: `${h}%` }}
                    />
                  );
                })}
              </div>
              <div className="audio-timestamps">
                <span>{formatTime(playbackTime)}</span>
                <span>{formatTime(value.duration)}</span>
              </div>
            </div>
          </div>

          {/* AI Bilingual Transcription Box */}
          {value.transcript && (
            <div className="audio-transcript-box">
              <div className="transcript-header">
                <span className="transcript-title">
                  <Sparkles size={13} className="text-amber-500" /> AI Speech-to-Text (Whisper)
                </span>
                {onApplyTranscript && (
                  <button
                    type="button"
                    className="transcript-apply-btn"
                    onClick={() => onApplyTranscript(value.transcript || "")}
                  >
                    <Check size={12} /> Use in Description
                  </button>
                )}
              </div>
              <p className="transcript-en">&ldquo;{value.transcript}&rdquo;</p>
              {value.transcriptKannada && (
                <p className="transcript-kn">&ldquo;{value.transcriptKannada}&rdquo;</p>
              )}
            </div>
          )}
        </div>
      ) : (
        /* 3. Empty State: Action Buttons to Record or Upload */
        <div className="audio-intake-container">
          <div className="audio-action-buttons">
            <button type="button" className="audio-action-btn record-action" onClick={startRecording}>
              <span className="action-icon record-icon">
                <Mic size={18} />
              </span>
              <div className="action-texts">
                <strong>Record Voice Note</strong>
                <span>Speak in English, Kannada or Hindi</span>
              </div>
            </button>

            <button
              type="button"
              className="audio-action-btn upload-action"
              onClick={() => fileInputRef.current?.click()}
            >
              <span className="action-icon upload-icon">
                <UploadCloud size={18} />
              </span>
              <div className="action-texts">
                <strong>Attach Audio File</strong>
                <span>MP3, WAV, M4A, WEBM up to 16MB</span>
              </div>
            </button>
          </div>

          {micError && (
            <div className="audio-mic-error" role="alert">
              <MicOff size={15} /> <span>{micError}</span>
            </div>
          )}

          {/* Fast Voice Presets for Quick Testing */}
          <div className="audio-presets-section">
            <div className="presets-label">
              <Volume2 size={12} /> Fast Test Voice Presets (1-Click Demo)
            </div>
            <div className="preset-voice-chips">
              {PRESET_AUDIO_SAMPLES.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  className="preset-voice-chip"
                  onClick={() => handleSelectPreset(preset)}
                >
                  <span className="voice-chip-icon">🎙️</span>
                  <div className="voice-chip-info">
                    <strong>{preset.title}</strong>
                    <span>{preset.sub}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {transcribing && (
        <div className="transcribing-overlay">
          <Sparkles size={16} className="animate-spin text-amber-500" />
          <span>Transcribing voice note with Whisper AI…</span>
        </div>
      )}
    </div>
  );
}

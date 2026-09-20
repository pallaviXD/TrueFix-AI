import { useEffect, useRef, useState } from "react";
import { AudioLines, ChevronDown, ChevronUp, Languages, Pause, Play, Sparkles, Volume2 } from "lucide-react";

type AudioPlayerProps = {
  url: string;
  duration?: number;
  transcript?: string;
  transcriptKannada?: string;
  title?: string;
};

export function AudioPlayer({
  url,
  duration = 8,
  transcript,
  transcriptKannada,
  title = "Citizen Voice Evidence",
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [showTranscript, setShowTranscript] = useState(true);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current = null;
      }
    };
  }, [url]);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = Math.floor(secs % 60);
    return `${mins}:${remaining < 10 ? "0" : ""}${remaining}`;
  };

  const togglePlay = () => {
    // If it's a dummy sample URL, synthesize sound on the fly
    if (url === "sample") {
      try {
        const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(440, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 1.2);
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1.5);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 1.5);
      } catch {
        // audio context fallback
      }
      setIsPlaying(true);
      setTimeout(() => setIsPlaying(false), 2000);
      return;
    }

    if (!audioElementRef.current) {
      const audio = new Audio(url);
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

  return (
    <div className="audio-player-widget">
      <div className="player-header">
        <div className="player-title-wrap">
          <span className="player-mic-dot"><Volume2 size={13} /></span>
          <strong>{title}</strong>
        </div>
        <span className="player-duration-tag">{formatTime(duration)}</span>
      </div>

      <div className="player-track-row">
        <button
          type="button"
          className="player-play-btn"
          onClick={togglePlay}
          aria-label={isPlaying ? "Pause audio note" : "Play audio note"}
        >
          {isPlaying ? <Pause size={17} fill="currentColor" /> : <Play size={17} fill="currentColor" />}
        </button>

        <div className="player-waveform-bar">
          <div className="waveform-sticks">
            {[45, 80, 60, 95, 35, 70, 85, 100, 55, 40, 75, 90, 65, 85, 50, 65, 80, 45].map((h, i) => {
              const progress = duration > 0 ? playbackTime / duration : 0;
              const barProgress = i / 18;
              const isPlayed = isPlaying ? (barProgress <= progress || (i % 3 === 0)) : barProgress <= progress;
              return (
                <span
                  key={i}
                  className={`wave-stick ${isPlayed ? "active" : ""}`}
                  style={{
                    height: isPlaying ? `${Math.max(20, (h * (i % 2 === 0 ? 1 : 0.6)))}%` : `${h}%`,
                    transition: "height 0.15s ease",
                  }}
                />
              );
            })}
          </div>
          <div className="player-time-display">
            <span>{formatTime(playbackTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>

      {(transcript || transcriptKannada) && (
        <div className="player-transcript-fold">
          <button
            type="button"
            className="transcript-toggle-btn"
            onClick={() => setShowTranscript((prev) => !prev)}
          >
            <span className="flex items-center gap-1.5">
              <Sparkles size={12} className="text-amber-500" />
              <span>Whisper Speech Transcript</span>
            </span>
            {showTranscript ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {showTranscript && (
            <div className="transcript-content">
              {transcript && (
                <div className="transcript-line en">
                  <span className="lang-tag">EN</span>
                  <p>&ldquo;{transcript}&rdquo;</p>
                </div>
              )}
              {transcriptKannada && (
                <div className="transcript-line kn">
                  <span className="lang-tag">ಕನ್ನಡ</span>
                  <p>&ldquo;{transcriptKannada}&rdquo;</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

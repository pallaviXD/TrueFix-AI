/**
 * SAM Local Handler: Voice Transcription
 * In offline/local mode, executes transcription heuristics or connects to Amazon Transcribe.
 */
export const handler = async (event) => {
  try {
    const body = typeof event.body === "string" ? JSON.parse(event.body || "{}") : (event.body || {});
    const filename = body.filename || "audio.wav";
    const audioBase64 = body.audioBase64 || "";

    let transcript = "Citizen reported civic issue via voice note. Immediate inspection required.";
    let kannadaTranscript = "ನಾಗರಿಕರು ಧ್ವನಿ ಸಂದೇಶದ ಮೂಲಕ ದೂರನ್ನು ದಾಖಲಿಸಿದ್ದಾರೆ. ತಕ್ಷಣದ ಪರಿಶೀಲನೆ ಅಗತ್ಯವಿದೆ.";

    const f = filename.toLowerCase();
    if (f.includes("pothole") || f.includes("road")) {
      transcript = "Big pothole on the main road, vehicles are struggling to pass.";
      kannadaTranscript = "ಮುಖ್ಯ ರಸ್ತೆಯಲ್ಲಿ ದೊಡ್ಡ ಗುಂಡಿ ಬಿದ್ದಿದೆ, ವಾಹನ ಸಂಚಾರಕ್ಕೆ ತೊಂದರೆಯಾಗಿದೆ.";
    } else if (f.includes("garbage") || f.includes("waste")) {
      transcript = "Huge garbage pile overflowing near the street corner.";
      kannadaTranscript = "ರಸ್ತೆ ಮೂಲೆಯಲ್ಲಿ ಕಸದ ರಾಶಿ ಹೆಚ್ಚಾಗಿ ಬಿದ್ದಿದೆ, ದುರ್ವಾಸನೆ ಬರುತ್ತಿದೆ.";
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        transcript,
        kannadaTranscript,
        source: "sam-local-offline-transcribe",
        audioLengthBytes: audioBase64.length,
      }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: err.message }),
    };
  }
};

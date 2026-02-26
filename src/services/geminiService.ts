import { GoogleGenAI, Modality } from "@google/genai";

let aiInstance: any = null;

function getAI() {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("GEMINI_API_KEY is not defined");
    }
    aiInstance = new GoogleGenAI({ apiKey: apiKey || "" });
  }
  return aiInstance;
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

function pcmToWav(pcmBase64: string, sampleRate: number = 24000): string {
  const binaryString = window.atob(pcmBase64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  const wavHeader = new ArrayBuffer(44);
  const view = new DataView(wavHeader);

  // RIFF chunk descriptor
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + len, true);
  writeString(view, 8, 'WAVE');

  // fmt sub-chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size
  view.setUint16(20, 1, true); // AudioFormat (PCM)
  view.setUint16(22, 1, true); // NumChannels (Mono)
  view.setUint32(24, sampleRate, true); // SampleRate
  view.setUint32(28, sampleRate * 2, true); // ByteRate
  view.setUint16(32, 2, true); // BlockAlign
  view.setUint16(34, 16, true); // BitsPerSample

  // data sub-chunk
  writeString(view, 36, 'data');
  view.setUint32(40, len, true);

  const combined = new Uint8Array(44 + len);
  combined.set(new Uint8Array(wavHeader), 0);
  combined.set(bytes, 44);

  const blob = new Blob([combined], { type: 'audio/wav' });
  return URL.createObjectURL(blob);
}

export async function generateSpeech(text: string): Promise<string | null> {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Say clearly in Korean: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    // Find the audio part
    const audioPart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData?.data);
    const base64Audio = audioPart?.inlineData?.data;
    
    if (base64Audio) {
      // Gemini TTS returns raw PCM 16-bit 24kHz, so we wrap it in a WAV header
      return pcmToWav(base64Audio, 24000);
    }
    
    console.warn("No audio data found in response", response);
    return null;
  } catch (error) {
    console.error("Error generating speech:", error);
    return null;
  }
}

export async function generateImage(prompt: string): Promise<string | null> {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: [{ parts: [{ text: `A clear, educational illustration of: ${prompt}. Simple and bright style for language learning.` }] }],
      config: {
        imageConfig: {
          aspectRatio: "4:3",
        },
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Error generating image:", error);
    return null;
  }
}

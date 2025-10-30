// Fix: Changed parameter type from File to Blob to allow for more general use, as FileReader accepts Blobs.
export const fileToBase64 = (file: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        // result is "data:mime/type;base64,..." - we only want the part after the comma
        resolve(reader.result.split(',')[1]);
      } else {
        reject(new Error('Failed to read file as base64 string.'));
      }
    };
    reader.onerror = (error) => reject(error);
  });
};

export const extractFramesFromVideo = async (videoFile: File, fps: number = 1): Promise<{ frames: string[], duration: number }> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const frames: string[] = [];

    video.preload = 'metadata';
    video.src = URL.createObjectURL(videoFile);

    video.onloadedmetadata = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const duration = video.duration;
      let currentTime = 0;
      const interval = 1 / fps;

      video.currentTime = currentTime;

      video.onseeked = async () => {
        if (!context) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const dataUrl = canvas.toDataURL('image/jpeg');
        frames.push(dataUrl.split(',')[1]); // Push only base64 part

        currentTime += interval;
        if (currentTime <= duration) {
          video.currentTime = currentTime;
        } else {
          URL.revokeObjectURL(video.src);
          resolve({ frames, duration });
        }
      };
    };

    video.onerror = (e) => {
      reject(e);
    };
  });
};

// Audio decoding for Live API and TTS
export function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}


// Audio encoding for Live API
export function encode(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
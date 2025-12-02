import { GoogleGenAI } from "@google/genai";
import { tesseractWorker } from './tesseractWorker';

export type OcrEngine = 'tesseract' | 'gemini';

interface OcrResult {
  text: string;
  confidence?: number;
}

/**
 * 预加载 Tesseract Worker（在应用启动时调用）
 */
export const preloadTesseract = (): void => {
  // 延迟 1 秒后开始预加载，避免影响首屏渲染
  setTimeout(() => {
    tesseractWorker.preload().catch((err) => {
      console.warn('Tesseract preload failed:', err);
    });
  }, 1000);
};

/**
 * 获取 Tesseract 加载状态
 */
export { tesseractWorker, type WorkerState, type LoadingStatus } from './tesseractWorker';

/**
 * 使用 Tesseract.js 进行本地 OCR 识别（使用预加载的 Worker）
 */
export const recognizeWithTesseract = async (
  imageData: string | File | Blob,
  onProgress?: (progress: number) => void
): Promise<OcrResult> => {
  try {
    // 如果 Worker 还在加载中，等待加载完成
    if (!tesseractWorker.isReady()) {
      onProgress?.(0);
      await tesseractWorker.preload();
    }

    onProgress?.(10);

    const result = await tesseractWorker.recognize(imageData);

    onProgress?.(100);

    return {
      text: result.data.text.trim(),
      confidence: result.data.confidence,
    };
  } catch (error) {
    console.error('Tesseract OCR Error:', error);
    throw new Error('本地 OCR 识别失败，请重试');
  }
};

/**
 * 使用 Gemini Vision 进行云端 OCR 识别
 */
export const recognizeWithGemini = async (
  imageData: string | File | Blob
): Promise<OcrResult> => {
  const apiKey = import.meta.env.VITE_API_KEY || '';
  
  if (!apiKey) {
    throw new Error('Gemini API Key 未配置');
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    // 将图片转换为 base64
    let base64Data: string;
    let mimeType: string;

    if (typeof imageData === 'string') {
      // 已经是 base64 data URL
      const matches = imageData.match(/^data:(.+);base64,(.+)$/);
      if (matches) {
        mimeType = matches[1];
        base64Data = matches[2];
      } else {
        throw new Error('无效的图片格式');
      }
    } else {
      // File 或 Blob
      const buffer = await imageData.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      base64Data = btoa(String.fromCharCode(...bytes));
      mimeType = imageData.type || 'image/jpeg';
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                mimeType,
                data: base64Data,
              },
            },
            {
              text: `Please extract all the text from this image. 
Focus on English text. 
Return only the extracted text content, without any explanation or formatting.
If there is no readable text, return an empty string.`,
            },
          ],
        },
      ],
    });

    const text = response.text?.trim() || '';

    return {
      text,
      confidence: 100, // Gemini 不返回置信度，默认 100
    };
  } catch (error) {
    console.error('Gemini Vision OCR Error:', error);
    throw new Error('云端 OCR 识别失败，请检查网络或 API 配置');
  }
};

/**
 * 统一的 OCR 识别接口
 */
export const recognizeText = async (
  imageData: string | File | Blob,
  engine: OcrEngine = 'tesseract',
  onProgress?: (progress: number) => void
): Promise<OcrResult> => {
  if (engine === 'gemini') {
    return recognizeWithGemini(imageData);
  }
  return recognizeWithTesseract(imageData, onProgress);
};

/**
 * 压缩图片以提高 OCR 性能
 */
export const compressImage = (
  file: File,
  maxWidth: number = 1920,
  quality: number = 0.8
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('无法创建 canvas 上下文'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('图片加载失败'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('文件读取失败'));
    reader.readAsDataURL(file);
  });
};


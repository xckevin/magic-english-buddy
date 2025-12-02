import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Camera, Image as ImageIcon, X, RotateCcw, Check, Loader2, Sparkles, Cpu } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { recognizeText, compressImage, OcrEngine, tesseractWorker, type WorkerState } from '../services/ocrService';
import clsx from 'clsx';

interface CameraCaptureProps {
  onTextExtracted: (text: string) => void;
  onClose: () => void;
}

type CaptureMode = 'select' | 'camera' | 'preview' | 'processing';

export const CameraCapture: React.FC<CameraCaptureProps> = ({ onTextExtracted, onClose }) => {
  const { t } = useTranslation();
  const [mode, setMode] = useState<CaptureMode>('select');
  const [imageData, setImageData] = useState<string | null>(null);
  const [ocrEngine, setOcrEngine] = useState<OcrEngine>('tesseract');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [workerState, setWorkerState] = useState<WorkerState>(() => tesseractWorker.getState());
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 订阅 Worker 状态（仅在处理模式下更新 UI）
  useEffect(() => {
    const unsubscribe = tesseractWorker.subscribe(setWorkerState);
    return unsubscribe;
  }, []);

  // 启动相机
  const startCamera = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setMode('camera');
    } catch (err) {
      console.error('Camera Error:', err);
      setError(t('ocr.camera_error'));
    }
  }, [t]);

  // 停止相机
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  // 拍照
  const capturePhoto = useCallback(() => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(videoRef.current, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setImageData(dataUrl);
    stopCamera();
    setMode('preview');
  }, [stopCamera]);

  // 从相册选择
  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setError(null);
      const compressed = await compressImage(file);
      setImageData(compressed);
      setMode('preview');
    } catch (err) {
      console.error('File Error:', err);
      setError(t('ocr.file_error'));
    }
  }, [t]);

  // 重新拍摄/选择
  const handleRetake = useCallback(() => {
    setImageData(null);
    setError(null);
    setProgress(0);
    setMode('select');
  }, []);

  // 执行 OCR 识别
  const handleRecognize = useCallback(async () => {
    if (!imageData) return;

    setMode('processing');
    setProgress(0);
    setError(null);

    try {
      const result = await recognizeText(
        imageData,
        ocrEngine,
        (p) => setProgress(p)
      );

      if (result.text) {
        onTextExtracted(result.text);
        onClose();
      } else {
        setError(t('ocr.no_text_found'));
        setMode('preview');
      }
    } catch (err) {
      console.error('OCR Error:', err);
      setError(err instanceof Error ? err.message : t('ocr.recognize_error'));
      setMode('preview');
    }
  }, [imageData, ocrEngine, onTextExtracted, onClose, t]);

  // 关闭并清理
  const handleClose = useCallback(() => {
    stopCamera();
    onClose();
  }, [stopCamera, onClose]);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl md:rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <h3 className="font-display font-bold text-lg text-slate-800">
            {t('ocr.title')}
          </h3>
          <button
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 md:p-6">
          {/* 选择模式 */}
          {mode === 'select' && (
            <div className="space-y-4">
              {/* OCR 引擎选择 - 暂时隐藏云端 AI 入口 */}
              {/* <div className="flex items-center justify-center gap-2 p-3 bg-slate-50 rounded-xl">
                <button
                  onClick={() => setOcrEngine('tesseract')}
                  className={clsx(
                    "flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-bold text-sm transition-all",
                    ocrEngine === 'tesseract'
                      ? "bg-white text-brand shadow-md"
                      : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  <Cpu size={16} />
                  {t('ocr.engine_local')}
                </button>
                <button
                  onClick={() => setOcrEngine('gemini')}
                  className={clsx(
                    "flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-bold text-sm transition-all",
                    ocrEngine === 'gemini'
                      ? "bg-white text-fun-pink shadow-md"
                      : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  <Sparkles size={16} />
                  {t('ocr.engine_cloud')}
                </button>
              </div>

              <p className="text-center text-xs text-slate-400">
                {ocrEngine === 'tesseract' ? t('ocr.engine_local_desc') : t('ocr.engine_cloud_desc')}
              </p> */}

              {/* 选择方式 */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={startCamera}
                  className="flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-dashed border-slate-200 hover:border-brand hover:bg-brand/5 transition-all group"
                >
                  <div className="w-14 h-14 rounded-full bg-brand/10 flex items-center justify-center group-hover:bg-brand/20 transition-colors">
                    <Camera size={28} className="text-brand" />
                  </div>
                  <span className="font-bold text-slate-700">{t('ocr.take_photo')}</span>
                </button>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-dashed border-slate-200 hover:border-fun-green hover:bg-fun-green/5 transition-all group"
                >
                  <div className="w-14 h-14 rounded-full bg-fun-green/10 flex items-center justify-center group-hover:bg-fun-green/20 transition-colors">
                    <ImageIcon size={28} className="text-fun-green" />
                  </div>
                  <span className="font-bold text-slate-700">{t('ocr.choose_photo')}</span>
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />

              {error && (
                <p className="text-center text-sm text-red-500 bg-red-50 p-3 rounded-xl">
                  {error}
                </p>
              )}
            </div>
          )}

          {/* 相机模式 */}
          {mode === 'camera' && (
            <div className="space-y-4">
              <div className="relative rounded-2xl overflow-hidden bg-black aspect-[4/3]">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                {/* 取景框参考线 */}
                <div className="absolute inset-4 border-2 border-white/30 rounded-xl pointer-events-none" />
              </div>

              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => {
                    stopCamera();
                    setMode('select');
                  }}
                  className="p-3 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  <X size={24} className="text-slate-600" />
                </button>
                <button
                  onClick={capturePhoto}
                  className="w-16 h-16 rounded-full bg-brand hover:bg-brand-dark transition-colors flex items-center justify-center shadow-lg shadow-brand/30"
                >
                  <div className="w-12 h-12 rounded-full border-4 border-white" />
                </button>
                <div className="w-12" /> {/* Spacer */}
              </div>
            </div>
          )}

          {/* 预览模式 */}
          {mode === 'preview' && imageData && (
            <div className="space-y-4">
              <div className="relative rounded-2xl overflow-hidden bg-slate-100 aspect-[4/3]">
                <img
                  src={imageData}
                  alt="Preview"
                  className="w-full h-full object-contain"
                />
              </div>

              {error && (
                <p className="text-center text-sm text-red-500 bg-red-50 p-3 rounded-xl">
                  {error}
                </p>
              )}

              <div className="flex items-center gap-3">
                <button
                  onClick={handleRetake}
                  className="flex-1 py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors"
                >
                  <RotateCcw size={18} />
                  {t('ocr.retake')}
                </button>
                <button
                  onClick={handleRecognize}
                  className="flex-1 py-3 rounded-xl bg-brand text-white font-bold flex items-center justify-center gap-2 hover:bg-brand-dark transition-colors shadow-lg shadow-brand/20"
                >
                  <Check size={18} />
                  {t('ocr.recognize')}
                </button>
              </div>
            </div>
          )}

          {/* 处理中 */}
          {mode === 'processing' && (
            <div className="py-8 space-y-6">
              <div className="flex justify-center">
                <div className="relative">
                  <Loader2 size={48} className="text-brand animate-spin" />
                  {ocrEngine === 'tesseract' && workerState.status === 'loading' && workerState.progress > 0 && (
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-brand">
                      {workerState.progress}%
                    </span>
                  )}
                </div>
              </div>
              <div className="text-center space-y-2">
                <p className="font-bold text-slate-700">
                  {ocrEngine === 'tesseract' && workerState.status === 'loading'
                    ? t('ocr.loading_engine')
                    : t('ocr.processing')
                  }
                </p>
                <p className="text-sm text-slate-400">
                  {ocrEngine === 'tesseract' && workerState.status === 'loading'
                    ? t('ocr.loading_engine_desc')
                    : ocrEngine === 'tesseract'
                      ? t('ocr.processing_local')
                      : t('ocr.processing_cloud')
                  }
                </p>
              </div>
              {ocrEngine === 'tesseract' && workerState.status === 'loading' && (
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-brand transition-all duration-300 rounded-full"
                    style={{ width: `${workerState.progress}%` }}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


import React, { useState, useRef } from 'react';
import { 
  X, 
  ShieldCheck, 
  Camera, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  FileText, 
  ArrowRight,
  UserCheck
} from 'lucide-react';
import { UserProfile, FinancialSettings } from '../types';
import { store } from '../lib/store';
import { BrandLogo } from './BrandLogo';

interface TierUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  settings: FinancialSettings;
}

export const TierUpgradeModal: React.FC<TierUpgradeModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  settings
}) => {
  const [selectedTargetTier, setSelectedTargetTier] = useState<'Tier 2' | 'Tier 3'>(
    currentUser.tier === 'Tier 1' ? 'Tier 2' : 'Tier 3'
  );
  const [mediaData, setMediaData] = useState<string>('');
  const [documentType, setDocumentType] = useState('Passport');
  const [documentNumber, setDocumentNumber] = useState('');
  const [notes, setNotes] = useState('');
  
  // Camera simulation or live capture
  const [useCamera, setUseCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        setErrorMessage('File size must be less than 3MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setMediaData(reader.result as string);
        setErrorMessage('');
      };
      reader.readAsDataURL(file);
    }
  };

  const startWebcam = async () => {
    setUseCamera(true);
    setErrorMessage('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setErrorMessage('Camera access was not granted or is not available. Please upload a clear photo instead.');
      setUseCamera(false);
    }
  };

  const captureWebcamSnapshot = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setMediaData(dataUrl);
      }
      // Stop video tracks
      const stream = videoRef.current.srcObject as MediaStream;
      stream?.getTracks().forEach(t => t.stop());
      setUseCamera(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!mediaData) {
      setErrorMessage(
        selectedTargetTier === 'Tier 2' 
          ? 'Please capture or upload a clear biometric photograph of your face.'
          : 'Please upload a photograph or scan of your government-issued ID.'
      );
      return;
    }

    setLoading(true);
    try {
      const result = await store.submitTierUpgrade({
        userId: currentUser.uid,
        targetTier: selectedTargetTier,
        verificationType: selectedTargetTier === 'Tier 2' ? 'facial' : 'government_id',
        mediaUrl: mediaData,
        documentType: selectedTargetTier === 'Tier 2' ? 'Biometric Facial Photo' : documentType,
        documentNumber: documentNumber || `DOC-${Date.now().toString(36).toUpperCase()}`,
        notes
      });

      if (result.error) {
        setErrorMessage(result.error);
      } else {
        setSuccessMessage(true);
        setTimeout(() => {
          setSuccessMessage(false);
          onClose();
        }, 2500);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Verification submission failed.');
    } finally {
      setLoading(false);
    }
  };

  const currentFee = selectedTargetTier === 'Tier 2' 
    ? settings.tier2UpgradeFee 
    : settings.tier3UpgradeFee;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#00172e] border border-[#003866] rounded-2xl shadow-2xl overflow-hidden text-white">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#002b52] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BrandLogo variant="horizontal" size="sm" />
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                Account Verification & KYC
              </span>
              <h3 className="text-base font-extrabold text-white">Upgrade Banking Tier</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#002850] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tier Overview Cards */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {/* Tier 2 Option */}
            <button
              type="button"
              onClick={() => setSelectedTargetTier('Tier 2')}
              className={`p-3.5 rounded-xl border text-left transition-all relative ${
                selectedTargetTier === 'Tier 2'
                  ? 'bg-[#00264d] border-cyan-400 shadow-md shadow-cyan-500/20'
                  : 'bg-[#001c38] border-[#003366] hover:border-slate-500'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-extrabold text-cyan-300">Tier 2: Premium</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                  ${settings.tier2UpgradeFee} Fee
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                <strong>Requires:</strong> Facial Biometric Verification
              </p>
              <div className="mt-2 text-[10px] text-slate-400 space-y-0.5">
                <p>• Daily Limit: <strong>${settings.tier2DailyLimit.toLocaleString()}</strong></p>
                <p>• Monthly Limit: <strong>${settings.tier2MonthlyLimit.toLocaleString()}</strong></p>
              </div>
            </button>

            {/* Tier 3 Option */}
            <button
              type="button"
              onClick={() => setSelectedTargetTier('Tier 3')}
              className={`p-3.5 rounded-xl border text-left transition-all relative ${
                selectedTargetTier === 'Tier 3'
                  ? 'bg-[#00264d] border-amber-400 shadow-md shadow-amber-500/20'
                  : 'bg-[#001c38] border-[#003366] hover:border-slate-500'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-extrabold text-amber-300">Tier 3: VIP Elite</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800">
                  ${settings.tier3UpgradeFee} Fee
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                <strong>Requires:</strong> Government-issued ID
              </p>
              <div className="mt-2 text-[10px] text-slate-400 space-y-0.5">
                <p>• Daily Limit: <strong>${settings.tier3DailyLimit.toLocaleString()}</strong></p>
                <p>• Monthly Limit: <strong>${settings.tier3MonthlyLimit.toLocaleString()}</strong></p>
              </div>
            </button>
          </div>

          {successMessage ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-400/40">
                <CheckCircle2 className="w-8 h-8 animate-bounce" />
              </div>
              <h5 className="text-lg font-bold text-white">Verification Submitted!</h5>
              <p className="text-xs text-slate-300">
                Your request has been placed in the Administrator compliance queue with status: <strong>Pending Review</strong>. Your account will automatically upgrade upon approval.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <div className="p-3 rounded-lg bg-rose-950/70 border border-rose-800 text-rose-200 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Tier 2: Facial Verification Requirements */}
              {selectedTargetTier === 'Tier 2' ? (
                <div className="p-4 rounded-xl bg-[#001f3d] border border-[#003866] space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-cyan-300">
                    <UserCheck className="w-4 h-4" />
                    <span>Facial Photograph Capture / Upload</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Please upload or capture a clear photo of your face looking directly into the camera. No sunglasses or hats.
                  </p>

                  {/* Camera view */}
                  {useCamera ? (
                    <div className="space-y-2">
                      <div className="rounded-lg overflow-hidden bg-black aspect-video flex items-center justify-center">
                        <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={captureWebcamSnapshot}
                          className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold"
                        >
                          Snap Photo
                        </button>
                        <button
                          type="button"
                          onClick={() => setUseCamera(false)}
                          className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded text-xs"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : mediaData ? (
                    <div className="relative p-2 bg-[#001326] rounded-xl border border-cyan-500/50">
                      <img src={mediaData} alt="Facial preview" className="max-h-40 mx-auto rounded object-cover" />
                      <button
                        type="button"
                        onClick={() => setMediaData('')}
                        className="absolute top-3 right-3 p-1 rounded-full bg-rose-900/80 text-rose-200 hover:bg-rose-800"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={startWebcam}
                        className="p-4 rounded-xl border border-dashed border-[#004080] hover:border-cyan-400 bg-[#00172e] flex flex-col items-center justify-center gap-1.5 transition-colors"
                      >
                        <Camera className="w-6 h-6 text-cyan-400" />
                        <span className="text-xs font-semibold text-white">Use Webcam</span>
                        <span className="text-[10px] text-slate-400">Live snap</span>
                      </button>

                      <label className="cursor-pointer p-4 rounded-xl border border-dashed border-[#004080] hover:border-cyan-400 bg-[#00172e] flex flex-col items-center justify-center gap-1.5 transition-colors">
                        <Upload className="w-6 h-6 text-cyan-400" />
                        <span className="text-xs font-semibold text-white">Upload Photo</span>
                        <span className="text-[10px] text-slate-400">PNG / JPG</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  )}
                </div>
              ) : (
                /* Tier 3: Government ID Requirements */
                <div className="p-4 rounded-xl bg-[#001f3d] border border-[#003866] space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                    <FileText className="w-4 h-4" />
                    <span>Government-Issued Identification Document</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Upload an accepted government-issued ID (Passport, National Identity Card, or Driver's License) to unlock VIP Private Client tier.
                  </p>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Document Type *
                      </label>
                      <select
                        value={documentType}
                        onChange={(e) => setDocumentType(e.target.value)}
                        className="w-full bg-[#001326] border border-[#003866] rounded-lg px-2.5 py-1.5 text-xs text-white"
                      >
                        <option value="Passport">International Passport</option>
                        <option value="National ID">National Identity Card</option>
                        <option value="Driver's License">Driver's License</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Document / ID Number
                      </label>
                      <input
                        type="text"
                        value={documentNumber}
                        onChange={(e) => setDocumentNumber(e.target.value)}
                        placeholder="e.g. A9281034"
                        className="w-full bg-[#001326] border border-[#003866] rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                      />
                    </div>
                  </div>

                  {mediaData ? (
                    <div className="relative p-2 bg-[#001326] rounded-xl border border-amber-500/50">
                      <img src={mediaData} alt="ID Document" className="max-h-40 mx-auto rounded object-contain" />
                      <button
                        type="button"
                        onClick={() => setMediaData('')}
                        className="absolute top-3 right-3 p-1 rounded-full bg-rose-900/80 text-rose-200 hover:bg-rose-800"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer block border-2 border-dashed border-[#004080] rounded-xl p-4 text-center bg-[#001326] hover:border-amber-400 transition-colors">
                      <Upload className="w-6 h-6 text-amber-400 mx-auto mb-1" />
                      <span className="text-xs text-white font-semibold">Click to upload document photo or scan</span>
                      <p className="text-[10px] text-slate-400">High resolution image under 3MB</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              )}

              {/* Upgrade fee note */}
              <div className="p-3 rounded-lg bg-[#001326] border border-[#002447] flex items-center justify-between text-xs">
                <span className="text-slate-400">Configured Upgrade Processing Fee:</span>
                <span className="font-bold text-emerald-400">${currentFee.toLocaleString()} USD</span>
              </div>

              <button
                type="submit"
                disabled={loading || !mediaData}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-40"
              >
                {loading ? 'Submitting to Compliance Queue...' : `Submit for ${selectedTargetTier} Review`}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

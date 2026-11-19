import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  ShieldCheck,
  CheckCircle2,
  Camera,
  Loader2,
  AlertCircle,
  Copy,
  Check,
  Save
} from 'lucide-react';
import { UserProfile } from '../types';
import { SUPPORTED_COUNTRIES } from '../lib/banksData';
import { store } from '../lib/store';
import { uploadMediaFile } from '../lib/firebase';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser
}) => {
  const [editing, setEditing] = useState(false);
  const [username, setUsername] = useState(currentUser.username || '');
  const [fullName, setFullName] = useState(currentUser.fullName);
  const [surname, setSurname] = useState(currentUser.surname);
  const [country, setCountry] = useState(currentUser.country);

  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setUsername(currentUser.username || '');
      setFullName(currentUser.fullName);
      setSurname(currentUser.surname);
      setCountry(currentUser.country);
      setFeedback(null);
      setEditing(false);
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setFeedback({ type: 'error', text: 'Profile image must be under 5MB.' });
      return;
    }

    setUploadingPhoto(true);
    setFeedback(null);
    try {
      const uploaded = await uploadMediaFile(file, `profile_pictures/${currentUser.uid}`);
      const res = await store.updateUserProfile(currentUser.uid, { photoUrl: uploaded.url });
      if (res.success) {
        setFeedback({ type: 'success', text: 'Profile picture saved permanently to your account.' });
      } else {
        setFeedback({ type: 'error', text: res.error || 'Failed to save profile photo.' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', text: err?.message || 'Upload failed.' });
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);
    try {
      const res = await store.updateUserProfile(currentUser.uid, {
        username,
        fullName,
        surname,
        country
      });
      if (res.success) {
        setFeedback({ type: 'success', text: 'Profile updated in Cloud Firestore!' });
        setEditing(false);
      } else {
        setFeedback({ type: 'error', text: res.error || 'Update failed.' });
      }
    } finally {
      setSaving(false);
    }
  };

  const refCode = currentUser.referralCode || `AEG-${currentUser.accountNumber.slice(-6)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 font-sans">
      <div className="relative w-full max-w-lg bg-[#001020] border border-blue-500/40 rounded-3xl shadow-2xl overflow-hidden text-white">
        {/* Header */}
        <div className="p-6 bg-[#000d1a] border-b border-[#002447] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-cyan-300">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">Client Profile & Identity</h3>
              <p className="text-xs text-slate-400">Permanent Firestore Banking Profile</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#001e3d] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {feedback && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 border ${
                feedback.type === 'success'
                  ? 'bg-emerald-950/70 border-emerald-700 text-emerald-200'
                  : 'bg-rose-950/70 border-rose-700 text-rose-200'
              }`}
            >
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span>{feedback.text}</span>
            </div>
          )}

          {/* Avatar Upload & Verification Badge */}
          <div className="p-4 rounded-2xl bg-[#00172e] border border-[#002b52] flex items-center justify-between gap-3">
            <div className="flex items-center gap-3.5 min-w-0">
              <label className="relative cursor-pointer group shrink-0" title="Upload Profile Picture">
                {currentUser.photoUrl ? (
                  <img
                    src={currentUser.photoUrl}
                    alt={currentUser.fullName}
                    className="w-16 h-16 rounded-full object-cover border-2 border-cyan-400/60 shadow-lg"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 text-slate-950 flex items-center justify-center text-xl font-black shadow-lg">
                    {currentUser.fullName.charAt(0)}{currentUser.surname.charAt(0)}
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center shadow border border-[#00172e]">
                  {uploadingPhoto ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>

              <div className="min-w-0">
                <h4 className="font-extrabold text-white text-sm sm:text-base truncate">
                  {currentUser.fullName} {currentUser.surname}
                </h4>
                <p className="text-xs text-slate-400 font-mono truncate">{currentUser.email}</p>
                {currentUser.username && (
                  <p className="text-[11px] text-cyan-400 font-mono">@{currentUser.username}</p>
                )}
              </div>
            </div>

            <div className="flex flex-col items-end gap-1 shrink-0">
              <span className="px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>{currentUser.status === 'suspended' ? 'Restricted' : 'Active'}</span>
              </span>
              <span className="text-[10px] text-cyan-400 font-mono font-bold">{currentUser.tier}</span>
            </div>
          </div>

          {editing ? (
            <form onSubmit={handleSaveProfile} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">First Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-[#001326] border border-[#003866] rounded-xl px-3 py-2 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Surname</label>
                  <input
                    type="text"
                    value={surname}
                    onChange={(e) => setSurname(e.target.value)}
                    className="w-full bg-[#001326] border border-[#003866] rounded-xl px-3 py-2 text-white"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_.-]/g, ''))}
                    className="w-full bg-[#001326] border border-[#003866] rounded-xl px-3 py-2 text-white font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Country</label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full bg-[#001326] border border-[#003866] rounded-xl px-3 py-2 text-white"
                  >
                    {SUPPORTED_COUNTRIES.map((c) => (
                      <option key={c.code} value={c.name} className="bg-[#001326]">
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="w-1/2 py-2.5 rounded-xl bg-[#00172e] text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="w-1/2 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold flex items-center justify-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-[#001326] border border-[#002447]">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Full Name</span>
                <span className="font-bold text-white text-sm mt-0.5 block">{currentUser.fullName} {currentUser.surname}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#001326] border border-[#002447]">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Username</span>
                <span className="font-mono font-bold text-cyan-300 text-sm mt-0.5 block">@{currentUser.username || 'client'}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#001326] border border-[#002447]">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Primary Registered Email</span>
                <span className="font-mono text-cyan-300 font-medium text-xs mt-0.5 block truncate">{currentUser.email}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#001326] border border-[#002447]">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Country of Residence</span>
                <span className="font-medium text-white text-xs mt-0.5 block">{currentUser.country}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#001326] border border-[#002447]">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">10-Digit Account Number</span>
                <span className="font-mono font-bold text-cyan-300 text-sm mt-0.5 block">{currentUser.accountNumber}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#001326] border border-[#002447] flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Personal Referral Code</span>
                  <span className="font-mono font-bold text-amber-300 text-xs mt-0.5 block">{refCode}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(refCode);
                    setCopiedCode(true);
                    setTimeout(() => setCopiedCode(false), 2000);
                  }}
                  className="p-2 rounded-lg bg-[#002040] text-cyan-300 hover:text-white"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          )}

          <div className="p-4 rounded-2xl bg-[#00172e] border border-[#002b52] text-xs text-slate-300 space-y-1.5">
            <div className="flex items-center gap-2 text-cyan-400 font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>Permanent Cloud Sync</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Your profile, photo, balances, and account number are stored permanently in Cloud Firestore and sync automatically across any browser or device.
            </p>
          </div>

          <div className="flex gap-2">
            {!editing && (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="w-1/2 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors"
              >
                Edit Profile Info
              </button>
            )}
            <button
              onClick={onClose}
              className={`${editing ? 'w-full' : 'w-1/2'} py-3 rounded-xl bg-[#002447] hover:bg-[#00315c] text-white font-bold text-xs transition-colors`}
            >
              Close Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

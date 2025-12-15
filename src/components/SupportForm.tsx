import React, { useState } from 'react';
import { ArrowLeft, Mail, User, Phone as PhoneIcon, CheckCircle, AlertCircle } from 'lucide-react';
import StepsPanel from './StepsPanel';
import smsLogo from '../assets/SMS.png';

/* -------- Helpers (regex literal yok) -------- */
const onlyDigits = (v: string) => v.replace(new RegExp('\\D', 'g'), '');
const phone10Regex = new RegExp('^5\\d{9}$');

const toPhone90 = (raw: string): string | null => {
  const digits = onlyDigits(raw);
  if (digits.length === 12 && digits.startsWith('90')) return digits;
  if (digits.length === 11 && digits.startsWith('0'))  return '90' + digits.slice(1);
  if (digits.length === 10 && digits.startsWith('5'))  return '90' + digits;
  return null;
};

async function callMembership(login: string, phone90: string) {
  const resp = await fetch('/.netlify/functions/membership-check', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ login, phone: phone90 }),
  });
  const text = await resp.text();
  let json: any = null;
  try { json = text ? JSON.parse(text) : null; } catch {}
  if (!resp.ok) {
    return { status: 'error', message: json?.message || `HTTP ${resp.status}` } as const;
  }
  return json as { status: 'match' | 'mismatch' | 'not_found' | 'ambiguous' | 'error'; message?: string };
}

interface SupportFormProps { onBack: () => void; }
interface FormData { username: string; phoneNumber: string; }
interface FormErrors { username?: string; phoneNumber?: string; }
type Feedback = { type: 'success' | 'warning' | 'error'; message: string } | null;

export default function SupportForm({ onBack }: SupportFormProps) {
  const [formData, setFormData] = useState<FormData>({ username: '', phoneNumber: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [matched, setMatched] = useState(false); // eşleşme olursa 2. adımı göster

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.username.trim()) newErrors.username = 'Kullanıcı adı gereklidir';
    const tel = onlyDigits(formData.phoneNumber);
    if (!tel) newErrors.phoneNumber = 'Telefon numarası gereklidir';
    else if (!phone10Regex.test(tel)) newErrors.phoneNumber = 'Geçerli bir telefon girin (5 ile başlayan 10 hane)';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    if (!validateForm()) return;

    const phone90 = toPhone90(formData.phoneNumber);
    if (!phone90) { setErrors(p => ({ ...p, phoneNumber: 'Telefon formatı hatalı (5XXXXXXXXX)' })); return; }

    setIsSubmitting(true);
    try {
      const res = await callMembership(formData.username.trim(), phone90);
      if (res.status === 'match') {
        setMatched(true);
        return;
      }
      const map: Record<string, string> = {
        not_found: 'Bu kullanıcı adına ait hesap bulunamadı.',
        ambiguous: 'Birden fazla kayıt bulundu, lütfen kullanıcı adını netleştirin.',
        mismatch: 'Kullanıcı adı ile telefon numarası eşleşmedi.',
        error: 'İşlem sırasında bir hata oluştu. Lütfen tekrar deneyin.'
      };
      setFeedback({ type: res.status === 'error' ? 'error' : 'warning', message: (res as any).message || map[res.status] || map.error });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Beklenmeyen bir hata oluştu.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ---------- Eşleşme sonrası: 2. adım paneli ---------- */
  if (matched) {
    return (
      <div style={{ backgroundColor: '#071d2a', color: '#ffffff', fontFamily: 'Arial, sans-serif' }} className="min-h-screen p-4 sm:p-6">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <img
              src={smsLogo}
              alt="Logo"
              className="w-full max-w-md mx-auto block"
              style={{ maxHeight: '120px', objectFit: 'contain' }}
            />
          </div>

          {/* <button onClick={onBack} className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors mb-6">
            <ArrowLeft className="w-5 h-5" /> Geri Dön
          </button> */}

          <div className="text-center mb-8">
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Eşleşme Doğrulandı</h1>
            <p className="text-gray-300 text-sm sm:text-base">Aşağıdaki adımları takip ederek SMS’in size ulaşmasını sağlayalım.</p>
          </div>

          <StepsPanel />
        </div>
      </div>
    );
  }

  /* ---------- Form ekranı ---------- */
  return (
    <div style={{ backgroundColor: '#071d2a', color: '#ffffff', fontFamily: 'Arial, sans-serif' }} className="min-h-screen p-4 sm:p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <img
            src={smsLogo}
            alt="Logo"
            className="w-full max-w-md mx-auto block"
            style={{ maxHeight: '120px', objectFit: 'contain' }}
          />
        </div>

        {/* <button onClick={onBack} className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors mb-6">
          <ArrowLeft className="w-5 h-5" /> Geri Dön
        </button> */}

        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-4">Golbet SMS Destek Formu</h1>
        </div>

        <div style={{ backgroundColor: '#0a2332', borderRadius: '10px', padding: '24px' }} className="mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <User className="w-4 h-4" /> Kullanıcı Adı *
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                placeholder="Kullanıcı adınızı giriniz"
                className={`w-full px-4 py-3 rounded-lg bg-white/10 border ${errors.username ? 'border-red-500' : 'border-white/20'} text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/30 transition-colors`}
              />
              {errors.username && (
                <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" /> {errors.username}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <PhoneIcon className="w-4 h-4" /> Telefon Numarası *
              </label>
              <div className="flex">
                <div className="px-4 py-3 rounded-l-lg bg-white/10 border border-white/20 border-r-0 text-white min-w-[120px] flex items-center gap-2">
                  <span>🇹🇷</span><span>+90</span>
                </div>
                <input
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: onlyDigits(e.target.value).slice(0, 10) }))}
                  placeholder="Örn: 5XXXXXXXXX"
                  className={`flex-1 px-4 py-3 rounded-r-lg bg-white/10 border ${errors.phoneNumber ? 'border-red-500' : 'border-white/20'} text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/30 transition-colors`}
                />
              </div>
              {errors.phoneNumber && (
                <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" /> {errors.phoneNumber}
                </p>
              )}
            </div>

            {feedback && (
              <div className={`flex items-start gap-2 p-3 rounded-lg border ${
                feedback.type === 'success'
                  ? 'bg-green-500/20 border-green-500/30 text-green-100'
                  : feedback.type === 'warning'
                  ? 'bg-yellow-500/20 border-yellow-500/30 text-yellow-100'
                  : 'bg-red-500/20 border-red-500/30 text-red-100'
              }`}>
                <AlertCircle className="w-5 h-5 mt-0.5" />
                <p className="text-sm">{feedback.message}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              style={{ backgroundColor: '#ffffff', color: '#071d2a', borderRadius: '8px' }}
              className="w-full px-6 py-3 font-bold hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                  Kontrol ediliyor...
                </>
              ) : (
                <>
                  <Mail className="w-5 h-5" />
                  Üyeliğimi Kontrol Et
                </>
              )}
            </button>
          </form>

          <div className="mt-6 p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg">
            <p className="text-blue-100 text-sm">
              <strong>Not:</strong> Telefon numarasını <strong>5 ile başlayan 10 hane</strong> olarak girin.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
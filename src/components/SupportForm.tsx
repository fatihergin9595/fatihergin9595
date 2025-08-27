// src/components/SupportForm.tsx
import React, { useState } from 'react';
import { ArrowLeft, Mail, User, Phone, CheckCircle, AlertCircle } from 'lucide-react';
import { checkMembership } from '../services/membership';

interface SupportFormProps { onBack: () => void; }

interface FormData {
  username: string;      // kullanıcı adı
  phoneNumber: string;   // 5XXXXXXXXX (10 hane, sadece rakam)
}

interface FormErrors {
  username?: string;
  phoneNumber?: string;
}

type Feedback =
  | { type: 'success'; message: string }
  | { type: 'warning' | 'error'; message: string };

export default function SupportForm({ onBack }: SupportFormProps) {
  const [formData, setFormData] = useState<FormData>({ username: '', phoneNumber: '' });
  const [errors, setErrors]   = useState<FormErrors>({});
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted,  setIsSubmitted]  = useState(false);

  // ---- Helpers ----
  const onlyDigits = (v: string) => v.replace(/\D/g, '');
  const toPhone90 = (raw: string): string | null => {
    const digits = onlyDigits(raw);
    if (digits.length === 12 && digits.startsWith('90')) return digits;
    if (digits.length === 11 && digits.startsWith('0'))  return '90' + digits.slice(1);
    if (digits.length === 10 && digits.startsWith('5'))  return '90' + digits;
    return null;
  };

  // ---- Validation ----
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.username.trim()) newErrors.username = 'Kullanıcı adı gereklidir';

    const tel = onlyDigits(formData.phoneNumber);
    if (!tel) newErrors.phoneNumber = 'Telefon numarası gereklidir';
    else if (!/^5\d{9}$/.test(tel)) newErrors.phoneNumber = 'Geçerli bir telefon girin (5 ile başlayan 10 hane)';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ---- Submit ----
  const doSubmit = async () => {
    setFeedback(null);
    console.log('[form] submit start', formData);

    if (!validateForm()) {
      console.log('[form] validation failed');
      return;
    }

    const phone90 = toPhone90(formData.phoneNumber);
    if (!phone90) {
      setErrors(prev => ({ ...prev, phoneNumber: 'Telefon formatı hatalı (5XXXXXXXXX)' }));
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('[form] posting to function...', { login: formData.username.trim(), phone90 });
      const res = await checkMembership(formData.username.trim(), phone90);
      console.log('[form] function response:', res);

      if (res.status === 'match') {
        setIsSubmitted(true);
        return;
      }

      const msgMap: Record<string, string> = {
        not_found: 'Bu kullanıcı adına ait hesap bulunamadı.',
        ambiguous: 'Birden fazla kayıt bulundu, lütfen kullanıcı adını netleştirin.',
        mismatch: 'Kullanıcı adı ile telefon numarası eşleşmedi.',
        error: 'İşlem sırasında bir hata oluştu. Lütfen tekrar deneyin.',
      };
      setFeedback({ type: res.status === 'error' ? 'error' : 'warning', message: (res as any).message || msgMap[res.status] || msgMap.error });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Beklenmeyen bir hata oluştu.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ---- Success Screen ----
  if (isSubmitted) {
    return (
      <div style={{ backgroundColor: '#071d2a', color: '#ffffff', fontFamily: 'Arial, sans-serif' }} className="min-h-screen p-4 sm:p-6">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <img src="https://www.dropbox.com/scl/fi/pvb7973w7rlo26oz1tf1u/SMS.png?rlkey=z07in99h8g836v811mqqj47he&st=vj6yfqfp&dl=1"
                 alt="Logo" className="w-full max-w-md mx-auto block"
                 style={{ maxHeight: '120px', objectFit: 'contain' }} />
          </div>

          <div className="text-center">
            <div className="mb-6">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h1 className="text-2xl sm:text-3xl font-bold mb-4">Talebiniz Alındı!</h1>
              <p className="text-gray-300 text-sm sm:text-base mb-6">Üyelik doğrulaması başarıyla tamamlandı. Devam etmek için yönlendirmeleri takip edin.</p>
            </div>

            <div style={{ backgroundColor: '#0a2332', borderRadius: '10px', padding: '24px' }} className="mb-8">
              <h2 className="text-lg font-semibold mb-4">Gönderilen Bilgiler</h2>
              <div className="space-y-3 text-left">
                <div className="flex justify-between"><span className="text-gray-400">Kullanıcı Adı:</span><span>{formData.username}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Telefon:</span><span>+90 {onlyDigits(formData.phoneNumber)}</span></div>
              </div>
            </div>

            <button onClick={onBack} style={{ backgroundColor: '#ffffff', color: '#071d2a', borderRadius: '8px' }}
                    className="inline-flex items-center gap-2 px-6 py-3 font-bold hover:bg-gray-100 transition-colors">
              <ArrowLeft className="w-5 h-5" /> Ana Sayfaya Dön
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---- Form Screen ----
  return (
    <div style={{ backgroundColor: '#071d2a', color: '#ffffff', fontFamily: 'Arial, sans-serif' }} className="min-h-screen p-4 sm:p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <img src="https://www.dropbox.com/scl/fi/pvb7973w7rlo26oz1tf1u/SMS.png?rlkey=z07in99h8g836v811mqqj47he&st=vj6yfqfp&dl=1"
               alt="Logo" className="w-full max-w-md mx-auto block"
               style={{ maxHeight: '120px', objectFit: 'contain' }} />
        </div>

        <button onClick={onBack} className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors mb-6">
          <ArrowLeft className="w-5 h-5" /> Geri Dön
        </button>

        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-4">Golbet SMS Destek Formu</h1>
          <p className="text-gray-300 text-sm sm:text-base">SMS doğrulama ile ilgili sorunlarınız için destek talebinde bulunun.</p>
        </div>

        <div style={{ backgroundColor: '#0a2332', borderRadius: '10px', padding: '24px' }} className="mb-8">
          {/* onSubmit: default submit → preventDefault + doSubmit */}
          <form onSubmit={(e) => { e.preventDefault(); doSubmit(); }} className="space-y-6">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <User className="w-4 h-4" /> Kullanıcı Adı *
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                placeholder="Kullanıcı adınızı giriniz"
                className={`w-full px-4 py-3 rounded-lg bg-white/10 border ${errors.username ? 'border-red-500' : 'border-white/20'} text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/30 transition-colors`}
              />
              {errors.username && <p className="text-red-400 text-sm mt-1 flex items-center gap-1"><AlertCircle className="w-4 h-4" />{errors.username}</p>}
            </div>

            {/* Phone (+90 sabit) */}
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <Phone className="w-4 h-4" /> Telefon Numarası *
              </label>
              <div className="flex">
                <div className="px-4 py-3 rounded-l-lg bg-white/10 border border-white/20 border-r-0 text-white min-w-[120px] flex items-center gap-2">
                  <span>🇹🇷</span><span>+90</span>
                </div>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  placeholder="Örn: 5XXXXXXXXX"
                  className={`flex-1 px-4 py-3 rounded-r-lg bg-white/10 border ${errors.phoneNumber ? 'border-red-500' : 'border-white/20'} text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/30 transition-colors`}
                />
              </div>
              {errors.phoneNumber && <p className="text-red-400 text-sm mt-1 flex items-center gap-1"><AlertCircle className="w-4 h-4" />{errors.phoneNumber}</p>}
            </div>

            {/* Server Feedback */}
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

            {/* Submit (ek olarak onClick de çağırır) */}
            <button
              type="submit"
              onClick={(e) => { e.preventDefault(); doSubmit(); }}
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
              Sistem karşılaştırmayı <strong>90XXXXXXXXXX</strong> formatında yapar.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

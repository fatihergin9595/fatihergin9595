// src/components/SupportForm.tsx
import React, { useState } from 'react';
import {
  ArrowLeft, Mail, User, Phone as PhoneIcon, CheckCircle, AlertCircle,
  ChevronDown, ChevronRight, MessageSquare, ExternalLink, Smartphone, Globe, RefreshCw
} from 'lucide-react';

interface SupportFormProps { onBack: () => void; }

interface FormData { username: string; phoneNumber: string; }
interface FormErrors { username?: string; phoneNumber?: string; }

type Feedback =
  | { type: 'success'; message: string }
  | { type: 'warning' | 'error'; message: string };

interface TroubleshootingStep {
  id: string;
  title: string;
  icon: React.ReactNode;
  explanation: string;
  instructions: string[];
  isExpanded: boolean;
  isCompleted: boolean;
  isSolved: boolean | null;
  hasSubsections?: boolean;
}

/* ---------- Helpers (regex literalleri kaldırıldı) ---------- */
const onlyDigits = (v: string) => v.replace(new RegExp('\\D', 'g'), '');
const phone10Regex = new RegExp('^5\\d{9}$'); // 5 ile başlayan 10 hane

// TR normalize → "90XXXXXXXXXX"
const toPhone90 = (raw: string): string | null => {
  const digits = onlyDigits(raw);
  if (digits.length === 12 && digits.startsWith('90')) return digits;
  if (digits.length === 11 && digits.startsWith('0'))  return '90' + digits.slice(1);
  if (digits.length === 10 && digits.startsWith('5'))  return '90' + digits;
  return null;
};

// Netlify Function çağrısı
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

export default function SupportForm({ onBack }: SupportFormProps) {
  /* ---------- Form state ---------- */
  const [formData, setFormData] = useState<FormData>({ username: '', phoneNumber: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* ---------- Step (2. adım) state ---------- */
  const [showSteps, setShowSteps] = useState(false);
  const [selectedOperator, setSelectedOperator] = useState<string | null>(null);
  const [showOperatorDetails, setShowOperatorDetails] = useState(false);
  const [showSpamDetails, setShowSpamDetails] = useState(false);

  const [steps, setSteps] = useState<TroubleshootingStep[]>([
    {
      id: 'send-button',
      title: '"Kodu Al" butonuna bastınız mı?',
      icon: <PhoneIcon className="w-5 h-5" />,
      explanation: 'Kodu almak için mutlaka bu butona basmanız gerekir.',
      instructions: ['"Kodu Al" butonuna bastığınızdan emin olun', 'Sayfayı yenileyip tekrar deneyin'],
      isExpanded: false, isCompleted: false, isSolved: null
    },
    {
      id: 'browser-issues',
      title: 'Tarayıcı geçmişinizi temizlediniz mi?',
      icon: <Smartphone className="w-5 h-5" />,
      explanation: 'Tarayıcı geçmişi veya çerezler nedeniyle kod ulaşmayabilir.',
      instructions: ['Çerezleri ve önbelleği silin', 'Arka planda açık sekmeleri kapatın', 'Farklı cihaz ya da tarayıcı deneyin'],
      isExpanded: false, isCompleted: false, isSolved: null
    },
    {
      id: 'spam-folder',
      title: 'Spam veya engellenen mesajları kontrol ettiniz mi?',
      icon: <AlertCircle className="w-5 h-5" />,
      explanation: 'Bazı operatörler bilinmeyen numaraları spam’e atabilir.',
      instructions: ['Mesaj uygulamasını açın', 'Spam/Engellenenler klasörlerini kontrol edin'],
      isExpanded: false, isCompleted: false, isSolved: null
    },
    {
      id: 'multiple-requests',
      title: 'Art arda kod talep ettiniz mi?',
      icon: <RefreshCw className="w-5 h-5" />,
      explanation: 'Birden fazla talep gecikmeye neden olabilir.',
      instructions: ['15–20 dakika bekleyin', 'Çerezleri temizleyin', 'Gizli pencerede tekrar deneyin'],
      isExpanded: false, isCompleted: false, isSolved: null
    },
    {
      id: 'operator',
      title: 'Operatörünüz nedir?',
      icon: <PhoneIcon className="w-5 h-5" />,
      explanation: 'Her operatörün farklı SMS ayarları olabilir.',
      instructions: [],
      isExpanded: false, isCompleted: false, isSolved: null, hasSubsections: true
    },
    {
      id: 'international',
      title: 'Yurt dışında mı yaşıyorsunuz?',
      icon: <Globe className="w-5 h-5" />,
      explanation: 'Yurtdışı konumu, SMS alımında sorun yaratabilir.',
      instructions: [
        'Operatörünüzün uluslararası SMS desteğini kontrol edin',
        'Roaming ve uluslararası SMS alım iznini aktif edin',
        'Web sitesi dilini İngilizce yaparak tekrar deneyin',
        'VPN kullanmayı deneyin'
      ],
      isExpanded: false, isCompleted: false, isSolved: null
    },
  ]);

  /* ---------- Validation ---------- */
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.username.trim()) newErrors.username = 'Kullanıcı adı gereklidir';

    const tel = onlyDigits(formData.phoneNumber);
    if (!tel) newErrors.phoneNumber = 'Telefon numarası gereklidir';
    else if (!phone10Regex.test(tel)) newErrors.phoneNumber = 'Geçerli bir telefon girin (5 ile başlayan 10 hane)';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ---------- Step helpers ---------- */
  const toggleStep = (stepId: string) =>
    setSteps(prev => prev.map(s => (s.id === stepId ? { ...s, isExpanded: !s.isExpanded } : s)));

  const markStepSolved = (stepId: string, solved: boolean) => {
    setSteps(prev => prev.map(s => (s.id === stepId ? { ...s, isSolved: solved, isCompleted: true } : s)));
    if (solved) {
      window.open('https://t.ly/golgiris', '_blank');
      return;
    }
    const idx = steps.findIndex(s => s.id === stepId);
    if (idx < steps.length - 1) {
      const nextId = steps[idx + 1].id;
      setSteps(prev => prev.map(s => (s.id === nextId ? { ...s, isExpanded: true } : s)));
      setTimeout(() => document.getElementById(`step-${nextId}`)?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  };

  const getOperatorInstructions = (operator: string) => {
    const m = {
      turkcell: [
        'Tarife değişikliği sonrası SMS gelmeyebilir',
        'Turkcell’i arayıp SMS izinlerini kontrol ettirin',
        '20–30 dakika sonra tekrar deneyin'
      ],
      vodafone: [
        'Telefonu yeniden başlatın',
        'Farklı cihaz veya tarayıcı kullanın',
        'Çerezleri temizleyin ve tekrar deneyin'
      ],
      telekom: [
        'Gizli pencerede açın',
        'Çerezleri temizleyin',
        '15–20 dakika bekleyin'
      ]
    } as const;
    return (m as any)[operator] ?? [];
  };

  /* ---------- Submit ---------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!validateForm()) return;

    const phone90 = toPhone90(formData.phoneNumber);
    if (!phone90) {
      setErrors(prev => ({ ...prev, phoneNumber: 'Telefon formatı hatalı (5XXXXXXXXX)' }));
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await callMembership(formData.username.trim(), phone90);
      if (res.status === 'match') {
        setShowSteps(true); // 2. adımı aç
        return;
      }
      const msgMap: Record<string, string> = {
        not_found: 'Bu kullanıcı adına ait hesap bulunamadı.',
        ambiguous: 'Birden fazla kayıt bulundu, lütfen kullanıcı adını netleştirin.',
        mismatch: 'Kullanıcı adı ile telefon numarası eşleşmedi.',
        error: 'İşlem sırasında bir hata oluştu. Lütfen tekrar deneyin.',
      };
      setFeedback({
        type: res.status === 'error' ? 'error' : 'warning',
        message: (res as any).message || msgMap[res.status] || msgMap.error,
      });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Beklenmeyen bir hata oluştu.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ---------- UI: Match sonrası adımlar ---------- */
  if (showSteps) {
    return (
      <div style={{ backgroundColor: '#071d2a', color: '#ffffff', fontFamily: 'Arial, sans-serif' }} className="min-h-screen p-4 sm:p-6">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <img
              src="https://www.dropbox.com/scl/fi/pvb7973w7rlo26oz1tf1u/SMS.png?rlkey=z07in99h8g836v811mqqj47he&st=vj6yfqfp&dl=1"
              alt="Logo"
              className="w-full max-w-md mx-auto block"
              style={{ maxHeight: '120px', objectFit: 'contain' }}
            />
          </div>

          <button onClick={onBack} className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors mb-6">
            <ArrowLeft className="w-5 h-5" /> Geri Dön
          </button>

          <div className="text-center mb-8">
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Eşleşme Doğrulandı</h1>
            <p className="text-gray-300 text-sm sm:text-base">Aşağıdaki adımları takip ederek SMS’in size ulaşmasını sağlayalım.</p>
          </div>

          <div className="space-y-4 mb-8">
            <h2 className="text-xl sm:text-2xl font-bold mb-4">Sorun giderme adımları</h2>

            {steps.map((step, index) => (
              <div key={step.id} id={`step-${step.id}`} style={{ backgroundColor: '#0a2332', borderRadius: '10px', padding: '24px' }}>
                <button
                  onClick={() => toggleStep(step.id)}
                  className="w-full flex items-center justify-between text-left hover:bg-white/5 hover:shadow-lg transition-all duration-200 rounded-lg p-2 -m-2 border border-transparent hover:border-white/10"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-blue-400">{step.icon}</span>
                    <span className="font-semibold text-sm sm:text-base">Adım {index + 1}: {step.title}</span>
                    {step.isSolved === true && <CheckCircle className="w-5 h-5 text-green-400" />}
                  </div>
                  {step.isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                </button>

                {step.isExpanded && (
                  <div className="mt-4 pl-4 sm:pl-8 space-y-4">
                    <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                      <p className="text-blue-100 text-sm sm:text-base">{step.explanation}</p>
                    </div>

                    {step.id === 'operator' && (
                      <div>
                        <h4 className="font-semibold mb-3">Operatörünüzü seçin:</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                          {[
                            { key: 'turkcell', name: 'Turkcell' },
                            { key: 'vodafone', name: 'Vodafone' },
                            { key: 'telekom', name: 'Türk Telekom' }
                          ].map((op) => (
                            <button
                              key={op.key}
                              onClick={() => { setSelectedOperator(op.key); setShowOperatorDetails(true); }}
                              style={{
                                backgroundColor: selectedOperator === op.key ? '#ffffff' : 'transparent',
                                color: selectedOperator === op.key ? '#071d2a' : '#ffffff',
                                borderRadius: '8px', transition: 'all 0.2s ease'
                              }}
                              className="px-4 py-3 border border-white/30 font-medium hover:bg-white/10 hover:shadow-md hover:border-white/50 transition-all duration-200 text-sm sm:text-base"
                            >
                              📱 {op.name}
                            </button>
                          ))}
                        </div>

                        {selectedOperator && showOperatorDetails && (
                          <div className="p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                            <h5 className="font-semibold mb-3 capitalize text-blue-200">
                              {selectedOperator === 'telekom' ? 'Türk Telekom' : selectedOperator} Özel Talimatları:
                            </h5>
                            <ul className="space-y-3">
                              {getOperatorInstructions(selectedOperator).map((t, i) => (
                                <li key={i} className="flex items-start gap-3 p-2 bg-blue-500/10 rounded border-l-2 border-blue-400">
                                  <span className="text-blue-400 mt-1 font-bold">•</span>
                                  <span className="text-blue-50 text-sm sm:text-base">{t}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    {step.id === 'spam-folder' && (
                      <div className="space-y-4">
                        <h4 className="font-semibold mb-3">Spam Kontrol Seçenekleri:</h4>
                        <div className="grid grid-cols-1 gap-3 mb-4">
                          <button
                            onClick={() => setShowSpamDetails(!showSpamDetails)}
                            style={{
                              backgroundColor: showSpamDetails ? '#ffffff' : 'transparent',
                              color: showSpamDetails ? '#071d2a' : '#ffffff',
                              borderRadius: '8px', transition: 'all 0.2s ease'
                            }}
                            className="px-4 py-3 border border-white/30 font-medium hover:bg-white/10 hover:border-white/50 hover:shadow-md transition-all duration-200 text-sm sm:text-base flex items-center justify-between"
                          >
                            <span>📱 Spam klasörünü ve engellenen numaraları kontrol et</span>
                            {showSpamDetails ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                          </button>
                        </div>

                        {showSpamDetails && (
                          <div className="space-y-4 mt-4">
                            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                              <h5 className="font-semibold text-base mb-3 text-green-200">🤖 Android cihazlarda:</h5>
                              <ul className="text-xs sm:text-sm text-gray-200 space-y-2">
                                <li className="flex items-start gap-2"><span className="text-green-400 mt-1">1.</span><span>Mesajlar uygulamasını açın.</span></li>
                                <li className="flex items-start gap-2"><span className="text-green-400 mt-1">2.</span><span>Sağ üstteki üç nokta → Ayarlar.</span></li>
                                <li className="flex items-start gap-2"><span className="text-green-400 mt-1">3.</span><span>"Spam ve engellenenler" / "Engellenen numaralar".</span></li>
                                <li className="flex items-start gap-2"><span className="text-green-400 mt-1">4.</span><span>Listeleri kontrol edin.</span></li>
                                <li className="flex items-start gap-2"><span className="text-green-400 mt-1">5.</span><span>SMS sağlayıcımıza ait olabilecek numaraların engelini kaldırın.</span></li>
                              </ul>
                            </div>

                            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                              <h5 className="font-semibold text-base mb-3 text-blue-200">📱 iPhone cihazlarda:</h5>
                              <ul className="text-xs sm:text-sm text-gray-200 space-y-2">
                                <li className="flex items-start gap-2"><span className="text-blue-400 mt-1">1.</span><span>Ayarlar → Mesajlar → Bilinmeyen &amp; Spam.</span></li>
                                <li className="flex items-start gap-2"><span className="text-blue-400 mt-1">2.</span><span>Filtreleme seçeneklerini kontrol edin.</span></li>
                                <li className="flex items-start gap-2"><span className="text-blue-400 mt-1">3.</span><span>Gerekliyse "Filtrele" özelliğini kapatın.</span></li>
                                <li className="flex items-start gap-2"><span className="text-blue-400 mt-1">4.</span><span>Ayarlar → Telefon → Engellenen kişiler’den engelleri kaldırın.</span></li>
                              </ul>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {step.id !== 'operator' && step.id !== 'spam-folder' && step.instructions.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-3 text-white">Çözüm Adımları:</h4>
                        <ul className="space-y-3">
                          {step.instructions.map((t, i) => (
                            <li key={i} className="flex items-start gap-3 p-3 bg-gray-500/10 rounded-lg border border-gray-500/20 hover:bg-gray-500/20 transition-colors">
                              <span className="text-blue-400 mt-1 font-bold">•</span>
                              <span className="text-gray-200 text-sm sm:text-base">{t}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {step.id !== 'international' && (
                      <div className="pt-6 border-t border-white/10">
                        <p className="font-semibold mb-3 text-sm sm:text-base">Sorun çözüldü mü?</p>
                        <div className="flex flex-col sm:flex-row gap-3">
                          <button
                            onClick={() => markStepSolved(step.id, true)}
                            style={{ backgroundColor: '#22c55e', color: '#ffffff', borderRadius: '8px' }}
                            className="px-4 py-2 font-medium hover:bg-green-600 hover:shadow-lg transition-all duration-200 text-sm sm:text-base"
                          >
                            ✅ Evet, çözüldü!
                          </button>
                          <button
                            onClick={() => markStepSolved(step.id, false)}
                            style={{ backgroundColor: 'transparent', color: '#ffffff', borderRadius: '8px' }}
                            className="px-4 py-2 border border-white/30 font-medium hover:bg-white/10 hover:border-white/50 hover:shadow-lg transition-all duration-200 text-sm sm:text-base"
                          >
                            ❌ Hayır, hâlâ sorun var
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div style={{ backgroundColor: '#0a2332', borderRadius: '10px', padding: '24px' }} className="mb-8">
            <div className="text-center">
              <h2 className="text-xl sm:text-2xl font-bold mb-4">Sorun devam ediyor mu?</h2>
              <p className="text-gray-300 mb-6 text-sm sm:text-base">
                Yukarıdaki adımları denedikten sonra hâlâ sorun yaşıyorsanız, destek ekibimizle iletişime geçin.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href="https://heylink.me/golbettr/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ backgroundColor: '#1475E1', color: '#ffffff', borderRadius: '8px' }}
                  className="flex items-center justify-center gap-2 px-6 py-3 font-bold hover:bg-blue-600 hover:shadow-lg transition-all duration-200 text-sm sm:text-base"
                >
                  <Mail className="w-5 h-5" />
                  ✉️ Golbet Destek
                </a>
                <a
                  href="https://t.ly/golgiris"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ backgroundColor: '#ffffff', color: '#1475E1', borderRadius: '8px' }}
                  className="flex items-center justify-center gap-2 px-6 py-3 font-bold hover:bg-gray-100 hover:shadow-lg transition-all duration-200 text-sm sm:text-base"
                >
                  <MessageSquare className="w-5 h-5" />
                  💬 Canlı Destek
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
    );
  }

  /* ---------- UI: Form ---------- */
  return (
    <div style={{ backgroundColor: '#071d2a', color: '#ffffff', fontFamily: 'Arial, sans-serif' }} className="min-h-screen p-4 sm:p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <img
            src="https://www.dropbox.com/scl/fi/pvb7973w7rlo26oz1tf1u/SMS.png?rlkey=z07in99h8g836v811mqqj47he&st=vj6yfqfp&dl=1"
            alt="Logo"
            className="w-full max-w-md mx-auto block"
            style={{ maxHeight: '120px', objectFit: 'contain' }}
          />
        </div>

        <button onClick={onBack} className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors mb-6">
          <ArrowLeft className="w-5 h-5" /> Geri Dön
        </button>

        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-4">Golbet SMS Destek Formu</h1>
          <p className="text-gray-300 text-sm sm:text-base">SMS doğrulama ile ilgili sorunlarınız için destek talebinde bulunun.</p>
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
                  Üyeliğimi Kontrol V3
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
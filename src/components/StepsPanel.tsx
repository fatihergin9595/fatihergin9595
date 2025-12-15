import React, { useState } from 'react';
import {
  CheckCircle, AlertCircle, Phone as PhoneIcon, ChevronDown, ChevronRight,
  MessageSquare, ExternalLink, Smartphone, Globe, RefreshCw
} from 'lucide-react';

// 👇 EKRAN GÖRÜNTÜSÜ IMPORT
import koduAlScreenshot from '../assets/kodu-al-butonu.png';

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
  // 👇 Yeni alan (opsiyonel)
  explanationImage?: string;
}

const StepsPanel: React.FC = () => {
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
      explanationImage: koduAlScreenshot, // 👈 Ekran görüntüsü buraya bağlı
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

  const toggleStep = (id: string) =>
    setSteps(prev => prev.map(s => (s.id === id ? { ...s, isExpanded: !s.isExpanded } : s)));

  const markStepSolved = (id: string, solved: boolean) => {
    setSteps(prev => prev.map(s => (s.id === id ? { ...s, isSolved: solved, isCompleted: true } : s)));
    if (solved) {
      window.open('https://t.ly/golgiris', '_blank');
      return;
    }
    const idx = steps.findIndex(s => s.id === id);
    if (idx < steps.length - 1) {
      const nextId = steps[idx + 1].id;
      setSteps(prev => prev.map(s => (s.id === nextId ? { ...s, isExpanded: true } : s)));
      setTimeout(() => document.getElementById(`step-${nextId}`)?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  };

  const getOperatorInstructions = (op: string) => {
    const map = {
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
    return (map as any)[op] ?? [];
  };

  return (
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
              {/* AÇIKLAMA + GÖRSEL */}
              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg space-y-3">
                <p className="text-blue-100 text-sm sm:text-base">
                  {step.explanation}
                </p>

                {step.explanationImage && (
                  <div className="border border-blue-500/30 rounded-md overflow-hidden bg-black/40">
                    <img
                      src={step.explanationImage}
                      alt={step.title}
                      className="w-full max-w-md mx-auto block"
                    />
                  </div>
                )}
              </div>

              {step.id === 'operator' && (
                <div>
                  <h4 className="font-semibold mb-3">Operatörünüzü seçin:</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                    {[
                      { key: 'turkcell', name: 'Turkcell' },
                      { key: 'vodafone', name: 'Vodafone' },
                      { key: 'telekom', name: 'Türk Telekom' }
                    ].map(op => (
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
                          <li className="flex items-start gap-2"><span className="text-green-400 mt-1">5.</span><span>Gerekli numaraların engelini kaldırın.</span></li>
                        </ul>
                      </div>

                      <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                        <h5 className="font-semibold text-base mb-3 text-blue-200">📱 iPhone cihazlarda:</h5>
                        <ul className="text-xs sm:text-sm text-gray-200 space-y-2">
                          <li className="flex items-start gap-2"><span className="text-blue-400 mt-1">1.</span><span>Ayarlar → Mesajlar → Bilinmeyen &amp; Spam.</span></li>
                          <li className="flex items-start gap-2"><span className="text-blue-400 mt-1">2.</span><span>Filtreleme seçeneklerini kontrol edin.</span></li>
                          <li className="flex items-start gap-2"><span className="text-blue-400 mt-1">3.</span><span>Gerekirse "Filtrele" özelliğini kapatın.</span></li>
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

      <div style={{ backgroundColor: '#0a2332', borderRadius: '10px', padding: '24px' }} className="mb-8">
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-bold mb-4">Sorun devam ediyor mu?</h2>
          <p className="text-gray-300 mb-6 text-sm sm:text-base">
            Yukarıdaki adımları denedikten sonra hâlâ sorun yaşıyorsanız, destek ekibimizle iletişime geçin.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="https://www.goldestek.com/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ backgroundColor: '#1475E1', color: '#ffffff', borderRadius: '8px' }}
              className="flex items-center justify-center gap-2 px-6 py-3 font-bold hover:bg-blue-600 hover:shadow-lg transition-all duration-200 text-sm sm:text-base"
            >
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
  );
};

export default StepsPanel;
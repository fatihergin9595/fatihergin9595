import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Phone, MessageSquare, Mail, CheckCircle, AlertCircle, Smartphone, Globe, RefreshCw, User, ExternalLink } from 'lucide-react';
import SupportForm from './components/SupportForm';

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

function App() {
  const [username, setUsername] = useState('');
  const [countryCode, setCountryCode] = useState('+90');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [userInfoChecked, setUserInfoChecked] = useState(false);
  const [userInfoFound, setUserInfoFound] = useState<boolean | null>(null);
  const [hasReceivedSMS, setHasReceivedSMS] = useState<boolean | null>(null);
  const [selectedOperator, setSelectedOperator] = useState<string | null>(null);
  const [showOperatorDetails, setShowOperatorDetails] = useState(false);
  const [showSpamDetails, setShowSpamDetails] = useState(false);
  const [showBrowserDetails, setShowBrowserDetails] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const [showSupportForm, setShowSupportForm] = useState(false);

  const countries = [
    { code: '+90', name: 'Türkiye', flag: '🇹🇷' },
    { code: '+1', name: 'ABD', flag: '🇺🇸' },
    { code: '+44', name: 'İngiltere', flag: '🇬🇧' },
    { code: '+49', name: 'Almanya', flag: '🇩🇪' },
    { code: '+33', name: 'Fransa', flag: '🇫🇷' },
    { code: '+39', name: 'İtalya', flag: '🇮🇹' },
    { code: '+34', name: 'İspanya', flag: '🇪🇸' },
    { code: '+31', name: 'Hollanda', flag: '🇳🇱' },
    { code: '+32', name: 'Belçika', flag: '🇧🇪' },
    { code: '+41', name: 'İsviçre', flag: '🇨🇭' },
    { code: '+43', name: 'Avusturya', flag: '🇦🇹' },
    { code: '+45', name: 'Danimarka', flag: '🇩🇰' },
    { code: '+46', name: 'İsveç', flag: '🇸🇪' },
    { code: '+47', name: 'Norveç', flag: '🇳🇴' },
    { code: '+358', name: 'Finlandiya', flag: '🇫🇮' },
    { code: '+7', name: 'Rusya', flag: '🇷🇺' },
    { code: '+86', name: 'Çin', flag: '🇨🇳' },
    { code: '+81', name: 'Japonya', flag: '🇯🇵' },
    { code: '+82', name: 'Güney Kore', flag: '🇰🇷' },
    { code: '+91', name: 'Hindistan', flag: '🇮🇳' },
    { code: '+61', name: 'Avustralya', flag: '🇦🇺' },
    { code: '+55', name: 'Brezilya', flag: '🇧🇷' },
    { code: '+52', name: 'Meksika', flag: '🇲🇽' },
    { code: '+54', name: 'Arjantin', flag: '🇦🇷' },
    { code: '+56', name: 'Şili', flag: '🇨🇱' },
    { code: '+27', name: 'Güney Afrika', flag: '🇿🇦' },
    { code: '+20', name: 'Mısır', flag: '🇪🇬' },
    { code: '+971', name: 'BAE', flag: '🇦🇪' },
    { code: '+966', name: 'Suudi Arabistan', flag: '🇸🇦' },
    { code: '+98', name: 'İran', flag: '🇮🇷' },
    { code: '+92', name: 'Pakistan', flag: '🇵🇰' },
    { code: '+880', name: 'Bangladeş', flag: '🇧🇩' },
    { code: '+60', name: 'Malezya', flag: '🇲🇾' },
    { code: '+65', name: 'Singapur', flag: '🇸🇬' },
    { code: '+66', name: 'Tayland', flag: '🇹🇭' },
    { code: '+84', name: 'Vietnam', flag: '🇻🇳' },
    { code: '+62', name: 'Endonezya', flag: '🇮🇩' },
    { code: '+63', name: 'Filipinler', flag: '🇵🇭' }
  ];

  const [steps, setSteps] = useState<TroubleshootingStep[]>([
    {
      id: 'send-button',
      title: '"Kodu Al" butonuna bastınız mı?',
      icon: <Phone className="w-5 h-5" />,
      explanation: 'Kodu almak için mutlaka bu butona basmanız gerekir.',
      instructions: [
        '"Kodu Al" butonuna bastığınızdan emin olun',
        'Sayfayı yenileyip tekrar deneyin'
      ],
      isExpanded: false,
      isCompleted: false,
      isSolved: null
    },
    {
      id: 'browser-issues',
      title: 'Tarayıcı Geçmişinizi temizlediniz mi?',
      icon: <Smartphone className="w-5 h-5" />,
      explanation: 'Tarayıcı geçmişi veya çerezler nedeniyle kod ulaşmayabilir.',
      instructions: [
        'Çerezleri ve önbelleği silin',
        'Arka planda açık sekmeleri kapatın',
        'Farklı cihaz ya da tarayıcı deneyin'
      ],
      isExpanded: false,
      isCompleted: false,
      isSolved: null
    },
    {
      id: 'spam-folder',
      title: 'Spam veya engellenen mesajları kontrol ettiniz mi?',
      icon: <AlertCircle className="w-5 h-5" />,
      explanation: 'Bazı operatörler bilinmeyen numaraları spam\'e atabilir.',
      instructions: [
        'Mesaj uygulamasını açın',
        'Spam/Engellenenler klasörlerini kontrol edin'
      ],
      isExpanded: false,
      isCompleted: false,
      isSolved: null
    },
    {
      id: 'multiple-requests',
      title: 'Art arda kod talep ettiniz mi?',
      icon: <RefreshCw className="w-5 h-5" />,
      explanation: 'Birden fazla talep gecikmeye neden olabilir.',
      instructions: [
        '15–20 dakika bekleyin',
        'Çerezleri temizleyin',
        'Gizli pencerede tekrar deneyin'
      ],
      isExpanded: false,
      isCompleted: false,
      isSolved: null
    },
    {
      id: 'operator',
      title: 'Operatörünüz nedir?',
      icon: <Phone className="w-5 h-5" />,
      explanation: 'Her operatörün farklı SMS ayarları olabilir.',
      instructions: [],
      isExpanded: false,
      isCompleted: false,
      isSolved: null,
      hasSubsections: true
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
      isExpanded: false,
      isCompleted: false,
      isSolved: null
    },
  ]);

  const checkUserInfo = () => {
    // Validate phone number
    if (!phoneNumber || phoneNumber.length !== 10 || !phoneNumber.startsWith('5')) {
      setPhoneError('Lütfen 5 ile başlayan 10 haneli bir numara girin.');
      return;
    }
    
    setPhoneError('');
    setUserInfoChecked(true);
    // Simulate checking user info - for demo purposes, randomly return found/not found
    const found = Math.random() > 0.3; // 70% chance of finding info
    setUserInfoFound(found);
  };

  const handlePhoneChange = (value: string) => {
    // Only allow digits and limit to 10 characters
    const digitsOnly = value.replace(/\D/g, '').slice(0, 10);
    setPhoneNumber(digitsOnly);
    
    // Clear error when user starts typing
    if (phoneError) {
      setPhoneError('');
    }
  };

  const toggleStep = (stepId: string) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId 
        ? { ...step, isExpanded: !step.isExpanded }
        : step
    ));
  };

  const markStepSolved = (stepId: string, solved: boolean) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId 
        ? { ...step, isSolved: solved, isCompleted: true }
        : step
    ));

    if (solved) {
      // Redirect to login page
      window.open('https://t.ly/golgiris', '_blank');
    } else {
      // Find next step and expand it
      const currentStepIndex = steps.findIndex(step => step.id === stepId);
      if (currentStepIndex < steps.length - 1) {
        const nextStepId = steps[currentStepIndex + 1].id;
        setSteps(prev => prev.map(step => 
          step.id === nextStepId 
            ? { ...step, isExpanded: true }
            : step
        ));
        
        // Scroll to next step
        setTimeout(() => {
          const nextStepElement = document.getElementById(`step-${nextStepId}`);
          if (nextStepElement) {
            nextStepElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
      } else {
        setShowSupport(true);
      }
    }
  };

  const getOperatorInstructions = (operator: string) => {
    const instructions = {
      turkcell: [
        'Tarife değişikliği sonrası SMS gelmeyebilir',
        'Turkcell\'i arayıp SMS izinlerini kontrol ettirin',
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
    };
    return instructions[operator as keyof typeof instructions] || [];
  };

  if (showSupportForm) {
    return <SupportForm onBack={() => setShowSupportForm(false)} />;
  }

  return (
    <div style={{ backgroundColor: '#071d2a', color: '#ffffff', fontFamily: 'Arial, sans-serif' }} className="min-h-screen p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Logo */}
        <div className="mb-8">
          <img 
            src="https://www.dropbox.com/scl/fi/pvb7973w7rlo26oz1tf1u/SMS.png?rlkey=z07in99h8g836v811mqqj47he&st=vj6yfqfp&dl=1" 
            alt="Logo" 
            className="w-full max-w-md mx-auto block"
            style={{ maxHeight: '120px', objectFit: 'contain' }}
          />
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-4">SMS Doğrulama Yardım</h1>
          <p className="text-gray-300 text-sm sm:text-base">Doğrulama kodunuzu alamıyor musunuz? Size adım adım yardımcı olalım.</p>
        </div>

        {/* User Info Section */}
        <div style={{ backgroundColor: '#0a2332', borderRadius: '10px', padding: '24px' }} className="mb-8">
          <h2 className="text-lg sm:text-xl font-bold mb-4">Bilgilerinizi Girin</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Kullanıcı Adı</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Kullanıcı adınızı giriniz"
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Telefon Numarası</label>
              <div className="flex">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                    className={`px-4 py-3 rounded-l-lg bg-white/10 border ${
                      phoneError ? 'border-red-500' : 'border-white/20'
                    } border-r-0 text-white focus:outline-none focus:ring-2 focus:ring-white/30 transition-colors flex items-center gap-2 min-w-[120px]`}
                  >
                    <span>{countries.find(c => c.code === countryCode)?.flag}</span>
                    <span>{countryCode}</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  
                  {showCountryDropdown && (
                    <div className="absolute top-full left-0 right-0 z-50 bg-gray-800 border border-white/20 rounded-lg mt-1 max-h-60 overflow-y-auto">
                      {countries.map((country) => (
                        <button
                          key={country.code}
                          type="button"
                          onClick={() => {
                            setCountryCode(country.code);
                            setShowCountryDropdown(false);
                          }}
                          className="w-full px-4 py-2 text-left hover:bg-white/10 flex items-center gap-3 text-white text-sm"
                        >
                          <span>{country.flag}</span>
                          <span>{country.code}</span>
                          <span>{country.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder="Örn: 5XXXXXXXXX"
                  className={`flex-1 px-4 py-3 rounded-r-lg bg-white/10 border ${
                    phoneError ? 'border-red-500' : 'border-white/20'
                  } text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/30 transition-colors`}
                />
              </div>
              {phoneError && (
                <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {phoneError}
                </p>
              )}
            </div>
            <p className="text-gray-300 text-sm mb-4">
              Doğrulama kodları kullanıcı adınıza kayıtlı telefon numarasına gönderilmektedir. Eşleşme bulunamazsa destek hattımızla iletişime geçiniz.
            </p>
            <button
              onClick={checkUserInfo}
              disabled={!username || !phoneNumber || phoneError !== ''}
              style={{ backgroundColor: '#ffffff', color: '#071d2a', borderRadius: '8px' }}
              className="w-full px-6 py-3 font-bold hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Üyeliğimi Kontrol Et
            </button>
            <a
              href="https://heylink.me/golbettr/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ backgroundColor: 'transparent', color: '#ffffff', borderRadius: '8px' }}
              className="w-full px-6 py-3 font-bold border border-white/30 hover:bg-white/10 hover:border-white/50 transition-colors text-center block mt-4"
            >
              Golbet'e Geri Dön
            </a>
          </div>

          {userInfoChecked && userInfoFound === false && (
            <div className="mt-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
              <p className="text-red-300 mb-4">Bilgi bulunamadı.</p>
              <button
                onClick={() => setShowSupportForm(true)}
                style={{ backgroundColor: '#ffffff', color: '#071d2a', borderRadius: '8px' }}
                className="inline-flex items-center gap-2 px-6 py-3 font-bold hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <Mail className="w-5 h-5" />
                Golbet Destek
              </button>
            </div>
          )}

          {userInfoChecked && userInfoFound === true && (
            <div className="mt-6 text-center">
              <div className="mb-6">
                <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <h2 className="text-2xl sm:text-3xl font-bold mb-4">Eşleşme Doğrulandı</h2>
                <p className="text-gray-300 text-sm sm:text-base">
                  Lütfen aşağıdaki adımları takip ediniz.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Initial Question - Only show if user info is found */}

        {/* Troubleshooting Steps */}
        {userInfoFound === true && (
          <div className="space-y-4 mb-8">
            <h2 className="text-xl sm:text-2xl font-bold mb-6">Sorun giderme adımları</h2>
            
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
                    
                    {/* Operator Selection for Step 4 */}
                    {step.id === 'operator' && (
                      <div>
                        <h4 className="font-semibold mb-3">Operatörünüzü seçin:</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                          {[
                            { key: 'turkcell', name: 'Turkcell' },
                            { key: 'vodafone', name: 'Vodafone' },
                            { key: 'telekom', name: 'Türk Telekom' }
                          ].map((operator) => (
                            <button
                              key={operator.key}
                              onClick={() => {
                                setSelectedOperator(operator.key);
                                setShowOperatorDetails(true);
                              }}
                              style={{ 
                                backgroundColor: selectedOperator === operator.key ? '#ffffff' : 'transparent', 
                                color: selectedOperator === operator.key ? '#071d2a' : '#ffffff',
                                borderRadius: '8px',
                                transition: 'all 0.2s ease'
                              }}
                              className="px-4 py-3 border border-white/30 font-medium hover:bg-white/10 hover:shadow-md hover:border-white/50 transition-all duration-200 text-sm sm:text-base"
                            >
                              📱 {operator.name}
                            </button>
                          ))}
                        </div>

                        {selectedOperator && showOperatorDetails && (
                          <div className="p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                            <h5 className="font-semibold mb-3 capitalize text-blue-200">
                              {selectedOperator === 'telekom' ? 'Türk Telekom' : selectedOperator} Özel Talimatları:
                            </h5>
                            <ul className="space-y-3">
                              {getOperatorInstructions(selectedOperator).map((instruction, i) => (
                                <li key={i} className="flex items-start gap-3 p-2 bg-blue-500/10 rounded border-l-2 border-blue-400">
                                  <span className="text-blue-400 mt-1 font-bold">•</span>
                                  <span className="text-blue-50 text-sm sm:text-base">{instruction}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Spam Folder Instructions for Step 3 */}
                    {step.id === 'spam-folder' && (
                      <div className="space-y-4">
                        <h4 className="font-semibold mb-3">Spam Kontrol Seçenekleri:</h4>
                        <div className="grid grid-cols-1 gap-3 mb-4">
                          <button
                            onClick={() => setShowSpamDetails(!showSpamDetails)}
                            style={{ 
                              backgroundColor: showSpamDetails ? '#ffffff' : 'transparent', 
                              color: showSpamDetails ? '#071d2a' : '#ffffff',
                              borderRadius: '8px',
                              transition: 'all 0.2s ease'
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
                            <h5 className="font-semibold text-base mb-3 text-green-200 flex items-center gap-2">
                              🤖 Android cihazlarda:
                            </h5>
                            <ul className="text-xs sm:text-sm text-gray-200 space-y-2">
                              <li className="flex items-start gap-2">
                                <span className="text-green-400 mt-1">1.</span>
                                <span>Mesajlar uygulamasını açın.</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="text-green-400 mt-1">2.</span>
                                <span>Sağ üst köşedeki "3 nokta" simgesine dokunun ve Ayarlar bölümüne girin.</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="text-green-400 mt-1">3.</span>
                                <span>"Spam ve engellenenler" veya "Engellenen numaralar" sekmesini seçin.</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="text-green-400 mt-1">4.</span>
                                <span>Burada yer alan numaraları kontrol edin.</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="text-green-400 mt-1">5.</span>
                                <span>SMS sağlayıcımıza ait olabileceğini düşündüğünüz numaraların engelini kaldırın.</span>
                              </li>
                            </ul>
                          </div>
                          
                          <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                            <h5 className="font-semibold text-base mb-3 text-blue-200 flex items-center gap-2">
                              📱 iPhone cihazlarda:
                            </h5>
                            <ul className="text-xs sm:text-sm text-gray-200 space-y-2">
                              <li className="flex items-start gap-2">
                                <span className="text-blue-400 mt-1">1.</span>
                                <span>Ayarlar &gt; Mesajlar &gt; Bilinmeyen & Spam sekmesine gidin.</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="text-blue-400 mt-1">2.</span>
                                <span>Burada filtreleme seçeneklerini kontrol edin.</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="text-blue-400 mt-1">3.</span>
                                <span>Gerekli durumlarda "Filtrele" özelliğini devre dışı bırakın.</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="text-blue-400 mt-1">4.</span>
                                <span>Ayrıca Ayarlar &gt; Telefon &gt; Engellenen kişiler bölümünden numara engellerini kaldırabilirsiniz.</span>
                              </li>
                            </ul>
                          </div>
                        </div>
                        )}
                      </div>
                    )}
                    {/* Regular instructions for other steps */}
                    {step.id !== 'operator' && step.id !== 'spam-folder' && step.instructions.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-3 text-white">Çözüm Adımları:</h4>
                        <ul className="space-y-3">
                          {step.instructions.map((instruction, i) => (
                            <li key={i} className="flex items-start gap-3 p-3 bg-gray-500/10 rounded-lg border border-gray-500/20 hover:bg-gray-500/20 transition-colors">
                              <span className="text-blue-400 mt-1 font-bold">•</span>
                              <span className="text-gray-200 text-sm sm:text-base">{instruction}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Browser Guide for Step 6 */}
                    {step.id === 'browser-issues' && step.instructions.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-semibold mb-3">Çerez ve Geçmiş Temizleme Seçenekleri:</h4>
                        <div className="grid grid-cols-1 gap-3 mb-4">
                          <button
                            onClick={() => setShowBrowserDetails(!showBrowserDetails)}
                            style={{ 
                              backgroundColor: showBrowserDetails ? '#ffffff' : 'transparent', 
                              color: showBrowserDetails ? '#071d2a' : '#ffffff',
                              borderRadius: '8px',
                              transition: 'all 0.2s ease'
                            }}
                            className="px-4 py-3 border border-white/30 font-medium hover:bg-white/10 hover:shadow-md hover:border-white/50 transition-all duration-200 text-sm sm:text-base flex items-center justify-between"
                          >
                            <span>🧼 Çerez ve Geçmiş Temizleme Adımları</span>
                            {showBrowserDetails ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                          </button>
                        </div>
                        
                        {showBrowserDetails && (
                        <div className="p-6 bg-gray-500/20 border border-gray-500/30 rounded-lg space-y-6 hover:bg-gray-500/30 transition-colors">
                          <div>
                            <div className="space-y-4">
                              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                                <h7 className="font-medium text-sm text-blue-200 mb-2 block">Google Chrome:</h7>
                                <ul className="text-xs sm:text-sm text-gray-200 space-y-2 ml-2">
                                  <li className="flex items-start gap-2">
                                    <span className="text-blue-400 mt-1">•</span>
                                    <span>Sağ üstteki üç noktaya tıklayın</span>
                                  </li>
                                  <li className="flex items-start gap-2">
                                    <span className="text-blue-400 mt-1">•</span>
                                    <span>"Geçmiş" → "Tarama verilerini temizle"</span>
                                  </li>
                                  <li className="flex items-start gap-2">
                                    <span className="text-blue-400 mt-1">•</span>
                                    <span>Tüm zamanları seçin → Çerezler ve önbellek kutularını işaretleyin</span>
                                  </li>
                                  <li className="flex items-start gap-2">
                                    <span className="text-blue-400 mt-1">•</span>
                                    <span>"Verileri Temizle"ye tıklayın</span>
                                  </li>
                                </ul>
                              </div>
                              
                              <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                                <h7 className="font-medium text-sm text-orange-200 mb-2 block">Mozilla Firefox:</h7>
                                <ul className="text-xs sm:text-sm text-gray-200 space-y-2 ml-2">
                                  <li className="flex items-start gap-2">
                                    <span className="text-orange-400 mt-1">•</span>
                                    <span>Menü → Ayarlar → Gizlilik & Güvenlik</span>
                                  </li>
                                  <li className="flex items-start gap-2">
                                    <span className="text-orange-400 mt-1">•</span>
                                    <span>"Çerezleri ve site verilerini temizle" seçeneğine tıklayın</span>
                                  </li>
                                </ul>
                              </div>
                              
                              <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                                <h7 className="font-medium text-sm text-purple-200 mb-2 block">Safari (Mac):</h7>
                                <ul className="text-xs sm:text-sm text-gray-200 space-y-2 ml-2">
                                  <li className="flex items-start gap-2">
                                    <span className="text-purple-400 mt-1">•</span>
                                    <span>Menü çubuğundan "Safari" &gt; "Geçmişi Temizle"</span>
                                  </li>
                                  <li className="flex items-start gap-2">
                                    <span className="text-purple-400 mt-1">•</span>
                                    <span>Tüm geçmişi seçin → Temizle'ye tıklayın</span>
                                  </li>
                                </ul>
                              </div>
                            </div>
                          </div>
                          
                          <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                            <h6 className="font-semibold text-base mb-3 text-green-200 flex items-center gap-2">
                              🕵️‍♀️ Gizli Mod Açma Kısayolları:
                            </h6>
                            <ul className="text-xs sm:text-sm text-gray-200 space-y-2">
                              <li className="flex items-center gap-3">
                                <span className="text-green-400">•</span>
                                <span>Chrome:</span>
                                <code className="bg-black/40 px-2 py-1 rounded text-green-300 font-mono">Ctrl + Shift + N</code>
                              </li>
                              <li className="flex items-center gap-3">
                                <span className="text-green-400">•</span>
                                <span>Safari:</span>
                                <code className="bg-black/40 px-2 py-1 rounded text-green-300 font-mono">Command + Shift + N</code>
                              </li>
                              <li className="flex items-center gap-3">
                                <span className="text-green-400">•</span>
                                <span>Firefox:</span>
                                <code className="bg-black/40 px-2 py-1 rounded text-green-300 font-mono">Ctrl + Shift + P</code>
                              </li>
                            </ul>
                          </div>
                        </div>
                        )}
                      </div>
                    )}

                    {/* Support Buttons for Step 5 only */}
                    {step.id === 'international' && (
                      <div className="mt-4">
                        <div className="flex flex-col sm:flex-row gap-3">
                          <button
                            onClick={() => setShowSupportForm(true)}
                            style={{ backgroundColor: '#ffffff', color: '#071d2a', borderRadius: '8px' }}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2 font-bold hover:bg-gray-100 hover:shadow-lg transition-all duration-200 text-sm sm:text-base"
                          >
                            <Mail className="w-5 h-5" />
                            ✉️ Golbet Destek
                          </button>
                          <a
                            href="https://t.ly/golgiris"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ backgroundColor: 'transparent', color: '#ffffff', borderRadius: '8px' }}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-white/30 font-bold hover:bg-white/10 hover:border-white/50 hover:shadow-lg transition-all duration-200 text-sm sm:text-base"
                          >
                            <MessageSquare className="w-5 h-5" />
                            💬 Canlı Destek
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                    )}

                    {/* Support Buttons for Step 6 only */}
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
        )}

        {/* New Support Section */}
        {userInfoFound === true && (
          <div style={{ backgroundColor: '#0a2332', borderRadius: '10px', padding: '24px' }} className="mb-8">
            <div className="text-center">
              <h2 className="text-xl sm:text-2xl font-bold mb-4">Sorun devam ediyor mu?</h2>
              <p className="text-gray-300 mb-6 text-sm sm:text-base">
                Yukarıdaki adımları denedikten sonra hâlâ sorun yaşıyorsanız, destek ekibimizle iletişime geçin.
              </p>
              
              {/* Support Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => setShowSupportForm(true)}
                  style={{ backgroundColor: '#1475E1', color: '#ffffff', borderRadius: '8px' }}
                  className="flex items-center justify-center gap-2 px-6 py-3 font-bold hover:bg-blue-600 hover:shadow-lg transition-all duration-200 text-sm sm:text-base"
                >
                  <Mail className="w-5 h-5" />
                  ✉️ Golbet Destek
                </button>
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
        )}

      </div>
    </div>
  );
}

export default App;
import React, { useState } from 'react';
import { ArrowLeft, Mail, User, Phone, FileText, CheckCircle, AlertCircle, ChevronDown } from 'lucide-react';

interface SupportFormProps {
  onBack: () => void;
}

interface FormData {
  username: string;
  countryCode: string;
  phoneNumber: string;
  email: string;
  fullName: string;
}

interface FormErrors {
  username?: string;
  countryCode?: string;
  phoneNumber?: string;
  email?: string;
  fullName?: string;
}

export default function SupportForm({ onBack }: SupportFormProps) {
  const [formData, setFormData] = useState<FormData>({
    username: '',
    countryCode: '+90',
    phoneNumber: '',
    email: '',
    fullName: ''
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);

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

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Kullanıcı adı gereklidir';
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Telefon numarası gereklidir';
    } else if (!/^\d{7,15}$/.test(formData.phoneNumber.replace(/\s/g, ''))) {
      newErrors.phoneNumber = 'Geçerli bir telefon numarası girin (7-15 haneli)';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email adresi gereklidir';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Geçerli bir email adresi girin';
    }

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Ad soyad gereklidir';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    // For phone number, only allow digits
    if (field === 'phoneNumber') {
      value = value.replace(/\D/g, '');
    }
    
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    // Simulate form submission
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsSubmitted(true);
      
      // Show success notification
      const notification = document.createElement('div');
      notification.innerHTML = `
        <div style="position: fixed; top: 20px; right: 20px; background: #22c55e; color: white; padding: 16px 24px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.3); z-index: 1000; display: flex; align-items: center; gap: 8px; font-family: Arial, sans-serif;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22,4 12,14.01 9,11.01"></polyline>
          </svg>
          <span>Talep başarıyla gönderildi! En kısa sürede dönüş yapılacaktır.</span>
        </div>
      `;
      document.body.appendChild(notification);
      
      // Remove notification after 5 seconds
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 5000);
      
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div style={{ backgroundColor: '#071d2a', color: '#ffffff', fontFamily: 'Arial, sans-serif' }} className="min-h-screen p-4 sm:p-6">
        <div className="max-w-2xl mx-auto">
          {/* Logo */}
          <div className="mb-8">
            <img 
              src="https://www.dropbox.com/scl/fi/pvb7973w7rlo26oz1tf1u/SMS.png?rlkey=z07in99h8g836v811mqqj47he&st=vj6yfqfp&dl=1" 
              alt="Logo" 
              className="w-full max-w-md mx-auto block"
              style={{ maxHeight: '120px', objectFit: 'contain' }}
            />
          </div>

          <div className="text-center">
            <div className="mb-6">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h1 className="text-2xl sm:text-3xl font-bold mb-4">Talebiniz Alındı!</h1>
              <p className="text-gray-300 text-sm sm:text-base mb-6">
                Destek talebiniz başarıyla gönderildi. En kısa sürede size dönüş yapacağız.
              </p>
            </div>

            <div style={{ backgroundColor: '#0a2332', borderRadius: '10px', padding: '24px' }} className="mb-8">
              <h2 className="text-lg font-semibold mb-4">Gönderilen Bilgiler:</h2>
              <div className="space-y-3 text-left">
                <div className="flex justify-between">
                  <span className="text-gray-400">Kullanıcı Adı:</span>
                  <span>{formData.username}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Telefon:</span>
                  <span>{formData.countryCode} {formData.phoneNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Email:</span>
                  <span>{formData.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Ad Soyad:</span>
                  <span>{formData.fullName}</span>
                </div>
              </div>
            </div>

            <button
              onClick={onBack}
              style={{ backgroundColor: '#ffffff', color: '#071d2a', borderRadius: '8px' }}
              className="inline-flex items-center gap-2 px-6 py-3 font-bold hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Ana Sayfaya Dön
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#071d2a', color: '#ffffff', fontFamily: 'Arial, sans-serif' }} className="min-h-screen p-4 sm:p-6">
      <div className="max-w-2xl mx-auto">
        {/* Logo */}
        <div className="mb-8">
          <img 
            src="https://www.dropbox.com/scl/fi/pvb7973w7rlo26oz1tf1u/SMS.png?rlkey=z07in99h8g836v811mqqj47he&st=vj6yfqfp&dl=1" 
            alt="Logo" 
            className="w-full max-w-md mx-auto block"
            style={{ maxHeight: '120px', objectFit: 'contain' }}
          />
        </div>

        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Geri Dön
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-4">Golbet SMS Destek Formu</h1>
          <p className="text-gray-300 text-sm sm:text-base">
            SMS doğrulama ile ilgili sorunlarınız için destek talebinde bulunun.
          </p>
        </div>

        {/* Form */}
        <div style={{ backgroundColor: '#0a2332', borderRadius: '10px', padding: '24px' }} className="mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <User className="w-4 h-4" />
                Kullanıcı Adı *
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                placeholder="Kullanıcı adınızı giriniz"
                className={`w-full px-4 py-3 rounded-lg bg-white/10 border ${
                  errors.username ? 'border-red-500' : 'border-white/20'
                } text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/30 transition-colors`}
              />
              {errors.username && (
                <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.username}
                </p>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Telefon Numarası *
              </label>
              <div className="flex">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                    className={`px-4 py-3 rounded-l-lg bg-white/10 border ${
                      errors.phoneNumber ? 'border-red-500' : 'border-white/20'
                    } border-r-0 text-white focus:outline-none focus:ring-2 focus:ring-white/30 transition-colors flex items-center gap-2 min-w-[120px]`}
                  >
                    <span>{countries.find(c => c.code === formData.countryCode)?.flag}</span>
                    <span>{formData.countryCode}</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  
                  {showCountryDropdown && (
                    <div className="absolute top-full left-0 right-0 z-50 bg-gray-800 border border-white/20 rounded-lg mt-1 max-h-60 overflow-y-auto">
                      {countries.map((country) => (
                        <button
                          key={country.code}
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({ ...prev, countryCode: country.code }));
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
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  placeholder="Örn: 5XXXXXXXXX"
                  className={`flex-1 px-4 py-3 rounded-r-lg bg-white/10 border ${
                    errors.phoneNumber ? 'border-red-500' : 'border-white/20'
                  } text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/30 transition-colors`}
                />
              </div>
              {errors.phoneNumber && (
                <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.phoneNumber}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Adresi *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Email adresinizi girin"
                className={`w-full px-4 py-3 rounded-lg bg-white/10 border ${
                  errors.email ? 'border-red-500' : 'border-white/20'
                } text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/30 transition-colors`}
              />
              {errors.email && (
                <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Ad Soyad *
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                placeholder="Ad ve soyadınızı girin"
                className={`w-full px-4 py-3 rounded-lg bg-white/10 border ${
                  errors.fullName ? 'border-red-500' : 'border-white/20'
                } text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/30 transition-colors`}
              />
              {errors.fullName && (
                <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.fullName}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              style={{ backgroundColor: '#ffffff', color: '#071d2a', borderRadius: '8px' }}
              className="w-full px-6 py-3 font-bold hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                  Gönderiliyor...
                </>
              ) : (
                <>
                  <Mail className="w-5 h-5" />
                  Talep Gönder
                </>
              )}
            </button>
          </form>

          <div className="mt-6 p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg">
            <p className="text-blue-100 text-sm">
              <strong>Not:</strong> Tüm alanlar zorunludur. Talebiniz 24 saat içinde değerlendirilecektir.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
import { checkMembership } from './services/membership';

// ...
const onSubmit = async () => {
  // Kullanıcıdan gelen değerler:
  // username -> login
  // phone -> "90XXXXXXXXXX" (12 hane, sadece rakam)
  const res = await checkMembership(username, phone90);
  if (res.status === 'match') {
    // sonraki aşamaya geç
  } else {
    // res.message'ı kullanıcıya göster
  }
};

import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

export const SUPPORTED_LANGUAGES = {
  sv: { code: 'sv', name: 'Svenska', flag: '🇸🇪', countryCode: 'SE' },
  en: { code: 'en', name: 'English', flag: '🇬🇧', countryCode: 'GB' },
  so: { code: 'so', name: 'Soomaali', flag: '🇸🇴', countryCode: 'SO' },
  ar: { code: 'ar', name: 'العربية', flag: '🇸🇦', countryCode: 'SA' },
  tr: { code: 'tr', name: 'Türkçe', flag: '🇹🇷', countryCode: 'TR' },
} as const

export type LanguageCode = keyof typeof SUPPORTED_LANGUAGES

const resources = {  sv: {
    translation: {
      title: 'BotKyrka',
      subtitle: 'Din AI-assistent för Botkyrka kommun',
      greeting: 'Hej! Hur kan jag hjälpa dig idag?',
      contextHint: 'Fråga mig om vad som helst gällande Botkyrkas tjänster—t.ex. förskola, boende eller avfallshantering.',
      placeholder: 'Skriv din fråga här...',
      quickActions: {
        preschool: 'Förskola',
        waste: 'Avfall',
        housing: 'Boende',
        parking: 'Parkering',
        eldercare: 'Äldreomsorg',
        schools: 'Skolor'
      },
      sendToKommun: 'Skicka till kommunen',
      tryAnother: 'Prova annat ämne',
      helpful: 'Hjälpsam',
      notHelpful: 'Inte hjälpsam',
      feedback: 'Vad fungerade inte? Skriv gärna på ditt språk.',
      showSteps: 'Visa steg',
      downloadGuide: 'Ladda ner guide',
      applyHere: 'Ansök här',
      source: 'Källa: botkyrka.se',      privacyNote: 'Vi sparar ingen personlig information. All data är anonym.',      idlePrompt: 'Behöver du mer hjälp? Säg bara något!',
      goodbye: 'Varsågod! Ha en fortsatt bra dag i Botkyrka.',
      relatedServices: 'Relaterade tjänster',      newChat: 'Ny chatt',
      sending: 'Skickar...',
      sendMessage: 'Skicka meddelande',
      thinking: 'Tänker...',
      scraping_content: 'Hämtar aktuell information...',
      fetching_content: 'Hämtar senaste information från Botkyrka webbplats...'
    }
  },  en: {
    translation: {
      title: 'BotKyrka',
      subtitle: 'Your AI assistant for Botkyrka municipality',
      greeting: 'Hello! How can I help you today?',
      contextHint: 'Ask me anything about Botkyrka services—e.g. preschool, housing, or trash collection.',
      placeholder: 'Type your question here...',
      quickActions: {
        preschool: 'Preschool',
        waste: 'Waste',
        housing: 'Housing',
        parking: 'Parking',
        eldercare: 'Elder care',
        schools: 'Schools'
      },
      sendToKommun: 'Send to municipality',
      tryAnother: 'Try another topic',
      helpful: 'Helpful',
      notHelpful: 'Not helpful',
      feedback: 'What didn\'t work? Feel free to write in your language.',
      showSteps: 'Show steps',
      downloadGuide: 'Download guide',
      applyHere: 'Apply here',
      source: 'Source: botkyrka.se',      privacyNote: 'We don\'t store personal info. All data is anonymous.',
      idlePrompt: 'Need more help? Just say something!',      goodbye: 'You\'re welcome! Have a great day in Botkyrka.',
      relatedServices: 'Related services',      newChat: 'New Chat',
      sending: 'Sending...',
      sendMessage: 'Send message',
      thinking: 'Thinking...',
      scraping_content: 'Getting latest information...',
      fetching_content: 'Getting latest information from Botkyrka website...'
    }
  },  so: {
    translation: {
      title: 'BotKyrka',
      subtitle: 'Kaaliyaha AI-ga ee dawladda hoose ee Botkyrka',
      greeting: 'Salaam! Sidee kuu caawin karaa maanta?',
      contextHint: 'I weydii wax kasta oo ku saabsan adeegyada Botkyrka—sida dugsiga yar-yar, guriga, ama qashin-ururinta.',
      placeholder: 'Qor su\'aalkaaga halkan...',
      quickActions: {
        preschool: 'Dugsiga yar-yar',
        waste: 'Qashin',
        housing: 'Guri',
        parking: 'Meel baabuur',
        eldercare: 'Daryeelka waayeelka',
        schools: 'Dugsiyada'
      },
      sendToKommun: 'U dir dawladda hoose',
      tryAnother: 'Isku day mawduuc kale',
      helpful: 'Waxtar leh',
      notHelpful: 'Aan waxtar lahayn',
      feedback: 'Maxaa aan shaqayn? Fadlan ku qor luuqaddaada.',
      showSteps: 'Tus tillaabada',
      downloadGuide: 'Soo dejiso hagaha',
      applyHere: 'Halkan ka codsado',
      source: 'Isha: botkyrka.se',      privacyNote: 'Ma kaydsanno macluumaad shakhsi ah. Dhammaan xogtu waa qarsoodi.',
      idlePrompt: 'Ma u baahan tahay kaalmo dheeraad ah? Wax yar dheh!',      goodbye: 'Waad ku mahadsantahay! Maalin fiican ku yeesho Botkyrka.',
      relatedServices: 'Adeegyo la xiriira',      newChat: 'Sheeko cusub',
      sending: 'Diraya...',
      sendMessage: 'Dir fariinta',
      thinking: 'Ka fakiraya...',
      scraping_content: 'Helaya macluumaad cusub...',
      fetching_content: 'Helaya macluumaad cusub website-ka Botkyrka...'
    }
  },  ar: {
    translation: {
      title: 'BotKyrka',
      subtitle: 'مساعدك الذكي لبلدية بوتشيركا',
      greeting: 'مرحبا! كيف يمكنني مساعدتك اليوم؟',
      contextHint: 'اسألني عن أي شيء متعلق بخدمات بوتشيركا—مثل الحضانة أو السكن أو جمع القمامة.',
      placeholder: 'اكتب سؤالك هنا...',
      quickActions: {
        preschool: 'الحضانة',
        waste: 'النفايات',
        housing: 'السكن',
        parking: 'وقوف السيارات',
        eldercare: 'رعاية المسنين',
        schools: 'المدارس'
      },
      sendToKommun: 'إرسال إلى البلدية',
      tryAnother: 'جرب موضوعاً آخر',
      helpful: 'مفيد',
      notHelpful: 'غير مفيد',
      feedback: 'ما الذي لم يعمل؟ اكتب بلغتك.',
      showSteps: 'إظهار الخطوات',
      downloadGuide: 'تحميل الدليل',
      applyHere: 'تقدم بطلب هنا',
      source: 'المصدر: botkyrka.se',      privacyNote: 'لا نحفظ المعلومات الشخصية. جميع البيانات مجهولة.',
      idlePrompt: 'تحتاج مساعدة إضافية؟ قل شيئاً!',      goodbye: 'أهلاً وسهلاً! أتمنى لك يوماً سعيداً في بوتشيركا.',
      relatedServices: 'الخدمات ذات الصلة',      newChat: 'محادثة جديدة',
      sending: 'جاري الإرسال...',
      sendMessage: 'إرسال الرسالة',
      thinking: 'يفكر...',
      scraping_content: 'جاري الحصول على أحدث المعلومات...',
      fetching_content: 'جاري الحصول على أحدث المعلومات من موقع بوتشيركا...'
    }
  },  tr: {
    translation: {
      title: 'BotKyrka',
      subtitle: 'Botkyrka belediyesi için AI asistanınız',
      greeting: 'Merhaba! Bugün size nasıl yardımcı olabilirim?',
      contextHint: 'Botkyrka hizmetleri hakkında her şeyi sorabilirsiniz—örneğin anaokulu, konut veya çöp toplama.',
      placeholder: 'Sorunuzu buraya yazın...',
      quickActions: {
        preschool: 'Anaokulu',
        waste: 'Atık',
        housing: 'Konut',
        parking: 'Park',
        eldercare: 'Yaşlı bakımı',
        schools: 'Okullar'
      },
      sendToKommun: 'Belediyeye gönder',
      tryAnother: 'Başka bir konu dene',
      helpful: 'Yararlı',
      notHelpful: 'Yararlı değil',
      feedback: 'Neyi işe yaramadı? Dilinizde yazabilirsiniz.',
      showSteps: 'Adımları göster',
      downloadGuide: 'Rehberi indir',
      applyHere: 'Buradan başvurun',
      source: 'Kaynak: botkyrka.se',      privacyNote: 'Kişisel bilgi saklamıyoruz. Tüm veriler anonimdir.',
      idlePrompt: 'Daha fazla yardıma ihtiyacınız var mı? Bir şey söyleyin!',      goodbye: 'Rica ederim! Botkyrka\'da güzel bir gün geçirin.',
      relatedServices: 'İlgili hizmetler',      newChat: 'Yeni Sohbet',
      sending: 'Gönderiliyor...',
      sendMessage: 'Mesaj gönder',
      thinking: 'Düşünüyor...',
      scraping_content: 'En güncel bilgileri alıyor...',
      fetching_content: 'Botkyrka web sitesinden en güncel bilgileri alıyor...'
    }
  }
}

// Only initialize LanguageDetector on client side
const isClient = typeof window !== 'undefined'

const i18nInstance = i18n
  .use(initReactI18next)

if (isClient) {
  i18nInstance.use(LanguageDetector)
}

i18nInstance.init({
  resources,
  fallbackLng: 'sv',
  lng: isClient ? undefined : 'sv', // Use Swedish on server, auto-detect on client
  detection: isClient ? {
    order: ['localStorage', 'navigator', 'htmlTag'],
    caches: ['localStorage'],
  } : undefined,
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false, // Prevent SSR issues
  },
})

export default i18n

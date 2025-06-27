"use client"

import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '@/components/ui/card'

interface QuickActionsProps {
  onActionClick: (action: string) => void
}

export function QuickActions({ onActionClick }: QuickActionsProps) {
  const { t, i18n } = useTranslation()

  // Language-aware simple explanations
  const getSimpleExplanation = () => {
    const currentLang = i18n.language || 'sv'
    
    const explanations: Record<string, {
      title: string
      text: string
      examples: string[]
      prompt: string
    }> = {
      sv: {
        title: "Vad kan jag hjälpa dig med?",
        text: "Jag kan hjälpa dig med allt som rör Botkyrka kommun. Fråga mig på svenska eller ditt eget språk om:",
        examples: [
          "• Förskola och skola för dina barn",
          "• Var du ska slänga sopor och återvinning",
          "• Hur du ansöker om boende eller bygglov",
          "• Parkeringstillstånd och trafikfrågor",
          "• Hjälp för äldre eller familjer"
        ],
        prompt: "Skriv bara din fråga här nedan!"
      },
      en: {
        title: "How can I help you?",
        text: "I can help you with anything related to Botkyrka municipality. Ask me in English or your native language about:",
        examples: [
          "• Preschool and school for your children",
          "• Where to dispose of waste and recycling",
          "• How to apply for housing or building permits",
          "• Parking permits and traffic questions",
          "• Support for elderly or families"
        ],
        prompt: "Just type your question below!"
      },
      ar: {
        title: "كيف يمكنني مساعدتك؟",
        text: "يمكنني مساعدتك في أي شيء يتعلق ببلدية بوتشيركا. اسألني بالعربية أو بلغتك الأم عن:",
        examples: [
          "• الحضانة والمدرسة لأطفالك",
          "• أين ترمي القمامة والنفايات القابلة للتدوير",
          "• كيفية التقدم للسكن أو تراخيص البناء",
          "• تصاريح الوقوف وأسئلة المرور",
          "• الدعم لكبار السن أو العائلات"
        ],
        prompt: "فقط اكتب سؤالك أدناه!"
      },
      tr: {
        title: "Size nasıl yardımcı olabilirim?",
        text: "Botkyrka belediyesi ile ilgili her konuda size yardımcı olabilirim. Türkçe veya ana dilinizde sorun:",
        examples: [
          "• Çocuklarınız için anaokulu ve okul",
          "• Çöp ve geri dönüşümü nereye atacağınız",
          "• Konut veya yapı ruhsatı başvurusu nasıl yapılır",
          "• Park izinleri ve trafik soruları",
          "• Yaşlılar veya aileler için destek"
        ],
        prompt: "Sorunuzu aşağıya yazın!"
      },
      so: {
        title: "Sidee kaa caawin karaa?",
        text: "Waxaan ku caawin karaa wax walba oo la xiriira degmada Botkyrka. Weydiiso Soomaali ama luqaddaada hooyo:",
        examples: [
          "• Dugsiga yar-yar iyo dugsiga caruurta",
          "• Meesha aad ku tuuri lahayd qashinka iyo dib-u-warshadaynta",
          "• Sida loo codsado guriga ama ruqsadda dhismaha",
          "• Ruqsadaha baabuurta iyo su'aalaha gaadiidka",
          "• Taageerada dadka waayeelka ah ama qoysaska"
        ],
        prompt: "Kaliya qor su'aashaada halkan hoose!"
      },
      fi: {
        title: "Miten voin auttaa sinua?",
        text: "Voin auttaa sinua kaikessa Botkyrkan kuntaan liittyvässä. Kysy suomeksi tai äidinkielelläsi:",
        examples: [
          "• Päiväkoti ja koulu lapsillesi",
          "• Minne heittää jätteet ja kierrätyksen",
          "• Miten hakea asuntoa tai rakennuslupaa",
          "• Pysäköintiluvat ja liikennekysymykset",
          "• Tuki ikääntyneille tai perheille"
        ],
        prompt: "Kirjoita vain kysymyksesi alle!"
      }
    }
    
    return explanations[currentLang] || explanations.sv
  }

  const explanation = getSimpleExplanation()

  return (
    <Card className="w-full max-w-md mx-auto border-blue-100 bg-blue-50/30">
      <CardContent className="p-6 text-center">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">
          {explanation.title}
        </h2>
        <p className="text-sm text-gray-600 mb-4 leading-relaxed">
          {explanation.text}
        </p>
        <div className="text-left text-sm text-gray-700 mb-4 space-y-1">
          {explanation.examples.map((example: string, index: number) => (
            <p key={index} className="leading-relaxed">{example}</p>
          ))}
        </div>
        <p className="text-sm font-medium text-blue-600">
          {explanation.prompt}
        </p>
      </CardContent>
    </Card>
  )
}

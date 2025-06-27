import MultilingualDemo from '@/components/multilingual-demo'

export default function MultilingualPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <MultilingualDemo />
    </div>
  )
}

export const metadata = {
  title: 'Multilingual Botkyrka Assistant - Demo',
  description: 'Test the multilingual capabilities of the Botkyrka municipality assistant in Swedish, English, Finnish, Somali, Arabic, and Turkish',
}

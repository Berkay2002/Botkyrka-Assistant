# 🇸🇪 Botkyrka Assist

A mobile-first, multilingual AI chatbot for Botkyrka municipality residents. Get answers in Swedish, English, Somali, Arabic, Turkish, and more.

## ✨ Features

- **Mobile-First Design**: Responsive from 320px to 1440px
- **Multilingual Support**: Auto-detects language, supports 5+ languages
- **Quick Actions**: Tappable chips for common municipality services
- **Smart Links**: Automatic detection of services with direct links to official pages
- **Analytics**: Tracks questions, feedback, and fallback requests via Supabase
- **Accessibility**: Full keyboard navigation and screen reader support

## 🚀 Quick Start

### 1. Clone & Install
```bash
git clone <your-repo>
cd botkyrka-assistant
npm install
```

### 2. Environment Setup
```bash
cp .env.example .env.local
```

Fill in your environment variables:
```env
OPENAI_API_KEY=sk-your-openai-key
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Supabase Database Setup
Run the SQL schema in your Supabase dashboard (see `/docs/database-schema.sql`)

### 4. Development
```bash
npm run dev
```

Visit `http://localhost:3000`

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 15, React 19, Tailwind CSS
- **AI**: Vercel AI SDK, OpenAI GPT-4o-mini
- **Database**: Supabase (PostgreSQL)
- **Internationalization**: i18next, react-i18next
- **UI Components**: Radix UI, shadcn/ui

### Project Structure
```
├── app/
│   ├── api/chat/          # AI chat endpoint
│   ├── api/feedback/      # User feedback logging
│   ├── api/fallback/      # Forward to human agents
│   └── layout.tsx         # Root layout
├── components/
│   ├── chat-form.tsx      # Main chat interface
│   ├── language-selector.tsx  # Language switcher
│   ├── quick-actions.tsx  # Service shortcuts
│   └── ui/               # Reusable UI components
├── lib/
│   ├── i18n.ts           # Internationalization config
│   ├── supabase.ts       # Database client & analytics
│   └── utils.ts          # Utilities
```

## 🌍 Supported Languages

| Language | Code | Flag |
|----------|------|------|
| Svenska | `sv` | 🇸🇪 |
| English | `en` | 🇬🇧 |
| Soomaali | `so` | 🇸🇴 |
| العربية | `ar` | 🇸🇦 |
| Türkçe | `tr` | 🇹🇷 |

## 📊 Analytics Dashboard

Track usage via Supabase:
- Question logs with language detection
- User feedback (👍/👎)
- Fallback requests to human agents
- Service link clicks

## 🔧 Configuration

### Municipal Services Links
Edit `components/chat-form.tsx` to customize service URLs:

```typescript
const SERVICE_URLS = {
  'parkeringstillstånd': 'https://www.botkyrka.se/...',
  'förskola': 'https://www.botkyrka.se/...',
  // Add more services...
}
```

### Language Support
Add new languages in `lib/i18n.ts`:

```typescript
export const SUPPORTED_LANGUAGES = {
  // Add new language here
  fi: { code: 'fi', name: 'Suomi', flag: '🇫🇮' },
}
```

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm run build
vercel --prod
```

### Docker
```bash
docker build -t botkyrka-assist .
docker run -p 3000:3000 botkyrka-assist
```

## 📱 Mobile Testing

Test responsive design:
- **Mobile**: 320px - 768px
- **Tablet**: 768px - 1024px  
- **Desktop**: 1024px+

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📄 License

MIT License - see LICENSE file for details.

---

**Built with ❤️ for Botkyrka municipality residents**

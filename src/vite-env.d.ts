/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_APP_ENV: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// PWA типы
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

// Расширяем Window интерфейс для PWA событий
declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent
    appinstalled: Event
  }

  interface Navigator {
    standalone?: boolean
  }
}

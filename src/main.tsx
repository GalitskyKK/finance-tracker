import React from "react"
import ReactDOM from "react-dom/client"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import App from "./App.tsx"
import "./index.css"
import { registerSW } from "virtual:pwa-register"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5 // 5 minutes
    }
  }
})

// Регистрация Service Worker для PWA
const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm("Доступно обновление приложения. Перезагрузить?")) {
      updateSW(true)
    }
  },
  onOfflineReady() {
    console.log("Приложение готово к работе офлайн")
  }
})

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
)

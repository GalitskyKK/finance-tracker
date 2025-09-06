import React from "react"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { AppWithMigration } from "@/components/AppWithMigration"

const App: React.FC = () => {
  return (
    <ProtectedRoute>
      <AppWithMigration />
    </ProtectedRoute>
  )
}

export default App

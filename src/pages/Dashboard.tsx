import React from "react"
import { Dashboard as DashboardComponent } from "@/components/Dashboard"

interface DashboardPageProps {
  onPageChange?: (page: string) => void
}

const Dashboard: React.FC<DashboardPageProps> = ({ onPageChange }) => {
  return <DashboardComponent onPageChange={onPageChange} />
}

export default Dashboard

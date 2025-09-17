export interface SavingsGoal {
  id: string
  name: string
  description: string
  targetAmount: number
  currentAmount: number
  color: string
  icon: string
  deadline?: string // ISO string, optional
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateSavingsGoalData {
  name: string
  description: string
  targetAmount: number
  color: string
  icon: string
  deadline?: string
}

export interface UpdateSavingsGoalData extends Partial<CreateSavingsGoalData> {
  id: string
}

/**
 * Транзакция для перевода денег в/из сберегательных целей
 * Этот тип транзакций не влияет на общий баланс пользователя,
 * а только перераспределяет деньги между "свободными" и "зарезервированными"
 */
export interface SavingsTransaction {
  id: string
  savingsGoalId: string
  amount: number
  type: "deposit" | "withdraw" // положить в цель или снять из цели
  description: string
  date: string // ISO string
  createdAt: string
  updatedAt: string
}

export interface CreateSavingsTransactionData {
  savingsGoalId: string
  amount: number
  type: "deposit" | "withdraw"
  description: string
  date: string
}

/**
 * Расширенная информация о балансе с учетом сбережений
 */
export interface BalanceWithSavings {
  totalBalance: number // общий баланс (доходы - расходы)
  availableBalance: number // свободные деньги (общий баланс - зарезервированные)
  reservedBalance: number // деньги в сберегательных целях
  savingsGoals: SavingsGoal[]
}

/**
 * Статистика по сберегательной цели
 */
export interface SavingsGoalStats {
  goalId: string
  progressPercentage: number // процент выполнения цели
  remainingAmount: number // сколько еще нужно накопить
  daysToDeadline?: number // дней до дедлайна
  averageMonthlyDeposit: number // средний месячный взнос
  recommendedMonthlyDeposit?: number // рекомендуемый месячный взнос для достижения цели к дедлайну
}

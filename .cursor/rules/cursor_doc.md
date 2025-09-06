# Finance Tracker - Cursor AI Instructions

## 🎯 Контекст проекта
Мы разрабатываем Personal Finance Tracker - веб-приложение для управления личными финансами. Это учебный проект для отработки навыков React/TypeScript разработки.

## 📋 Обязательные требования

### Технологический стек
- **React 18** с TypeScript (строго типизированный код)
- **Vite** для сборки проекта
- **Tailwind CSS** для стилизации (никаких styled-components или emotion)
- **React Hook Form** для всех форм
- **Zustand** для глобального состояния
- **React Query** для управления серверным состоянием
- **Recharts** для всех графиков и диаграмм
- **Date-fns** для работы с датами (не moment.js)

### Архитектурные принципы
1. **Компонентный подход** - каждый компонент должен быть переиспользуемым
2. **Типизация** - все пропсы, состояния и функции должны быть типизированы
3. **Разделение логики** - бизнес-логика в кастомных хуках
4. **Консистентность** - единообразное именование и структура

## 🚫 Ограничения и запреты

### Что НЕ использовать:
- ❌ **Material-UI, Ant Design, Chakra UI** - только кастомные компоненты с Tailwind
- ❌ **Redux/Redux Toolkit** - используем Zustand
- ❌ **Axios** - используем fetch или React Query
- ❌ **Moment.js** - только date-fns
- ❌ **Class components** - только функциональные компоненты
- ❌ **any тип** - всегда типизируем данные
- ❌ **Inline стили** - только Tailwind классы
- ❌ **jQuery или другие DOM библиотеки**
- ❌ **External API** - работаем с localStorage для данных

### Стилизация:
- ✅ Используй только Tailwind CSS классы
- ✅ Создавай переиспользуемые UI компоненты (Button, Input, Card, etc.)
- ✅ Следуй принципам responsive design
- ✅ Используй CSS переменные для цветовой схемы
- ❌ Не используй !important
- ❌ Не создавай кастомные CSS файлы без необходимости

## 📁 Обязательная структура файлов

```
src/
├── components/
│   ├── ui/                  # Базовые UI компоненты
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   └── Card.tsx
│   ├── forms/               # Формы
│   │   ├── TransactionForm.tsx
│   │   └── CategoryForm.tsx
│   ├── charts/              # Компоненты графиков
│   │   ├── PieChart.tsx
│   │   └── LineChart.tsx
│   └── layout/              # Компоненты макета
│       ├── Header.tsx
│       ├── Sidebar.tsx
│       └── Layout.tsx
├── pages/                   # Страницы
│   ├── Dashboard.tsx
│   ├── Transactions.tsx
│   └── Analytics.tsx
├── hooks/                   # Кастомные хуки
│   ├── useTransactions.ts
│   ├── useCategories.ts
│   └── useLocalStorage.ts
├── store/                   # Zustand сторы
│   ├── transactionStore.ts
│   └── categoryStore.ts
├── types/                   # TypeScript типы
│   ├── transaction.ts
│   ├── category.ts
│   └── index.ts
├── utils/                   # Утилиты
│   ├── formatters.ts
│   ├── validators.ts
│   └── constants.ts
└── data/                    # Моковые данные
    └── mockData.ts
```

## 📊 Обязательные TypeScript типы

```typescript
// types/transaction.ts
export interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  categoryId: string;
  description: string;
  date: string; // ISO string
  createdAt: string;
  updatedAt: string;
}

// types/category.ts
export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  type: 'income' | 'expense';
  isDefault: boolean;
}

// types/budget.ts
export interface Budget {
  id: string;
  categoryId: string;
  amount: number;
  period: 'monthly' | 'weekly';
  createdAt: string;
}
```

## 🎨 Дизайн-система (обязательно соблюдать)

### Цвета (используй только эти CSS переменные):
```css
:root {
  --primary: theme('colors.blue.500');
  --primary-hover: theme('colors.blue.600');
  --success: theme('colors.emerald.500');
  --danger: theme('colors.red.500');
  --warning: theme('colors.amber.500');
  --neutral: theme('colors.gray.500');
  --background: theme('colors.gray.50');
  --card: theme('colors.white');
  --border: theme('colors.gray.200');
}
```

### Spacing и sizing:
- Используй систему spacing Tailwind (4, 8, 12, 16, 20, 24px и т.д.)
- Контейнеры: max-width от sm до 7xl
- Отступы: p-4, p-6, p-8 для карточек
- Промежутки: gap-4, gap-6, gap-8 для grid/flex

## 🔧 Правила написания кода

### Компоненты:
```typescript
// ✅ Правильно
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  variant, 
  size = 'md', 
  onClick, 
  children 
}) => {
  const baseClasses = 'font-medium rounded-lg transition-colors';
  const variantClasses = {
    primary: 'bg-blue-500 hover:bg-blue-600 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900',
    danger: 'bg-red-500 hover:bg-red-600 text-white'
  };
  
  return (
    <button 
      className={`${baseClasses} ${variantClasses[variant]}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

// ❌ Неправильно
const Button = (props: any) => {
  return <button style={{backgroundColor: 'blue'}}>{props.children}</button>;
};
```

### Хуки:
```typescript
// ✅ Правильно
export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  
  const addTransaction = useCallback((transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTransactions(prev => [newTransaction, ...prev]);
  }, []);

  return { transactions, loading, addTransaction };
};
```

### Формы (обязательно React Hook Form):
```typescript
// ✅ Правильно
interface TransactionFormData {
  amount: number;
  type: 'income' | 'expense';
  categoryId: string;
  description: string;
  date: string;
}

export const TransactionForm: React.FC = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<TransactionFormData>();
  
  const onSubmit = (data: TransactionFormData) => {
    // логика отправки
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        {...register('amount', { required: 'Сумма обязательна' })}
        type="number"
        placeholder="Сумма"
        error={errors.amount?.message}
      />
      {/* остальные поля */}
    </form>
  );
};
```

## 📱 UX/UI требования

### Обязательные элементы интерфейса:
1. **Loading states** - для всех асинхронных операций
2. **Error states** - обработка ошибок с сообщениями пользователю
3. **Empty states** - когда нет данных для отображения
4. **Toast notifications** - для успешных операций и ошибок
5. **Confirmation dialogs** - для удаления данных
6. **Form validation** - валидация всех форм с понятными сообщениями

### Responsive design:
- Mobile first подход
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Скрытие/показ элементов на разных экранах
- Адаптивные сетки и компоновка

## 💾 Работа с данными

### Используй только localStorage:
```typescript
// ✅ Правильно
export const useLocalStorage = <T>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value: T) => {
    try {
      setStoredValue(value);
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  return [storedValue, setValue] as const;
};

// ❌ Не используй внешние API или базы данных
```

## 🧪 Подходы к разработке

### MVP First:
1. Сначала базовый функционал (CRUD транзакций)
2. Потом улучшения (графики, аналитика)
3. Затем дополнительные фичи (бюджеты, цели)

### Code Quality:
- Используй ESLint правила
- Пиши понятные названия переменных и функций
- Добавляй комментарии к сложной логике
- Следуй принципам DRY и SOLID

### Performance:
- Используй React.memo для оптимизации перерендеров
- useMemo и useCallback где необходимо
- Ленивая загрузка компонентов с React.lazy
- Оптимизируй списки с виртуализацией при необходимости

## 🎯 Первые шаги (следуй этому порядку):

1. **Настройка проекта**: Vite + React + TypeScript + Tailwind
2. **Базовые UI компоненты**: Button, Input, Card, Modal
3. **Типы данных**: Transaction, Category интерфейсы
4. **Форма добавления транзакции**: с валидацией
5. **Список транзакций**: с фильтрацией
6. **Базовый Dashboard**: карточки с балансом
7. **Графики**: простой pie chart для категорий

## 📝 Заметки для разработки

- **Начинай с простого** - не переусложняй архитектуру
- **Тестируй в браузере** - проверяй каждую фичу сразу
- **Следуй плану** - не отклоняйся от MVP
- **Документируй** - добавляй комментарии к сложным местам
- **Итеративность** - делай по одной фиче за раз

---

**Важно**: Если ты не уверен в каком-то решении, всегда выбирай более простой и понятный подход. Лучше рабочий простой код, чем сломанный сложный.
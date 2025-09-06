# 🚀 Миграция на Supabase + Аутентификацию

## 📋 План миграции

### Этап 1: Настройка Supabase

#### 1.1 Установка зависимостей

```bash
npm install @supabase/supabase-js
npm install --save-dev @supabase/cli
```

#### 1.2 Создание проекта Supabase

1. Зайти на [supabase.com](https://supabase.com)
2. Создать новый проект
3. Получить URL и API Key из настроек проекта

#### 1.3 Настройка environment переменных

Создать `.env.local`:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### Этап 2: Схема базы данных

#### 2.1 Таблица users (расширение auth.users)

```sql
-- Создаем profile таблицу для дополнительных данных пользователя
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text unique not null,
  name text,
  avatar_url text,
  currency text default 'RUB' not null,
  timezone text default 'Europe/Moscow' not null,
  date_format text default 'DD/MM/YYYY' not null,
  language text default 'ru' not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Включаем RLS
alter table public.profiles enable row level security;

-- Политики безопасности
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Триггер для автоматического создания профиля
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name)
  values (new.id, new.email, new.raw_user_meta_data->>'name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

#### 2.2 Таблица categories

```sql
create table public.categories (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  color text not null,
  icon text not null,
  type text not null check (type in ('income', 'expense')),
  is_default boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS
alter table public.categories enable row level security;

create policy "Users can manage own categories" on public.categories
  using (auth.uid() = user_id);
```

#### 2.3 Таблица transactions

```sql
create table public.transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  amount decimal(15,2) not null,
  type text not null check (type in ('income', 'expense')),
  category_id uuid references public.categories(id) not null,
  description text not null,
  date date not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS
alter table public.transactions enable row level security;

create policy "Users can manage own transactions" on public.transactions
  using (auth.uid() = user_id);

-- Индексы для производительности
create index transactions_user_id_idx on public.transactions(user_id);
create index transactions_date_idx on public.transactions(date desc);
create index transactions_category_id_idx on public.transactions(category_id);
```

#### 2.4 Таблица budgets

```sql
create table public.budgets (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  category_id uuid references public.categories(id) on delete cascade not null,
  amount decimal(15,2) not null,
  period text not null check (period in ('monthly', 'weekly')) default 'monthly',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, category_id, period)
);

-- RLS
alter table public.budgets enable row level security;

create policy "Users can manage own budgets" on public.budgets
  using (auth.uid() = user_id);
```

### Этап 3: Настройка Supabase клиента

#### 3.1 Создание Supabase клиента

```typescript
// src/lib/supabase.ts
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Типизация для базы данных
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          name: string | null
          avatar_url: string | null
          currency: string
          timezone: string
          date_format: string
          language: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name?: string | null
          avatar_url?: string | null
          currency?: string
          timezone?: string
          date_format?: string
          language?: string
        }
        Update: {
          name?: string | null
          avatar_url?: string | null
          currency?: string
          timezone?: string
          date_format?: string
          language?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          user_id: string
          name: string
          color: string
          icon: string
          type: "income" | "expense"
          is_default: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          color: string
          icon: string
          type: "income" | "expense"
          is_default?: boolean
        }
        Update: {
          name?: string
          color?: string
          icon?: string
          type?: "income" | "expense"
          updated_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          amount: number
          type: "income" | "expense"
          category_id: string
          description: string
          date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          type: "income" | "expense"
          category_id: string
          description: string
          date: string
        }
        Update: {
          amount?: number
          type?: "income" | "expense"
          category_id?: string
          description?: string
          date?: string
          updated_at?: string
        }
      }
      budgets: {
        Row: {
          id: string
          user_id: string
          category_id: string
          amount: number
          period: "monthly" | "weekly"
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category_id: string
          amount: number
          period?: "monthly" | "weekly"
        }
        Update: {
          amount?: number
          period?: "monthly" | "weekly"
          updated_at?: string
        }
      }
    }
  }
}
```

### Этап 4: Миграция localStorage данных

#### 4.1 Утилита для экспорта данных

```typescript
// src/utils/dataExport.ts
import { Transaction, Category } from "@/types"
import { STORAGE_KEYS } from "@/utils/constants"

export interface ExportedData {
  transactions: Transaction[]
  categories: Category[]
  exportedAt: string
}

export const exportLocalStorageData = (): ExportedData | null => {
  try {
    const transactions = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.TRANSACTIONS) || "[]"
    ) as Transaction[]

    const categories = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.CATEGORIES) || "[]"
    ) as Category[]

    return {
      transactions,
      categories: categories.filter((cat) => !cat.isDefault), // Не экспортируем дефолтные
      exportedAt: new Date().toISOString()
    }
  } catch (error) {
    console.error("Error exporting localStorage data:", error)
    return null
  }
}

export const downloadDataBackup = (data: ExportedData): void => {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json"
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `finance-tracker-backup-${new Date().toISOString().split("T")[0]}.json`
  a.click()
  URL.revokeObjectURL(url)
}
```

### Этап 5: Создание Auth Store

#### 5.1 Auth Store на Zustand

```typescript
// src/store/authStore.ts
import { create } from "zustand"
import { AuthState, AuthActions, LoginCredentials, RegisterCredentials } from "@/types"
import { supabase } from "@/lib/supabase"

interface AuthStore extends AuthState, AuthActions {}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  session: null,
  loading: false,
  error: null,
  isAuthenticated: false,

  signIn: async (credentials: LoginCredentials) => {
    set({ loading: true, error: null })

    try {
      const { data, error } = await supabase.auth.signInWithPassword(credentials)

      if (error) throw error

      set({
        user: data.user,
        session: data.session,
        isAuthenticated: true,
        loading: false
      })
    } catch (error: any) {
      set({
        error: error.message,
        loading: false,
        isAuthenticated: false
      })
    }
  },

  signUp: async (credentials: RegisterCredentials) => {
    set({ loading: true, error: null })

    try {
      const { data, error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            name: credentials.name
          }
        }
      })

      if (error) throw error

      set({
        user: data.user,
        session: data.session,
        isAuthenticated: !!data.session,
        loading: false
      })
    } catch (error: any) {
      set({
        error: error.message,
        loading: false,
        isAuthenticated: false
      })
    }
  },

  signOut: async () => {
    set({ loading: true })

    try {
      await supabase.auth.signOut()
      set({
        user: null,
        session: null,
        isAuthenticated: false,
        loading: false
      })
    } catch (error: any) {
      set({
        error: error.message,
        loading: false
      })
    }
  },

  clearError: () => set({ error: null })

  // ... остальные методы
}))

// Слушатель изменений аутентификации
supabase.auth.onAuthStateChange((event, session) => {
  const { set } = useAuthStore.getState()

  set({
    user: session?.user || null,
    session: session,
    isAuthenticated: !!session,
    loading: false
  })
})
```

## 🚦 Порядок выполнения

1. **Установить Supabase** и создать проект
2. **Создать схему БД** через SQL Editor
3. **Настроить environment переменные**
4. **Создать Supabase клиент**
5. **Реализовать Auth Store**
6. **Создать UI для аутентификации**
7. **Мигрировать Transaction Store**
8. **Мигрировать Category Store**
9. **Создать систему миграции данных**
10. **Протестировать все функции**

## 🛡️ Безопасность

- ✅ Row Level Security (RLS) настроена
- ✅ Каждый пользователь видит только свои данные
- ✅ API ключи не попадают в код
- ✅ Валидация на уровне БД
- ✅ Автоматическое создание профиля пользователя

## 🚀 Преимущества после миграции

- 📱 **Синхронизация** между устройствами
- 👥 **Многопользовательская** система
- 🔒 **Безопасность** данных
- ☁️ **Резервное копирование** автоматически
- 📊 **Масштабируемость** до тысяч пользователей
- 🔍 **Аналитика** использования
- 📈 **Real-time** обновления данных

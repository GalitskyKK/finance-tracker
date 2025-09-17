# 💰 KashKontrol

A modern **Personal Finance Tracker** built with React 18 and TypeScript - your complete solution for managing personal finances with **offline-first architecture**.

[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2.2-blue.svg)](https://www.typescriptlang.org/)
[![PWA](https://img.shields.io/badge/PWA-Ready-green.svg)](https://web.dev/progressive-web-apps/)
[![Offline](https://img.shields.io/badge/Offline-First-orange.svg)](https://web.dev/offline-first/)

## 🌟 **Key Features**

### 💸 **Transaction Management**

- ✅ **Full CRUD operations** - Create, read, update, delete transactions
- ✅ **Offline support** - Add transactions without internet connection
- ✅ **Real-time sync** - Automatic synchronization with cloud database
- ✅ **Smart categorization** - Organize transactions with color-coded categories

### 📊 **Analytics & Insights**

- ✅ **Interactive dashboard** - Key financial metrics at a glance
- ✅ **Rich visualizations** - Beautiful charts and graphs powered by Recharts
- ✅ **Monthly analysis** - Track spending patterns over time
- ✅ **Category breakdown** - Detailed expense analysis by category

### 📱 **Progressive Web App (PWA)**

- ✅ **Install anywhere** - Works on desktop, Android, and iOS
- ✅ **Offline-first** - Full functionality without internet
- ✅ **Native experience** - App-like behavior when installed
- ✅ **Auto-updates** - Seamless updates with Service Worker

### 🔄 **Data Synchronization**

- ✅ **IndexedDB storage** - Fast local data caching
- ✅ **Supabase backend** - Secure cloud database
- ✅ **Conflict resolution** - Smart data merging
- ✅ **Background sync** _(coming soon)_ - Sync even when app is closed

## 🛠️ **Tech Stack**

### **Frontend Framework**

- **React 18** with TypeScript - Modern React with strict typing
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first CSS framework

### **State Management**

- **Zustand** - Lightweight state management
- **React Query** - Server state management
- **React Hook Form** - Performant forms with validation

### **Data & Storage**

- **Supabase** - Cloud database and authentication
- **IndexedDB** - Client-side storage for offline functionality
- **localStorage** - Fallback storage for PWA compatibility

### **UI & Visualization**

- **Recharts** - Responsive chart library
- **Lucide React** - Beautiful icon library
- **Date-fns** - Modern date utility library

### **PWA & Performance**

- **Vite PWA Plugin** - Service Worker generation
- **Workbox** - Advanced caching strategies
- **TypeScript** - 100% type safety

## 🚀 **Quick Start**

### **Prerequisites**

- Node.js 18+
- npm or yarn

### **Installation**

```bash
# Clone the repository
git clone <repository-url>
cd kashkontrol

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### **Production Build**

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 📁 **Project Structure**

```
src/
├── components/
│   ├── ui/                 # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   └── Card.tsx
│   ├── forms/              # Form components
│   │   └── TransactionForm.tsx
│   ├── charts/             # Chart components
│   │   ├── PieChart.tsx
│   │   └── LineChart.tsx
│   ├── layout/             # Layout components
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   └── Layout.tsx
│   └── auth/               # Authentication components
├── pages/                  # Application pages
│   ├── Dashboard.tsx
│   ├── Transactions.tsx
│   └── Analytics.tsx
├── hooks/                  # Custom React hooks
│   ├── useOfflineSync.ts
│   └── useLocalStorage.ts
├── store/                  # Zustand stores
│   ├── transactionStore.ts
│   └── categoryStore.ts
├── types/                  # TypeScript type definitions
│   ├── transaction.ts
│   ├── category.ts
│   └── index.ts
├── utils/                  # Utility functions
│   ├── indexedDB.ts
│   ├── formatters.ts
│   └── validators.ts
└── lib/                    # Third-party library configurations
    └── supabase.ts
```

## 🎨 **Design System**

KashKontrol follows a consistent design system:

- **🎨 Color Palette** - Modern fintech-inspired colors
- **📝 Typography** - Clean, readable font hierarchy
- **📐 Spacing** - Consistent 8px grid system
- **🔄 Animations** - Smooth micro-interactions
- **📱 Responsive** - Mobile-first design approach

## 💾 **Data Architecture**

### **Offline-First Strategy**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React UI      │◄──►│   IndexedDB     │◄──►│   Supabase      │
│   (Frontend)    │    │   (Local Cache) │    │   (Cloud DB)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### **Data Flow**

1. **User creates transaction** → Saved to IndexedDB immediately
2. **IndexedDB** → Syncs to Supabase when online
3. **Supabase** → Real-time updates across devices
4. **Conflict resolution** → Smart merging of offline changes

## 🔧 **Development**

### **Available Scripts**

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
npm run type-check # TypeScript type checking
```

### **Code Quality**

- **✅ TypeScript** - 100% type coverage, zero `any` types
- **✅ ESLint** - Strict linting rules with custom configuration
- **✅ Prettier** - Automatic code formatting
- **✅ Husky** - Pre-commit hooks for quality assurance

### **Development Guidelines**

1. **🎯 TypeScript First** - All code must be strictly typed
2. **🧩 Component-Based** - Build reusable, composable components
3. **📱 Mobile-First** - Design for mobile, enhance for desktop
4. **⚡ Performance** - Optimize for speed and efficiency
5. **🔄 Offline-Ready** - Always consider offline scenarios

## 📱 **PWA Features**

### **Installation**

- **📱 Mobile** - "Add to Home Screen" on iOS/Android
- **💻 Desktop** - Install from browser address bar
- **🔄 Auto-Update** - Seamless updates via Service Worker

### **Offline Capabilities**

- **✅ Create transactions** - Works completely offline
- **✅ View analytics** - Access cached data
- **✅ Browse history** - All data available offline
- **🔄 Auto-sync** - Syncs when connection is restored

## 🎯 **Current Features**

- ✅ **Transaction CRUD** - Full transaction management
- ✅ **Category System** - Smart categorization with icons
- ✅ **Dashboard Analytics** - Real-time financial insights
- ✅ **Interactive Charts** - Beautiful data visualizations
- ✅ **Search & Filter** - Find transactions quickly
- ✅ **Responsive Design** - Works on all devices
- ✅ **PWA Support** - Install as native app
- ✅ **Offline Functionality** - Full offline capabilities
- ✅ **Data Synchronization** - Cloud sync with conflict resolution
- ✅ **User Authentication** - Secure login with Supabase Auth

## 🚧 **Roadmap**

### **Phase 1: Core Enhancement** _(Q4 2025)_

- [ ] **Background Sync** - Sync even when app is closed
- [ ] **Push Notifications** - Important financial alerts
- [ ] **Advanced Filtering** - Complex search queries

### **Phase 2: Financial Features** _(Q1 2026)_

- [ ] **Budget Management** - Set and track budgets
- [ ] **Financial Goals** - Savings targets and progress
- [ ] **Recurring Transactions** - Automatic transaction creation

### **Phase 3: Intelligence** _(Q2 2026)_

- [ ] **AI Insights** - Smart financial recommendations
- [ ] **Expense Predictions** - Forecast future spending
- [ ] **Data Export** - CSV, PDF export capabilities

## 🔒 **Security & Privacy**

- **🔐 Authentication** - Secure login with Supabase Auth
- **🛡️ Data Encryption** - All data encrypted in transit and at rest
- **👤 Privacy First** - No tracking, no data selling
- **🔄 Local Storage** - Sensitive data stays on your device

## 🌐 **Browser Support**

| Browser | Version | PWA Support | Offline Support |
| ------- | ------- | ----------- | --------------- |
| Chrome  | 90+     | ✅ Full     | ✅ Full         |
| Firefox | 88+     | ✅ Full     | ✅ Full         |
| Safari  | 14+     | ⚠️ Limited  | ✅ Full         |
| Edge    | 90+     | ✅ Full     | ✅ Full         |

## 📊 **Performance**

- **⚡ Lighthouse Score** - 90+ PWA Score
- **📦 Bundle Size** - Optimized with code splitting
- **🚀 Load Time** - < 2s initial load
- **💾 Cache Size** - ~3MB for full offline functionality

## 🤝 **Contributing**

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### **Development Setup**

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎉 **Acknowledgments**

- Built with ❤️ using modern web technologies
- Inspired by the need for simple, effective financial management
- Community-driven development and feedback

---

## 🚀 **Get Started Today!**

Ready to take control of your finances?

```bash
git clone <repository-url>
cd kashkontrol
npm install && npm run dev
```

**KashKontrol** - Simple. Powerful. Always Available. 💰✨

---

_Last updated: September 2025 | Version 1.2.8_

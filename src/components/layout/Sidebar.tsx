import React from 'react';
import { Home, CreditCard, BarChart3, Settings, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  className?: string;
}

const menuItems = [
  { id: 'dashboard', label: 'Дашборд', icon: Home },
  { id: 'transactions', label: 'Транзакции', icon: CreditCard },
  { id: 'analytics', label: 'Аналитика', icon: BarChart3 },
  { id: 'settings', label: 'Настройки', icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onPageChange,
  isOpen,
  onToggle,
  className = '',
}) => {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={onToggle} />
      )}

      {/* Sidebar */}
      <aside
        className={`
        fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:inset-0
        ${className}
      `}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Меню</h2>
          <Button variant="secondary" size="sm" onClick={onToggle} className="lg:hidden !p-2">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <nav className="my-6 px-3">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;

              return (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      onPageChange(item.id);
                      onToggle(); // Закрываем меню на мобильных после выбора
                    }}
                    className={`
                      w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors
                      ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      }
                    `}>
                    <Icon
                      className={`mr-3 h-5 w-5 ${isActive ? 'text-blue-700' : 'text-gray-400'}`}
                    />
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        {/* <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-200">
          <div className="text-xs text-gray-500 text-center">Finance Tracker v1.0.0</div>
        </div> */}
      </aside>
    </>
  );
};

import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Map as MapIcon, 
  CheckSquare, 
  FolderOpen, 
  Upload,
  LogOut 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '../../hooks/useAuth';

interface CandidateLayoutProps {
  children: ReactNode;
}

export default function CandidateLayout({ children }: CandidateLayoutProps) {
  const location = useLocation();
  const { logout } = useAuth();

  const navigation = [
    { name: 'Painel', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Mapa Eleitoral', href: '/map', icon: MapIcon },
    { name: 'Insights & Tarefas', href: '/tasks', icon: CheckSquare },
    { name: 'Repositório', href: '/vault', icon: FolderOpen },
    { name: 'Importar Dados', href: '/data', icon: Upload },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-card border-r border-border">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-primary">PRISMA 360</h1>
            <p className="text-sm text-muted-foreground">Inteligência Eleitoral</p>
          </div>
          
          <nav className="px-4 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href || 
                              (item.href === '/dashboard' && location.pathname === '/');
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }`}
                >
                  <Icon className="mr-3 h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="absolute bottom-4 left-4 right-4">
            <Button variant="ghost" onClick={logout} className="w-full justify-start">
              <LogOut className="mr-3 h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 p-8">
          {children}
        </div>
      </div>
    </div>
  );
}

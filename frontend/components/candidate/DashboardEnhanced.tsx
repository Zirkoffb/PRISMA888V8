import { useEffect, useState } from 'react';
import { 
  TrendingUp, Users, AlertCircle, CheckCircle, Calendar, 
  BarChart3, MapPin, Target, Brain, Clock, Award 
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useBackend } from '../../hooks/useBackend';
import { useToast } from '@/components/ui/use-toast';

interface DashboardStats {
  totalVotes: number;
  votingPercentage: number;
  pollRating: number;
  activeInsights: number;
  completedTasks: number;
  totalTasks: number;
  campaignProgress: number;
  weeklyGrowth: number;
}

interface Insight {
  id: number;
  title: string;
  description: string;
  priority: 'alta' | 'média' | 'baixa';
  category: string;
  createdAt: string;
  source: string;
}

interface Task {
  id: number;
  title: string;
  description: string;
  priority: 'alta' | 'média' | 'baixa';
  status: 'pendente' | 'em_andamento' | 'concluida';
  dueDate?: string;
  category: string;
  estimatedHours: number;
}

interface RecentActivity {
  id: number;
  type: 'task_completed' | 'insight_generated' | 'data_uploaded' | 'agent_action';
  description: string;
  timestamp: string;
  details?: any;
}

export default function DashboardEnhanced() {
  const [stats, setStats] = useState<DashboardStats>({
    totalVotes: 15420,
    votingPercentage: 23.4,
    pollRating: 28.7,
    activeInsights: 12,
    completedTasks: 18,
    totalTasks: 25,
    campaignProgress: 72,
    weeklyGrowth: 5.2
  });

  const [insights, setInsights] = useState<Insight[]>([
    {
      id: 1,
      title: "Oportunidade no Setor Norte",
      description: "Análise demográfica indica potencial de crescimento de 15% na região norte da cidade",
      priority: "alta",
      category: "Territorial",
      createdAt: "2024-01-15",
      source: "Agente Territorial"
    },
    {
      id: 2,
      title: "Engajamento em Redes Sociais",
      description: "Posts sobre educação geram 40% mais engajamento que outros temas",
      priority: "média",
      category: "Digital",
      createdAt: "2024-01-14",
      source: "Agente Digital"
    },
    {
      id: 3,
      title: "Perfil Demográfico Favorável",
      description: "Faixa etária 35-50 anos apresenta maior intenção de voto (32%)",
      priority: "média",
      category: "Demográfico",
      createdAt: "2024-01-13",
      source: "Agente Analítico"
    }
  ]);

  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 1,
      title: "Reunião com Associação de Moradores",
      description: "Encontro no bairro Jardim das Flores para apresentar propostas de infraestrutura",
      priority: "alta",
      status: "pendente",
      dueDate: "2024-01-18",
      category: "Agenda",
      estimatedHours: 3
    },
    {
      id: 2,
      title: "Gravação de Vídeo Institucional",
      description: "Produção de conteúdo para campanha digital sobre propostas para educação",
      priority: "alta",
      status: "em_andamento",
      dueDate: "2024-01-20",
      category: "Conteúdo",
      estimatedHours: 5
    },
    {
      id: 3,
      title: "Análise de Pesquisa Eleitoral",
      description: "Revisão dos resultados da pesquisa qualitativa com eleitores indecisos",
      priority: "média",
      status: "pendente",
      dueDate: "2024-01-22",
      category: "Estratégia",
      estimatedHours: 2
    }
  ]);

  const [activities, setActivities] = useState<RecentActivity[]>([
    {
      id: 1,
      type: "task_completed",
      description: "Concluída reunião com lideranças do setor comercial",
      timestamp: "2024-01-15T14:30:00Z"
    },
    {
      id: 2,
      type: "insight_generated",
      description: "Novo insight sobre oportunidades territoriais gerado",
      timestamp: "2024-01-15T10:15:00Z"
    },
    {
      id: 3,
      type: "data_uploaded",
      description: "Dados eleitorais de 2020 processados e analisados",
      timestamp: "2024-01-14T16:45:00Z"
    }
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const priorityColors = {
    alta: "destructive",
    média: "default",
    baixa: "secondary"
  } as const;

  const statusColors = {
    pendente: "secondary",
    em_andamento: "default",
    concluida: "default"
  } as const;

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'task_completed': return CheckCircle;
      case 'insight_generated': return Brain;
      case 'data_uploaded': return BarChart3;
      case 'agent_action': return Target;
      default: return AlertCircle;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Painel da Campanha</h1>
          <p className="text-muted-foreground">Visão geral do desempenho e próximas ações</p>
        </div>
        <Button variant="outline" size="sm">
          <Clock className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Métricas Principais */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total de Votos (Última Pesquisa)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center">
              <Users className="mr-2 h-5 w-5 text-primary" />
              {stats.totalVotes.toLocaleString()}
            </div>
            <div className="flex items-center text-sm text-green-600 mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +{stats.weeklyGrowth}% esta semana
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Intenção de Voto</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center">
              <BarChart3 className="mr-2 h-5 w-5 text-blue-500" />
              {stats.pollRating.toFixed(1)}%
            </div>
            <Progress value={stats.pollRating} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Progresso da Campanha</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center">
              <Target className="mr-2 h-5 w-5 text-green-500" />
              {stats.campaignProgress}%
            </div>
            <Progress value={stats.campaignProgress} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Tarefas Concluídas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center">
              <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
              {stats.completedTasks}/{stats.totalTasks}
            </div>
            <Progress value={(stats.completedTasks / stats.totalTasks) * 100} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Insights Recentes */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              Insights da IA
            </CardTitle>
            <CardDescription>Análises e oportunidades identificadas pelos agentes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {insights.map((insight) => (
                <div key={insight.id} className="border-l-4 border-primary pl-4 space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="font-medium text-sm leading-tight">{insight.title}</h4>
                    <Badge 
                      variant={priorityColors[insight.priority]}
                      className="text-xs shrink-0"
                    >
                      {insight.priority}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {insight.description}
                  </p>
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>{insight.source}</span>
                    <span>{formatDate(insight.createdAt)}</span>
                  </div>
                </div>
              ))}
              <Button variant="outline" size="sm" className="w-full mt-4">
                Ver Todos os Insights
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Próximas Tarefas */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Próximas Tarefas
            </CardTitle>
            <CardDescription>Ações prioritárias para os próximos dias</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tasks.map((task) => (
                <div key={task.id} className="p-3 border rounded-lg space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="font-medium text-sm leading-tight">{task.title}</h4>
                    <div className="flex gap-1 shrink-0">
                      <Badge 
                        variant={priorityColors[task.priority]}
                        className="text-xs"
                      >
                        {task.priority}
                      </Badge>
                      <Badge 
                        variant={statusColors[task.status]}
                        className="text-xs"
                      >
                        {task.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {task.description}
                  </p>
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>{task.category}</span>
                    {task.dueDate && (
                      <span>Prazo: {formatDate(task.dueDate)}</span>
                    )}
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">{task.estimatedHours}h estimadas</span>
                    <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                      Ver Detalhes
                    </Button>
                  </div>
                </div>
              ))}
              <Button variant="outline" size="sm" className="w-full mt-4">
                Ver Todas as Tarefas
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Atividade Recente */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Atividade Recente
            </CardTitle>
            <CardDescription>Últimas atualizações da campanha</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activities.map((activity) => {
                const Icon = getActivityIcon(activity.type);
                return (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className="rounded-full bg-accent p-1.5 mt-0.5">
                      <Icon className="h-3 w-3" />
                    </div>
                    <div className="space-y-1 flex-1">
                      <p className="text-sm leading-tight">{activity.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDateTime(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                );
              })}
              <Button variant="outline" size="sm" className="w-full mt-4">
                Ver Histórico Completo
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Seção de Ações Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Ações Rápidas
          </CardTitle>
          <CardDescription>Principais ferramentas para gestão da campanha</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="h-20 flex-col gap-2">
              <MapPin className="h-6 w-6" />
              <span className="text-sm">Mapa Eleitoral</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <BarChart3 className="h-6 w-6" />
              <span className="text-sm">Análises</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Calendar className="h-6 w-6" />
              <span className="text-sm">Agenda</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Users className="h-6 w-6" />
              <span className="text-sm">Equipe</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
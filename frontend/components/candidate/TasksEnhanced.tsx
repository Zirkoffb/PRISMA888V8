import { useEffect, useState } from 'react';
import { 
  Plus, Calendar, User, Clock, Filter, Search, 
  PlayCircle, CheckCircle, PauseCircle, MoreVertical,
  Target, Brain, Users, Megaphone, BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';

interface Task {
  id: number;
  title: string;
  description: string;
  priority: 'alta' | 'média' | 'baixa';
  status: 'pendente' | 'em_andamento' | 'concluida' | 'pausada';
  dueDate?: string;
  assignedTo?: string;
  category: 'estrategia' | 'agenda' | 'comunicacao' | 'pesquisa' | 'mobilizacao';
  estimatedHours: number;
  completedHours?: number;
  tags: string[];
  createdAt: string;
  agentGenerated: boolean;
  subtasks?: {
    id: number;
    title: string;
    completed: boolean;
  }[];
}

export default function TasksEnhanced() {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 1,
      title: "Reunião com Associação de Moradores do Jardim das Flores",
      description: "Apresentar propostas de infraestrutura e ouvir demandas da comunidade local. Foco em melhorias de saneamento e mobilidade urbana.",
      priority: "alta",
      status: "pendente",
      dueDate: "2024-01-18",
      assignedTo: "João Silva",
      category: "agenda",
      estimatedHours: 3,
      tags: ["infraestrutura", "comunidade", "saneamento"],
      createdAt: "2024-01-15",
      agentGenerated: true,
      subtasks: [
        { id: 1, title: "Preparar apresentação com propostas", completed: false },
        { id: 2, title: "Confirmar presença dos líderes comunitários", completed: true },
        { id: 3, title: "Organizar material de apoio", completed: false }
      ]
    },
    {
      id: 2,
      title: "Produção de Conteúdo Digital - Educação",
      description: "Criar série de posts para redes sociais sobre propostas educacionais, incluindo vídeos explicativos e infográficos.",
      priority: "alta",
      status: "em_andamento",
      dueDate: "2024-01-20",
      assignedTo: "Maria Santos",
      category: "comunicacao",
      estimatedHours: 8,
      completedHours: 3,
      tags: ["digital", "educacao", "video"],
      createdAt: "2024-01-12",
      agentGenerated: true,
      subtasks: [
        { id: 4, title: "Roteiro dos vídeos", completed: true },
        { id: 5, title: "Gravação do primeiro vídeo", completed: true },
        { id: 6, title: "Edição e finalização", completed: false },
        { id: 7, title: "Criação dos infográficos", completed: false }
      ]
    },
    {
      id: 3,
      title: "Pesquisa Qualitativa - Eleitores Indecisos",
      description: "Conduzir entrevistas em profundidade com eleitores indecisos para entender suas principais preocupações e critérios de decisão.",
      priority: "média",
      status: "pendente",
      dueDate: "2024-01-25",
      assignedTo: "Ana Costa",
      category: "pesquisa",
      estimatedHours: 12,
      tags: ["pesquisa", "qualitativa", "indecisos"],
      createdAt: "2024-01-10",
      agentGenerated: false,
      subtasks: [
        { id: 8, title: "Definir perfil dos entrevistados", completed: true },
        { id: 9, title: "Preparar roteiro de entrevistas", completed: false },
        { id: 10, title: "Recrutamento dos participantes", completed: false }
      ]
    },
    {
      id: 4,
      title: "Mobilização de Voluntários - Zona Norte",
      description: "Organizar equipe de voluntários para distribuição de material na região norte da cidade, priorizando bairros com maior potencial eleitoral.",
      priority: "média",
      status: "pausada",
      dueDate: "2024-01-22",
      assignedTo: "Carlos Lima",
      category: "mobilizacao",
      estimatedHours: 6,
      completedHours: 2,
      tags: ["voluntarios", "zona-norte", "material"],
      createdAt: "2024-01-08",
      agentGenerated: true
    }
  ]);

  const [filteredTasks, setFilteredTasks] = useState<Task[]>(tasks);
  const [activeTab, setActiveTab] = useState('todas');
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('todas');
  const [categoryFilter, setCategoryFilter] = useState<string>('todas');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'média' as 'alta' | 'média' | 'baixa',
    dueDate: '',
    assignedTo: '',
    category: 'estrategia' as 'estrategia' | 'agenda' | 'comunicacao' | 'pesquisa' | 'mobilizacao',
    estimatedHours: 1,
  });

  const { toast } = useToast();

  useEffect(() => {
    filterTasks();
  }, [tasks, activeTab, searchTerm, priorityFilter, categoryFilter]);

  const filterTasks = () => {
    let filtered = tasks;

    // Filtro por status (tab)
    if (activeTab !== 'todas') {
      filtered = filtered.filter(task => task.status === activeTab);
    }

    // Filtro por busca
    if (searchTerm) {
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filtro por prioridade
    if (priorityFilter !== 'todas') {
      filtered = filtered.filter(task => task.priority === priorityFilter);
    }

    // Filtro por categoria
    if (categoryFilter !== 'todas') {
      filtered = filtered.filter(task => task.category === categoryFilter);
    }

    setFilteredTasks(filtered);
  };

  const getTaskStats = () => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'concluida').length;
    const inProgress = tasks.filter(t => t.status === 'em_andamento').length;
    const pending = tasks.filter(t => t.status === 'pendente').length;
    const completionRate = total > 0 ? (completed / total) * 100 : 0;

    return { total, completed, inProgress, pending, completionRate };
  };

  const stats = getTaskStats();

  const priorityColors = {
    alta: "destructive",
    média: "default", 
    baixa: "secondary"
  } as const;

  const statusColors = {
    pendente: "secondary",
    em_andamento: "default",
    concluida: "default",
    pausada: "destructive"
  } as const;

  const categoryIcons = {
    estrategia: Target,
    agenda: Calendar,
    comunicacao: Megaphone,
    pesquisa: BarChart3,
    mobilizacao: Users
  };

  const categoryLabels = {
    estrategia: "Estratégia",
    agenda: "Agenda",
    comunicacao: "Comunicação",
    pesquisa: "Pesquisa",
    mobilizacao: "Mobilização"
  };

  const statusLabels = {
    pendente: "Pendente",
    em_andamento: "Em Andamento",
    concluida: "Concluída",
    pausada: "Pausada"
  };

  const getProgress = (task: Task) => {
    if (task.subtasks) {
      const completed = task.subtasks.filter(s => s.completed).length;
      return (completed / task.subtasks.length) * 100;
    }
    if (task.completedHours && task.estimatedHours) {
      return Math.min((task.completedHours / task.estimatedHours) * 100, 100);
    }
    return task.status === 'concluida' ? 100 : 0;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date() && new Date(dueDate).toDateString() !== new Date().toDateString();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Tarefas & Insights</h1>
          <p className="text-muted-foreground">Gerencie seu plano de ação e acompanhe o progresso</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg">
              <Plus className="mr-2 h-4 w-4" />
              Nova Tarefa
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Criar Nova Tarefa</DialogTitle>
              <DialogDescription>
                Adicione uma nova tarefa ao seu plano de ação
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Título da tarefa"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descreva detalhadamente a tarefa..."
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="estrategia">Estratégia</SelectItem>
                      <SelectItem value="agenda">Agenda</SelectItem>
                      <SelectItem value="comunicacao">Comunicação</SelectItem>
                      <SelectItem value="pesquisa">Pesquisa</SelectItem>
                      <SelectItem value="mobilizacao">Mobilização</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="priority">Prioridade</Label>
                  <Select 
                    value={formData.priority} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="baixa">Baixa</SelectItem>
                      <SelectItem value="média">Média</SelectItem>
                      <SelectItem value="alta">Alta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Prazo</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="estimatedHours">Horas Estimadas</Label>
                  <Input
                    id="estimatedHours"
                    type="number"
                    min="1"
                    max="100"
                    value={formData.estimatedHours}
                    onChange={(e) => setFormData(prev => ({ ...prev, estimatedHours: parseInt(e.target.value) }))}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="assignedTo">Responsável</Label>
                <Input
                  id="assignedTo"
                  value={formData.assignedTo}
                  onChange={(e) => setFormData(prev => ({ ...prev, assignedTo: e.target.value }))}
                  placeholder="Nome do responsável (opcional)"
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button disabled={!formData.title}>
                  Criar Tarefa
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Estatísticas */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Tarefas</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Target className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Em Andamento</p>
                <p className="text-2xl font-bold">{stats.inProgress}</p>
              </div>
              <PlayCircle className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Concluídas</p>
                <p className="text-2xl font-bold">{stats.completed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Taxa de Conclusão</p>
                <p className="text-2xl font-bold">{stats.completionRate.toFixed(0)}%</p>
              </div>
              <BarChart3 className="h-8 w-8 text-orange-500" />
            </div>
            <Progress value={stats.completionRate} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar tarefas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Prioridade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="média">Média</SelectItem>
                  <SelectItem value="baixa">Baixa</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas</SelectItem>
                  <SelectItem value="estrategia">Estratégia</SelectItem>
                  <SelectItem value="agenda">Agenda</SelectItem>
                  <SelectItem value="comunicacao">Comunicação</SelectItem>
                  <SelectItem value="pesquisa">Pesquisa</SelectItem>
                  <SelectItem value="mobilizacao">Mobilização</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs de Status */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="todas">Todas ({tasks.length})</TabsTrigger>
          <TabsTrigger value="pendente">Pendentes ({stats.pending})</TabsTrigger>
          <TabsTrigger value="em_andamento">Em Andamento ({stats.inProgress})</TabsTrigger>
          <TabsTrigger value="concluida">Concluídas ({stats.completed})</TabsTrigger>
          <TabsTrigger value="pausada">Pausadas</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="space-y-4">
          {filteredTasks.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Target className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">
                  {searchTerm ? 'Nenhuma tarefa encontrada' : 'Nenhuma tarefa nesta categoria'}
                </p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Criar primeira tarefa
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredTasks.map((task) => {
              const CategoryIcon = categoryIcons[task.category];
              const progress = getProgress(task);
              
              return (
                <Card key={task.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <CategoryIcon className="h-4 w-4 text-primary" />
                          <CardTitle className="text-lg leading-tight">{task.title}</CardTitle>
                          {task.agentGenerated && (
                            <Badge variant="outline" className="text-xs">
                              <Brain className="h-3 w-3 mr-1" />
                              IA
                            </Badge>
                          )}
                        </div>
                        <CardDescription className="text-sm leading-relaxed">
                          {task.description}
                        </CardDescription>
                      </div>
                      
                      <div className="flex flex-col gap-2 items-end">
                        <div className="flex gap-2">
                          <Badge variant={priorityColors[task.priority]} className="text-xs">
                            {task.priority}
                          </Badge>
                          <Badge variant={statusColors[task.status]} className="text-xs">
                            {statusLabels[task.status]}
                          </Badge>
                        </div>
                        {task.dueDate && (
                          <div className={`flex items-center text-xs ${
                            isOverdue(task.dueDate) ? 'text-red-600' : 'text-muted-foreground'
                          }`}>
                            <Calendar className="h-3 w-3 mr-1" />
                            {formatDate(task.dueDate)}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Progress */}
                    {progress > 0 && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Progresso</span>
                          <span>{progress.toFixed(0)}%</span>
                        </div>
                        <Progress value={progress} />
                      </div>
                    )}
                    
                    {/* Tags */}
                    {task.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {task.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    {/* Subtasks */}
                    {task.subtasks && task.subtasks.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Subtarefas:</p>
                        <div className="space-y-1">
                          {task.subtasks.map((subtask) => (
                            <div key={subtask.id} className="flex items-center gap-2 text-sm">
                              <CheckCircle className={`h-4 w-4 ${
                                subtask.completed ? 'text-green-500' : 'text-muted-foreground'
                              }`} />
                              <span className={subtask.completed ? 'line-through text-muted-foreground' : ''}>
                                {subtask.title}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Footer */}
                    <div className="flex justify-between items-center pt-2 border-t">
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {task.estimatedHours}h est.
                        </div>
                        {task.assignedTo && (
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {task.assignedTo}
                          </div>
                        )}
                        <span>{categoryLabels[task.category]}</span>
                      </div>
                      
                      <div className="flex gap-2">
                        {task.status === 'pendente' && (
                          <Button size="sm" variant="outline">
                            <PlayCircle className="h-4 w-4 mr-1" />
                            Iniciar
                          </Button>
                        )}
                        {task.status === 'em_andamento' && (
                          <Button size="sm">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Concluir
                          </Button>
                        )}
                        <Button size="sm" variant="ghost">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
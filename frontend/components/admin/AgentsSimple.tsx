import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import backend from '~backend/client';

interface Agent {
  id: number;
  name: string;
  description: string;
  strategy_focus: string;
  status: string;
  is_active: boolean;
  created_at: string;
}

interface FormData {
  name: string;
  description: string;
  strategy_focus: string;
}

export default function AgentsSimple() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    strategy_focus: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    try {
      const response = await backend.admin.listAgentsWithKnowledge();
      setAgents(response.agents);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao carregar agentes",
        variant: "destructive"
      });
    }
  };

  const handleCreateAgent = async () => {
    try {
      await backend.admin.createAgent(formData);
      setIsCreateOpen(false);
      setFormData({ name: '', description: '', strategy_focus: '' });
      loadAgents();
      
      toast({
        title: "Sucesso",
        description: "Agente criado com sucesso"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao criar agente",
        variant: "destructive"
      });
    }
  };

  const handleDeleteAgent = async (agentId: number) => {
    try {
      await backend.admin.deleteAgent({ id: agentId });
      loadAgents();
      
      toast({
        title: "Sucesso",
        description: "Agente removido com sucesso"
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Falha ao remover agente",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gerenciamento de Agentes de IA</h1>
          <p className="text-muted-foreground">
            Crie e gerencie os agentes com estratégias de campanha específicas.
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="gap-2">
              <Plus className="h-4 w-4" />
              Adicionar Novo Agente
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Criar Novo Agente de IA</DialogTitle>
              <DialogDescription>
                Configure um novo agente especializado com sua estratégia.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nome do Agente</Label>
                <Input
                  id="name"
                  placeholder="Ex: Especialista em Campanha Comunitária"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="strategy_focus">Foco da Estratégia</Label>
                <Input
                  id="strategy_focus"
                  placeholder="Ex: Campanha Digital, Mobilização Comunitária"
                  value={formData.strategy_focus}
                  onChange={(e) => setFormData(prev => ({ ...prev, strategy_focus: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="description">Descrição da Estratégia</Label>
                <Textarea
                  id="description"
                  placeholder="Descreva a especialidade deste agente..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateAgent} disabled={!formData.name || !formData.description}>
                  Salvar Agente
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de Agentes */}
      <div className="grid gap-6">
        {agents.map((agent) => (
          <Card key={agent.id} className="w-full">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle className="text-xl">{agent.name}</CardTitle>
                  <CardDescription className="text-base">
                    {agent.description}
                  </CardDescription>
                  <div className="flex items-center gap-2">
                    <Badge variant={agent.status === 'active' ? 'default' : 'secondary'}>
                      {agent.status === 'active' ? 'Ativo' : 'Inativo'}
                    </Badge>
                    <Badge variant="outline">
                      {agent.strategy_focus}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteAgent(agent.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}

        {agents.length === 0 && (
          <Card className="w-full">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Brain className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum agente criado ainda</h3>
              <p className="text-muted-foreground text-center mb-4">
                Comece criando seu primeiro agente de IA especializado.
              </p>
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeiro Agente
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
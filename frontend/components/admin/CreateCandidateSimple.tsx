import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Target, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import backend from '~backend/client';

interface Agent {
  id: number;
  name: string;
  description: string;
  strategy_focus: string;
  status: string;
}

interface FormData {
  subdomain: string;
  name: string;
  candidateName: string;
  position: string;
  party: string;
  electionYear: number;
  city: string;
  state: string;
  assigned_agent_id?: number;
}

export default function CreateCandidateSimple() {
  const [formData, setFormData] = useState<FormData>({
    subdomain: '',
    name: '',
    candidateName: '',
    position: '',
    party: '',
    electionYear: new Date().getFullYear(),
    city: '',
    state: '',
  });
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    try {
      const response = await backend.admin.listAgentsWithKnowledge();
      setAgents(response.agents.filter(agent => agent.status === 'active'));
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao carregar agentes disponíveis",
        variant: "destructive"
      });
    }
  };

  const handleAgentSelection = (agentId: string) => {
    const agent = agents.find(a => a.id === parseInt(agentId));
    setSelectedAgent(agent || null);
    setFormData(prev => ({ ...prev, assigned_agent_id: parseInt(agentId) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await backend.admin.createCandidate({
        ...formData,
        party: formData.party || undefined,
      });
      
      toast({
        title: "Sucesso",
        description: "Candidato criado com sucesso"
      });
      
      navigate('/candidates');
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao criar candidato",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/candidates')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para candidatos
        </Button>
        <h1 className="text-3xl font-bold">Adicionar Novo Candidato</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
        {/* Dados do Candidato */}
        <Card>
          <CardHeader>
            <CardTitle>Dados Pessoais e Políticos</CardTitle>
            <CardDescription>
              Informe os dados básicos do candidato e da campanha
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="subdomain">Subdomínio</Label>
                <Input
                  id="subdomain"
                  placeholder="joao-silva-2024"
                  value={formData.subdomain}
                  onChange={(e) => setFormData(prev => ({ ...prev, subdomain: e.target.value }))}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Criará: {formData.subdomain || 'subdomain'}.prisma360.com
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="name">Nome da Campanha</Label>
                <Input
                  id="name"
                  placeholder="João Silva Prefeito 2024"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="candidateName">Nome do Candidato</Label>
                <Input
                  id="candidateName"
                  placeholder="João Silva"
                  value={formData.candidateName}
                  onChange={(e) => setFormData(prev => ({ ...prev, candidateName: e.target.value }))}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="position">Cargo</Label>
                <Input
                  id="position"
                  placeholder="Prefeito, Vereador, Deputado..."
                  value={formData.position}
                  onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="party">Partido</Label>
                <Input
                  id="party"
                  placeholder="PT, PSDB, PDT..."
                  value={formData.party}
                  onChange={(e) => setFormData(prev => ({ ...prev, party: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="electionYear">Ano da Eleição</Label>
                <Input
                  id="electionYear"
                  type="number"
                  value={formData.electionYear}
                  onChange={(e) => setFormData(prev => ({ ...prev, electionYear: parseInt(e.target.value) }))}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="state">Estado</Label>
                <Input
                  id="state"
                  placeholder="SP"
                  maxLength={2}
                  value={formData.state}
                  onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value.toUpperCase() }))}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">Cidade</Label>
              <Input
                id="city"
                placeholder="São Paulo"
                value={formData.city}
                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Seleção do Agente */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              Atribuição do Agente de IA
            </CardTitle>
            <CardDescription>
              Selecione o agente que gerará o plano de ação estratégico para este candidato
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Selecione o Agente</Label>
              <Select onValueChange={handleAgentSelection}>
                <SelectTrigger>
                  <SelectValue placeholder="Escolha um agente estratégico..." />
                </SelectTrigger>
                <SelectContent>
                  {agents.map((agent) => (
                    <SelectItem key={agent.id} value={agent.id.toString()}>
                      {agent.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedAgent && (
              <div className="p-4 bg-accent rounded-lg space-y-2">
                <h4 className="font-medium">{selectedAgent.name}</h4>
                <Badge variant="outline">{selectedAgent.strategy_focus}</Badge>
                <p className="text-sm text-muted-foreground">
                  {selectedAgent.description}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Botões de Ação */}
        <div className="flex justify-between">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => navigate('/candidates')}
          >
            Cancelar
          </Button>
          <Button 
            type="submit" 
            disabled={isLoading}
            size="lg"
          >
            {isLoading ? 'Criando...' : 'Criar Candidato'}
          </Button>
        </div>
      </form>
    </div>
  );
}
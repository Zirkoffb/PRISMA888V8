import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useBackend } from '../../hooks/useBackend';
import { useToast } from '@/components/ui/use-toast';

export default function CreateCandidate() {
  const [formData, setFormData] = useState({
    subdomain: '',
    name: '',
    candidateName: '',
    position: '',
    party: '',
    electionYear: new Date().getFullYear(),
    city: '',
    state: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const backend = useBackend();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await backend.admin.createCandidate({
        ...formData,
        party: formData.party || undefined,
      });
      
      toast({
        title: "Success",
        description: "Candidate created successfully",
      });
      
      navigate('/candidates');
    } catch (error) {
      console.error('Failed to create candidate:', error);
      toast({
        title: "Error",
        description: "Failed to create candidate",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/candidates')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to candidates
        </Button>
        <h1 className="text-3xl font-bold">Add New Candidate</h1>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Candidate Information</CardTitle>
          <CardDescription>
            Create a new candidate profile and campaign dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="subdomain">Subdomain</Label>
                <Input
                  id="subdomain"
                  placeholder="candidate-name"
                  value={formData.subdomain}
                  onChange={(e) => handleInputChange('subdomain', e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Will create: {formData.subdomain || 'subdomain'}.prisma888.com
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="name">Campaign Name</Label>
                <Input
                  id="name"
                  placeholder="Campaign for Mayor 2024"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="candidateName">Candidate Name</Label>
                <Input
                  id="candidateName"
                  placeholder="João Silva"
                  value={formData.candidateName}
                  onChange={(e) => handleInputChange('candidateName', e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="position">Position</Label>
                <Input
                  id="position"
                  placeholder="Mayor, Councilman, Deputy..."
                  value={formData.position}
                  onChange={(e) => handleInputChange('position', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="party">Party (optional)</Label>
                <Input
                  id="party"
                  placeholder="PT, PSDB, PDT..."
                  value={formData.party}
                  onChange={(e) => handleInputChange('party', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="electionYear">Election Year</Label>
                <Input
                  id="electionYear"
                  type="number"
                  value={formData.electionYear}
                  onChange={(e) => handleInputChange('electionYear', parseInt(e.target.value))}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  placeholder="São Paulo"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  placeholder="SP"
                  maxLength={2}
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value.toUpperCase())}
                  required
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={() => navigate('/candidates')}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create Candidate'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

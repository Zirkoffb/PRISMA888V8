import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useBackend } from '../../hooks/useBackend';
import { useToast } from '@/components/ui/use-toast';
import type { Candidate } from '~backend/admin/list_candidates';

export default function CandidatesList() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const backend = useBackend();
  const { toast } = useToast();

  useEffect(() => {
    loadCandidates();
  }, []);

  const loadCandidates = async () => {
    try {
      const response = await backend.admin.listCandidates();
      setCandidates(response.candidates);
    } catch (error) {
      console.error('Failed to load candidates:', error);
      toast({
        title: "Error",
        description: "Failed to load candidates",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Candidates</h1>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Candidates</h1>
        <Link to="/candidates/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Candidate
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {candidates.map((candidate) => (
          <Card key={candidate.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{candidate.candidateName}</CardTitle>
                  <CardDescription>{candidate.position}</CardDescription>
                </div>
                <Badge variant={candidate.isActive ? "default" : "secondary"}>
                  {candidate.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Campaign:</span>
                  <span>{candidate.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Party:</span>
                  <span>{candidate.party || 'Independent'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">City:</span>
                  <span>{candidate.city}, {candidate.state}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Election:</span>
                  <span>{candidate.electionYear}</span>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t flex justify-between items-center">
                <code className="text-xs bg-muted px-2 py-1 rounded">
                  {candidate.subdomain}.prisma888.com
                </code>
                <Button variant="ghost" size="sm" asChild>
                  <a 
                    href={`https://${candidate.subdomain}.prisma888.com`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {candidates.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No candidates yet</p>
          <Link to="/candidates/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add your first candidate
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}

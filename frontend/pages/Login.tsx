import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '../hooks/useAuth';
import { useSubdomain } from '../hooks/useSubdomain';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { isAdmin } = useSubdomain();

  const handleLogin = async (role: 'admin' | 'candidate') => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      login(email, password, role);
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">PRISMA888</h1>
          <p className="text-muted-foreground">Electoral Intelligence Platform</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Access Platform</CardTitle>
            <CardDescription>
              {isAdmin 
                ? "Sign in to the admin dashboard"
                : "Sign in to your candidate dashboard"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isAdmin ? (
              <Tabs defaultValue="admin" className="space-y-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="admin">Admin</TabsTrigger>
                  <TabsTrigger value="candidate">Candidate</TabsTrigger>
                </TabsList>
                <TabsContent value="admin" className="space-y-4">
                  <LoginForm 
                    email={email}
                    setEmail={setEmail}
                    password={password}
                    setPassword={setPassword}
                    onLogin={() => handleLogin('admin')}
                    isLoading={isLoading}
                    role="admin"
                  />
                </TabsContent>
                <TabsContent value="candidate" className="space-y-4">
                  <LoginForm 
                    email={email}
                    setEmail={setEmail}
                    password={password}
                    setPassword={setPassword}
                    onLogin={() => handleLogin('candidate')}
                    isLoading={isLoading}
                    role="candidate"
                  />
                </TabsContent>
              </Tabs>
            ) : (
              <LoginForm 
                email={email}
                setEmail={setEmail}
                password={password}
                setPassword={setPassword}
                onLogin={() => handleLogin('candidate')}
                isLoading={isLoading}
                role="candidate"
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface LoginFormProps {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  onLogin: () => void;
  isLoading: boolean;
  role: 'admin' | 'candidate';
}

function LoginForm({ email, setEmail, password, setPassword, onLogin, isLoading, role }: LoginFormProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <Button 
        onClick={onLogin} 
        className="w-full" 
        disabled={isLoading || !email || !password}
      >
        {isLoading ? 'Signing in...' : `Sign in as ${role}`}
      </Button>
    </div>
  );
}

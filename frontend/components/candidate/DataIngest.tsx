import { useState } from 'react';
import { Upload, FileText, BarChart, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useBackend } from '../../hooks/useBackend';
import { useToast } from '@/components/ui/use-toast';

export default function DataIngest() {
  const [isUploading, setIsUploading] = useState(false);
  const backend = useBackend();
  const { toast } = useToast();

  const uploadFile = async (file: File, endpoint: string, type: string) => {
    setIsUploading(true);
    
    try {
      const fileData = await fileToBase64(file);
      
      let response;
      switch (endpoint) {
        case 'elections':
          response = await backend.ingest.uploadElections({
            fileName: file.name,
            fileData,
          });
          break;
        case 'ibge':
          response = await backend.ingest.uploadIBGE({
            fileName: file.name,
            fileData,
          });
          break;
        case 'polls':
          response = await backend.ingest.uploadPolls({
            fileName: file.name,
            fileData,
          });
          break;
        default:
          throw new Error('Unknown endpoint');
      }
      
      toast({
        title: response.success ? "Success" : "Error",
        description: response.message,
        variant: response.success ? "default" : "destructive",
      });
    } catch (error) {
      console.error('Failed to upload file:', error);
      toast({
        title: "Error",
        description: "Failed to upload file",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]); // Remove data:type;base64, prefix
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, endpoint: string, type: string) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    await uploadFile(file, endpoint, type);
    event.target.value = ''; // Reset input
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Data Import</h1>
      </div>

      <Tabs defaultValue="elections" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="elections">Elections Data</TabsTrigger>
          <TabsTrigger value="ibge">IBGE Demographics</TabsTrigger>
          <TabsTrigger value="polls">Polls & Surveys</TabsTrigger>
        </TabsList>

        <TabsContent value="elections" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart className="mr-2 h-5 w-5" />
                Elections Data
              </CardTitle>
              <CardDescription>
                Upload CSV files containing electoral results and voting data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="elections-file">CSV File</Label>
                <Input
                  id="elections-file"
                  type="file"
                  accept=".csv"
                  onChange={(e) => handleFileUpload(e, 'elections', 'Elections')}
                  disabled={isUploading}
                />
              </div>
              
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Expected CSV Format:</h4>
                <code className="text-sm">
                  zone,section,candidate_name,party,votes,percentage,election_type,year
                </code>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ibge" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5" />
                IBGE Demographics
              </CardTitle>
              <CardDescription>
                Upload demographic data from IBGE (Brazilian Institute of Geography and Statistics)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ibge-file">CSV File</Label>
                <Input
                  id="ibge-file"
                  type="file"
                  accept=".csv"
                  onChange={(e) => handleFileUpload(e, 'ibge', 'IBGE')}
                  disabled={isUploading}
                />
              </div>
              
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Expected CSV Format:</h4>
                <code className="text-sm text-wrap">
                  zone,neighborhood,population,age_0_17,age_18_24,age_25_34,age_35_44,age_45_54,age_55_64,age_65_plus,income_0_2,income_2_5,income_5_10,income_10_plus,education_fundamental,education_medio,education_superior
                </code>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="polls" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                Polls & Surveys
              </CardTitle>
              <CardDescription>
                Upload polling data, surveys, and research reports (CSV or PDF)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="polls-file">CSV or PDF File</Label>
                <Input
                  id="polls-file"
                  type="file"
                  accept=".csv,.pdf"
                  onChange={(e) => handleFileUpload(e, 'polls', 'Polls')}
                  disabled={isUploading}
                />
              </div>
              
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Expected CSV Format:</h4>
                <code className="text-sm">
                  poll_name,date_conducted,sample_size,candidate_name,intention_percentage,rejection_percentage,confidence_level,margin_error,methodology
                </code>
                <p className="text-sm text-muted-foreground mt-2">
                  PDF files will be processed using AI for data extraction
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {isUploading && (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="flex items-center space-x-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="text-muted-foreground">Processing upload...</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Data Processing</CardTitle>
          <CardDescription>
            How your data is processed after upload
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                1
              </div>
              <div>
                <h4 className="font-medium">Upload & Validation</h4>
                <p className="text-sm text-muted-foreground">
                  Files are securely uploaded and validated for correct format
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                2
              </div>
              <div>
                <h4 className="font-medium">Data Processing</h4>
                <p className="text-sm text-muted-foreground">
                  CSV data is parsed and stored in the database with data quality checks
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                3
              </div>
              <div>
                <h4 className="font-medium">AI Analysis</h4>
                <p className="text-sm text-muted-foreground">
                  AI agents automatically analyze the data to generate insights and recommendations
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                4
              </div>
              <div>
                <h4 className="font-medium">Dashboard Updates</h4>
                <p className="text-sm text-muted-foreground">
                  Your dashboard, map, and insights are automatically updated with the new data
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

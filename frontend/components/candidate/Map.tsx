import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useBackend } from '../../hooks/useBackend';
import { useToast } from '@/components/ui/use-toast';
import type { MapDataResponse } from '~backend/candidates/map_data';

export default function Map() {
  const [mapData, setMapData] = useState<MapDataResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const backend = useBackend();
  const { toast } = useToast();

  useEffect(() => {
    loadMapData();
  }, []);

  const loadMapData = async () => {
    try {
      const response = await backend.candidates.getMapData();
      setMapData(response);
    } catch (error) {
      console.error('Failed to load map data:', error);
      toast({
        title: "Error",
        description: "Failed to load map data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Electoral Map</h1>
        <div className="animate-pulse">
          <div className="h-96 bg-muted rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (!mapData) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Failed to load map data</p>
      </div>
    );
  }

  const selectedZoneData = selectedZone 
    ? mapData.zones.find(z => z.zone === selectedZone)
    : null;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Electoral Map</h1>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Map Visualization */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Electoral Zones</CardTitle>
              <CardDescription>Click on a zone to view detailed demographics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 md:grid-cols-3 lg:grid-cols-4">
                {mapData.zones.map((zone) => {
                  const intensity = Math.min(zone.percentage / 50, 1); // Normalize to 0-1
                  const bgOpacity = Math.max(0.1, intensity);
                  
                  return (
                    <div
                      key={zone.zone}
                      className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                        selectedZone === zone.zone ? 'ring-2 ring-primary' : ''
                      }`}
                      style={{
                        backgroundColor: `rgba(59, 130, 246, ${bgOpacity})`,
                      }}
                      onClick={() => setSelectedZone(zone.zone)}
                    >
                      <div className="text-center">
                        <h3 className="font-medium text-sm">Zone {zone.zone}</h3>
                        <p className="text-xs text-muted-foreground">
                          {zone.totalVotes.toLocaleString()} votes
                        </p>
                        <Badge variant="secondary" className="mt-1 text-xs">
                          {zone.percentage.toFixed(1)}%
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Zone Details */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Zone Details</CardTitle>
              <CardDescription>
                {selectedZoneData ? `Zone ${selectedZoneData.zone}` : 'Select a zone to view details'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedZoneData ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Electoral Data</h4>
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span>Total Votes:</span>
                        <span>{selectedZoneData.totalVotes.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Percentage:</span>
                        <span>{selectedZoneData.percentage.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Population:</span>
                        <span>{selectedZoneData.population.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">Age Groups</h4>
                    <div className="text-sm space-y-1">
                      {Object.entries(selectedZoneData.demographics.ageGroups).map(([age, count]) => (
                        <div key={age} className="flex justify-between">
                          <span>{age}:</span>
                          <span>{count.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">Income Groups</h4>
                    <div className="text-sm space-y-1">
                      {Object.entries(selectedZoneData.demographics.incomeGroups).map(([income, count]) => (
                        <div key={income} className="flex justify-between">
                          <span>{income}:</span>
                          <span>{count.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">Education</h4>
                    <div className="text-sm space-y-1">
                      {Object.entries(selectedZoneData.demographics.educationGroups).map(([education, count]) => (
                        <div key={education} className="flex justify-between">
                          <span>{education}:</span>
                          <span>{count.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">
                  Click on a zone in the map to view detailed demographic information.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import MapVisualization from './components/MapVisualization';
import ZoneDetails from './components/ZoneDetails';
import { Layers } from 'lucide-react';

function App() {
  const [zones, setZones] = useState([]);
  const [selectedZoneId, setSelectedZoneId] = useState(null);
  const [selectedZoneData, setSelectedZoneData] = useState(null);
  const [loadingMap, setLoadingMap] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  useEffect(() => {
    // Fetch all zones for map
    fetch(`${API_URL}/api/zones`)
      .then(res => res.json())
      .then(data => {
        setZones(data);
        setLoadingMap(false);
      })
      .catch(err => {
        console.error("Failed to fetch zones", err);
        setLoadingMap(false);
      });
  }, [API_URL]);

  const handleZoneSelect = (zoneId) => {
    setSelectedZoneId(zoneId);
    setLoadingDetails(true);
    fetch(`${API_URL}/api/zones/${zoneId}`)
      .then(res => res.json())
      .then(data => {
        setSelectedZoneData(data);
        setLoadingDetails(false);
      })
      .catch(err => {
        console.error("Failed to fetch zone details", err);
        setLoadingDetails(false);
      });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', padding: '16px', gap: '16px', background: 'var(--bg-primary)' }}>
      
      {/* Header */}
      <header className="glass-panel" style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ background: 'linear-gradient(135deg, var(--accent-primary), #a78bfa)', padding: '10px', borderRadius: '12px', boxShadow: '0 0 20px var(--accent-glow)' }}>
          <Layers size={24} color="white" />
        </div>
        <div>
          <h1 className="heading-gradient" style={{ margin: 0, fontSize: '20px', letterSpacing: '0.5px' }}>Urbix Analytics</h1>
          <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>Predictive Urban Growth Modeling</p>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ display: 'flex', gap: '16px', flex: 1, minHeight: 0 }}>
        
        {/* Map Section */}
        <section className="glass-panel" style={{ flex: 2, padding: '8px', position: 'relative' }}>
          {loadingMap ? (
            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ color: 'var(--text-muted)' }}>Loading Geospatial Data...</p>
            </div>
          ) : (
            <MapVisualization 
              zones={zones} 
              selectedZoneId={selectedZoneId} 
              onZoneSelect={handleZoneSelect} 
            />
          )}
        </section>

        {/* Sidebar Section */}
        <aside style={{ flex: 1, minWidth: '350px', maxWidth: '450px' }}>
          <ZoneDetails 
            zoneData={selectedZoneData} 
            loading={loadingDetails} 
          />
        </aside>

      </main>
    </div>
  );
}

export default App;

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Polygon, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons not showing up due to Webpack/Vite asset compilation
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const MapUpdater = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

const MapVisualization = ({ zones, selectedZoneId, onZoneSelect }) => {
  const defaultCenter = [19.0760, 72.8777]; // Mumbai center

  const getColor = (score) => {
    if (!score) return 'gray';
    if (score >= 70) return 'var(--growth-high)'; // High growth
    if (score >= 40) return 'var(--growth-med)';  // Med growth
    return 'var(--growth-low)';                   // Low growth
  };

  return (
    <div className="map-wrapper" style={{ height: '100%', width: '100%', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
      <MapContainer 
        center={defaultCenter} 
        zoom={11} 
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        <MapUpdater center={defaultCenter} zoom={11} />
        
        {zones.map((zone) => {
          const isSelected = zone.id === selectedZoneId;
          const score = zone.scores?.growth_velocity_score || 0;
          
          return (
            <Polygon
              key={zone.id}
              positions={zone.coordinates[0].map(coord => [coord[1], coord[0]])}
              pathOptions={{
                fillColor: getColor(score),
                fillOpacity: isSelected ? 0.8 : 0.4,
                color: isSelected ? '#ffffff' : getColor(score),
                weight: isSelected ? 3 : 1
              }}
              eventHandlers={{
                click: () => onZoneSelect(zone.id)
              }}
            >
              <Popup className="custom-popup">
                <div style={{ padding: '4px', textAlign: 'center' }}>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '14px' }}>{zone.name}</h4>
                  <p style={{ margin: '0', fontSize: '12px', color: 'var(--text-secondary)' }}>Score: {score}/100</p>
                </div>
              </Popup>
            </Polygon>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default MapVisualization;

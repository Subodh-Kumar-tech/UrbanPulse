import { useStore } from '@/lib/Store';
import { MapContainer, TileLayer, Marker, Popup, Circle, GeoJSON } from 'react-leaflet';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { FadeIn } from '@/components/ui/Animations';
import { MapPin, AlertCircle, Maximize2 } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import { useEffect, useState } from 'react';
import { useLanguage } from '@/lib/LanguageContext';

// Custom colored markers
const createIcon = (color) => L.divIcon({
  html: `<div style="width:14px;height:14px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.4)"></div>`,
  className: '',
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

const STATUS_COLORS = {
  'Pending': '#ef4444',
  'In Progress': '#f59e0b',
  'Resolved': '#22c55e',
};

const PRIORITY_RADIUS = { Critical: 300, High: 200, Medium: 120, Low: 60 };

export default function CityMap() {
  const { complaints } = useStore();
  const { t } = useLanguage();
  const [boundaryGeo, setBoundaryGeo] = useState(null);
  
  // Optional: Load city boundary GeoJSON here if needed in the future

  const withCoords = complaints.filter(c => c.coordinates?.lat && c.coordinates?.lng);
  const patnaCenter = [25.5941, 85.1376];

  return (
    <div className="container mx-auto px-4 py-8">
      <FadeIn className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold mb-1 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center shadow-lg shadow-primary/30">
                <Maximize2 className="w-5 h-5 text-white" />
              </div>
              {t.cityExplorer}
            </h1>
            <p className="text-muted-foreground italic">{t.fullCoverage}</p>
          </div>

        </div>
      </FadeIn>

      {/* Legend */}
      <FadeIn delay={0.1} className="flex flex-wrap gap-4 mb-4">
        {Object.entries(STATUS_COLORS).map(([status, color]) => (
          <div key={status} className="flex items-center gap-2 glass-card px-3 py-2 rounded-lg text-[10px] uppercase tracking-wider font-bold">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
            {status}
          </div>
        ))}
        <div className="flex items-center gap-2 glass-card px-3 py-2 rounded-lg text-[10px] uppercase tracking-wider font-bold text-muted-foreground border-dashed">
          <AlertCircle className="w-3 h-3" /> Priority Radii
        </div>
      </FadeIn>

      {/* Map Container */}
      <FadeIn delay={0.2} className="glass-card overflow-hidden rounded-2xl border-2 border-primary/10 shadow-2xl relative" style={{ height: '70vh' }}>
        <MapContainer 
          center={patnaCenter} 
          zoom={8} 
          minZoom={5} 
          maxZoom={18}
          style={{ height: '100%', width: '100%' }}
        >
          {/* Premium Tile Layer: CartoDB Voyager (Clear & Modern) */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />

          {/* Regional Boundary Highlight (Optional) */}
          {boundaryGeo && (
            <GeoJSON 
              data={boundaryGeo} 
              style={{
                color: '#3b82f6',
                weight: 2,
                fillColor: '#3b82f6',
                fillOpacity: 0.03,
                dashArray: '5, 10'
              }} 
            />
          )}

          <MarkerClusterGroup
            showCoverageOnHover={false}
            maxClusterRadius={40}
            spiderfyOnMaxZoom={true}
          >
            {withCoords.map(c => {
              if (!c.coordinates?.lat || !c.coordinates?.lng) return null;
              const pos = [c.coordinates.lat, c.coordinates.lng];
              const color = STATUS_COLORS[c.status] || '#6b7280';
              const radius = PRIORITY_RADIUS[c.priority] || 120;
              return (
                <div key={c._id}>
                  {/* Subtle impact radius for critical/high priority */}
                  <Circle
                    center={pos}
                    radius={radius}
                    pathOptions={{ color, fillColor: color, fillOpacity: 0.15, weight: 1 }}
                  />
                  <Marker position={pos} icon={createIcon(color)}>
                    <Popup className="custom-popup">
                      <div className="min-w-[180px] p-1">
                        <div className="flex justify-between items-start gap-2 mb-1">
                          <span className="text-[10px] font-bold uppercase tracking-tighter text-primary">{c.category || 'Issue'}</span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                            c.priority === 'Critical' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {c.priority || 'Normal'}
                          </span>
                        </div>
                        <div className="font-bold text-sm leading-tight mb-1">{c.title || 'Untitled'}</div>
                        <div className="text-[11px] text-muted-foreground flex items-center gap-1 mb-3">
                          <MapPin className="w-3 h-3" /> {c.location || 'Unknown'}
                        </div>
                        <div className="flex items-center justify-between border-t pt-2 mt-2">
                           <span className="text-[10px] font-medium text-muted-foreground">Status: <span style={{ color }}>{c.status || 'Pending'}</span></span>
                           <Link to={`/issue/${c._id}`} className="text-[11px] text-blue-600 hover:underline font-bold">
                            {t.details}
                           </Link>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                </div>
              );
            })}
          </MarkerClusterGroup>
        </MapContainer>

        {/* Map Overlay info */}
        <div className="absolute top-4 right-4 z-[1000] glass-card px-4 py-3 text-right">
          <div className="text-lg font-bold text-primary">{withCoords.length}</div>
          <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{t.activeReports}</div>
        </div>
        
        <div className="absolute bottom-6 left-6 z-[1000] flex flex-col gap-2">
           <div className="glass-card px-3 py-2 text-[10px] font-bold bg-white/90 backdrop-blur border-none shadow-xl">
             📍 {t.cityCenter}
           </div>
           <div className="glass-card px-3 py-2 text-[10px] font-bold bg-white/90 backdrop-blur border-none shadow-xl">
             🌍 {t.fullCoverage}
           </div>
        </div>
      </FadeIn>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {withCoords.slice(0, 4).map(c => (
          <div key={c._id} className="glass-card p-4 hover:shadow-xl transition-all group border-primary/5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-2 h-2 rounded-full" style={{ background: STATUS_COLORS[c.status] }} />
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{c.category}</p>
            </div>
            <p className="text-sm font-bold mb-2 line-clamp-1 group-hover:text-primary transition-colors">{c.title}</p>
            <div className="flex items-center justify-between mt-auto">
               <span className="text-[10px] text-muted-foreground">{c.location}</span>
               <Link to={`/issue/${c._id}`}>
                 <Button variant="ghost" size="sm" className="h-7 text-[10px] font-bold">Manage</Button>
               </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

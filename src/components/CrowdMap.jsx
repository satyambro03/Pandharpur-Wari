import React, { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import { useTranslation } from 'react-i18next';
import { useCrowdDensity } from '../hooks/useCrowdDensity';
import { usePOI } from '../hooks/usePOI';
import { POI_CATEGORIES } from '../lib/mockData';
import { useTheme } from '../context/ThemeContext';

const STATUS_COLORS = {
  green: '#22C55E',
  orange: '#F97316',
  red: '#EF4444',
};

const STATUS_WEIGHT = { green: 4, orange: 5, red: 6 };

const POI_ICONS = {
  food: '🍛',
  medical: '🏥',
  water: '💧',
  parking: '🅿️',
  stay: '🏠',
  women_safety: '🛡️',
};

function createPOIIcon(category) {
  return L.divIcon({
    className: 'custom-poi-icon',
    html: `<div style="font-size:22px;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.3));text-align:center;">${POI_ICONS[category] || '📍'}</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
}

function UserLocationMarker() {
  const [position, setPosition] = useState(null);
  const map = useMap();

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = [pos.coords.latitude, pos.coords.longitude];
        setPosition(coords);
        map.flyTo(coords, 13, { duration: 1.5 });
      },
      () => {},
      { enableHighAccuracy: true }
    );
  }, [map]);

  if (!position) return null;

  return (
    <>
      <Circle
        center={position}
        radius={50}
        pathOptions={{ color: '#3B82F6', fillColor: '#3B82F6', fillOpacity: 0.15, weight: 1 }}
      />
      <Marker
        position={position}
        icon={L.divIcon({
          className: '',
          html: '<div class="user-location-dot"></div>',
          iconSize: [14, 14],
          iconAnchor: [7, 7],
        })}
      />
    </>
  );
}

export default function CrowdMap({ activeCategories = [], showUserLocation = true, fullscreen = false, darkTiles = false }) {
  const { t } = useTranslation();
  const { routes } = useCrowdDensity();
  const { pois } = usePOI();
  const { dark } = useTheme();

  const useDarkTiles = darkTiles || dark;

  const filteredPOIs = useMemo(() => {
    if (activeCategories.length === 0) return pois;
    return pois.filter(p => activeCategories.includes(p.category));
  }, [pois, activeCategories]);

  const center = [18.0, 74.3]; // Center of Wari route
  const tileUrl = useDarkTiles
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  return (
    <MapContainer
      center={center}
      zoom={8}
      className={`w-full ${fullscreen ? 'h-full' : 'h-[60vh]'} rounded-xl z-0`}
      zoomControl={false}
      attributionControl={false}
    >
      <TileLayer url={tileUrl} />

      {showUserLocation && <UserLocationMarker />}

      {/* Route polylines */}
      {routes.map(route => {
        const coords = (route.coordinates || []).map(c => [c.lat, c.lng]);
        if (coords.length < 2) return null;
        return (
          <Polyline
            key={route.route_id}
            positions={coords}
            pathOptions={{
              color: STATUS_COLORS[route.status] || '#22C55E',
              weight: STATUS_WEIGHT[route.status] || 4,
              opacity: 0.85,
              lineCap: 'round',
              lineJoin: 'round',
            }}
          >
            <Popup>
              <div className="text-sm font-bold">{route.nameKey ? t(route.nameKey) : route.route_name}</div>
              <div className="text-xs mt-1">
                <span
                  className="inline-block w-2 h-2 rounded-full mr-1"
                  style={{ backgroundColor: STATUS_COLORS[route.status] }}
                />
                {route.crowd_count} {t('home.people')}
                {' — '}
                {route.status === 'green' && t('map.low_crowd')}
                {route.status === 'orange' && t('map.moderate_crowd')}
                {route.status === 'red' && t('map.heavy_crowd')}
              </div>
            </Popup>
          </Polyline>
        );
      })}

      {/* POI markers */}
      {filteredPOIs.map(poi => (
        <Marker
          key={poi.id || `${poi.latitude}-${poi.longitude}`}
          position={[poi.latitude, poi.longitude]}
          icon={createPOIIcon(poi.category)}
        >
          <Popup>
            <div className="text-sm font-bold">{poi.nameKey ? t(poi.nameKey) : poi.name}</div>
            <div className="text-xs text-gray-500 mt-0.5">{t(`poi.${poi.category}`)}</div>
            {poi.contact && <div className="text-xs mt-1">📞 {poi.contact}</div>}
            <div className={`text-xs mt-1 font-medium ${poi.capacity_status === 'full' ? 'text-red-500' : 'text-green-600'}`}>
              {t(`poi.${poi.capacity_status}`)}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

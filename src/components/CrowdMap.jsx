import React, { useEffect, useState, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import { useTranslation } from 'react-i18next';
import { usePOI } from '../hooks/usePOI';
import { WARI_ROUTE_OPTIONS, POI_CATEGORIES } from '../lib/mockData';
import { useTheme } from '../context/ThemeContext';
import { Layers, Navigation, Crosshair, ZoomIn, ZoomOut, Phone, Compass, MapPin, CheckCircle2, AlertCircle, Users, Activity } from 'lucide-react';

const STATUS_COLORS = {
  green: '#22C55E',
  orange: '#F97316',
  red: '#EF4444',
};

const STATUS_WEIGHT = { green: 5, orange: 6, red: 7 };

const TILE_PROVIDERS = {
  google_standard: {
    nameKey: 'map.google_map',
    url: 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
    attribution: '&copy; Google Maps',
    maxZoom: 20,
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
  },
  google_hybrid: {
    nameKey: 'map.google_satellite',
    url: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
    attribution: '&copy; Google Maps Satellite',
    maxZoom: 20,
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
  },
  google_terrain: {
    nameKey: 'map.google_terrain',
    url: 'https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}',
    attribution: '&copy; Google Maps Terrain',
    maxZoom: 20,
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
  },
  dark: {
    nameKey: 'map.dark_map',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; CARTO',
    maxZoom: 19,
    subdomains: 'abcd',
  },
  osm: {
    nameKey: 'map.osm_map',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap',
    maxZoom: 19,
    subdomains: 'abc',
  },
};

const CATEGORY_STYLES = {
  medical: { bg: 'bg-red-500', border: 'border-red-600', text: 'text-red-500', shadow: 'shadow-red-500/40', emoji: '🏥', color: '#EF4444' },
  water: { bg: 'bg-sky-500', border: 'border-sky-600', text: 'text-sky-500', shadow: 'shadow-sky-500/40', emoji: '💧', color: '#0EA5E9' },
  food: { bg: 'bg-amber-500', border: 'border-amber-600', text: 'text-amber-500', shadow: 'shadow-amber-500/40', emoji: '🍛', color: '#F59E0B' },
  parking: { bg: 'bg-slate-600', border: 'border-slate-700', text: 'text-slate-600', shadow: 'shadow-slate-600/40', emoji: '🅿️', color: '#64748B' },
  safety: { bg: 'bg-purple-600', border: 'border-purple-700', text: 'text-purple-600', shadow: 'shadow-purple-600/40', emoji: '🛡️', color: '#8B5CF6' },
  women_safety: { bg: 'bg-pink-600', border: 'border-pink-700', text: 'text-pink-600', shadow: 'shadow-pink-600/40', emoji: '🛡️', color: '#EC4899' },
  stay: { bg: 'bg-emerald-600', border: 'border-emerald-700', text: 'text-emerald-600', shadow: 'shadow-emerald-600/40', emoji: '🏠', color: '#10B981' },
};

function createCustomPOIIcon(category, isPulsing = false) {
  const style = CATEGORY_STYLES[category] || CATEGORY_STYLES.medical;
  const pulseHtml = isPulsing
    ? `<div style="position:absolute;inset:-6px;border-radius:9999px;background-color:${style.color};opacity:0.4;animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></div>`
    : '';

  return L.divIcon({
    className: 'custom-poi-marker',
    html: `
      <div style="position:relative;display:flex;align-items:center;justify-center;width:34px;height:34px;cursor:pointer;">
        ${pulseHtml}
        <div style="width:34px;height:34px;background-color:${style.color};border:2px solid #ffffff;border-radius:12px;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 10px rgba(0,0,0,0.35);font-size:17px;transform:rotate(-45deg);position:relative;z-index:2;">
          <span style="transform:rotate(45deg);display:inline-block;line-height:1;">${style.emoji}</span>
        </div>
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -18],
  });
}

function MapControls({ onLocateMe, onRecenter, currentTile, setTileLayer, showCrowd, setShowCrowd }) {
  const { t } = useTranslation();
  const map = useMap();
  const [showLayerMenu, setShowLayerMenu] = useState(false);

  return (
    <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-2 pointer-events-auto select-none">
      {/* Map Layer Switcher */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setShowLayerMenu(!showLayerMenu)}
          className="w-10 h-10 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-lg border border-slate-200/80 dark:border-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:text-wari-saffron transition-all active:scale-95"
          title="Switch Google Map Layer"
        >
          <Layers size={18} />
        </button>

        {showLayerMenu && (
          <div className="absolute right-12 top-0 w-48 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-2 space-y-1 z-50">
            <div className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1 tracking-wider">
              {t('map.google_map') || 'Google Map Style'}
            </div>
            {Object.entries(TILE_PROVIDERS).map(([key, provider]) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setTileLayer(key);
                  setShowLayerMenu(false);
                }}
                className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                  currentTile === key
                    ? 'bg-wari-saffron/15 text-wari-saffron font-bold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span>{t(provider.nameKey) || provider.nameKey}</span>
                {currentTile === key && <span className="w-1.5 h-1.5 rounded-full bg-wari-saffron" />}
              </button>
            ))}

            <div className="border-t border-slate-100 dark:border-slate-800 my-1 pt-1">
              <button
                type="button"
                onClick={() => setShowCrowd(!showCrowd)}
                className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                  showCrowd
                    ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 font-bold'
                    : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span>{t('map.crowd_layer')}</span>
                <span className={`w-2 h-2 rounded-full ${showCrowd ? 'bg-emerald-500' : 'bg-slate-400'}`} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Locate Me */}
      <button
        type="button"
        onClick={onLocateMe}
        className="w-10 h-10 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-lg border border-slate-200/80 dark:border-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:text-blue-500 transition-all active:scale-95"
        title="Find My GPS Location"
      >
        <Crosshair size={18} />
      </button>

      {/* Recenter Wari Route */}
      <button
        type="button"
        onClick={onRecenter}
        className="w-10 h-10 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-lg border border-slate-200/80 dark:border-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:text-wari-saffron transition-all active:scale-95"
        title="Recenter to Pilgrimage Route"
      >
        <Navigation size={18} />
      </button>

      {/* Zoom In & Out */}
      <div className="flex flex-col rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-lg border border-slate-200/80 dark:border-slate-800 overflow-hidden">
        <button
          type="button"
          onClick={() => map.zoomIn()}
          className="w-10 h-9 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all border-b border-slate-100 dark:border-slate-800"
          title="Zoom In"
        >
          <ZoomIn size={16} />
        </button>
        <button
          type="button"
          onClick={() => map.zoomOut()}
          className="w-10 h-9 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all"
          title="Zoom Out"
        >
          <ZoomOut size={16} />
        </button>
      </div>
    </div>
  );
}

function UserLocationHandler({ triggerLocate, centerCoords }) {
  const [userPos, setUserPos] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const map = useMap();

  useEffect(() => {
    if (triggerLocate) {
      if (!navigator.geolocation) {
        alert('Geolocation is not supported by your browser');
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = [pos.coords.latitude, pos.coords.longitude];
          setUserPos(coords);
          setAccuracy(pos.coords.accuracy || 40);
          map.flyTo(coords, 14, { duration: 1.5 });
        },
        (err) => {
          console.warn('Geolocation failed:', err);
        },
        { enableHighAccuracy: true }
      );
    }
  }, [triggerLocate, map]);

  return (
    <>
      {userPos && (
        <>
          <Circle
            center={userPos}
            radius={accuracy || 50}
            pathOptions={{ color: '#3B82F6', fillColor: '#3B82F6', fillOpacity: 0.15, weight: 1.5 }}
          />
          <Marker
            position={userPos}
            icon={L.divIcon({
              className: 'user-loc-pin',
              html: `
                <div style="position:relative;width:18px;height:18px;display:flex;align-items:center;justify-content:center;">
                  <div style="position:absolute;inset:-6px;border-radius:9999px;background-color:#3B82F6;opacity:0.35;animation:ping 2s cubic-bezier(0,0,0.2,1) infinite;"></div>
                  <div style="width:16px;height:16px;background-color:#2563EB;border:3px solid #ffffff;border-radius:9999px;box-shadow:0 2px 6px rgba(0,0,0,0.4);"></div>
                </div>
              `,
              iconSize: [18, 18],
              iconAnchor: [9, 9],
            })}
          >
            <Popup>
              <div className="text-xs font-bold text-slate-900">📍 You are here / आपले स्थान</div>
            </Popup>
          </Marker>
        </>
      )}
    </>
  );
}

function MapRecenterHandler({ centerTrigger, centerCoords, zoomLevel = 8 }) {
  const map = useMap();
  useEffect(() => {
    if (centerTrigger) {
      map.flyTo(centerCoords, zoomLevel, { duration: 1.2 });
    }
  }, [centerTrigger, centerCoords, zoomLevel, map]);
  return null;
}

export default function CrowdMap({
  selectedRouteId = 'dnyaneshwar',
  activeCategories = [],
  showUserLocation = true,
  fullscreen = false,
  darkTiles = false,
  searchQuery = '',
  onPOISelect,
  onSegmentSelect,
}) {
  const { t } = useTranslation();
  const { pois } = usePOI();
  const { dark } = useTheme();

  // Default to Google Standard Map
  const [currentTile, setCurrentTile] = useState('google_standard');
  const [showCrowd, setShowCrowd] = useState(true);
  const [locateCount, setLocateCount] = useState(0);
  const [recenterCount, setRecenterCount] = useState(0);

  const centerCoords = [18.15, 74.5]; // Center of Wari routes

  // Active Route Option
  const activeRoute = useMemo(() => {
    return WARI_ROUTE_OPTIONS.find((r) => r.id === selectedRouteId) || WARI_ROUTE_OPTIONS[0];
  }, [selectedRouteId]);

  // Filter POIs by Category and Search Query
  const filteredPOIs = useMemo(() => {
    let result = pois;

    // Filter by category
    if (activeCategories.length > 0) {
      result = result.filter((p) => activeCategories.includes(p.category));
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((p) => {
        const name = (p.name || '').toLowerCase();
        const landmark = (p.landmark || '').toLowerCase();
        const cat = (p.category || '').toLowerCase();
        const translatedName = p.nameKey ? t(p.nameKey).toLowerCase() : '';
        return name.includes(q) || landmark.includes(q) || cat.includes(q) || translatedName.includes(q);
      });
    }

    return result;
  }, [pois, activeCategories, searchQuery, t]);

  const activeProvider = TILE_PROVIDERS[currentTile] || TILE_PROVIDERS.google_standard;

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={centerCoords}
        zoom={8}
        className={`w-full ${fullscreen ? 'h-full' : 'h-[60vh]'} rounded-2xl z-0 overflow-hidden shadow-inner`}
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer
          key={currentTile}
          url={activeProvider.url}
          maxZoom={activeProvider.maxZoom}
          subdomains={activeProvider.subdomains}
        />

        {/* Map Interactive Controls */}
        <MapControls
          currentTile={currentTile}
          setTileLayer={setCurrentTile}
          showCrowd={showCrowd}
          setShowCrowd={setShowCrowd}
          onLocateMe={() => setLocateCount((c) => c + 1)}
          onRecenter={() => setRecenterCount((c) => c + 1)}
        />

        {/* GPS Locator & Recenter Handlers */}
        {showUserLocation && (
          <UserLocationHandler triggerLocate={locateCount} centerCoords={centerCoords} />
        )}
        <MapRecenterHandler centerTrigger={recenterCount} centerCoords={centerCoords} zoomLevel={8} />

        {/* Multi-Route Crowd Density Polylines */}
        {showCrowd &&
          activeRoute.segments.map((segment) => {
            const coords = (segment.coordinates || []).map((c) => [c.lat, c.lng]);
            if (coords.length < 2) return null;

            return (
              <React.Fragment key={segment.id}>
                {/* Route Casing Shadow for High Contrast on any Map style */}
                <Polyline
                  positions={coords}
                  pathOptions={{
                    color: '#ffffff',
                    weight: (STATUS_WEIGHT[segment.status] || 5) + 3,
                    opacity: 0.8,
                    lineCap: 'round',
                    lineJoin: 'round',
                  }}
                />

                {/* Primary Crowd Color Polyline (Green / Orange / Red) */}
                <Polyline
                  positions={coords}
                  pathOptions={{
                    color: STATUS_COLORS[segment.status] || '#22C55E',
                    weight: STATUS_WEIGHT[segment.status] || 5,
                    opacity: 0.95,
                    lineCap: 'round',
                    lineJoin: 'round',
                  }}
                  eventHandlers={{
                    click: () => onSegmentSelect?.(segment),
                  }}
                >
                  <Popup className="custom-route-popup" minWidth={230}>
                    <div className="p-1.5 text-slate-900 font-sans space-y-2">
                      <div className="flex items-center justify-between gap-1 border-b border-slate-100 pb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          {activeRoute.nameKey ? t(activeRoute.nameKey) : activeRoute.name}
                        </span>
                        <span
                          className="text-[10px] font-extrabold px-2 py-0.5 rounded-full text-white"
                          style={{ backgroundColor: STATUS_COLORS[segment.status] }}
                        >
                          {segment.status === 'green' && (t('map.low_crowd') || 'Low Crowd')}
                          {segment.status === 'orange' && (t('map.moderate_crowd') || 'Moderate Crowd')}
                          {segment.status === 'red' && (t('map.heavy_crowd') || 'Heavy Crowd')}
                        </span>
                      </div>

                      <div>
                        <div className="text-xs font-bold text-slate-900">
                          {segment.nameKey ? t(segment.nameKey) : segment.name}
                        </div>
                        <div className="text-[11px] text-slate-600 mt-1 flex items-center justify-between font-medium">
                          <span>📍 {segment.distanceKm} km</span>
                          <span>⏳ ~{segment.walkingHours} hrs walking</span>
                        </div>
                      </div>

                      <div className="bg-slate-50 rounded-xl p-2 flex items-center justify-between text-xs font-semibold text-slate-800">
                        <div className="flex items-center gap-1.5">
                          <Users size={13} className="text-slate-500" />
                          <span>{segment.crowd_count?.toLocaleString()} {t('home.people') || 'Pilgrims'}</span>
                        </div>
                        <div className="text-[11px] font-bold" style={{ color: STATUS_COLORS[segment.status] }}>
                          {segment.status === 'green' ? '🟢 Smooth' : segment.status === 'orange' ? '🟠 Caution' : '🔴 Bottleneck'}
                        </div>
                      </div>
                    </div>
                  </Popup>
                </Polyline>
              </React.Fragment>
            );
          })}

        {/* POI markers for Hospitals, Water, Food, Parking, Safety, Stay */}
        {filteredPOIs.map((poi) => {
          const style = CATEGORY_STYLES[poi.category] || CATEGORY_STYLES.medical;
          const isAvailable = poi.capacity_status !== 'full';

          return (
            <Marker
              key={poi.id || `${poi.latitude}-${poi.longitude}`}
              position={[poi.latitude, poi.longitude]}
              icon={createCustomPOIIcon(poi.category, poi.category === 'medical')}
              eventHandlers={{
                click: () => onPOISelect?.(poi),
              }}
            >
              <Popup className="custom-poi-popup" minWidth={230} maxWidth={280}>
                <div className="p-1 space-y-2 text-slate-900 font-sans">
                  {/* Category Header */}
                  <div className="flex items-center justify-between gap-1 border-b border-slate-100 pb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 flex items-center gap-1">
                      <span>{style.emoji}</span>
                      <span>{t(`poi.${poi.category}`) || poi.category}</span>
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                        isAvailable
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {isAvailable ? <CheckCircle2 size={10} /> : <AlertCircle size={10} />}
                      <span>{t(`poi.${poi.capacity_status}`) || poi.capacity_status}</span>
                    </span>
                  </div>

                  {/* Title & Landmark */}
                  <div>
                    <h4 className="text-xs font-bold leading-tight text-slate-900">
                      {poi.nameKey ? t(poi.nameKey) : poi.name}
                    </h4>
                    {poi.landmark && (
                      <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5 font-medium">
                        <MapPin size={11} className="text-slate-400 flex-shrink-0" />
                        <span className="truncate">{poi.landmark}</span>
                      </p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-1.5 pt-1">
                    {poi.contact ? (
                      <a
                        href={`tel:${poi.contact}`}
                        className="py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 transition-colors text-center no-underline"
                      >
                        <Phone size={11} className="text-emerald-600" />
                        <span>{t('helpline.call')}</span>
                      </a>
                    ) : (
                      <div className="py-1.5 px-2 bg-slate-50 text-slate-400 rounded-xl text-[10px] font-medium text-center">
                        Free Seva
                      </div>
                    )}

                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${poi.latitude},${poi.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-1.5 px-2 bg-gradient-to-r from-wari-saffron to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 transition-all shadow-sm shadow-orange-500/20 text-center no-underline"
                    >
                      <Compass size={12} />
                      <span>{t('map.open_directions') ? 'Directions' : 'Maps'}</span>
                    </a>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}

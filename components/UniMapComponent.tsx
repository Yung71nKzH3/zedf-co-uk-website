'use client';

import { useState, useEffect, useRef } from 'react';
import { UoPBuilding, getGoogleMapsSearchUrl, getGoogleMapsDirUrl } from '@/lib/uop-buildings';
import { MapPin, Layers } from 'lucide-react';

interface UniMapProps {
  buildings: UoPBuilding[];
  selectedBuilding: UoPBuilding | null;
  onSelectBuilding: (building: UoPBuilding) => void;
}

export default function UniMapComponent({
  buildings,
  selectedBuilding,
  onSelectBuilding,
}: UniMapProps) {
  const [mapMode, setMapMode] = useState<'google' | 'interactive'>('google');
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<import('leaflet').Map | null>(null);
  const markersRef = useRef<Record<string, import('leaflet').Marker>>({});
  const onSelectRef = useRef(onSelectBuilding);
  onSelectRef.current = onSelectBuilding;

  // Initialize and clean up Leaflet map when toggling interactive mode
  useEffect(() => {
    if (mapMode !== 'interactive' || !mapContainerRef.current) return;

    let isMounted = true;
    let resizeTimer: ReturnType<typeof setTimeout> | null = null;

    import('leaflet').then((L) => {
      if (!isMounted || !mapContainerRef.current) return;

      const map = L.map(mapContainerRef.current, {
        center: selectedBuilding
          ? [selectedBuilding.lat, selectedBuilding.lng]
          : [50.7958, -1.0955],
        zoom: 16,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;

      // Ensure tiles and container dimensions settle after dynamic mount
      resizeTimer = setTimeout(() => {
        if (isMounted && mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 120);
    });

    return () => {
      isMounted = false;
      if (resizeTimer) clearTimeout(resizeTimer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      markersRef.current = {};
    };
  }, [mapMode]);

  // Sync markers and flyTo when buildings or selectedBuilding change
  useEffect(() => {
    if (mapMode !== 'interactive' || !mapInstanceRef.current) return;

    let isMounted = true;

    import('leaflet').then((L) => {
      const map = mapInstanceRef.current;
      if (!isMounted || !map) return;

      Object.values(markersRef.current).forEach((m) => map.removeLayer(m));
      markersRef.current = {};

      buildings.forEach((building) => {
        const isSelected = selectedBuilding?.id === building.id;
        const pinColor = isSelected ? '#06b6d4' : '#1e293b';
        const strokeColor = isSelected ? '#ffffff' : '#06b6d4';

        const customIcon = L.divIcon({
          className: 'custom-uop-svg-marker',
          html: `
            <div style="position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; transform: ${isSelected ? 'scale(1.2)' : 'scale(1)'}; transition: transform 0.2s ease;">
              <svg width="32" height="42" viewBox="0 0 32 42" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 4px 6px rgba(0,0,0,0.4));">
                <path d="M16 0C7.16344 0 0 7.16344 0 16C0 28 16 42 16 42C16 42 32 28 32 16C32 7.16344 24.8366 0 16 0Z" fill="${pinColor}" stroke="${strokeColor}" stroke-width="2"/>
                <circle cx="16" cy="16" r="6" fill="${isSelected ? '#000000' : '#38bdf8'}" />
              </svg>
              <div style="
                position: absolute;
                bottom: -18px;
                left: 50%;
                transform: translateX(-50%);
                background: #0f172a;
                color: #38bdf8;
                border: 1px solid #06b6d4;
                font-size: 10px;
                font-weight: 800;
                padding: 1px 6px;
                border-radius: 6px;
                white-space: nowrap;
                box-shadow: 0 2px 5px rgba(0,0,0,0.5);
              ">
                ${building.shortCode}
              </div>
            </div>
          `,
          iconSize: [32, 42],
          iconAnchor: [16, 42],
          popupAnchor: [0, -42],
        });

        const marker = L.marker([building.lat, building.lng], { icon: customIcon }).addTo(map);

        const popupContent = `
          <div style="font-family: system-ui, -apple-system, sans-serif; color: #0f172a; padding: 4px; max-width: 240px; word-break: break-word;">
            <strong style="font-size: 14px; display: block; color: #0284c7; margin-bottom: 2px; line-height: 1.3;">${building.name} (${building.shortCode})</strong>
            <div style="font-size: 11px; color: #475569; margin-bottom: 6px; line-height: 1.2;">${building.address}, <strong>${building.postcode}</strong></div>
            <p style="font-size: 11.5px; color: #334155; margin-bottom: 8px; line-height: 1.35; max-height: 80px; overflow-y: auto;">${building.description}</p>
            <div style="display: flex; gap: 4px; flex-wrap: wrap; margin-top: 6px;">
              <a href="${getGoogleMapsDirUrl(building)}" target="_blank" rel="noopener noreferrer" style="background: #0284c7; color: #ffffff; font-size: 10.5px; font-weight: bold; text-decoration: none; padding: 5px 8px; border-radius: 6px; display: inline-flex; align-items: center; gap: 3px;">Walking Directions</a>
              <a href="${getGoogleMapsSearchUrl(building)}" target="_blank" rel="noopener noreferrer" style="background: #f1f5f9; color: #0f172a; font-size: 10.5px; font-weight: bold; border: 1px solid #cbd5e1; text-decoration: none; padding: 5px 8px; border-radius: 6px; display: inline-flex; align-items: center; gap: 3px;">Google Maps</a>
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);
        marker.on('click', () => onSelectRef.current(building));
        markersRef.current[building.id] = marker;
      });

      if (selectedBuilding && markersRef.current[selectedBuilding.id]) {
        map.flyTo([selectedBuilding.lat, selectedBuilding.lng], 17, { duration: 0.8 });
        markersRef.current[selectedBuilding.id].openPopup();
      }
    });

    return () => {
      isMounted = false;
    };
  }, [buildings, selectedBuilding, mapMode]);

  // Google Maps Embed URL pinned to exact official UoP coordinates
  const googleEmbedUrl = selectedBuilding
    ? `https://maps.google.com/maps?q=${selectedBuilding.lat},${selectedBuilding.lng}&t=&z=17&ie=UTF8&iwloc=&output=embed`
    : `https://maps.google.com/maps?q=50.7953083,-1.0939&t=&z=15&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className="relative w-full h-full min-h-[450px] rounded-2xl overflow-hidden border border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.15)] bg-[#0c1422] flex flex-col">
      {/* View Switcher Bar */}
      <div className="absolute top-3 right-3 z-30 flex items-center gap-1.5 p-1 rounded-xl bg-slate-950/80 backdrop-blur-md border border-cyan-500/30 shadow-lg">
        <button
          type="button"
          onClick={() => setMapMode('google')}
          aria-pressed={mapMode === 'google'}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
            mapMode === 'google'
              ? 'bg-cyan-500 text-slate-950 shadow-[0_0_10px_rgba(6,182,212,0.5)]'
              : 'text-slate-300 hover:text-cyan-400 hover:bg-slate-800'
          }`}
        >
          <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
          Google Maps View
        </button>
        <button
          type="button"
          onClick={() => setMapMode('interactive')}
          aria-pressed={mapMode === 'interactive'}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
            mapMode === 'interactive'
              ? 'bg-cyan-500 text-slate-950 shadow-[0_0_10px_rgba(6,182,212,0.5)]'
              : 'text-slate-300 hover:text-cyan-400 hover:bg-slate-800'
          }`}
        >
          <Layers className="w-3.5 h-3.5" aria-hidden="true" />
          All Pins Overview
        </button>
      </div>

      {/* Leaflet CSS CDN */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
        crossOrigin=""
      />

      {mapMode === 'google' ? (
        <div className="w-full h-full min-h-[450px] relative">
          <iframe
            key={selectedBuilding?.id || 'default'}
            title={`Google Map view for ${selectedBuilding?.name || 'Portsmouth Campus'}`}
            src={googleEmbedUrl}
            className="w-full h-full min-h-[450px] border-0 rounded-2xl grayscale-[20%] contrast-[105%]"
            loading="lazy"
            allowFullScreen
          />
          {selectedBuilding && (
            <div className="absolute bottom-3 left-3 z-20 bg-slate-950/90 backdrop-blur-md px-3 py-2 rounded-xl border border-cyan-500/30 text-xs flex items-center gap-2 shadow-xl max-w-[90%]">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shrink-0" />
              <span className="text-slate-200 font-semibold truncate">
                Official UoP Pin: <strong className="text-cyan-300">{selectedBuilding.name}</strong>
              </span>
            </div>
          )}
        </div>
      ) : (
        <div ref={mapContainerRef} className="w-full h-full min-h-[450px] z-10" />
      )}
    </div>
  );
}

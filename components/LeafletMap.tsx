'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import type { NeighborhoodWithScores } from './MapView';
import 'leaflet/dist/leaflet.css';

interface LeafletMapProps {
  neighborhoods: (NeighborhoodWithScores & { color: string })[];
  onHover: (n: NeighborhoodWithScores | null) => void;
}

const MILAN_CENTER: [number, number] = [45.4642, 9.19];
const DEFAULT_ZOOM
 = 12;

export default function LeafletMap({ neighborhoods, onHover }: LeafletMapProps) {
  const router = useRouter();

  return (

    <MapContainer
      center={MILAN_CENTER}
      zoom={DEFAULT_ZOOM}
      minZoom={11}
      maxZoom={17}
      scrollWheelZoom
      className="w-full h-full z-0"
      style={{ background: '#F5F4F2' }}
    >
      {/* Light, muted tiles — CartoDB Positron */}
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://openstreetmap.org">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'
        subdomains={['a', 'b', 'c', 'd']}
      />

      {neighborhoods.map((n) => {
        if (!n.boundary_geojson) return null;
        return (
          <GeoJSON
            key={n.id}
            data={n.boundary_geojson as GeoJSON.GeoJsonObject}
            style={{
              color: n.color,
              weight: 1.5,
              opacity: 0.8,
              fillColor: n.color,
              fillOpacity: 0.25,
            }}
            eventHandlers={{
              mouseover: (e) => {
                e.target.setStyle({ fillOpacity: 0.5, weight: 2.5 });
                onHover(n);
              },
              mouseout: (e) => {
                e.target.setStyle({ fillOpacity: 0.25, weight: 1.5 });
                onHover(null);
              },
              click: () => {
                router.push(`/milan/${n.slug}`);
              },
            }}
          />
        );
      })}
    </MapContainer>
  );
}
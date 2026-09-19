import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, Navigation, Compass, Search, ZoomIn, ZoomOut, Check, Layers, AlertCircle } from "lucide-react";
import { SupplierProfile } from "../types";
import { fmt } from "../utils";

// Custom SVG Icons for Leaflet markers
const createOriginIcon = (label: string) => {
  return L.divIcon({
    className: "custom-leaflet-origin-marker",
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer; transform: translate(-50%, -100%);">
        <div style="background-color: #B71C1C; color: white; padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: 700; font-family: sans-serif; white-space: nowrap; box-shadow: 0 2px 6px rgba(0,0,0,0.3); border: 1.5px solid white; display: flex; align-items: center; gap: 4px;">
          <span>🏢</span>
          <span>${label || "โรงงานต้นทาง"}</span>
        </div>
        <div style="width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 7px solid #B71C1C;"></div>
        <div style="width: 10px; height: 10px; background-color: #B71C1C; border: 2px solid white; border-radius: 50%; margin-top: -3px; box-shadow: 0 2px 4px rgba(0,0,0,0.4);"></div>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
};

const createDestinationIcon = (distanceText?: string) => {
  return L.divIcon({
    className: "custom-leaflet-dest-marker",
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: grab; transform: translate(-50%, -100%);">
        <div style="background-color: #059669; color: white; padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: 700; font-family: sans-serif; white-space: nowrap; box-shadow: 0 3px 8px rgba(0,0,0,0.35); border: 1.5px solid white; display: flex; align-items: center; gap: 4px; animation: bouncePin 1.5s infinite alternate;">
          <span>📍</span>
          <span>${distanceText ? `หน้างาน (${distanceText})` : "หมุดหน้างานจัดส่ง (ลากได้)"}</span>
        </div>
        <div style="width: 0; height: 0; border-left: 7px solid transparent; border-right: 7px solid transparent; border-top: 8px solid #059669;"></div>
        <div style="width: 12px; height: 12px; background-color: #059669; border: 2.5px solid white; border-radius: 50%; margin-top: -4px; box-shadow: 0 2px 5px rgba(0,0,0,0.5);"></div>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
};

interface MapPinPickerProps {
  originLat: number;
  originLng: number;
  originName: string;
  destLat?: number;
  destLng?: number;
  freeRadiusKm?: number;
  distanceKm?: number;
  onLocationSelect: (lat: number, lng: number, addressSuggestion?: string) => void;
  height?: string;
  activeSupplier?: SupplierProfile;
}

export default function MapPinPicker({
  originLat,
  originLng,
  originName,
  destLat,
  destLng,
  freeRadiusKm = 30,
  distanceKm,
  onLocationSelect,
  height = "360px",
  activeSupplier,
}: MapPinPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const originMarkerRef = useRef<L.Marker | null>(null);
  const destMarkerRef = useRef<L.Marker | null>(null);
  const routeLineRef = useRef<L.Polyline | null>(null);
  const freeRadiusCircleRef = useRef<L.Circle | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Array<{ display_name: string; lat: string; lon: string }>>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [mapType, setMapType] = useState<"standard" | "satellite">("standard");
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Center on destination if available, otherwise origin
    const initialCenter: [number, number] = destLat !== undefined && destLng !== undefined 
      ? [destLat, destLng] 
      : [originLat, originLng];

    const initialZoom = destLat !== undefined && destLng !== undefined ? 11 : 10;

    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: initialZoom,
      zoomControl: false,
    });

    mapInstanceRef.current = map;

    // Add Tile Layer (OpenStreetMap)
    const standardLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);
    tileLayerRef.current = standardLayer;

    // Add Free Radius Circle around origin
    if (freeRadiusKm > 0) {
      const circle = L.circle([originLat, originLng], {
        radius: freeRadiusKm * 1000,
        color: "#059669",
        fillColor: "#10B981",
        fillOpacity: 0.08,
        weight: 1.5,
        dashArray: "4, 4",
      }).addTo(map);
      circle.bindTooltip(`รัศมีส่งฟรี ${freeRadiusKm} กม.`, { permanent: false, direction: "top" });
      freeRadiusCircleRef.current = circle;
    }

    // Add Origin Marker
    const originMarker = L.marker([originLat, originLng], {
      icon: createOriginIcon(originName),
      zIndexOffset: 100,
    }).addTo(map);
    originMarker.bindPopup(`<b>🏢 โรงงานต้นทาง:</b><br/>${originName}`);
    originMarkerRef.current = originMarker;

    // Add Destination Marker if already set
    if (destLat !== undefined && destLng !== undefined) {
      const distLabel = distanceKm ? `${distanceKm} กม.` : undefined;
      const destMarker = L.marker([destLat, destLng], {
        icon: createDestinationIcon(distLabel),
        draggable: true,
        zIndexOffset: 500,
      }).addTo(map);

      destMarker.on("dragend", async () => {
        const pos = destMarker.getLatLng();
        handlePinMoved(pos.lat, pos.lng);
      });

      destMarkerRef.current = destMarker;

      // Draw route line
      const poly = L.polyline([[originLat, originLng], [destLat, destLng]], {
        color: "#DC2626",
        weight: 3,
        opacity: 0.75,
        dashArray: "6, 6",
      }).addTo(map);
      routeLineRef.current = poly;

      // Fit bounds to show both
      const bounds = L.latLngBounds([[originLat, originLng], [destLat, destLng]]);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }

    // Map Click Handler to Drop / Move Pin
    map.on("click", (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      handlePinMoved(lat, lng);
    });

    // Invalidate size after mount
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update map layer when mapType toggles
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    if (tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
    }

    if (mapType === "satellite") {
      tileLayerRef.current = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
        attribution: "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
        maxZoom: 18,
      }).addTo(mapInstanceRef.current);
    } else {
      tileLayerRef.current = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(mapInstanceRef.current);
    }
  }, [mapType]);

  // Update origin marker & free radius circle when props change
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    if (originMarkerRef.current) {
      originMarkerRef.current.setLatLng([originLat, originLng]);
      originMarkerRef.current.setIcon(createOriginIcon(originName));
      originMarkerRef.current.setPopupContent(`<b>🏢 โรงงานต้นทาง:</b><br/>${originName}`);
    }

    if (freeRadiusCircleRef.current) {
      freeRadiusCircleRef.current.setLatLng([originLat, originLng]);
      freeRadiusCircleRef.current.setRadius(freeRadiusKm * 1000);
      freeRadiusCircleRef.current.setTooltipContent(`รัศมีส่งฟรี ${freeRadiusKm} กม.`);
    }
  }, [originLat, originLng, originName, freeRadiusKm]);

  // Update destination marker & route line when destLat/destLng/distanceKm change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (destLat !== undefined && destLng !== undefined) {
      const distLabel = distanceKm ? `${distanceKm} กม.` : undefined;

      if (!destMarkerRef.current) {
        const destMarker = L.marker([destLat, destLng], {
          icon: createDestinationIcon(distLabel),
          draggable: true,
          zIndexOffset: 500,
        }).addTo(map);

        destMarker.on("dragend", () => {
          const pos = destMarker.getLatLng();
          handlePinMoved(pos.lat, pos.lng);
        });

        destMarkerRef.current = destMarker;
      } else {
        destMarkerRef.current.setLatLng([destLat, destLng]);
        destMarkerRef.current.setIcon(createDestinationIcon(distLabel));
      }

      // Update route polyline
      if (!routeLineRef.current) {
        routeLineRef.current = L.polyline([[originLat, originLng], [destLat, destLng]], {
          color: "#DC2626",
          weight: 3,
          opacity: 0.75,
          dashArray: "6, 6",
        }).addTo(map);
      } else {
        routeLineRef.current.setLatLngs([[originLat, originLng], [destLat, destLng]]);
      }
    } else {
      // Remove destination marker and route if dest is cleared
      if (destMarkerRef.current) {
        map.removeLayer(destMarkerRef.current);
        destMarkerRef.current = null;
      }
      if (routeLineRef.current) {
        map.removeLayer(routeLineRef.current);
        routeLineRef.current = null;
      }
    }
  }, [destLat, destLng, originLat, originLng, distanceKm]);

  // Handle pin moved / dropped
  const handlePinMoved = async (lat: number, lng: number) => {
    // Reverse Geocoding via OpenStreetMap Nominatim (lightweight & debounced)
    let addressSuggestion = "";
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1&accept-language=th`, {
        headers: { "User-Agent": "PongsakulConcreteApp/1.0" },
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.display_name) {
          const addr = data.address || {};
          const parts = [];
          if (addr.suburb || addr.neighbourhood || addr.village || addr.subdistrict) {
            parts.push(addr.suburb || addr.neighbourhood || addr.village || addr.subdistrict);
          }
          if (addr.district || addr.county || addr.city_district) {
            parts.push(addr.district || addr.county || addr.city_district);
          }
          if (addr.province || addr.state || addr.city) {
            parts.push(addr.province || addr.state || addr.city);
          }
          addressSuggestion = parts.length > 0 ? parts.join(", ") : data.display_name.split(",").slice(0, 3).join(", ");
        }
      }
    } catch {
      // Fail silently and fallback to coordinates
    }

    onLocationSelect(lat, lng, addressSuggestion);
  };

  // Search Location via Nominatim
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setShowSearchResults(true);
    try {
      const query = `${searchQuery} ประเทศไทย`;
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=th&limit=5&accept-language=th`,
        { headers: { "User-Agent": "PongsakulConcreteApp/1.0" } }
      );
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data || []);
      }
    } catch (err) {
      console.error("Search failed", err);
    } finally {
      setIsSearching(false);
    }
  };

  // Select Search Result
  const handleSelectSearchResult = (result: { display_name: string; lat: string; lon: string }) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    setShowSearchResults(false);
    setSearchQuery("");

    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([lat, lng], 13, { duration: 1 });
    }

    // Clean address snippet
    const namePart = result.display_name.split(",").slice(0, 3).join(", ");
    onLocationSelect(lat, lng, namePart);
  };

  // Reset View to Fit Both Markers
  const handleFitBounds = () => {
    if (!mapInstanceRef.current) return;
    if (destLat !== undefined && destLng !== undefined) {
      const bounds = L.latLngBounds([[originLat, originLng], [destLat, destLng]]);
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    } else {
      mapInstanceRef.current.setView([originLat, originLng], 11);
    }
  };

  // Locate current user GPS and pin
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert("เบราว์เซอร์ไม่รองรับ GPS");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([lat, lng], 14, { duration: 1 });
        }
        handlePinMoved(lat, lng);
      },
      (err) => {
        alert("ไม่สามารถระบุพิกัด GPS ได้: " + err.message);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="relative rounded-xl overflow-hidden border border-neutral-300 shadow-sm bg-neutral-100 flex flex-col">
      {/* Top Map Action Bar */}
      <div className="bg-white/95 backdrop-blur-xs border-b border-neutral-200 px-3 py-2 flex flex-wrap items-center justify-between gap-2 z-[400]">
        <div className="flex items-center gap-1.5 flex-1 min-w-[220px]">
          <form onSubmit={handleSearch} className="relative flex-1 flex items-center">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="🔍 ค้นหาสถานที่ เช่น พระราม 2, บางบ่อ, ปลวกแดง..."
              className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-2.5 py-1 text-xs text-neutral-800 focus:outline-none focus:border-red-500 pr-14"
            />
            <button
              type="submit"
              disabled={isSearching}
              className="absolute right-1 text-[11px] font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 px-2 py-0.5 rounded transition"
            >
              {isSearching ? "..." : "ค้นหา"}
            </button>
          </form>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleLocateMe}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2 py-1 rounded-md transition shadow-2xs"
            title="ปักหมุดตำแหน่งปัจจุบันของฉันด้วย GPS"
          >
            <Navigation className="w-3 h-3 text-blue-600" />
            <span className="hidden sm:inline">ปักหมุด GPS</span>
          </button>

          <button
            type="button"
            onClick={handleFitBounds}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-neutral-700 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 px-2 py-1 rounded-md transition shadow-2xs"
            title="ขยายมุมมองเพื่อแสดงทั้งโรงงานและหน้างาน"
          >
            <Compass className="w-3 h-3 text-neutral-600" />
            <span className="hidden sm:inline">รีเซ็ตมุมมอง</span>
          </button>

          <button
            type="button"
            onClick={() => setMapType(mapType === "standard" ? "satellite" : "standard")}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-neutral-700 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 px-2 py-1 rounded-md transition shadow-2xs"
            title="สลับแผนที่ดาวเทียม / แผนที่ถนน"
          >
            <Layers className="w-3 h-3 text-neutral-600" />
            <span>{mapType === "standard" ? "🛰️ ดาวเทียม" : "🗺️ แผนที่ปกติ"}</span>
          </button>
        </div>
      </div>

      {/* Autocomplete Dropdown Search Results */}
      {showSearchResults && searchResults.length > 0 && (
        <div className="absolute top-[46px] left-3 right-3 sm:right-auto sm:w-96 bg-white border border-neutral-300 rounded-lg shadow-lg z-[1000] max-h-60 overflow-y-auto divide-y divide-neutral-100">
          <div className="p-2 text-[11px] font-bold text-neutral-500 bg-neutral-50 flex items-center justify-between">
            <span>ผลการค้นหาสถานที่:</span>
            <button
              type="button"
              onClick={() => setShowSearchResults(false)}
              className="text-neutral-400 hover:text-neutral-700 text-xs"
            >
              ✕ ปิด
            </button>
          </div>
          {searchResults.map((res, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSelectSearchResult(res)}
              className="w-full text-left p-2 hover:bg-red-50 text-xs transition flex items-start gap-2"
            >
              <MapPin className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
              <div className="line-clamp-2 text-neutral-800 text-[11px] leading-snug">
                {res.display_name}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Map Container */}
      <div 
        ref={mapContainerRef} 
        style={{ height, minHeight: "320px" }} 
        className="w-full z-[10]"
      />

      {/* Bottom Hint Banner */}
      <div className="bg-neutral-900/90 text-white text-[11px] px-3 py-1.5 flex flex-wrap items-center justify-between gap-2 z-[400]">
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>
            👉 <strong>คลิกบนแผนที่</strong> เพื่อปักหมุด หรือ <strong>กดค้างลากหมุด 📍</strong> เพื่อปรับตำแหน่งหน้างาน
          </span>
        </div>
        {destLat !== undefined && destLng !== undefined ? (
          <div className="font-mono text-emerald-300 font-semibold text-[10px] bg-white/10 px-2 py-0.5 rounded">
            พิกัดหน้างาน: {destLat.toFixed(4)}, {destLng.toFixed(4)}
          </div>
        ) : (
          <div className="text-amber-300 text-[10px]">
            ยังไม่ได้ปักหมุด (คลิกบนแผนที่เพื่อปักหมุดหน้างาน)
          </div>
        )}
      </div>
    </div>
  );
}

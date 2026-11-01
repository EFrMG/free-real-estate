import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

import { LuBed, LuBath } from "react-icons/lu";
import { Link } from "react-router";

import getAssetUrl from "~/utils/getAssetUrl";

// Import the icons directly so Vite bundles and hashes them, then point the default icon at the real URLs
delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

interface MapPopover {
  id: number;
  title: string;
  exteriorImage: string;
  bedrooms: number;
  bathrooms: number;
  city: string;
  address: string;
  latitude: number;
  longitude: number;
}

interface MapProps {
  marginTop: number;
  viewportHeight: number;
  zoomLevel: number;
  scrollable: boolean;
  mapPopovers?: MapPopover[];
}

export default function Map({
  marginTop,
  viewportHeight,
  zoomLevel,
  scrollable,
  mapPopovers,
}: MapProps) {
  return (
    <div
      className={`h-[35vh] md:sticky md:top-[7.5vh] md:h-[${viewportHeight}vh] w-[85%] md:w-[95%] md:mt-${marginTop} mx-auto`}
    >
      <MapContainer
        center={[
          +`${mapPopovers?.length ? `${mapPopovers[0].latitude}` : "-38.4161"}`,
          +`${mapPopovers?.length ? `${mapPopovers[0].longitude}` : "-63.6167"}`,
        ]}
        zoom={zoomLevel}
        scrollWheelZoom={scrollable}
        className="h-full w-full rounded-lg! shadow-lg"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {mapPopovers?.map(
          (
            {
              id,
              title,
              exteriorImage,
              bedrooms,
              bathrooms,
              city,
              address,
              latitude,
              longitude,
            },
            idx,
          ) => (
            <Marker
              key={`map-popover-${idx}`}
              position={[+`${latitude}`, +`${longitude}`]}
            >
              <Popup>
                <div className="min-w-50">
                  <Link to={`/properties/${id}`}>
                    <h3 className="pb-3 text-center text-base leading-none font-medium text-amber-900">
                      {title}
                    </h3>
                  </Link>
                  <div className="gap-4 md:grid md:grid-cols-2">
                    <img
                      src={getAssetUrl(exteriorImage)}
                      alt="Property popover image"
                      draggable={false}
                      className="h-[calc(max(var(--spacing)*32,100%)-10%)] w-full place-self-center rounded-lg object-cover max-md:hidden"
                    />
                    <div className="flex items-center justify-around text-sm text-gray-600 md:stack-0 [&_p]:my-2! [&_p]:flex [&_p]:gap-2">
                      <p>
                        {city}, {address}
                      </p>
                      <div className="flex gap-2 text-gray-500 max-md:flex-col md:gap-4">
                        <p>
                          <LuBed size={18} /> <b>{bedrooms}</b>
                        </p>
                        <p>
                          <LuBath size={18} /> <b>{bathrooms}</b>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          ),
        )}
      </MapContainer>
    </div>
  );
}

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

interface MapPopover {
  title: string;
  img: string;
  bedrooms: number;
  bathrooms: number;
  address: string;
  latitude: number;
  longitude: number;
}

interface MapProps {
  marginTop: number;
  viewportHeight: number;
  zoomLevel: number;
  scrollable: boolean;
  mapPopovers: MapPopover[];
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
      className={`sticky top-[7.5vh] h-[${viewportHeight}vh] w-[95%] mt-${marginTop} mx-auto`}
    >
      <MapContainer
        center={[+`${mapPopovers[0].latitude}`, +`${mapPopovers[0].longitude}`]}
        zoom={zoomLevel}
        scrollWheelZoom={scrollable}
        className="h-full w-full rounded-lg! shadow-lg"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {mapPopovers.map(
          (
            { title, img, bedrooms, bathrooms, address, latitude, longitude },
            idx,
          ) => (
            <Marker
              key={`map-popover-${idx}`}
              position={[+`${latitude}`, +`${longitude}`]}
            >
              <Popup>
                <div className="min-w-50">
                  <h3 className="pb-2 text-base text-center leading-none text-amber-900 font-medium">
                    {title}
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <img
                      src={img}
                      alt="Property popover image"
                      draggable={false}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <div className="stack-0 justify-around text-sm [&_p]:my-2!">
                      <p>
                        bedrooms: <b>{bedrooms}</b>
                      </p>
                      <p>
                        bathrooms: <b>{bathrooms}</b>
                      </p>
                      <p>{address}</p>
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

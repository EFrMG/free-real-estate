import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { LuBed, LuBath } from "react-icons/lu";

interface MapPopover {
  title: string;
  img: string;
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
      className={`md:sticky md:top-[7.5vh] h-[35vh] md:h-[${viewportHeight}vh] w-[85%] md:w-[95%] md:mt-${marginTop} mx-auto`}
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
            {
              title,
              img,
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
                  <h3 className="pb-2 text-base text-center leading-none text-amber-900 font-medium">
                    {title}
                  </h3>
                  <div className="md:grid md:grid-cols-2 gap-4">
                    <img
                      src={img}
                      alt="Property popover image"
                      draggable={false}
                      className="max-md:hidden place-self-center w-full h-[calc(max(var(--spacing)*32,100%)-10%)] object-cover rounded-lg"
                    />
                    <div className="flex md:stack-0 justify-around items-center text-sm text-gray-600 [&_p]:flex [&_p]:gap-2 [&_p]:my-2!">
                      <p>
                        {city}, {address}
                      </p>
                      <div className="flex max-md:flex-col gap-2 md:gap-4 text-gray-500">
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

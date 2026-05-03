import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

interface MapPopover {
  title: string;
  img: string;
  bedrooms: number;
  address: string;
  latitude: number;
  longitude: number;
}

interface MapProps {
  marginTop: number;
  viewportHeight: number;
  zoomLevel: number;
  mapPopovers: MapPopover[];
}

export default function Map({
  marginTop,
  viewportHeight,
  zoomLevel,
  mapPopovers,
}: MapProps) {
  return (
    <div
      className={`sticky top-[7.5vh] h-[${viewportHeight}vh] w-[95%] mt-${marginTop} mx-auto`}
    >
      <MapContainer
        center={[+`${mapPopovers[0].latitude}`, +`${mapPopovers[0].longitude}`]}
        zoom={zoomLevel}
        scrollWheelZoom={true}
        className="h-full w-full rounded-lg! shadow-lg"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {mapPopovers.map(
          ({ title, img, bedrooms, address, latitude, longitude }) => (
            <Marker position={[+`${latitude}`, +`${longitude}`]}>
              <Popup>
                <img src={img} alt="Property popover image" />
                <h3>{title}</h3>
                <p>{bedrooms}</p>
                <p>{address}</p>
              </Popup>
            </Marker>
          ),
        )}
      </MapContainer>
    </div>
  );
}

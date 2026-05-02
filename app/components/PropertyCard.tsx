interface PropertyCardProps {
  title: string;
  description: string;
  img: string;
  bedrooms: number;
  bathrooms: number;
  price: number;
  address: string;
}

export default function PropertyCard({
  title,
  description,
  img,
  bedrooms,
  bathrooms,
  price,
  address,
}: PropertyCardProps) {
  return (
    <div className="">
      <h2>{title}</h2>
      <p>{description}</p>
      <img src={img} alt="Property image" />
      <span>{bedrooms}</span>
      <span>{bathrooms}</span>
      <span>{price}</span>
      <span>{address}</span>
    </div>
  );
}

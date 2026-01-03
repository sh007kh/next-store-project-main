import { formatCurrency } from "@/utils/format";
import Image from "next/image";
import Link from "next/link";
export const FirstColumn = ({
  name,
  image,
}: {
  image: string;
  name: string;
}) => {
  return (
    <div className="relative h-24 w-24 sm:h-32 sm:w-32">
      <Image
        src={image}
        alt={name}
        fill
        sizes="(max-width:768px) 100vw,(max-width:1200px) 50vw,33vw"
        priority
        className="w-full rounded-md object-cover"
        unoptimized={true}
      />
    </div>
  );
};
export const SecondColumn = ({
  name,
  company,
  productId,
  size,
  color,
}: {
  name: string;
  company: string;
  productId: string;
  size: string;
  color: string;
}) => {
  const sizeLabels = {
    SMALL: "Small",
    MEDIUM: "Medium",
    LARGE: "Large",
    XLARGE: "X Large",
    XXLARGE: "2XL",
  };

  const colorLabels = {
    RED: "Red",
    BLUE: "Blue",
    GREEN: "Green",
    BLACK: "Black",
    WHITE: "White",
    YELLOW: "Yellow",
    PURPLE: "Purple",
    ORANGE: "Orange",
    PINK: "Pink",
    GRAY: "Gray",
  };

  return (
    <div className=" sm:w-48">
      <Link href={`/products/${productId}`}>
        <h3 className="capitalize font-medium hover:underline">{name}</h3>
      </Link>
      <h4 className="mt-2 capitalize text-xs">{company}</h4>
      <p className="mt-1 text-xs text-muted-foreground">
        Color: {colorLabels[color as keyof typeof colorLabels]}, Size:{" "}
        {sizeLabels[size as keyof typeof sizeLabels]}
      </p>
    </div>
  );
};

export const FourthColumn = ({ price }: { price: number }) => {
  return <p className="font-medium md:ml-auto">{formatCurrency(price)}</p>;
};

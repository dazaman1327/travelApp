import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface ActivityCardProps {
  name: string;
  image: string;
  description: string;
  selected?: boolean;
  onClick?: () => void;
}

export function ActivityCard({ name, image, description, selected, onClick }: ActivityCardProps) {
  return (
    <Card 
      className={`overflow-hidden transition-all cursor-pointer ${
        selected ? "ring-2 ring-primary" : "hover:shadow-lg"
      }`}
      onClick={onClick}
    >
      <AspectRatio ratio={16 / 9}>
        <img
          src={image}
          alt={name}
          className="object-cover w-full h-full"
        />
      </AspectRatio>
      <CardHeader>
        <CardTitle>{name}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
    </Card>
  );
}

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface DestinationCardProps {
  name: string;
  image: string;
  description: string;
}

export function DestinationCard({ name, image, description }: DestinationCardProps) {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg">
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

import { CalendarDays, MapPin, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import type { FieldTrip } from "@/types";

interface FieldTripCardProps {
  fieldTrip: FieldTrip;
  onRegister: () => void;
}

export function FieldTripCard({ fieldTrip, onRegister }: FieldTripCardProps) {
  const formattedDate = new Date(fieldTrip.date).toLocaleDateString("en-NZ", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const formattedCost = new Intl.NumberFormat("en-NZ", {
    style: "currency",
    currency: "NZD",
  }).format(fieldTrip.cost);

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">{fieldTrip.location}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-muted-foreground">
          <MapPin className="h-4 w-4 shrink-0" />
          <span>{fieldTrip.location}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <CalendarDays className="h-4 w-4 shrink-0" />
          <span>{formattedDate}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <DollarSign className="h-4 w-4 shrink-0" />
          <span className="text-lg font-semibold text-foreground">
            {formattedCost}
          </span>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" size="lg" onClick={onRegister}>
          Register
        </Button>
      </CardFooter>
    </Card>
  );
}

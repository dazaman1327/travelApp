import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

interface BudgetSliderProps {
  value: number[];
  onChange: (value: number[]) => void;
}

export function BudgetSlider({ value, onChange }: BudgetSliderProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Budget Range</Label>
        <span className="text-sm text-muted-foreground">
          ${value[0].toLocaleString()}
        </span>
      </div>
      <Slider
        defaultValue={value}
        max={10000}
        min={500}
        step={500}
        onValueChange={onChange}
      />
      <div className="grid grid-cols-3 text-sm text-muted-foreground">
        <span>Budget</span>
        <span className="text-center">Moderate</span>
        <span className="text-right">Luxury</span>
      </div>
    </div>
  );
}

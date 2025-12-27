"use client";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

const colors = [
  { value: "RED", label: "Red" },
  { value: "BLUE", label: "Blue" },
  { value: "GREEN", label: "Green" },
  { value: "BLACK", label: "Black" },
  { value: "WHITE", label: "White" },
  { value: "YELLOW", label: "Yellow" },
  { value: "PURPLE", label: "Purple" },
  { value: "ORANGE", label: "Orange" },
  { value: "PINK", label: "Pink" },
  { value: "GRAY", label: "Gray" },
];

function ColorInput({
  name = "color",
  defaultValue = "BLACK",
}: {
  name?: string;
  defaultValue?: string;
}) {
  return (
    <div className="mb-2">
      <Label htmlFor={name} className="capitalize">
        Color
      </Label>
      <Select defaultValue={defaultValue} name={name}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {colors.map((color) => (
            <SelectItem key={color.value} value={color.value}>
              {color.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export default ColorInput;

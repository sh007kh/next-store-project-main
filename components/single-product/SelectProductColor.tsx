import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

type SelectProductColorProps = {
  color: string;
  setColor: (value: string) => void;
  availableColors?: string[];
};

function SelectProductColor({
  color,
  setColor,
  availableColors,
}: SelectProductColorProps) {
  return (
    <>
      <h4 className="mb-2">Color : </h4>
      <Select value={color} onValueChange={setColor}>
        <SelectTrigger className="w-[150px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {colors
            .filter(
              (colorOption) =>
                !availableColors || availableColors.includes(colorOption.value)
            )
            .map((colorOption) => (
              <SelectItem key={colorOption.value} value={colorOption.value}>
                {colorOption.label}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>
    </>
  );
}

export default SelectProductColor;

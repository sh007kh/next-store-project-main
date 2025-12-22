import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const sizes = [
  { value: "SMALL", label: "Small" },
  { value: "MEDIUM", label: "Medium" },
  { value: "LARGE", label: "Large" },
  { value: "XLARGE", label: "X Large" },
  { value: "XXLARGE", label: "2XL" },
];

type SelectProductSizeProps = {
  size: string;
  setSize: (value: string) => void;
};

function SelectProductSize({ size, setSize }: SelectProductSizeProps) {
  return (
    <>
      <h4 className="mb-2">Size : </h4>
      <Select defaultValue={size} onValueChange={setSize}>
        <SelectTrigger className="w-[150px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {sizes.map((sizeOption) => (
            <SelectItem key={sizeOption.value} value={sizeOption.value}>
              {sizeOption.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  );
}

export default SelectProductSize;
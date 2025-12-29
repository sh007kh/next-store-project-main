import { Label } from "../ui/label";
import { Input } from "../ui/input";

function ImageInput() {
  const name = "image";
  return (
    <div className="mb-2">
      <Label htmlFor={name} className="capitalize">
        Images (select multiple)
      </Label>
      <Input
        id={name}
        name={name}
        type="file"
        multiple
        required
        accept="image/*"
      />
    </div>
  );
}
export default ImageInput;

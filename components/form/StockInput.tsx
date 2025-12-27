import FormInput from "./FormInput";

function StockInput({ defaultValue = 10 }: { defaultValue?: number }) {
  return (
    <FormInput
      type="number"
      name="stock"
      label="stock"
      defaultValue={defaultValue.toString()}
    />
  );
}

export default StockInput;

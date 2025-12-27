"use client";
import { useState, useMemo, useEffect } from "react";
import SelectProductAmount from "./SelectProductAmount";
import SelectProductSize from "./SelectProductSize";
import SelectProductColor from "./SelectProductColor";
import { Mode } from "./SelectProductAmount";
import FormContainer from "../form/FormContainer";
import { SubmitButton } from "../form/Buttons";
import { addToCartAction } from "@/utils/actions";
import { useAuth } from "@clerk/nextjs";
import { ProductSignInButton } from "../form/Buttons";

type Variant = {
  id: string;
  color: string;
  size: string;
  stock: number;
};

function AddToCart({
  productId,
  variants,
}: {
  productId: string;
  variants: Variant[];
}) {
  const [amount, setAmount] = useState(1);
  const [color, setColor] = useState(variants[0]?.color || "BLACK");
  const [size, setSize] = useState(variants[0]?.size || "MEDIUM");
  const { userId } = useAuth();

  const availableColors = useMemo(
    () => [...new Set(variants.map((v) => v.color))],
    [variants]
  );
  const availableSizes = useMemo(() => {
    const sizesForColor = variants
      .filter((v) => v.color === color)
      .map((v) => v.size);
    return [...new Set(sizesForColor)];
  }, [variants, color]);

  useEffect(() => {
    if (!availableSizes.includes(size)) {
      setSize(availableSizes[0] || "MEDIUM");
    }
  }, [availableSizes, size]);

  const currentVariant = useMemo(() => {
    return variants.find((v) => v.color === color && v.size === size);
  }, [variants, color, size]);

  const stock = currentVariant?.stock || 0;

  return (
    <div className="mt-4">
      <SelectProductColor
        color={color}
        setColor={setColor}
        availableColors={availableColors}
      />
      <div className="mt-4">
        <SelectProductSize
          size={size}
          setSize={setSize}
          availableSizes={availableSizes}
        />
      </div>
      <div className="mt-4">
        <SelectProductAmount
          mode={Mode.SingleProduct}
          amount={amount}
          setAmount={setAmount}
          stock={stock}
        />
      </div>
      {userId ? (
        <FormContainer action={addToCartAction}>
          <input type="hidden" name="productId" value={productId} />
          <input type="hidden" name="amount" value={amount} />
          <input type="hidden" name="color" value={color} />
          <input type="hidden" name="size" value={size} />
          <SubmitButton text="add to cart" size="default" className="mt-8" />
        </FormContainer>
      ) : (
        <ProductSignInButton />
      )}
    </div>
  );
}
export default AddToCart;

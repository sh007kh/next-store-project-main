import {
  fetchAdminProductDetails,
  updateProductAction,
  updateProductImageAction,
  updateVariantAction,
  deleteVariantAction,
  addVariantAction,
} from "@/utils/actions";
import FormContainer from "@/components/form/FormContainer";
import FormInput from "@/components/form/FormInput";
import PriceInput from "@/components/form/PriceInput";
import TextAreaInput from "@/components/form/TextAreaInput";
import { SubmitButton } from "@/components/form/Buttons";
import CheckboxInput from "@/components/form/CheckBoxInput";
import ImageInputContainer from "@/components/form/ImageInputContainer";
import ColorInput from "@/components/form/ColorInput";
import SizeInput from "@/components/form/SizeInput";
import StockInput from "@/components/form/StockInput";
async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await fetchAdminProductDetails(id);
  const { name, company, description, featured, price } = product;
  return (
    <section>
      <h1 className="text-2xl font-semibold mb-8 capitalize">update product</h1>
      <div className="border p-8 rounded-md">
        {/* Image Input Container */}
        {/* Image Input Container */}
        <ImageInputContainer
          action={updateProductImageAction}
          name={name}
          image={product.images[0]?.imageUrl || ""}
          text="update image"
        >
          <input type="hidden" name="id" value={id} />
          <input
            type="hidden"
            name="url"
            value={product.images[0]?.imageUrl || ""}
          />
        </ImageInputContainer>
        <FormContainer action={updateProductAction}>
          <div className="grid gap-4 md:grid-cols-2 my-4">
            <input type="hidden" name="id" value={id} />
            <FormInput
              type="text"
              name="name"
              label="product name"
              defaultValue={name}
            />
            <FormInput
              type="text"
              name="company"
              label="company"
              defaultValue={company}
            />

            <PriceInput defaultValue={price} />
          </div>
          <TextAreaInput
            name="description"
            labelText="product description"
            defaultValue={description}
          />
          <div className="mt-6">
            <CheckboxInput
              name="featured"
              label="featured"
              defaultChecked={featured}
            />
          </div>
          <SubmitButton text="update product" className="mt-8" />
        </FormContainer>
      </div>
      <div className="border p-8 rounded-md mt-8">
        <h2 className="text-xl font-semibold mb-4">Product Variants</h2>
        {product.variants
          .filter((variant: any) => variant.stock > 0)
          .map((variant: any) => (
            <div key={variant.id} className="border p-4 mb-4 rounded">
              <FormContainer action={updateVariantAction}>
                <input type="hidden" name="id" value={variant.id} />
                <div className="grid gap-4 md:grid-cols-3">
                  <ColorInput defaultValue={variant.color} />
                  <SizeInput defaultValue={variant.size} />
                  <StockInput defaultValue={variant.stock} />
                </div>
                <SubmitButton text="Update Variant" className="mt-4" />
              </FormContainer>
              <div className="mt-4">
                <FormContainer action={deleteVariantAction}>
                  <input type="hidden" name="variantId" value={variant.id} />
                  <SubmitButton
                    text="Delete Variant"
                    className="bg-red-500 hover:bg-red-600"
                  />
                </FormContainer>
              </div>
            </div>
          ))}
        <div className="border p-4 rounded mt-4">
          <h3 className="text-lg font-semibold mb-2">Add New Variant</h3>
          <FormContainer action={addVariantAction}>
            <input type="hidden" name="productId" value={id} />
            <div className="grid gap-4 md:grid-cols-3">
              <ColorInput />
              <SizeInput />
              <StockInput />
            </div>
            <SubmitButton text="Add Variant" className="mt-4" />
          </FormContainer>
        </div>
      </div>
    </section>
  );
}
export default EditProductPage;

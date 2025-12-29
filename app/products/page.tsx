import ProductsContainer from "@/components/products/ProductsContainer";

async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{
    layout?: string;
    search?: string;
    company?: string;
    size?: string;
    color?: string;
    priceMin?: string;
    priceMax?: string;
    sort?: string;
  }>;
}) {
  const params = await searchParams;
  const layout = params.layout || "grid";
  const search = params.search || "";
  const company = params.company || "";
  const size = params.size || "";
  const color = params.color || "";
  const priceMin = params.priceMin || "";
  const priceMax = params.priceMax || "";
  const sort = params.sort || "createdAt-desc";
  return (
    <>
      <ProductsContainer
        layout={layout}
        search={search}
        company={company}
        size={size}
        color={color}
        priceMin={priceMin}
        priceMax={priceMax}
        sort={sort}
      />
    </>
  );
}
export default ProductsPage;

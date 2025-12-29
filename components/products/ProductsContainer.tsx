import ProductsGrid from "./ProductsGrid";
import ProductsList from "./ProductsList";
import ProductsFilters from "./ProductsFilters";
import { LuLayoutGrid, LuList } from "react-icons/lu";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { fetchAllProducts } from "@/utils/actions";
import Link from "next/link";

async function ProductsContainer({
  layout,
  search,
  company,
  size,
  color,
  priceMin,
  priceMax,
  sort,
}: {
  layout: string;
  search: string;
  company: string;
  size: string;
  color: string;
  priceMin: string;
  priceMax: string;
  sort: string;
}) {
  const products = await fetchAllProducts({
    search,
    company,
    size,
    color,
    priceMin,
    priceMax,
    sort,
  });
  const totalProducts = products.length;
  const searchTerm = search ? `&search=${search}` : "";
  const companyTerm = company ? `&company=${company}` : "";
  const sizeTerm = size ? `&size=${size}` : "";
  const colorTerm = color ? `&color=${color}` : "";
  const priceMinTerm = priceMin ? `&priceMin=${priceMin}` : "";
  const priceMaxTerm = priceMax ? `&priceMax=${priceMax}` : "";
  const sortTerm = sort !== "createdAt-desc" ? `&sort=${sort}` : "";
  const queryString = `${searchTerm}${companyTerm}${sizeTerm}${colorTerm}${priceMinTerm}${priceMaxTerm}${sortTerm}`;
  return (
    <>
      {/* HEADER */}
      <section>
        <div className="flex justify-between items-center">
          <h4 className="font-medium text-lg">
            {totalProducts} product{totalProducts > 1 && "s"}
          </h4>
          <div className="flex gap-x-4">
            <Button
              variant={layout === "grid" ? "default" : "ghost"}
              size="icon"
              asChild
            >
              <Link href={`/products?layout=grid${queryString}`}>
                <LuLayoutGrid />
              </Link>
            </Button>
            <Button
              variant={layout === "list" ? "default" : "ghost"}
              size="icon"
              asChild
            >
              <Link href={`/products?layout=list${queryString}`}>
                <LuList />
              </Link>
            </Button>
          </div>
        </div>
        <Separator className="mt-4" />
      </section>
      {/* FILTERS */}
      <section className="mb-8">
        <ProductsFilters />
      </section>
      {/* PRODUCTS */}
      <div>
        {totalProducts === 0 ? (
          <h5 className="text-2xl mt-16">
            Sorry, no products matched your search...
          </h5>
        ) : layout === "grid" ? (
          <ProductsGrid products={products} />
        ) : (
          <ProductsList products={products} />
        )}
      </div>
    </>
  );
}
export default ProductsContainer;

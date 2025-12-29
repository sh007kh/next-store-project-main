"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  fetchDistinctCompanies,
  fetchDistinctSizes,
  fetchDistinctColors,
} from "@/utils/actions";

function ProductsFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [companies, setCompanies] = useState<string[]>([]);
  const [sizes, setSizes] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);

  const [company, setCompany] = useState(searchParams.get("company") || "all");
  const [size, setSize] = useState(searchParams.get("size") || "all");
  const [color, setColor] = useState(searchParams.get("color") || "all");
  const [priceMin, setPriceMin] = useState(searchParams.get("priceMin") || "");
  const [priceMax, setPriceMax] = useState(searchParams.get("priceMax") || "");
  const [sort, setSort] = useState(
    searchParams.get("sort") || "createdAt-desc"
  );

  useEffect(() => {
    const loadFilters = async () => {
      const [comp, sz, col] = await Promise.all([
        fetchDistinctCompanies(),
        fetchDistinctSizes(),
        fetchDistinctColors(),
      ]);
      setCompanies(comp);
      setSizes(sz);
      setColors(col);
    };
    loadFilters();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (company && company !== "all") params.set("company", company);
    else params.delete("company");
    if (size && size !== "all") params.set("size", size);
    else params.delete("size");
    if (color && color !== "all") params.set("color", color);
    else params.delete("color");
    if (priceMin) params.set("priceMin", priceMin);
    else params.delete("priceMin");
    if (priceMax) params.set("priceMax", priceMax);
    else params.delete("priceMax");
    if (sort !== "createdAt-desc") params.set("sort", sort);
    else params.delete("sort");
    router.push(`/products?${params.toString()}`);
  };

  const handleClear = () => {
    setCompany("all");
    setSize("all");
    setColor("all");
    setPriceMin("");
    setPriceMax("");
    setSort("createdAt-desc");
    router.push("/products");
  };

  return (
    <form onSubmit={handleSubmit} className="bg-muted/40 p-4 rounded-lg">
      <h3 className="text-lg font-medium mb-4">Filters</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="company">Company</Label>
          <Select value={company} onValueChange={setCompany}>
            <SelectTrigger>
              <SelectValue placeholder="All Companies" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Companies</SelectItem>
              {companies.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="size">Size</Label>
          <Select value={size} onValueChange={setSize}>
            <SelectTrigger>
              <SelectValue placeholder="All Sizes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sizes</SelectItem>
              {sizes.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="color">Color</Label>
          <Select value={color} onValueChange={setColor}>
            <SelectTrigger>
              <SelectValue placeholder="All Colors" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Colors</SelectItem>
              {colors.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="priceMin">Min Price</Label>
          <Input
            id="priceMin"
            type="number"
            value={priceMin}
            onChange={(e) => setPriceMin(e.target.value)}
            placeholder="0"
          />
        </div>
        <div>
          <Label htmlFor="priceMax">Max Price</Label>
          <Input
            id="priceMax"
            type="number"
            value={priceMax}
            onChange={(e) => setPriceMax(e.target.value)}
            placeholder="1000"
          />
        </div>
        <div>
          <Label htmlFor="sort">Sort By</Label>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt-desc">Newest</SelectItem>
              <SelectItem value="price-asc">Price: Low to High</SelectItem>
              <SelectItem value="price-desc">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <Separator className="my-4" />
      <div className="flex gap-2">
        <Button type="submit">Apply Filters</Button>
        <Button type="button" variant="outline" onClick={handleClear}>
          Clear Filters
        </Button>
      </div>
    </form>
  );
}

export default ProductsFilters;

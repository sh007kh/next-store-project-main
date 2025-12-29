"use client";
import { fetchCategories } from "@/utils/actions";
import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type Category = {
  id: string;
  name: string;
  subcategories: {
    id: string;
    name: string;
  }[];
};

function CategoriesNav() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getCategories = async () => {
      try {
        const cats = await fetchCategories();
        setCategories(cats);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        setIsLoading(false);
      }
    };
    getCategories();
  }, []);

  if (isLoading || categories.length === 0) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Categories</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {categories.map((category) => (
          <div key={category.id}>
            <DropdownMenuItem asChild>
              <Link href={`/products?category=${category.id}`}>
                {category.name}
              </Link>
            </DropdownMenuItem>
            {category.subcategories.map((sub) => (
              <DropdownMenuItem key={sub.id} asChild>
                <Link href={`/products?subcategory=${sub.id}`}>
                  &nbsp;&nbsp;{sub.name}
                </Link>
              </DropdownMenuItem>
            ))}
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default CategoriesNav;

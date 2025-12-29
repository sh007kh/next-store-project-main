import EmptyList from "@/components/global/EmptyList";
import { fetchAdminCategories } from "@/utils/actions";
import FormContainer from "@/components/form/FormContainer";
import { IconButton } from "@/components/form/Buttons";
import { deleteCategoryAction, deleteSubcategoryAction } from "@/utils/actions";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Link from "next/link";

async function CategoriesPage() {
  const categories = await fetchAdminCategories();
  if (categories.length === 0) return <EmptyList />;

  return (
    <section>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold">Categories</h1>
        <Button asChild>
          <Link href="/admin/categories/create">Create Category</Link>
        </Button>
      </div>

      <Table>
        <TableCaption className="capitalize">
          total categories : {categories.length}
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Category Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Subcategories</TableHead>
            <TableHead>Products</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((category) => {
            const {
              id: categoryId,
              name,
              description,
              subcategories,
              products,
            } = category;
            return (
              <TableRow key={categoryId}>
                <TableCell className="font-medium">{name}</TableCell>
                <TableCell>{description || "No description"}</TableCell>
                <TableCell>{subcategories.length}</TableCell>
                <TableCell>{products.length}</TableCell>
                <TableCell className="flex items-center gap-x-2">
                  <Button asChild size="sm">
                    <Link href={`/admin/categories/${categoryId}/edit`}>
                      Edit
                    </Link>
                  </Button>
                  <DeleteCategory categoryId={categoryId} />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* Subcategories Section */}
      <h2 className="text-xl font-semibold mt-12 mb-4">Subcategories</h2>
      {categories.flatMap((cat) => cat.subcategories).length === 0 ? (
        <EmptyList />
      ) : (
        <Table>
          <TableCaption className="capitalize">
            total subcategories :{" "}
            {categories.flatMap((cat) => cat.subcategories).length}
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Subcategory Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Parent Category</TableHead>
              <TableHead>Products</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.flatMap((cat) =>
              cat.subcategories.map((sub) => (
                <TableRow key={sub.id}>
                  <TableCell className="font-medium">{sub.name}</TableCell>
                  <TableCell>{sub.description || "No description"}</TableCell>
                  <TableCell>{cat.name}</TableCell>
                  <TableCell>{sub.products.length}</TableCell>
                  <TableCell className="flex items-center gap-x-2">
                    <Button asChild size="sm">
                      <Link href={`/admin/categories/sub/${sub.id}/edit`}>
                        Edit
                      </Link>
                    </Button>
                    <DeleteSubcategory subcategoryId={sub.id} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}
    </section>
  );
}

function DeleteCategory({ categoryId }: { categoryId: string }) {
  const deleteCategory = deleteCategoryAction.bind(null, { categoryId });
  return (
    <FormContainer action={deleteCategory}>
      <IconButton actionType="delete" />
    </FormContainer>
  );
}

function DeleteSubcategory({ subcategoryId }: { subcategoryId: string }) {
  const deleteSubcategory = deleteSubcategoryAction.bind(null, {
    subcategoryId,
  });
  return (
    <FormContainer action={deleteSubcategory}>
      <IconButton actionType="delete" />
    </FormContainer>
  );
}

export default CategoriesPage;

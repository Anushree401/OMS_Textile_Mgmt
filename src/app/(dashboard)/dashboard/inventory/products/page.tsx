import { ProductsContent } from "@/components/inventory/products-content";
import { createClient as createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

// Define the structure of the fetched elements for map/set operations
type ProductFilterRow = {
  product_category: string | null;
  product_color: string | null;
  product_material: string | null;
};

export default async function ProductsPage() {
  const supabase = await createServerSupabaseClient(); 

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/login");
  }

  // Fetch products with pagination
  const { data: products, count } = await supabase
    .from("products")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(0, 9); // First 10 products

  // Fetch filter options
  // Workarounds for untyped client: Assert results as 'any' for local use
  const { data: categories } = await supabase
    .from("products")
    .select("product_category")
    .not("product_category", "is", null)
    .neq("product_category", "") as any; 

  const { data: colors } = await supabase
    .from("products")
    .select("product_color")
    .not("product_color", "is", null)
    .neq("product_color", "") as any; 

  const { data: materials } = await supabase
    .from("products")
    .select("product_material")
    .not("product_material", "is", null)
    .neq("product_material", "") as any; 

  const filterOptions = {
    // FIX 1 & 2: Type parameters (p) and assert final array as string[]
    categories: [
      ...new Set(
        (categories as ProductFilterRow[])?.map((p: ProductFilterRow) => p.product_category).filter(Boolean) || [],
      ),
    ] as string[], 
    // FIX 1 & 2: Type parameters (p) and assert final array as string[]
    colors: [
      ...new Set((colors as ProductFilterRow[])?.map((p: ProductFilterRow) => p.product_color).filter(Boolean) || []),
    ] as string[], 
    // FIX 1 & 2: Type parameters (p) and assert final array as string[]
    materials: [
      ...new Set(
        (materials as ProductFilterRow[])?.map((p: ProductFilterRow) => p.product_material).filter(Boolean) || [],
      ),
    ] as string[], 
    statuses: ["Active", "Inactive"],
  };

  return (
    <ProductsContent
      products={products || []}
      totalCount={count || 0}
      filterOptions={filterOptions}
      userRole={(profile as any)?.user_role} 
    />
  );
}
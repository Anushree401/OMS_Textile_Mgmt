import { createClient as createServerSupabaseClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// --- Type Definitions for Safety ---
// Note: In a real project, these should be imported from your Supabase generated types (Database['public']['Tables']['...'])

// Minimal type for Weaver Challan used in cost calculation
type WeaverChallan = {
  vendor_amount: number | null;
  challan_no: string;
  // This structure is based on how you access it:
  quality_details: { quality_name?: string; rate?: number }[] | null | undefined; 
};

// Minimal type for the main Challan fetch (isteaching_challans)
type StitchingChallan = {
  id: string;
  challan_no: string;
  batch_number: string[] | null;
  product_size: unknown; // Actual type is likely a JSON string or object array
  quantity: number | null;
  quality: string | null;
  selected_product_id: string | null;
  product_name: string | null;
  product_description: string | null;
  product_sku: string | null;
  category: string | null;
  sub_category: string | null;
  brand: string | null;
  product_color: string | null;
  ledgers: { business_name: string | null } | null;
  products: {
    id: string | null;
    product_name: string | null;
    product_description: string | null;
    product_sku: string | null;
    product_category: string | null;
    product_sub_category: string | null;
    product_brand: string | null;
    product_color: string | null;
    product_material: string | null;
  } | null;
};

// --- API Route Handler ---

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const resolvedParams = await params;
    
    // FIX 1: AWAIT the creation of the Supabase client
    const supabase = await createServerSupabaseClient(); 

    // Fetch the stitching challan with related data
    const { data: isteachingChallan, error } = await supabase
      .from("isteaching_challans")
      .select(
        `
        *,
        ledgers (*),
        products (*)
        `,
      )
      .eq("id", resolvedParams.id)
      .single();

    if (error || !isteachingChallan) {
      return NextResponse.json({ error: "Challan not found" }, { status: 404 });
    }
    
    // Type assertion for the fetched data
    const typedStitchingChallan = isteachingChallan as StitchingChallan;

    // Parse size details
    const parseSizeDetails = (
      sizeDetails: unknown,
    ): { size: string; quantity: number }[] => {
      if (!sizeDetails) return [];
      try {
        return typeof sizeDetails === "string"
          ? JSON.parse(sizeDetails)
          : (sizeDetails as { size: string; quantity: number }[]);
      } catch {
        return [];
      }
    };

    // Fetch related weaver challans to get cost and weaver challan number
    const { data: relatedWeaverChallans } = await supabase
      .from("weaver_challans")
      .select("*")
      .in("batch_number", typedStitchingChallan.batch_number as string[] || []);

    // Type assertion for weaver challans
    const typedWeaverChallans: WeaverChallan[] | null = relatedWeaverChallans as WeaverChallan[] | null;

    const sizeDetails = parseSizeDetails(typedStitchingChallan.product_size);

    // For each size, generate the required number of barcodes
    const barcodeData = sizeDetails.map(
      (size: { size: string; quantity: number }) => {
        // Calculate total barcodes needed (quantity + 3 as per requirements)
        const totalBarcodes = size.quantity + 3;
        const barcodes = [];

        // Generate barcode URLs for this size
        for (let i = 1; i <= totalBarcodes; i++) {
          // Create the data for the barcode
          const barcodeContent = {
            productName:
              typedStitchingChallan.products?.product_name ||
              typedStitchingChallan.product_name ||
              "",
            productDescription:
              typedStitchingChallan.products?.product_description ||
              typedStitchingChallan.product_description ||
              "",
            batchNumber: typedStitchingChallan.batch_number || [],
            cost: (() => {
              // Calculate cost based on quantity and rate from weaver challans
              if (typedWeaverChallans && typedWeaverChallans.length > 0) {
                const weaverChallan = typedWeaverChallans[0];

                let rate = 0;
                if (
                  weaverChallan.quality_details &&
                  Array.isArray(weaverChallan.quality_details)
                ) {
                  const quality = weaverChallan.quality_details.find(
                    (q) =>
                      q.quality_name === typedStitchingChallan.quality,
                  );
                  if (quality && quality.rate) {
                    rate = quality.rate;
                  }
                }

                // Calculate cost as quantity * rate
                return (typedStitchingChallan.quantity || 0) * rate;
              }
              // Fallback to vendor_amount if no rate is found
              // FIX 2: Explicitly type the reducer parameters (sum: number, wc: WeaverChallan)
              return (
                typedWeaverChallans?.reduce(
                  (sum: number, wc: WeaverChallan) => sum + (wc.vendor_amount || 0),
                  0,
                ) || 0
              );
            })(),
            weaverChallanNumber:
              typedWeaverChallans?.map((wc) => wc.challan_no).join(", ") ||
              "",
            stitchingChallanNumber: typedStitchingChallan.challan_no,
            size: size.size,
            barcodeNumber: i,
            // Add more product metadata
            productSKU:
              typedStitchingChallan.products?.product_sku ||
              typedStitchingChallan.product_sku ||
              "",
            productCategory:
              typedStitchingChallan.products?.product_category ||
              typedStitchingChallan.category ||
              "",
            productSubCategory:
              typedStitchingChallan.products?.product_sub_category ||
              typedStitchingChallan.sub_category ||
              "",
            productBrand:
              typedStitchingChallan.products?.product_brand ||
              typedStitchingChallan.brand ||
              "Bhaktinandan",
            productColor:
              typedStitchingChallan.products?.product_color ||
              typedStitchingChallan.product_color ||
              "",
            productMaterial: typedStitchingChallan.products?.product_material || "",
            quality: typedStitchingChallan.quality || "",
            ledgerName: typedStitchingChallan.ledgers?.business_name || "",
          };

          // Create a simplified content for the barcode (embedding the product URL with size info)
          const productId =
            typedStitchingChallan.products?.id ||
            typedStitchingChallan.selected_product_id ||
            null;
          let barcodeText;

          if (productId) {
            const productUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://oms-two-mu.vercel.app"}/product/${productId}?size=${size.size}&barcode=${i}`;
            barcodeText = productUrl;
          } else {
            const productSKU =
              typedStitchingChallan.products?.product_sku ||
              typedStitchingChallan.product_sku ||
              "NOSKU";
            barcodeText = `${productSKU}-${size.size}-${i}`;
          }

          // Generate Code128 barcode using bwip-js API
          const barcodeUrl = `http://bwipjs-api.metafloor.com/?bcid=code128&text=${encodeURIComponent(barcodeText)}&scale=3&height=10&includetext=true&textxalign=center`;
          barcodes.push(barcodeUrl);
        }

        return {
          size: size.size,
          quantity: size.quantity,
          barcodes: barcodes,
        };
      },
    );

    return NextResponse.json({
      success: true,
      challan: typedStitchingChallan.challan_no,
      barcodes: barcodeData,
    });
  } catch (error) {
    console.error("Error generating barcodes:", error);
    return NextResponse.json(
      { error: "Failed to generate barcodes" },
      { status: 500 },
    );
  }
}
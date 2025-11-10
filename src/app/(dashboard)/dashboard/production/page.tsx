import { ProductionDashboardContent } from "@/components/production/production-dashboard-content";
import { createClient as createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

type QualityDetail = {
  quality_name: string;
  rate: number;
};

type WeaverChallanRow = {
  quality_details: QualityDetail[];
  batch_number: string;
  challan_date: string;
  ms_party_name: string;
  total_grey_mtr: number;
};

type ShortingEntryRow = {
  quality_name: string;
  shorting_qty: number;
};

type IsteachingChallanRow = {
  quality: string;
  quantity: number;
  [key: string]: any;
};

type BatchData = {
  batch_number: string;
  weaver_challan_date: string;
  weaver_challan_party: string;
  weaver_challan_quantity: number;
  total_raw_fabric_used: number;
  stitching_challans: {
    id: number;
    date: string;
    challan_no: string;
    product_name: string | null;
    quantity: number;
    top_qty: number | null;
    top_pcs_qty: number | null;
    bottom_qty: number | null;
    bottom_pcs_qty: number | null;
    both_selected: boolean | null;
    both_top_qty: number | null;
    both_bottom_qty: number | null;
    inventory_classification: string | null;
  }[];
  expenses: {
    id: number;
    expense_date: string;
    cost: number;
    expense_for: string[];
  }[];
};

export default async function ProductionDashboardPage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch weaver challans
  const { data: weaverChallansDataRaw } = await supabase
    .from("weaver_challans")
    .select(
      "quality_details, batch_number, challan_date, ms_party_name, total_grey_mtr",
    );
  const weaverChallansData =
    (weaverChallansDataRaw as WeaverChallanRow[]) || [];

  // Fetch shorting entries
  const { data: shortingEntriesRaw } = await supabase
    .from("shorting_entries")
    .select("*");
  const shortingEntries = (shortingEntriesRaw as ShortingEntryRow[]) || [];

  // Fetch isteaching challans
  const { data: isteachingChallansRaw } = await supabase
    .from("isteaching_challans")
    .select("*");
  const isteachingChallans =
    (isteachingChallansRaw as IsteachingChallanRow[]) || [];

  // Calculate finished stock by quality
  const weaverChallansByQuality: { [key: string]: number } = {};
  for (const challan of weaverChallansData) {
    if (Array.isArray(challan.quality_details)) {
      for (const detail of challan.quality_details) {
        if (detail.quality_name && detail.rate) {
          weaverChallansByQuality[detail.quality_name] =
            (weaverChallansByQuality[detail.quality_name] || 0) + detail.rate;
        }
      }
    }
  }

  const shortingByQuality: { [key: string]: number } = {};
  for (const entry of shortingEntries) {
    if (entry.quality_name) {
      shortingByQuality[entry.quality_name] =
        (shortingByQuality[entry.quality_name] || 0) + entry.shorting_qty;
    }
  }

  const isteachingByQuality: { [key: string]: number } = {};
  for (const challan of isteachingChallans) {
    if (challan.quality) {
      isteachingByQuality[challan.quality] =
        (isteachingByQuality[challan.quality] || 0) + challan.quantity;
    }
  }

  const finishedStock = Object.keys({
    ...weaverChallansByQuality,
    ...shortingByQuality,
    ...isteachingByQuality,
  }).map((quality) => {
    const totalQty = weaverChallansByQuality[quality] || 0;
    const shorted = shortingByQuality[quality] || 0;
    const issued = isteachingByQuality[quality] || 0;
    return {
      quality_name: quality,
      total_qty: totalQty,
      shorted_qty: shorted,
      issued_qty: issued,
      available_qty: totalQty - shorted - issued,
    };
  });

  const batchNumbers = weaverChallansData
    .map((c) => c.batch_number)
    .filter(Boolean) as string[];

  // Fetch detailed batch data for the dashboard
  const batchData: BatchData[] = [];
  for (const weaverChallan of weaverChallansData) {
    // Fetch stitching challans for this batch
    const { data: stitchingChallansRaw } = await supabase
      .from("isteaching_challans")
      .select(
        `
        id,
        date,
        challan_no,
        product_name,
        quantity,
        top_qty,
        top_pcs_qty,
        bottom_qty,
        bottom_pcs_qty,
        both_selected,
        both_top_qty,
        both_bottom_qty,
        inventory_classification
      `,
      )
      .contains("batch_number", [weaverChallan.batch_number]);
    const stitchingChallans = stitchingChallansRaw || [];

    // Fetch expenses related to stitching challans of this batch
    const challanNumbers =
      stitchingChallans.map((challan: any) => challan.challan_no) || [];
    let expensesData: any[] = [];
    if (challanNumbers.length > 0) {
      const { data: expenses } = await supabase
        .from("expenses")
        .select("*")
        .in("challan_no", challanNumbers);
      expensesData = expenses || [];
    }

    batchData.push({
      batch_number: weaverChallan.batch_number,
      weaver_challan_date: weaverChallan.challan_date,
      weaver_challan_party: weaverChallan.ms_party_name,
      weaver_challan_quantity: weaverChallan.total_grey_mtr,
      total_raw_fabric_used: weaverChallan.total_grey_mtr,
      stitching_challans: stitchingChallans,
      expenses: expensesData,
    });
  }

  return (
    <ProductionDashboardContent
      finishedStock={finishedStock}
      batchNumbers={batchNumbers}
      batchData={batchData}
    />
  );
}

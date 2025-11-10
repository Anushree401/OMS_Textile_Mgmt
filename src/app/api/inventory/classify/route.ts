// src\app\api\inventory\classify\route.ts

import { createClient as createServerSupabaseClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// Define the valid classification types for better request validation
type ClassificationType = "good" | "bad" | "wastage" | "shorting";

// Define the expected structure of the incoming request body
interface ClassifyPayload {
    challanId: string;
    classification: ClassificationType;
}

export async function POST(request: Request) {
  // Await the client creation (already correct)
  // ⚠️ WORKAROUND: Cast the entire client result to 'any'
  const supabase = (await createServerSupabaseClient()) as any; 

  try {
    // Explicitly type the request body data
    const { challanId, classification } = await request.json() as ClassifyPayload;

    // Validate classification
    const validClassifications: ClassificationType[] = ["good", "bad", "wastage", "shorting"];
    if (!validClassifications.includes(classification)) {
      return NextResponse.json(
        { error: "Invalid classification" },
        { status: 400 },
      );
    }

    // Prepare the update payload (no need for 'as any' here if the client is 'any')
    const updatePayload = { 
        inventory_classification: classification 
    };

    // Update the challan classification
    const { error } = await supabase
      .from("isteaching_challans")
      .update(updatePayload) 
      .eq("id", challanId);

    if (error) {
      console.error("Error updating challan classification:", error);
      return NextResponse.json(
        { error: "Failed to classify challan" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in classify API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
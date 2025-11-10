import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server"; // Use standardized custom client
import { formatDate } from "@/lib/utils";
import { Database, Json, Tables } from "@/types/supabase";
import {
  ArrowLeft,
  Building2,
  Calendar,
  Edit,
  FileText,
  Package,
  Printer,
  ShoppingCart,
} from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

// --- TYPE DEFINITIONS ---
type PurchaseOrderBase = Tables<"purchase_orders">;
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type LedgerJoin = Pick<
  Tables<"ledgers">,
  | "business_name"
  | "contact_person_name"
  | "mobile_number"
  | "email"
  | "address"
  | "city"
  | "state"
  | "gst_number"
>;

// Define the raw data structure from the JOIN query
type PurchaseOrderRaw = PurchaseOrderBase & { ledgers: LedgerJoin | null };

// Define the finalized object for safer access and guaranteed types
type FinalPurchaseOrder = Omit<
  PurchaseOrderBase,
  | "created_at"
  | "updated_at"
  | "total_amount"
  | "delivery_date"
  | "items"
  | "ledgers"
  | "po_date"
  | "status"
> & {
  created_at: string;
  updated_at: string;
  delivery_date: string | null;
  po_date: string;
  status: string | null;
  total_amount: number;
  items: any[];
  ledgers: LedgerJoin | null;
  user_role: string;
};

type UserRoleProfile = Pick<ProfileRow, "user_role">;
// --- END TYPE DEFINITIONS ---

interface PurchaseOrderDetailPageProps {
  params: { id: string };
}

export default async function PurchaseOrderDetailPage({
  params,
}: PurchaseOrderDetailPageProps) {
  const supabase = await createClient();

  const { id } = params;

  // 1. Authentication Check
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  // 2. Get user profile
  const { data: profileRaw } = await supabase
    .from("profiles")
    .select("user_role") // Only select user_role
    .eq("id", user.id)
    .single();

  const profile = profileRaw as UserRoleProfile | null;

  if (!profile) {
    return redirect("/login");
  }

  // 3. Fetch purchase order details with ledger info
  const { data: purchaseOrderRaw, error } = await supabase
    .from("purchase_orders")
    .select(
      `
      *,
      ledgers (
        business_name, contact_person_name, mobile_number, email, address, city, state, gst_number
      )
    `,
    )
    .eq("id", id)
    .single();

  if (error || !purchaseOrderRaw) {
    notFound();
  }

  const raw = purchaseOrderRaw as PurchaseOrderRaw;

  const canEdit =
    profile.user_role === "Admin" || profile.user_role === "Manager";

  const getStatusBadge = (status: string | null) => {
    if (!status) return null;
    const statusColors: { [key: string]: string } = {
      Draft: "bg-gray-100 text-gray-700",
      Sent: "bg-blue-100 text-blue-700",
      Confirmed: "bg-green-100 text-green-700",
      Partial: "bg-yellow-100 text-yellow-700",
      Completed: "bg-emerald-100 text-emerald-700",
      Cancelled: "bg-red-100 text-red-700",
    };

    return (
      <Badge variant="secondary" className={statusColors[status]}>
        {status}
      </Badge>
    );
  };

  const parseItems = (items: Json | null) => {
    if (!items) return [];
    try {
      return typeof items === "string" ? JSON.parse(items) : items;
    } catch {
      return [];
    }
  };

  const items = parseItems(raw.items) as any[];

  // Normalize and create a safe purchaseOrder object for display
  const purchaseOrder: FinalPurchaseOrder = {
    ...raw,
    po_date: raw.po_date || new Date().toISOString().split("T")[0],
    total_amount: raw.total_amount || 0,
    created_at: raw.created_at || new Date().toISOString(),
    updated_at: raw.updated_at || new Date().toISOString(),
    items: items,
    ledgers: raw.ledgers,
    user_role: profile.user_role ?? "",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/purchase/manage">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Purchase Orders
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Purchase Order Details
            </h1>
            <p className="text-gray-600 mt-1">
              View purchase order information and items
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Link href={`/dashboard/purchase/${purchaseOrder.id}/print`}>
            <Button variant="outline">
              <Printer className="h-4 w-4 mr-2" />
              Print PO
            </Button>
          </Link>
          {canEdit && (
            <Link href={`/dashboard/purchase/${purchaseOrder.id}/edit`}>
              <Button>
                <Edit className="h-4 w-4 mr-2" />
                Edit PO
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* PO Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ShoppingCart className="h-5 w-5 mr-2" />
              PO Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">
                PO Number
              </label>
              <p className="font-mono text-lg font-semibold">
                {purchaseOrder.po_number}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">
                Status
              </label>
              <div className="mt-1">{getStatusBadge(purchaseOrder.status)}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">
                Total Amount
              </label>
              <p className="text-2xl font-bold text-green-600">
                ₹{purchaseOrder.total_amount.toLocaleString()}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">
                PO Date
              </label>
              <p className="flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                {formatDate(purchaseOrder.po_date)}
              </p>
            </div>
            {purchaseOrder.delivery_date && (
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Expected Delivery
                </label>
                <p className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                  {formatDate(purchaseOrder.delivery_date)}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Supplier Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building2 className="h-5 w-5 mr-2" />
                Supplier Information
              </CardTitle>
              <CardDescription>
                Supplier details and contact information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Supplier Name
                </label>
                <p className="text-lg font-semibold">
                  {purchaseOrder.supplier_name}
                </p>
              </div>

              {purchaseOrder.ledgers && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Business Name
                    </label>
                    <p className="text-gray-900">
                      {purchaseOrder.ledgers.business_name}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Contact Person
                    </label>
                    <p className="text-gray-900">
                      {purchaseOrder.ledgers.contact_person_name ||
                        "Not specified"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Mobile
                    </label>
                    <p className="text-gray-900">
                      {purchaseOrder.ledgers.mobile_number || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <p className="text-gray-900">
                      {purchaseOrder.ledgers.email || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      GST Number
                    </label>
                    <p className="font-mono text-sm">
                      {purchaseOrder.ledgers.gst_number || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Address
                    </label>
                    <p className="text-gray-900">
                      {purchaseOrder.ledgers.address
                        ? `${purchaseOrder.ledgers.address}, ${purchaseOrder.ledgers.city}, ${purchaseOrder.ledgers.state}`
                        : "Not provided"}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Purchase Items
              </CardTitle>
              <CardDescription>
                {items.length} items in this purchase order
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {items.map(
                  (
                    item: {
                      item_name: string;
                      description: string;
                      quantity: number;
                      unit_price: number;
                      total_price: number;
                    },
                    index: number,
                  ) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-2">
                          <label className="text-sm font-medium text-gray-700">
                            Item Name
                          </label>
                          <p className="font-semibold">{item.item_name}</p>
                          {item.description && (
                            <p className="text-sm text-gray-600 mt-1">
                              {item.description}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">
                            Quantity
                          </label>
                          <p className="text-lg">{item.quantity}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">
                            Unit Price
                          </label>
                          <p className="text-lg">
                            ₹{item.unit_price.toLocaleString()}
                          </p>
                        </div>
                        <div className="md:col-span-4">
                          <div className="flex justify-between items-center pt-2 border-t">
                            <span className="font-medium">Item Total:</span>
                            <span className="text-lg font-bold">
                              ₹{item.total_price.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ),
                )}
              </div>

              <div className="mt-6 pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-semibold">Grand Total:</span>
                  <span className="text-2xl font-bold text-green-600">
                    ₹{purchaseOrder.total_amount.toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Details */}
          {(purchaseOrder.description || purchaseOrder.terms_conditions) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Additional Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {purchaseOrder.description && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <p className="text-gray-900 mt-1">
                      {purchaseOrder.description}
                    </p>
                  </div>
                )}
                {purchaseOrder.terms_conditions && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Terms & Conditions
                    </label>
                    <p className="text-gray-900 mt-1 whitespace-pre-wrap">
                      {purchaseOrder.terms_conditions}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle>Record Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Created At
                  </label>
                  <p className="text-gray-900">
                    {purchaseOrder.created_at
                      ? formatDate(purchaseOrder.created_at)
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Last Updated
                  </label>
                  <p className="text-gray-900">
                    {purchaseOrder.updated_at
                      ? formatDate(purchaseOrder.updated_at)
                      : "N/A"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

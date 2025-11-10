import ChallanList from "@/components/ledger/challan-list";
import ExpenseList from "@/components/ledger/expense-list";
import IsteachingChallanList from "@/components/ledger/isteaching-challan-list";
import LedgerSummary from "@/components/ledger/ledger-summary";
import Passbook from "@/components/ledger/passbook";
import PaymentVoucherList from "@/components/ledger/payment-voucher-list";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient as createServerSupabaseClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import { Database } from "@/types/supabase";
import {
  ArrowLeft,
  Building2,
  Edit,
  FileText,
  Mail,
  MapPin,
  Phone,
  Printer,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

// Types
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type LedgerRow = Database["public"]["Tables"]["ledgers"]["Row"];

interface LedgerDetailPageProps {
  params: { id: string };
}

// Helper: map all nullable ledger fields to safe default values
function cleanupLedger(row: LedgerRow) {
  return {
    ...row,
    business_logo: row.business_logo ?? "",
    business_name: row.business_name ?? "",
    contact_person_name: row.contact_person_name ?? "",
    gst_number: row.gst_number ?? "",
    pan_number: row.pan_number ?? "",
    mobile_number: row.mobile_number ?? "",
    email: row.email ?? "",
    address: row.address ?? "",
    city: row.city ?? "",
    district: row.district ?? "",
    state: row.state ?? "",
    country: row.country ?? "",
    zip_code: row.zip_code ?? "",
    edit_logs: row.edit_logs ?? "",
    created_at: row.created_at ?? "",
    updated_at: row.updated_at ?? "",
    ledger_id: row.ledger_id ?? "",
  };
}

export default async function LedgerDetailPage({
  params,
}: LedgerDetailPageProps) {
  const { id } = params;

  // Always await server client creation
  const supabase = await createServerSupabaseClient();

  // User fetch
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return redirect("/login");

  // Profile fetch
  const { data: profileData } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  const profile = profileData as ProfileRow | null;
  if (!profile) return redirect("/login");

  // Ledger fetch
  const { data: ledgerData, error } = await supabase
    .from("ledgers")
    .select("*")
    .eq("ledger_id", id)
    .single();
  if (error || !ledgerData) return notFound();
  const ledger = cleanupLedger(ledgerData);

  // Vendor challans fetch
  const { data: vendorChallans } = await supabase
    .from("weaver_challans")
    .select("*")
    .eq("vendor_ledger_id", id);

  // Edit permission
  const canEdit =
    profile &&
    (profile.user_role === "Admin" || profile.user_role === "Manager");

  // Render
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/ledger/list">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Ledgers
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Ledger Details</h1>
            <p className="text-gray-600 mt-1">
              View business partner information
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Link href={`/print/ledger/${ledger.ledger_id}`}>
            <Button variant="outline">
              <Printer className="h-4 w-4 mr-2" />
              Print Ledger
            </Button>
          </Link>
          {canEdit && (
            <Link href={`/dashboard/ledger/${ledger.ledger_id}/edit`}>
              <Button>
                <Edit className="h-4 w-4 mr-2" />
                Edit Ledger
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building2 className="h-5 w-5 mr-2" />
                Business Logo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                {ledger.business_logo ? (
                  <Image
                    src={ledger.business_logo}
                    alt={ledger.business_name}
                    width={200}
                    height={200}
                    className="rounded-lg object-cover w-full h-full"
                  />
                ) : (
                  <div className="text-gray-400 text-center">
                    <Building2 className="h-16 w-16 mx-auto mb-4" />
                    <p>No logo available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <LedgerSummary ledgerId={ledger.ledger_id} />
        </div>

        <div className="lg:col-span-2 space-y-6">
          {/* Business Information */}
          <Card>
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
              <CardDescription>
                Primary business details and identification
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Ledger ID
                  </label>
                  <p className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                    {ledger.ledger_id}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Business Name
                  </label>
                  <p className="text-lg font-semibold">
                    {ledger.business_name}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Contact Person
                  </label>
                  <p className="text-gray-900">
                    {ledger.contact_person_name || "Not specified"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    {ledger.gst_number ? "GST Number" : "PAN Number"}
                  </label>
                  <p className="font-mono text-sm">
                    {ledger.gst_number || ledger.pan_number || "Not provided"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Phone className="h-5 w-5 mr-2" />
                Contact Information
              </CardTitle>
              <CardDescription>Communication details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Mobile Number
                    </label>
                    <p className="text-gray-900">
                      {ledger.mobile_number || "Not provided"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-gray-40" />
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <p className="text-gray-900">
                      {ledger.email || "Not provided"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Address Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Address Information
              </CardTitle>
              <CardDescription>Location and postal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Address
                </label>
                <p className="text-gray-900">
                  {ledger.address || "Not provided"}
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    City
                  </label>
                  <p className="text-gray-900">
                    {ledger.city || "Not specified"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    District
                  </label>
                  <p className="text-gray-900">
                    {ledger.district || "Not specified"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    State
                  </label>
                  <p className="text-gray-900">
                    {ledger.state || "Not specified"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Country
                  </label>
                  <p className="text-gray-900">
                    {ledger.country || "Not specified"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    ZIP Code
                  </label>
                  <p className="text-gray-900">
                    {ledger.zip_code || "Not specified"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Record Information
              </CardTitle>
              <CardDescription>
                Creation and modification details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Created At
                  </label>
                  <p className="text-gray-900">
                    {formatDate(ledger.created_at)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Last Updated
                  </label>
                  <p className="text-gray-900">
                    {formatDate(ledger.updated_at)}
                  </p>
                </div>
              </div>
              {ledger.edit_logs && (
                <div className="mt-4">
                  <label className="text-sm font-medium text-gray-700">
                    Edit History
                  </label>
                  <p className="text-sm text-gray-600 mt-1">
                    {ledger.edit_logs}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <hr className="my-6" />

      {vendorChallans && vendorChallans.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Vendor Ledger Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="multiple" className="w-full">
              <AccordionItem value="vendor-passbook">
                <AccordionTrigger>Vendor Passbook</AccordionTrigger>
                <AccordionContent>
                  <Passbook
                    ledgerId={ledger.ledger_id}
                    vendorChallans={vendorChallans}
                  />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      )}

      <Accordion type="multiple" className="w-full">
        <AccordionItem value="passbook">
          <AccordionTrigger>Passbook</AccordionTrigger>
          <AccordionContent>
            <Passbook ledgerId={ledger.ledger_id} />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="challans">
          <AccordionTrigger>Challan Details</AccordionTrigger>
          <AccordionContent>
            <ChallanList ledgerId={ledger.ledger_id} />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="expenses">
          <AccordionTrigger>Expense Details</AccordionTrigger>
          <AccordionContent>
            <ExpenseList ledgerId={ledger.ledger_id} />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="payment-vouchers">
          <AccordionTrigger>Payment Vouchers</AccordionTrigger>
          <AccordionContent>
            <PaymentVoucherList ledgerId={ledger.ledger_id} />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="isteaching-challans">
          <AccordionTrigger>Stitching Challans</AccordionTrigger>
          <AccordionContent>
            <IsteachingChallanList ledgerId={ledger.ledger_id} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

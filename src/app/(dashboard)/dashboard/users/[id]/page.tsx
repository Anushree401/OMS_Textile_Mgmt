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
import { Database } from "@/types/supabase";
import {
  ArrowLeft,
  Calendar,
  Edit
} from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

type ProfileRow = Database['public']['Tables']['profiles']['Row'];
type UserProfile = ProfileRow;
type CurrentProfile = ProfileRow;

interface UserDetailPageProps {
  params: { id: string };
}

export default async function UserDetailPage({ params }: UserDetailPageProps) {
  const supabase = await createClient();

  const { id } = params;

  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  if (!currentUser) {
    return redirect("/login");
  }

  const { data: currentProfileRaw } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", currentUser.id)
    .single();

  const currentProfile = currentProfileRaw as CurrentProfile | null;

  if (!currentProfile) {
    return redirect("/login");
  }

  if (currentProfile.user_role !== "Admin" && currentUser.id !== id) {
    return redirect("/dashboard/users/manage");
  }

  const { data: userProfileRaw, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();

  const userProfile = userProfileRaw as UserProfile | null;

  if (error || !userProfile) {
    notFound();
  }

  // Normalize date fields to non-null strings for formatDate usage
  const normalizedProfile = {
    ...userProfile,
    created_at: userProfile.created_at || new Date().toISOString(),
    updated_at: userProfile.updated_at || new Date().toISOString(),
    dob: userProfile.dob || "",
  };

  const canEdit = currentProfile.user_role === "Admin" || currentUser.id === id;

  // Utility badge, initials, etc functions here - omitted for brevity (copy from your existing code)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/users/manage">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Users
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">User Profile</h1>
            <p className="text-gray-600 mt-1">
              View user information and account details
            </p>
          </div>
        </div>
        {canEdit && (
          <Link href={`/dashboard/users/${userProfile.id}/edit`}>
            <Button>
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Photo */}
        {/* ... add your Profile Photo Card JSX here */}

        {/* User Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Personal and account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    First Name
                  </label>
                  <p className="text-lg">
                    {normalizedProfile.first_name || "Not specified"}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Last Name
                  </label>
                  <p className="text-lg">
                    {normalizedProfile.last_name || "Not specified"}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <p className="text-gray-900 font-mono text-sm">{normalizedProfile.email}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Mobile</label>
                  <p className="text-gray-900">{normalizedProfile.mobile || "Not provided"}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Role</label>
                  <div className="mt-1">{/* Call getRoleBadge(normalizedProfile.user_role) here */}</div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <div className="mt-1">{/* Call getStatusBadge(normalizedProfile.user_status) here */}</div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Date of Birth</label>
                  <p className="text-gray-900 flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                    {normalizedProfile.dob ? formatDate(normalizedProfile.dob) : "Not specified"}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Account Created</label>
                  <p className="text-gray-900">{formatDate(normalizedProfile.created_at)}</p>
                </div>

              </div>
            </CardContent>
          </Card>

          {/* Add other cards e.g. Address, Additional Details */}
        </div>
      </div>
    </div>
  );
}

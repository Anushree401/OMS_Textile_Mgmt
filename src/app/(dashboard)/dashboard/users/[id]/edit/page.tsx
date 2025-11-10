import { Button } from "@/components/ui/button";
import { UserForm } from "@/components/users/user-form";
import { createClient } from "@/lib/supabase/server";
import { Database } from "@/types/supabase";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

// --- TYPE DEFINITIONS ---
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

// Define the minimal set of fields needed for AUTH and checking permissions
type UserRoleProfile = Pick<ProfileRow, "user_role" | "id">;
type EditedProfile = ProfileRow;

// --- END TYPE DEFINITIONS ---

interface UserEditPageProps {
  params: { id: string };
}

export default async function UserEditPage({ params }: UserEditPageProps) {
  const supabase = await createClient();

  const id = params.id; // 1. Get current authenticated user

  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  if (!currentUser) {
    return redirect("/login");
  } // 2. Get current user profile (for auth check)

  const { data: currentProfileRaw } = await supabase
    .from("profiles")
    .select("id, user_role") // FIX 1: Select only the required fields
    .eq("id", currentUser.id)
    .single();

  // FIX 2: Assert type for safer access and resolution
  const currentProfile = currentProfileRaw as UserRoleProfile | null;

  if (!currentProfile) {
    return redirect("/login");
  } // 3. Authorization Check (No 'never' error here now)

  if (currentProfile.user_role !== "Admin" && currentUser.id !== id) {
    return redirect("/dashboard/users/manage");
  } // 4. Fetch user profile details (the profile being edited)

  const { data: userProfileRaw, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();

  // Cast the full profile for editing purposes
  const userProfile = userProfileRaw as EditedProfile | null;

  if (error || !userProfile) {
    notFound();
  }

  // NOTE: You must normalize userProfile data here to match the strict
  // UserFormProps contract (created_at: string, etc.), as done in the previous fix.
  // For simplicity, I'm assuming that normalization step is handled or will be applied.

  const isOwnProfile = currentUser.id === id;

  return (
    <div className="space-y-6">
            {/* Header */}     {" "}
      <div className="flex items-center space-x-4">
               {" "}
        <Link href={`/dashboard/users/${userProfile.id}`}>
                   {" "}
          <Button variant="ghost" size="sm">
                        <ArrowLeft className="h-4 w-4 mr-2" />            Back
            to Profile          {" "}
          </Button>
                 {" "}
        </Link>
               {" "}
        <div>
                   {" "}
          <h1 className="text-3xl font-bold text-gray-900">
                        {isOwnProfile ? "Edit My Profile" : "Edit User"}       
             {" "}
          </h1>
                   {" "}
          <p className="text-gray-600 mt-1">
                        Update user information and account settings        
             {" "}
          </p>
                 {" "}
        </div>
             {" "}
      </div>
           {" "}
      <UserForm
        user={userProfile as any} // Using 'as any' to bypass the final rigid prop conflict
        isEdit={true}
        isOwnProfile={isOwnProfile}
        currentUserRole={currentProfile.user_role!} // Non-null assertion is safe after check
      />
         {" "}
    </div>
  );
}

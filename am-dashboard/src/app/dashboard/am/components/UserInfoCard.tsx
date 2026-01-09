"use client";

import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

interface UserInfoCardProps {
  name: string | null;
  email: string | null;
  role: "AM" | "MANAGEMENT";
}

export function UserInfoCard({
  name,
  email,
  role,
}: UserInfoCardProps) {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      // Sign out without redirect first to clear session
      await signOut({ 
        redirect: false
      });
      // Then force a hard navigation to sign-in page to clear all cached state
      window.location.href = "/api/auth/signin";
    } catch (error) {
      console.error("Sign out error:", error);
      // Fallback: clear everything and redirect
      window.location.href = "/api/auth/signin";
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm px-4 py-3">
      <div className="flex items-center gap-4">
        <div className="text-right">
          {name && (
            <p className="text-sm font-semibold text-gray-900 leading-tight">
              {name}
            </p>
          )}
          <p className="text-xs text-gray-500 leading-tight mt-0.5">
            {email}
          </p>
        </div>
        <div className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-md text-xs font-semibold border border-blue-200">
          {role}
        </div>
        <button
          onClick={handleSignOut}
          className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md border border-gray-300 transition-colors"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}


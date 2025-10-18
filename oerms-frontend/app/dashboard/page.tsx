"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../components/AuthProvider";

export default function DashboardRedirect() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.roles?.includes("ADMIN")) {
      router.replace("/admin/dashboard");
    } else if (user.roles?.includes("TEACHER")) {
      router.replace("/teacher/dashboard");
    } else if (user.roles?.includes("STUDENT")) {
      router.replace("/student/dashboard");
    } else {
      router.replace("/");
    }
  }, [user, loading, router]);

  return <div className="p-8">Redirecting to your dashboard...</div>;
}

"use client";
import { useEffect } from "react";
import { useAuth } from "../../components/AuthProvider";
import { useRouter } from "next/navigation";

export default function LogoutPage() {
  const { logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    logout().then(() => router.push("/auth/login"));
  }, [logout, router]);

  return <div>Signing out...</div>;
}

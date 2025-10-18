"use client";
import { useAuth } from "./AuthProvider";

export default function UserProfile() {
  const { user } = useAuth();
  if (!user) return null;
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
        {user.name ? user.name.split(' ').map(n => n[0]).join('') : user.email[0].toUpperCase()}
      </div>
      <div>
        <p className="font-semibold text-gray-900 text-sm">{user.name || user.email}</p>
        <p className="text-xs text-gray-600">{user.roles.join(', ')}</p>
      </div>
    </div>
  );
}

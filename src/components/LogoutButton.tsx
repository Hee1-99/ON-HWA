"use client";

import { signOut } from "@/app/actions/authActions";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  return (
    <button
      onClick={async () => await signOut()}
      className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-[var(--warm-rose)] px-4 py-2 bg-white border border-gray-200 rounded-full shadow-sm transition-all hover:shadow-md hover:border-[var(--warm-rose)]"
    >
      <LogOut className="w-4 h-4" />
      로그아웃
    </button>
  );
}

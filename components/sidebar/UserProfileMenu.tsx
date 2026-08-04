"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronUp, ChevronDown, User, LogOut } from "lucide-react";

interface UserProfileMenuProps {
  name: string;
  initial: string;
  onLogout: () => void;
}

export default function UserProfileMenu({ name, initial, onLogout }: UserProfileMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div ref={menuRef} className="relative w-full">
      {open && (
        <div
          role="menu"
          className="absolute bottom-full left-0 mb-1 w-full bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden"
        >
          <button
            role="menuitem"
            onClick={() => { router.push("/profile"); setOpen(false); }}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-gray-900 hover:bg-gray-50 text-left"
          >
            <User size={16} className="text-gray-500" />
            Profile
          </button>
          <button
            role="menuitem"
            onClick={() => { onLogout(); setOpen(false); }}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-left border-t border-gray-200"
            style={{ color: "#791F1F" }}
          >
            <LogOut size={16} style={{ color: "#791F1F" }} />
            Log out
          </button>
        </div>
      )}

      <button
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-2.5 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-left"
      >
        <div
          className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center font-medium text-sm"
          style={{ backgroundColor: "#501313", color: "#FCEBEB" }}
        >
          {initial}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-gray-900 truncate">{name}</p>
          <p className="text-xs text-gray-500">View profile</p>
        </div>
        {open ? (
          <ChevronUp size={16} className="text-gray-400 flex-shrink-0" />
        ) : (
          <ChevronDown size={16} className="text-gray-400 flex-shrink-0" />
        )}
      </button>
    </div>
  );
}

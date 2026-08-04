"use client";

import { useState, useRef, useEffect } from "react";

interface ProfileMenuButtonProps {
  name: string;
  initials: string;
  onLogout: () => void;
}

export default function ProfileMenuButton({ name, initials, onLogout }: ProfileMenuButtonProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
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

  const buttonStyle = {
    display: "flex",
    width: "100%",
    alignItems: "center",
    gap: "10px",
    borderRadius: "8px",
    padding: "8px 10px",
    background: "transparent",
    cursor: "pointer",
    border: "none",
    transition: "all 0.15s ease",
    boxSizing: "border-box" as const,
  };

  const avatarStyle = {
    display: "flex",
    height: "32px",
    width: "32px",
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "50%",
    background: "#7A1315",
    color: "white",
    fontSize: "14px",
    fontWeight: "500",
  };

  const nameStyle = {
    flex: 1,
    minWidth: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap" as const,
    textAlign: "left" as const,
    fontSize: "14px",
    fontWeight: "500",
    color: "#111827",
  };

  const menuStyle = {
    position: "absolute" as const,
    bottom: "48px",
    left: 0,
    width: "100%",
    borderRadius: "8px",
    border: "1px solid rgba(0, 0, 0, 0.1)",
    background: "white",
    padding: "6px",
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15)",
    zIndex: 100,
  };

  const logoutStyle = {
    display: "flex",
    width: "100%",
    alignItems: "center",
    gap: "10px",
    borderRadius: "6px",
    padding: "8px 10px",
    fontSize: "14px",
    color: "#A32D2D",
    cursor: "pointer",
    border: "none",
    background: "none",
    textAlign: "left" as const,
  };

  return (
    <div ref={containerRef} style={{ position: "relative", width: "100%" }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        style={buttonStyle}
        onMouseEnter={(e) => e.currentTarget.style.background = "#F3F4F6"}
        onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
        onMouseDown={(e) => e.currentTarget.style.transform = "scale(0.98)"}
        onMouseUp={(e) => e.currentTarget.style.transform = "scale(1)"}
      >
        <span style={avatarStyle}>
          {initials}
        </span>
        <span style={nameStyle}>
          {name}
        </span>
      </button>

      {open && (
        <div
          role="menu"
          style={menuStyle}
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onLogout();
            }}
            style={logoutStyle}
            onMouseEnter={(e) => e.currentTarget.style.background = "#FEF2F2"}
            onMouseLeave={(e) => e.currentTarget.style.background = "none"}
          >
            <svg style={{ height: "16px", width: "16px", flexShrink: 0 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
            Log out
          </button>
        </div>
      )}
    </div>
  );
}

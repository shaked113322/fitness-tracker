"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Dumbbell, BarChart2, Camera, Brain, Home, Menu, X, LogOut, User, Shield } from "lucide-react";
import { useState, useEffect } from "react";

const navLinks = [
  { href: "/", label: "דשבורד", icon: Home },
  { href: "/workouts", label: "אימונים", icon: Dumbbell },
  { href: "/body-stats", label: "מדדי גוף", icon: BarChart2 },
  { href: "/photos", label: "תמונות", icon: Camera },
  { href: "/ai", label: "ניתוח AI", icon: Brain },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<{ username: string; isAdmin: boolean } | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setUser(d.user ?? null));
  }, [pathname]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  return (
    <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-orange-500 p-1.5 rounded-lg">
              <Dumbbell className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-white">FitTrack</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${pathname === href ? "bg-orange-500 text-white" : "text-gray-400 hover:text-white hover:bg-gray-800"}`}>
                <Icon className="w-4 h-4" />{label}
              </Link>
            ))}
          </div>

          {/* User + Logout */}
          <div className="hidden md:flex items-center gap-3">
            {user?.isAdmin && (
              <Link href="/admin" className={`flex items-center gap-1.5 text-sm px-2 py-1.5 rounded-lg transition-colors ${pathname.startsWith("/admin") ? "bg-yellow-500/20 text-yellow-400" : "text-gray-500 hover:text-yellow-400 hover:bg-gray-800"}`}>
                <Shield className="w-4 h-4" />Admin
              </Link>
            )}
            {user && (
              <Link href="/profile" className={`flex items-center gap-2 text-sm px-2 py-1.5 rounded-lg transition-colors ${pathname === "/profile" ? "bg-gray-700 text-white" : "text-gray-400 hover:text-white hover:bg-gray-800"}`}>
                <User className="w-4 h-4" />
                <span>{user.username}</span>
              </Link>
            )}
            <button onClick={handleLogout} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-400 transition-colors px-2 py-1.5 rounded-lg hover:bg-gray-800">
              <LogOut className="w-4 h-4" />
              יציאה
            </button>
          </div>

          <button className="md:hidden p-2 text-gray-400 hover:text-white" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Nav */}
        {menuOpen && (
          <div className="md:hidden pb-3 flex flex-col gap-1">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} onClick={() => setMenuOpen(false)} className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${pathname === href ? "bg-orange-500 text-white" : "text-gray-400 hover:text-white hover:bg-gray-800"}`}>
                <Icon className="w-4 h-4" />{label}
              </Link>
            ))}
            {user?.isAdmin && <Link href="/admin" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-yellow-400 hover:bg-gray-800 transition-colors"><Shield className="w-4 h-4" />Admin</Link>}
            {user && <Link href="/profile" onClick={() => setMenuOpen(false)} className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${pathname === "/profile" ? "bg-gray-700 text-white" : "text-gray-400 hover:text-white hover:bg-gray-800"}`}><User className="w-4 h-4" />{user.username}</Link>}
            <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-gray-800 transition-colors">
              <LogOut className="w-4 h-4" />יציאה
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

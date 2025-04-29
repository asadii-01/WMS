"use client";

import type React from "react";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Users,
  Trash2,
  Calendar,
  Truck,
  Map,
  ClipboardList,
  Settings,
  LogOut,
  Menu,
  X,
  Shield,
  ActivitySquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMobile } from "@/hooks/use-mobile";
import { getUserRole } from "@/lib/auth";

interface SidebarProps {
  onLogout: () => void;
}

export function Sidebar({ onLogout }: SidebarProps) {
  const pathname = usePathname();
  const isMobile = useMobile();
  const [isOpen, setIsOpen] = useState(!isMobile);
  const [userRole, setUserRole] = useState<string>("resident");

  useEffect(() => {
    async function fetchUserRole() {
      const role = await getUserRole();
      setUserRole(role);
    }

    fetchUserRole();
  }, []);

  useEffect(() => {
    setIsOpen(!isMobile);
  }, [isMobile]);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const NavItem = ({
    href,
    icon,
    label,
  }: {
    href: string;
    icon: React.ReactNode;
    label: string;
  }) => {
    const isActive = pathname === href;

    return (
      <Link href={href} className="w-full">
        <div
          className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
            isActive
              ? "bg-green-100 text-green-800"
              : "text-gray-700 hover:bg-green-50 hover:text-green-700"
          }`}
        >
          {icon}
          {(isOpen || !isMobile) && <span>{label}</span>}
        </div>
      </Link>
    );
  };

  return (
    <>
      {isMobile && (
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 left-4 z-50"
          onClick={toggleSidebar}
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </Button>
      )}

      <aside
        className={`${
          isMobile
            ? isOpen
              ? "fixed inset-0 z-40 bg-white/95 w-64"
              : "hidden"
            : "w-64 min-h-screen"
        } border-r p-4 flex flex-col transition-all duration-300`}
      >
        <div className="flex items-center justify-center mb-8 mt-4">
          <Trash2 className="h-8 w-8 text-green-600" />
          <h1 className="text-xl font-bold text-green-800 ml-2">
            Waste Management
          </h1>
        </div>

        <nav className="space-y-2 flex-1">
          <NavItem
            href="/dashboard"
            icon={<Home size={20} />}
            label="Dashboard"
          />

          {userRole === "admin" && (
            <>
              <NavItem href="/users" icon={<Users size={20} />} label="Users" />
              <NavItem
                href="/roles"
                icon={<Settings size={20} />}
                label="Roles"
              />
              <NavItem
                href="/permissions"
                icon={<Shield size={20} />}
                label="Permissions"
              />
              <NavItem
                href="/activity-logs"
                icon={<ActivitySquare size={20} />}
                label="Activity Logs"
              />
            </>
          )}

          <NavItem
            href="/wastebins"
            icon={<Trash2 size={20} />}
            label="Waste Bins"
          />
          <NavItem
            href="/requests"
            icon={<ClipboardList size={20} />}
            label="Requests"
          />

          {(userRole === "admin" || userRole === "collector") && (
            <>
              <NavItem
                href="/schedules"
                icon={<Calendar size={20} />}
                label="Schedules"
              />
              <NavItem
                href="/collections"
                icon={<Truck size={20} />}
                label="Collections"
              />
              <NavItem
                href="/trucks"
                icon={<Truck size={20} />}
                label="Trucks"
              />
              <NavItem href="/routes" icon={<Map size={20} />} label="Routes" />
            </>
          )}
        </nav>

        <Button
          variant="ghost"
          className="mt-auto flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={onLogout}
        >
          <LogOut size={20} />
          <span>Logout</span>
        </Button>
      </aside>
    </>
  );
}

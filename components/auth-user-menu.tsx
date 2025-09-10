"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { LogOut, User as UserIcon } from "lucide-react"
import { useAuth } from "@/lib/auth"

export function AuthUserMenu() {
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" className="h-9 px-3">
          <Link href="/auth/sign-in">Sign in</Link>
        </Button>
        <Button asChild className="h-9 px-3 bg-blue-600 hover:bg-blue-700 text-white">
          <Link href="/auth/sign-up">Sign up</Link>
        </Button>
      </div>
    )
  }

  async function handleSignOut() {
    logout();
    window.location.href = "/"; 
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="h-9 px-3 flex items-center gap-2 bg-transparent">
          <UserIcon className="h-4 w-4" />
          <span className="hidden sm:inline">{user?.username}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {user?.role === "ADMIN" && (
          <DropdownMenuItem asChild>
            <Link href="/admin">Admin dashboard</Link>
          </DropdownMenuItem>
        )}
        {user?.role === "VOLUNTEER" && (
          <DropdownMenuItem asChild>
            <Link href="/volunteer">Volunteer dashboard</Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onSelect={handleSignOut} className="text-red-600">
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

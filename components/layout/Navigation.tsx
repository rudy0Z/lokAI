"use client"

import { useState } from "react"
import { Scale, User, LogOut, Menu, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { useLanguage } from "@/contexts/LanguageContext"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { LanguageSelector } from "@/components/ui/language-selector"
import { LocationDetector } from "@/components/ui/location-detector"
import { usePathname } from "next/navigation"

export function Navigation() {
  const { user, userProfile, logout } = useAuth()
  const { t } = useLanguage()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const navItems = [
    { href: "/dashboard", label: t("nav.dashboard") },
    { href: "/legal", label: t("nav.legalHelp") },
    { href: "/documents", label: t("nav.documents") },
    { href: "/voice", label: "Voice Assistant" },
  ]

  const isActive = (href: string) => pathname === href

  return (
    <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 p-2 rounded-lg">
              <Scale className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              LokAI
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`transition-colors ${
                  isActive(item.href)
                    ? "text-orange-600 dark:text-orange-400 font-medium"
                    : "text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Right Side Controls */}
          <div className="flex items-center space-x-3">
            <LanguageSelector />
            <LocationDetector />
            <ThemeToggle />

            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                3
              </span>
            </Button>

            {/* User Menu */}
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={userProfile?.photoURL || "/placeholder.svg"} alt={userProfile?.displayName} />
                      <AvatarFallback className="bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400">
                        {userProfile?.displayName?.charAt(0) || user.email?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-56 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                  align="end"
                  forceMount
                >
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium text-gray-900 dark:text-white">{userProfile?.displayName}</p>
                      <p className="w-[200px] truncate text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="text-gray-700 dark:text-gray-300">
                      <User className="mr-2 h-4 w-4" />
                      <span>{t("nav.profile")}</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="text-gray-700 dark:text-gray-300">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{t("nav.logout")}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-[300px] bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
              >
                <div className="flex flex-col space-y-4 mt-6">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`text-lg transition-colors ${
                        isActive(item.href)
                          ? "text-orange-600 dark:text-orange-400 font-medium"
                          : "text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  )
}

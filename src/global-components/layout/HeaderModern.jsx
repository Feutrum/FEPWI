/**
 * HEADER MODERN
 *
 * Modern header component using Shadcn components
 * Provides role-based navigation and user management
 */

import React from 'react'
import {
  LogOut,
  User,
  Menu,
  Sprout,
  Truck,
  Package,
  Users,
  Euro,
  LayoutDashboard
} from 'lucide-react'

// Shadcn UI Components
import { Button } from '../../components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar'
import { Badge } from '../../components/ui/badge'
import { cn } from '../../lib/utils'

// =================================================================
// COMPONENT
// =================================================================

export default function HeaderModern({
  showFullHeader,
  user,
  onLogout,
  onModuleChange,
  activeModule,
  onSidebarToggle,
  sidebarCollapsed
}) {

  /**
   * Menu items with their required roles and icons
   */
  const menuItems = [
    {
      label: "Pflanzenmanagement",
      requiredRole: "farm-management",
      moduleKey: "pflanzenmanagement",
      icon: Sprout,
      color: "text-green-600"
    },
    {
      label: "Fuhrpark",
      requiredRole: "carpool",
      moduleKey: "fuhrpark",
      icon: Truck,
      color: "text-blue-600"
    },
    {
      label: "Lagerhaltung",
      requiredRole: "warehouse",
      moduleKey: "lagerhaltung",
      icon: Package,
      color: "text-orange-600"
    },
    {
      label: "Personal",
      requiredRole: "hr",
      moduleKey: "personal",
      icon: Users,
      color: "text-purple-600"
    },
    {
      label: "Vertrieb",
      requiredRole: "sales",
      moduleKey: "vertrieb",
      icon: Euro,
      color: "text-emerald-600"
    },
  ]

  /**
   * Filter visible menu items based on user roles
   */
  const getVisibleMenuItems = () => {
    if (!user || !user.roles) return []
    return menuItems.filter(item => user.roles.includes(item.requiredRole))
  }

  const visibleMenuItems = getVisibleMenuItems()

  /**
   * Get user initials for avatar
   */
  const getUserInitials = () => {
    if (!user?.email) return 'U'
    return user.email.substring(0, 2).toUpperCase()
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-border">
      <div className="flex h-16 items-center px-4 gap-4">
        {/* Left Section - Logo & Sidebar Toggle */}
        <div className="flex items-center gap-4">
          {showFullHeader && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onSidebarToggle}
              className="h-8 w-8 p-0"
            >
              <Menu className="h-4 w-4" />
            </Button>
          )}

          <div className="flex items-center gap-2">
            <div className="bg-green-600 rounded-lg p-2">
              <Sprout className="h-5 w-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-semibold">BEPWI ERP</h1>
              <p className="text-xs text-muted-foreground">Agricultural Management</p>
            </div>
          </div>
        </div>

        {/* Center Section - Navigation */}
        {showFullHeader && (
          <nav className="hidden md:flex items-center space-x-1 flex-1 justify-center">
            {/* Dashboard Button */}
            <Button
              variant={activeModule === "dashboard" ? "default" : "ghost"}
              onClick={() => onModuleChange?.("dashboard")}
              className={cn(
                "flex items-center gap-2 px-3 py-2",
                activeModule === "dashboard" && "bg-primary text-primary-foreground"
              )}
            >
              <LayoutDashboard className={cn("h-4 w-4", activeModule !== "dashboard" && "text-slate-600")} />
              <span className="hidden lg:inline">Dashboard</span>
            </Button>

            {visibleMenuItems.map((item) => {
              const IconComponent = item.icon
              const isActive = activeModule === item.moduleKey

              return (
                <Button
                  key={item.moduleKey}
                  variant={isActive ? "default" : "ghost"}
                  onClick={() => onModuleChange?.(item.moduleKey)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2",
                    isActive && "bg-primary text-primary-foreground"
                  )}
                >
                  <IconComponent className={cn("h-4 w-4", !isActive && item.color)} />
                  <span className="hidden lg:inline">{item.label}</span>
                </Button>
              )
            })}
          </nav>
        )}

        {/* Right Section - User Menu */}
        {showFullHeader && user && onLogout && (
          <div className="flex items-center gap-2">
            {/* User role badge */}
            {user.roles && user.roles.length > 0 && (
              <Badge variant="secondary" className="hidden sm:inline-flex">
                {user.roles.includes('admin') ? 'Administrator' : 'Benutzer'}
              </Badge>
            )}

            {/* User dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar} alt={user.email} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user.name || 'Benutzer'}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profil</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-red-600 focus:text-red-600"
                  onClick={onLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Abmelden</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        {/* Mobile menu for navigation */}
        {showFullHeader && (
          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel>Module</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {/* Dashboard in mobile menu */}
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => onModuleChange?.("dashboard")}
                >
                  <LayoutDashboard className="mr-2 h-4 w-4 text-slate-600" />
                  <span>Dashboard</span>
                </DropdownMenuItem>
                {visibleMenuItems.map((item) => {
                  const IconComponent = item.icon
                  return (
                    <DropdownMenuItem
                      key={item.moduleKey}
                      className="cursor-pointer"
                      onClick={() => onModuleChange?.(item.moduleKey)}
                    >
                      <IconComponent className={cn("mr-2 h-4 w-4", item.color)} />
                      <span>{item.label}</span>
                    </DropdownMenuItem>
                  )
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </header>
  )
}
/**
 * MAIN LAYOUT MODERN
 *
 * Modern application layout using Shadcn components
 * Provides responsive design with collapsible sidebar and header navigation
 */

import React, { useState } from 'react'
import { cn } from '../lib/utils'

// Components
import HeaderModern from '../global-components/layout/HeaderModern'
import SidebarModern from '../global-components/layout/SidebarModern'

// =================================================================
// COMPONENT
// =================================================================

export default function MainLayoutModern({
  children,
  showFullHeader = false,
  user,
  onLogout,
  onModuleChange,
  activeModule,
  onPageChange
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <HeaderModern
        showFullHeader={showFullHeader}
        user={user}
        onLogout={onLogout}
        onModuleChange={onModuleChange}
        activeModule={activeModule}
        onSidebarToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        sidebarCollapsed={sidebarCollapsed}
      />

      <div className="flex">
        {/* Sidebar */}
        {showFullHeader && (
          <SidebarModern
            activeModule={activeModule}
            onPageChange={onPageChange}
            collapsed={sidebarCollapsed}
          />
        )}

        {/* Main Content */}
        <main
          className={cn(
            "flex-1 transition-all duration-300 ease-in-out",
            showFullHeader && !sidebarCollapsed && "ml-64",
            showFullHeader && sidebarCollapsed && "ml-16",
            "pt-16" // Header height offset
          )}
        >
          <div className="container mx-auto p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
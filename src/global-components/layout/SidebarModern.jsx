/**
 * SIDEBAR MODERN
 *
 * Modern sidebar component using Shadcn components
 * Provides module page navigation with collapsible design
 */

import React, { useState, useEffect } from 'react'
import { ChevronRight, Folder, FileText } from 'lucide-react'

// Shadcn UI Components
import { Button } from '../../components/ui/button'
import { ScrollArea } from '../../components/ui/scroll-area'
import { Separator } from '../../components/ui/separator'
import { cn } from '../../lib/utils'

// =================================================================
// COMPONENT
// =================================================================

export default function SidebarModern({ activeModule, onPageChange, collapsed = false }) {
  const [modulePages, setModulePages] = useState([])
  const [activePage, setActivePage] = useState(null)

  // =================================================================
  // EFFECTS
  // =================================================================

  /**
   * Load module configuration based on active module
   */
  useEffect(() => {
    const loadModuleConfig = async () => {
      if (!activeModule) {
        setModulePages([])
        return
      }

      try {
        const { moduleConfig } = await import(`../../modules/${activeModule}/module-config.js`)
        setModulePages(moduleConfig.pages || [])

        // Set first page as default
        if (moduleConfig.pages?.length > 0) {
          setActivePage(moduleConfig.defaultPage || moduleConfig.pages[0].component)
        }
      } catch (error) {
        console.warn(`Keine module-config.js für ${activeModule} gefunden`)
        setModulePages([])
      }
    }

    loadModuleConfig()
  }, [activeModule])

  // =================================================================
  // HANDLERS
  // =================================================================

  /**
   * Handle page navigation
   */
  const handlePageChange = (pageComponent) => {
    setActivePage(pageComponent)
    onPageChange?.(pageComponent)
  }

  /**
   * Get module display name
   */
  const getModuleDisplayName = () => {
    const moduleNames = {
      pflanzenmanagement: 'Pflanzenmanagement',
      fuhrpark: 'Fuhrpark',
      lagerhaltung: 'Lagerhaltung',
      personal: 'Personal',
      vertrieb: 'Vertrieb'
    }
    return moduleNames[activeModule] || activeModule
  }

  // =================================================================
  // RENDER
  // =================================================================

  return (
    <aside
      className={cn(
        "fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] bg-white border-r border-border transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-full flex-col">
        {/* Module Header */}
        {activeModule && (
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Folder className="h-5 w-5 text-primary" />
              {!collapsed && (
                <div>
                  <h3 className="font-semibold text-sm">{getModuleDisplayName()}</h3>
                  <p className="text-xs text-muted-foreground">
                    {modulePages.length} {modulePages.length === 1 ? 'Seite' : 'Seiten'}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigation Pages */}
        <ScrollArea className="flex-1 px-2">
          <div className="space-y-1 py-2">
            {modulePages.map((page, index) => {
              const isActive = activePage === page.component

              return (
                <Button
                  key={index}
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start h-auto py-2 px-3",
                    collapsed && "px-2 justify-center"
                  )}
                  onClick={() => handlePageChange(page.component)}
                  title={collapsed ? page.name : undefined}
                >
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 flex-shrink-0" />
                    {!collapsed && (
                      <div className="flex-1 text-left">
                        <div className="text-sm font-medium">{page.name}</div>
                      </div>
                    )}
                    {!collapsed && isActive && (
                      <ChevronRight className="h-4 w-4 text-primary" />
                    )}
                  </div>
                </Button>
              )
            })}
          </div>
        </ScrollArea>

        {/* Footer */}
        {!collapsed && (
          <>
            <Separator />
            <div className="p-4">
              <div className="text-xs text-muted-foreground text-center">
                <p>BEPWI ERP System</p>
                <p>v1.0.0</p>
              </div>
            </div>
          </>
        )}
      </div>
    </aside>
  )
}
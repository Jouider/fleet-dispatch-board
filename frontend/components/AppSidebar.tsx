'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Truck, Users, Car, LayoutDashboard } from 'lucide-react'
import {
  Sidebar, SidebarContent, SidebarHeader, SidebarMenu,
  SidebarMenuButton, SidebarMenuItem, SidebarGroup,
  SidebarGroupLabel, SidebarGroupContent, SidebarFooter,
} from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'

const nav = [
  { label: 'Dispatch Board', href: '/',         icon: LayoutDashboard },
  { label: 'Drivers',        href: '/drivers',  icon: Users },
  { label: 'Vehicles',       href: '/vehicles', icon: Car },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar className="border-r border-border">
      <SidebarHeader className="px-4 py-4 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Truck className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground leading-none">Fleet Dispatch</p>
            <p className="text-xs text-muted-foreground mt-0.5">Fleet Corp</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {nav.map(({ label, href, icon: Icon }) => (
                <SidebarMenuItem key={href}>
                  <SidebarMenuButton isActive={pathname === href}>
                    <Link href={href} className={cn(
                      'flex items-center gap-2.5 w-full',
                      pathname === href && 'font-medium'
                    )}>
                      <Icon className="h-4 w-4" />
                      {label}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="px-4 py-3 border-t border-border">
        <p className="text-xs text-muted-foreground">Fleet Management v1.0</p>
      </SidebarFooter>
    </Sidebar>
  )
}

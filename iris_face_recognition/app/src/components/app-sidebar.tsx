import { Link, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ScanFace,
  LayoutDashboard,
  Users,
  CalendarClock,
  UserX,
  Camera,
  Settings,
  ScrollText,
  FlaskConical,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { api } from "@/lib/api";

const mainItems = [
  { title: "Bảng điều khiển", url: "/", icon: LayoutDashboard },
  { title: "Danh sách người", url: "/people", icon: Users },
  { title: "Sự kiện", url: "/events", icon: CalendarClock },
  { title: "Người lạ", url: "/unknown", icon: UserX },
  { title: "Camera", url: "/cameras", icon: Camera },
  { title: "Thử nghiệm", url: "/test", icon: FlaskConical },
];

const systemItems = [
  { title: "Cài đặt", url: "/settings", icon: Settings },
  { title: "Nhật ký hệ thống", url: "/logs", icon: ScrollText },
];

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { isMobile, setOpenMobile } = useSidebar();
  const { data } = useQuery({
    queryKey: ["dashboard"],
    queryFn: api.dashboard,
    refetchInterval: 10000,
  });
  const isActive = (url: string) => (url === "/" ? pathname === "/" : pathname.startsWith(url));
  const services = data?.services;
  const onlineCount = [services?.insightface, services?.mqtt, services?.telegram].filter(
    Boolean,
  ).length;
  const closeMobileSidebar = () => {
    if (isMobile) setOpenMobile(false);
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2.5 px-2 py-2">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 ring-1 ring-primary/40">
            <ScanFace className="h-4 w-4 text-primary" />
            <div className="absolute inset-0 rounded-md ring-1 ring-primary/20 animate-pulse" />
          </div>
          <div className="flex flex-col leading-tight group-data-[collapsible=icon]:hidden">
            <span className="font-display text-sm font-semibold tracking-tight">
              IRIS<span className="text-primary">.</span>
            </span>
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Nhận diện khách
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="font-mono text-[10px] uppercase tracking-widest">
            Không gian làm việc
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                    <Link to={item.url} onClick={closeMobileSidebar}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="font-mono text-[10px] uppercase tracking-widest">
            Hệ thống
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {systemItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                    <Link to={item.url} onClick={closeMobileSidebar}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-1.5 group-data-[collapsible=icon]:hidden">
          <span
            className={`h-2 w-2 rounded-full ${onlineCount > 0 ? "bg-success animate-pulse" : "bg-warning"}`}
          />
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            {onlineCount}/3 services online
          </span>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

import { useState } from "react";
import { 
  LayoutDashboard, 
  ShoppingCart, 
  DollarSign, 
  Database, 
  FileText, 
  Settings,
  ChevronRight,
  ChevronDown,
  FileCheck,
  Truck,
  Receipt,
  CreditCard,
  PiggyBank,
  TrendingUp,
  Users,
  Package,
  UserCog,
  Building
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

interface SubModule {
  name: string;
  path: string;
  icon: React.ComponentType<any>;
}

interface MenuItem {
  title: string;
  path: string;
  icon: React.ComponentType<any>;
  subModules?: SubModule[];
}

const menuItems: MenuItem[] = [
  {
    title: "Dasbor",
    path: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Penjualan",
    path: "/penjualan",
    icon: ShoppingCart,
    subModules: [
      { name: "Penawaran Harga", path: "/penjualan/penawaran", icon: FileCheck },
      { name: "Surat Jalan", path: "/penjualan/surat-jalan", icon: Truck },
      { name: "Faktur", path: "/penjualan/faktur", icon: Receipt }
    ]
  },
  {
    title: "Keuangan",
    path: "/keuangan",
    icon: DollarSign,
    subModules: [
      { name: "Manajemen Piutang", path: "/keuangan/piutang", icon: CreditCard },
      { name: "Manajemen Utang", path: "/keuangan/utang", icon: PiggyBank },
      { name: "Manajemen Biaya", path: "/keuangan/biaya", icon: TrendingUp }
    ]
  },
  {
    title: "Data Master",
    path: "/data-master",
    icon: Database,
    subModules: [
      { name: "Manajemen Klien", path: "/data-master/klien", icon: Users },
      { name: "Produk & Jasa", path: "/data-master/produk", icon: Package }
    ]
  },
  {
    title: "Laporan",
    path: "/laporan",
    icon: FileText,
    subModules: [
      { name: "Laporan Laba Rugi", path: "/laporan/laba-rugi", icon: TrendingUp },
      { name: "Laporan Umur Piutang", path: "/laporan/umur-piutang", icon: FileText }
    ]
  },
  {
    title: "Pengaturan",
    path: "/pengaturan",
    icon: Settings,
    subModules: [
      { name: "Pengelolaan Pengguna", path: "/pengaturan/pengguna", icon: UserCog },
      { name: "Profil Perusahaan", path: "/pengaturan/profil", icon: Building }
    ]
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  
  const isCollapsed = state === "collapsed";

  const toggleExpanded = (itemTitle: string) => {
    setExpandedItems(prev => 
      prev.includes(itemTitle) 
        ? prev.filter(item => item !== itemTitle)
        : [...prev, itemTitle]
    );
  };

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  const isSubModuleActive = (path: string) => location.pathname === path;

  return (
    <Sidebar className={`${isCollapsed ? "w-16" : "w-64"} transition-all duration-300 bg-sidebar border-r border-sidebar-border`}>
      <SidebarContent className="bg-sidebar">
        {/* Logo Section */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gold rounded-lg flex items-center justify-center">
              <LayoutDashboard className="w-5 h-5 text-navy-dark" />
            </div>
            {!isCollapsed && (
              <div>
                <h1 className="text-lg font-bold text-sidebar-foreground">Orderly</h1>
                <p className="text-xs text-sidebar-foreground/70">Manajemen Bisnis</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Menu */}
        <SidebarGroup className="flex-1 py-4">
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => (
                <div key={item.title}>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild className="group">
                      <div className="flex items-center justify-between w-full">
                        <NavLink 
                          to={item.path}
                          className={`flex items-center space-x-3 flex-1 px-3 py-2 rounded-lg transition-all duration-200 ${
                            isActive(item.path)
                              ? "bg-gold text-navy-dark font-medium"
                              : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                          }`}
                        >
                          <item.icon className="w-5 h-5 shrink-0" />
                          {!isCollapsed && <span className="text-sm">{item.title}</span>}
                        </NavLink>
                        
                        {!isCollapsed && item.subModules && (
                          <button
                            onClick={() => toggleExpanded(item.title)}
                            className="p-1 rounded hover:bg-sidebar-accent text-sidebar-foreground"
                          >
                            {expandedItems.includes(item.title) ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </button>
                        )}
                      </div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  {/* Sub Modules */}
                  {!isCollapsed && item.subModules && expandedItems.includes(item.title) && (
                    <div className="ml-6 mt-1 space-y-1">
                      {item.subModules.map((subModule) => (
                        <SidebarMenuItem key={subModule.path}>
                          <SidebarMenuButton asChild>
                            <NavLink
                              to={subModule.path}
                              className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                                isSubModuleActive(subModule.path)
                                  ? "bg-gold/20 text-gold border-l-2 border-gold"
                                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                              }`}
                            >
                              <subModule.icon className="w-4 h-4 shrink-0" />
                              <span>{subModule.name}</span>
                            </NavLink>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Collapse Toggle at Bottom */}
        <div className="p-4 border-t border-sidebar-border">
          <SidebarTrigger className="w-full flex items-center justify-center px-3 py-2 rounded-lg bg-sidebar-accent hover:bg-sidebar-accent/80 text-sidebar-accent-foreground transition-colors">
            {!isCollapsed && <span className="text-sm mr-2">Tutup</span>}
            <ChevronRight className={`w-4 h-4 transition-transform ${isCollapsed ? "rotate-0" : "rotate-180"}`} />
          </SidebarTrigger>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
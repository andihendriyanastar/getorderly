import { useState, useEffect } from "react";
import { Bell, LogOut, User, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export function Header() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const userName = profile?.full_name || user?.email || "Administrator";

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Selamat Pagi";
    if (hour < 18) return "Selamat Siang";
    return "Selamat Malam";
  };

  const formatDate = () => {
    const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    const months = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];

    const dayName = days[currentTime.getDay()];
    const day = currentTime.getDate();
    const month = months[currentTime.getMonth()];
    const year = currentTime.getFullYear();

    return `${dayName}, ${day} ${month} ${year}`;
  };

  const formatTime = () => {
    return currentTime.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
  };

  return (
    <header className="h-16 bg-gradient-to-r from-gold to-gold-hover shadow-card border-b border-border">
      <div className="flex items-center justify-between h-full px-6">
        {/* Left Section - Greeting & Date */}
        <div className="flex items-center space-x-6">
          <SidebarTrigger className="lg:hidden p-2 rounded-lg bg-navy-dark/10 hover:bg-navy-dark/20 text-navy-dark transition-colors">
            <Menu className="w-5 h-5" />
          </SidebarTrigger>
          
          <div className="hidden sm:block">
            <h2 className="text-lg font-semibold text-navy-dark">
              {getGreeting()}, {userName}
            </h2>
            <p className="text-sm text-navy-dark/80">
              {formatDate()}
            </p>
          </div>
        </div>

        {/* Center Section - Time */}
        <div className="hidden md:flex items-center bg-navy-dark/10 px-4 py-2 rounded-lg">
          <span className="text-navy-dark font-mono text-sm">
            {formatTime()}
          </span>
        </div>

        {/* Right Section - Notifications & User Menu */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="relative bg-navy-dark/10 hover:bg-navy-dark/20 text-navy-dark"
              >
                <Bell className="w-5 h-5" />
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                >
                  3
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="p-3 border-b">
                <h3 className="font-semibold text-sm">Notifikasi</h3>
              </div>
              <div className="p-2 space-y-2">
                <div className="p-3 bg-warning/10 rounded-lg border border-warning/20">
                  <p className="text-sm font-medium text-warning-foreground">Piutang Jatuh Tempo</p>
                  <p className="text-xs text-muted-foreground mt-1">3 faktur akan jatuh tempo dalam 7 hari</p>
                </div>
                <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                  <p className="text-sm font-medium text-destructive-foreground">Stok Menipis</p>
                  <p className="text-xs text-muted-foreground mt-1">2 produk di bawah stok minimum</p>
                </div>
                <div className="p-3 bg-success/10 rounded-lg border border-success/20">
                  <p className="text-sm font-medium text-success-foreground">Pembayaran Masuk</p>
                  <p className="text-xs text-muted-foreground mt-1">Faktur #INV-001 telah dibayar</p>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="flex items-center space-x-2 bg-navy-dark/10 hover:bg-navy-dark/20 text-navy-dark px-3"
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline text-sm">{userName}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleProfileClick}>
                <User className="w-4 h-4 mr-2" />
                Profil Saya
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
                <LogOut className="w-4 h-4 mr-2" />
                Keluar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
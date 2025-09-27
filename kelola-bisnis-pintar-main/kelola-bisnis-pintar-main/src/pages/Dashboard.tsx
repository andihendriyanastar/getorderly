import { 
  DollarSign, 
  CreditCard, 
  TrendingUp, 
  Users, 
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText
} from "lucide-react";
import { DashboardWidget } from "@/components/dashboard/DashboardWidget";
import { SalesChart } from "@/components/dashboard/SalesChart";
import { TopProductsChart } from "@/components/dashboard/TopProductsChart";
import { TopClientsChart } from "@/components/dashboard/TopClientsChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Mock data for demonstration
const recentQuotes = [
  { id: "PH-001", client: "PT Teknologi Maju", amount: 15000000, status: "Dikirim", date: "2024-01-15" },
  { id: "PH-002", client: "CV Digital Solutions", amount: 8500000, status: "Disetujui", date: "2024-01-14" },
  { id: "PH-003", client: "UD Sukses Bersama", amount: 12000000, status: "Draf", date: "2024-01-13" },
  { id: "PH-004", client: "PT Media Global", amount: 6750000, status: "Ditolak", date: "2024-01-12" },
  { id: "PH-005", client: "CV Mitra Terpercaya", amount: 9200000, status: "Dikirim", date: "2024-01-11" },
];

const recentInvoices = [
  { id: "INV-001", client: "PT Inovasi Kreatif", amount: 18500000, status: "Lunas", dueDate: "2024-01-20" },
  { id: "INV-002", client: "CV Harapan Jaya", amount: 7200000, status: "Tertunda", dueDate: "2024-01-18" },
  { id: "INV-003", client: "PT Solusi Bisnis", amount: 11800000, status: "Jatuh Tempo", dueDate: "2024-01-16" },
  { id: "INV-004", client: "UD Berkah Mandiri", amount: 4500000, status: "Lunas", dueDate: "2024-01-15" },
  { id: "INV-005", client: "PT Prima Utama", amount: 9600000, status: "Tertunda", dueDate: "2024-01-14" },
];

const notifications = [
  { id: 1, type: "warning", title: "Piutang Jatuh Tempo", message: "3 faktur akan jatuh tempo dalam 7 hari", time: "2 jam lalu" },
  { id: 2, type: "error", title: "Stok Menipis", message: "2 produk di bawah stok minimum", time: "4 jam lalu" },
  { id: 3, type: "success", title: "Pembayaran Masuk", message: "Faktur INV-001 telah dibayar", time: "6 jam lalu" },
  { id: 4, type: "info", title: "Penawaran Baru", message: "Penawaran PH-006 menunggu persetujuan", time: "1 hari lalu" },
];

export default function Dashboard() {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Draf":
        return <Badge variant="secondary">Draf</Badge>;
      case "Dikirim":
        return <Badge variant="default">Dikirim</Badge>;
      case "Disetujui":
        return <Badge variant="default" className="bg-success text-success-foreground">Disetujui</Badge>;
      case "Ditolak":
        return <Badge variant="destructive">Ditolak</Badge>;
      case "Lunas":
        return <Badge variant="default" className="bg-success text-success-foreground">Lunas</Badge>;
      case "Tertunda":
        return <Badge variant="default" className="bg-warning text-warning-foreground">Tertunda</Badge>;
      case "Jatuh Tempo":
        return <Badge variant="destructive">Jatuh Tempo</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "warning": return <AlertTriangle className="w-4 h-4 text-warning" />;
      case "error": return <AlertTriangle className="w-4 h-4 text-destructive" />;
      case "success": return <CheckCircle className="w-4 h-4 text-success" />;
      default: return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dasbor Utama</h1>
          <p className="text-muted-foreground mt-1">
            Ringkasan aktivitas bisnis dan metrik kinerja utama
          </p>
        </div>
      </div>

      {/* Main Widgets Grid - 3x3 Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <DashboardWidget
          title="Total Piutang"
          value="Rp 145.2M"
          description="Total piutang yang belum dibayar"
          icon={DollarSign}
          trend={{ value: 12.5, isPositive: true }}
        />
        
        <DashboardWidget
          title="Piutang Jatuh Tempo"
          value="Rp 23.8M"
          description="Jatuh tempo dalam 30 hari"
          icon={CreditCard}
          trend={{ value: 8.2, isPositive: false }}
          className="border-l-4 border-l-destructive"
        />
        
        <DashboardWidget
          title="Omset Bulanan"
          value="Rp 87.6M"
          description="Penjualan bulan ini"
          icon={TrendingUp}
          trend={{ value: 15.3, isPositive: true }}
        />
        
        <DashboardWidget
          title="Klien Aktif"
          value="248"
          description="Klien dengan transaksi bulan ini"
          icon={Users}
          trend={{ value: 4.1, isPositive: true }}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <SalesChart />
        <TopProductsChart />
        <TopClientsChart />
      </div>

      {/* Recent Activities Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Recent Quotes */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-accent" />
              <span>Penawaran Terakhir</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentQuotes.map((quote) => (
                <div key={quote.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <span className="font-medium text-sm">{quote.id}</span>
                      {getStatusBadge(quote.status)}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{quote.client}</p>
                    <p className="text-xs text-muted-foreground">{quote.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm">
                      Rp {(quote.amount / 1000000).toFixed(1)}M
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Invoices */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CreditCard className="w-5 h-5 text-accent" />
              <span>Faktur Terbaru</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentInvoices.map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <span className="font-medium text-sm">{invoice.id}</span>
                      {getStatusBadge(invoice.status)}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{invoice.client}</p>
                    <p className="text-xs text-muted-foreground">Jatuh tempo: {invoice.dueDate}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm">
                      Rp {(invoice.amount / 1000000).toFixed(1)}M
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notification Center */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-accent" />
            <span>Pusat Notifikasi</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div key={notification.id} className="flex items-start space-x-3 p-3 bg-muted/20 rounded-lg hover:bg-muted/40 transition-colors">
                {getNotificationIcon(notification.type)}
                <div className="flex-1">
                  <p className="font-medium text-sm">{notification.title}</p>
                  <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                  <p className="text-xs text-muted-foreground mt-2">{notification.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
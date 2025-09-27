import { useState, useEffect } from "react";
import { Plus, Search, Edit, Trash2, Upload, Download, Phone, Mail, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface Client {
  id: string;
  user_id: string;
  client_id: string;
  name: string;
  email: string;
  phone: string;
  address: string | null;
  city: string | null;
  type: "Perusahaan" | "Individu";
  status: "Aktif" | "Tidak Aktif";
  total_transactions: number;
  last_transaction: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export default function ClientManagement() {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchClients();
    }
  }, [user]);

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClients(data as Client[] || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Gagal memuat data klien",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Form state
  const [formData, setFormData] = useState<Partial<Client>>({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    type: "Perusahaan",
    status: "Aktif",
    notes: ""
  });

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.city && client.city.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.phone) {
      toast({
        title: "Error",
        description: "Nama, email, dan telepon wajib diisi",
        variant: "destructive"
      });
      return;
    }

    if (!user) {
      toast({
        title: "Error",
        description: "Anda harus login terlebih dahulu",
        variant: "destructive"
      });
      return;
    }

    try {
      if (editingClient) {
        // Update existing client
        const { error } = await supabase
          .from('clients')
          .update(formData)
          .eq('id', editingClient.id);

        if (error) throw error;

        toast({
          title: "Berhasil",
          description: "Data klien berhasil diperbarui"
        });
      } else {
        // Add new client - get auto-generated client ID
        const { data: codeData, error: codeError } = await supabase
          .rpc('generate_client_id');

        if (codeError) throw codeError;

        const { error } = await supabase
          .from('clients')
          .insert({
            ...formData,
            client_id: codeData,
            user_id: user.id,
            total_transactions: 0,
            last_transaction: null
          } as any);

        if (error) throw error;

        toast({
          title: "Berhasil",
          description: "Klien baru berhasil ditambahkan"
        });
      }

      // Refresh data
      fetchClients();
      resetForm();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Terjadi kesalahan saat menyimpan data",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      type: "Perusahaan",
      status: "Aktif",
      notes: ""
    });
    setEditingClient(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setFormData(client);
    setIsDialogOpen(true);
  };

  const handleDelete = async (clientId: string) => {
    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', clientId);

      if (error) throw error;

      toast({
        title: "Berhasil",
        description: "Klien berhasil dihapus"
      });

      fetchClients();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Gagal menghapus klien",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    return (
      <Badge variant={status === "Aktif" ? "default" : "secondary"} 
             className={status === "Aktif" ? "bg-success text-success-foreground" : ""}>
        {status}
      </Badge>
    );
  };

  const handleImportExcel = () => {
    toast({
      title: "Info",
      description: "Fitur impor Excel akan segera tersedia"
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Phone className="w-8 h-8 animate-spin mx-auto mb-2" />
          <p>Memuat data klien...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Manajemen Klien</h1>
          <p className="text-muted-foreground mt-1">
            Kelola data klien dan informasi kontak
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={handleImportExcel}>
            <Upload className="w-4 h-4 mr-2" />
            Impor dari Excel
          </Button>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                className="bg-accent text-accent-foreground hover:bg-accent/90"
                onClick={() => {
                  resetForm();
                  setIsDialogOpen(true);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Tambah Klien
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingClient ? "Edit Klien" : "Tambah Klien Baru"}
                </DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nama *</Label>
                    <Input
                      id="name"
                      value={formData.name || ""}
                      onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                      placeholder="Nama klien atau perusahaan"
                    />
                  </div>
                  <div>
                    <Label htmlFor="type">Tipe</Label>
                    <select
                      id="type"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={formData.type || "Perusahaan"}
                      onChange={(e) => setFormData(prev => ({...prev, type: e.target.value as "Perusahaan" | "Individu"}))}
                    >
                      <option value="Perusahaan">Perusahaan</option>
                      <option value="Individu">Individu</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email || ""}
                      onChange={(e) => setFormData(prev => ({...prev, email: e.target.value}))}
                      placeholder="email@contoh.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Telepon *</Label>
                    <Input
                      id="phone"
                      value={formData.phone || ""}
                      onChange={(e) => setFormData(prev => ({...prev, phone: e.target.value}))}
                      placeholder="+62 21 1234567"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="address">Alamat</Label>
                  <Input
                    id="address"
                    value={formData.address || ""}
                    onChange={(e) => setFormData(prev => ({...prev, address: e.target.value}))}
                    placeholder="Alamat lengkap"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">Kota</Label>
                    <Input
                      id="city"
                      value={formData.city || ""}
                      onChange={(e) => setFormData(prev => ({...prev, city: e.target.value}))}
                      placeholder="Nama kota"
                    />
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <select
                      id="status"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={formData.status || "Aktif"}
                      onChange={(e) => setFormData(prev => ({...prev, status: e.target.value as "Aktif" | "Tidak Aktif"}))}
                    >
                      <option value="Aktif">Aktif</option>
                      <option value="Tidak Aktif">Tidak Aktif</option>
                    </select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Catatan</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes || ""}
                    onChange={(e) => setFormData(prev => ({...prev, notes: e.target.value}))}
                    placeholder="Catatan tambahan tentang klien"
                    rows={3}
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Batal
                  </Button>
                  <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90">
                    {editingClient ? "Perbarui" : "Simpan"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="shadow-card">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari klien berdasarkan nama, email, atau kota..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Ekspor
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Client Table */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Daftar Klien ({filteredClients.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID Klien</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Kontak</TableHead>
                <TableHead>Lokasi</TableHead>
                <TableHead>Tipe</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Transaksi</TableHead>
                <TableHead>Terakhir</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">{client.client_id}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{client.name}</p>
                      {client.notes && (
                        <p className="text-xs text-muted-foreground mt-1" title={client.notes}>
                          {client.notes.length > 40 ? client.notes.substring(0, 40) + "..." : client.notes}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center text-sm">
                        <Mail className="w-3 h-3 mr-1 text-muted-foreground" />
                        {client.email}
                      </div>
                      <div className="flex items-center text-sm">
                        <Phone className="w-3 h-3 mr-1 text-muted-foreground" />
                        {client.phone}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {client.city ? (
                      <div className="flex items-center text-sm">
                        <MapPin className="w-3 h-3 mr-1 text-muted-foreground" />
                        {client.city}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{client.type}</Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(client.status)}</TableCell>
                  <TableCell className="text-center">{client.total_transactions}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {client.last_transaction || "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(client)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(client.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
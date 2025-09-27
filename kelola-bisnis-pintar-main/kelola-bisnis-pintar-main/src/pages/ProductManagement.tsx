import { useState, useEffect } from "react";
import { Plus, Search, Edit, Trash2, Upload, Download, Package, AlertTriangle } from "lucide-react";
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

interface Product {
  id: string;
  user_id: string;
  product_code: string;
  name: string;
  description: string | null;
  category: string | null;
  price: number;
  cost: number;
  unit: string;
  current_stock: number;
  minimum_stock: number;
  status: "Aktif" | "Tidak Aktif";
  created_at: string;
  updated_at: string;
}

export default function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  // Form state
  const [formData, setFormData] = useState<Partial<Product>>({
    name: "",
    description: "",
    category: "",
    price: 0,
    cost: 0,
    unit: "pcs",
    current_stock: 0,
    minimum_stock: 0,
    status: "Aktif"
  });

  useEffect(() => {
    if (user) {
      fetchProducts();
    }
  }, [user]);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data as Product[] || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Gagal memuat data produk",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.product_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.category && product.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price) {
      toast({
        title: "Error",
        description: "Nama produk dan harga wajib diisi",
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
      if (editingProduct) {
        // Update existing product
        const { error } = await supabase
          .from('products')
          .update(formData)
          .eq('id', editingProduct.id);

        if (error) throw error;

        toast({
          title: "Berhasil",
          description: "Data produk berhasil diperbarui"
        });
      } else {
        // Add new product - get auto-generated product code
        const { data: codeData, error: codeError } = await supabase
          .rpc('generate_product_code');

        if (codeError) throw codeError;

        const { error } = await supabase
          .from('products')
          .insert({
            ...formData,
            product_code: codeData,
            user_id: user.id
          } as any);

        if (error) throw error;

        toast({
          title: "Berhasil",
          description: "Produk baru berhasil ditambahkan"
        });
      }

      // Refresh data
      fetchProducts();
      resetForm();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Terjadi kesalahan saat menyimpan data",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData(product);
    setIsDialogOpen(true);
  };

  const handleDelete = async (productId: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      toast({
        title: "Berhasil",
        description: "Produk berhasil dihapus"
      });

      fetchProducts();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Gagal menghapus produk",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      category: "",
      price: 0,
      cost: 0,
      unit: "pcs",
      current_stock: 0,
      minimum_stock: 0,
      status: "Aktif"
    });
    setEditingProduct(null);
    setIsDialogOpen(false);
  };

  const getStatusBadge = (status: string) => {
    return (
      <Badge variant={status === "Aktif" ? "default" : "secondary"} 
             className={status === "Aktif" ? "bg-success text-success-foreground" : ""}>
        {status}
      </Badge>
    );
  };

  const getStockBadge = (currentStock: number, minimumStock: number) => {
    if (currentStock <= minimumStock) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          Stok Menipis
        </Badge>
      );
    }
    return (
      <Badge variant="outline">Stok Normal</Badge>
    );
  };

  const handleImportExcel = () => {
    toast({
      title: "Info",
      description: "Fitur impor Excel akan segera tersedia"
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Package className="w-8 h-8 animate-spin mx-auto mb-2" />
          <p>Memuat data produk...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Manajemen Produk & Jasa</h1>
          <p className="text-muted-foreground mt-1">
            Kelola data produk dan jasa dengan pelacakan stok
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
                Tambah Produk
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingProduct ? "Edit Produk" : "Tambah Produk Baru"}
                </DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nama Produk/Jasa *</Label>
                    <Input
                      id="name"
                      value={formData.name || ""}
                      onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                      placeholder="Nama produk atau jasa"
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Kategori</Label>
                    <Input
                      id="category"
                      value={formData.category || ""}
                      onChange={(e) => setFormData(prev => ({...prev, category: e.target.value}))}
                      placeholder="Kategori produk"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Deskripsi</Label>
                  <Textarea
                    id="description"
                    value={formData.description || ""}
                    onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
                    placeholder="Deskripsi produk atau jasa"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="price">Harga Jual *</Label>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      value={formData.price || 0}
                      onChange={(e) => setFormData(prev => ({...prev, price: parseFloat(e.target.value) || 0}))}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cost">Harga Beli/HPP</Label>
                    <Input
                      id="cost"
                      type="number"
                      min="0"
                      value={formData.cost || 0}
                      onChange={(e) => setFormData(prev => ({...prev, cost: parseFloat(e.target.value) || 0}))}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="unit">Satuan</Label>
                    <select
                      id="unit"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={formData.unit || "pcs"}
                      onChange={(e) => setFormData(prev => ({...prev, unit: e.target.value}))}
                    >
                      <option value="pcs">Pcs</option>
                      <option value="kg">Kg</option>
                      <option value="liter">Liter</option>
                      <option value="meter">Meter</option>
                      <option value="unit">Unit</option>
                      <option value="layanan">Layanan</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="current_stock">Stok Saat Ini</Label>
                    <Input
                      id="current_stock"
                      type="number"
                      min="0"
                      value={formData.current_stock || 0}
                      onChange={(e) => setFormData(prev => ({...prev, current_stock: parseInt(e.target.value) || 0}))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="minimum_stock">Stok Minimum</Label>
                    <Input
                      id="minimum_stock"
                      type="number"
                      min="0"
                      value={formData.minimum_stock || 0}
                      onChange={(e) => setFormData(prev => ({...prev, minimum_stock: parseInt(e.target.value) || 0}))}
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

                <div className="flex justify-end space-x-3 pt-4">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Batal
                  </Button>
                  <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90">
                    {editingProduct ? "Perbarui" : "Simpan"}
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
                placeholder="Cari produk berdasarkan nama, kode, atau kategori..."
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

      {/* Products Table */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Daftar Produk & Jasa ({filteredProducts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kode</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Harga</TableHead>
                <TableHead>Stok</TableHead>
                <TableHead>Status Stok</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.product_code}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{product.name}</p>
                      {product.description && (
                        <p className="text-xs text-muted-foreground mt-1" title={product.description}>
                          {product.description.length > 40 ? product.description.substring(0, 40) + "..." : product.description}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {product.category ? (
                      <Badge variant="outline">{product.category}</Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="font-medium">{formatPrice(product.price)}</p>
                      <p className="text-xs text-muted-foreground">/{product.unit}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="space-y-1">
                      <p className="font-medium">{product.current_stock}</p>
                      <p className="text-xs text-muted-foreground">Min: {product.minimum_stock}</p>
                    </div>
                  </TableCell>
                  <TableCell>{getStockBadge(product.current_stock, product.minimum_stock)}</TableCell>
                  <TableCell>{getStatusBadge(product.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(product)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(product.id)}
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
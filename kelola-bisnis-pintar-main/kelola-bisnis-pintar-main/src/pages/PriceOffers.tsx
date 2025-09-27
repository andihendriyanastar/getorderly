import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Send, MessageSquare, Eye, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  unit: string;
}

interface PriceOfferItem {
  id?: string;
  product_id: string;
  product_name: string;
  description: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

interface PriceOffer {
  id: string;
  offer_number: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  offer_date: string;
  valid_until: string;
  subtotal: number;
  tax_amount: number;
  tax_percentage: number;
  total_amount: number;
  status: string;
  notes: string;
}

const statusOptions = [
  { value: 'Draft', label: 'Draf', color: 'bg-gray-500' },
  { value: 'Sent', label: 'Terkirim', color: 'bg-blue-500' },
  { value: 'Approved', label: 'Disetujui', color: 'bg-green-500' },
  { value: 'Rejected', label: 'Ditolak', color: 'bg-red-500' },
];

export default function PriceOffers() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [offers, setOffers] = useState<PriceOffer[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<PriceOffer | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form state
  const [selectedClientId, setSelectedClientId] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [offerDate, setOfferDate] = useState(new Date().toISOString().split('T')[0]);
  const [validUntil, setValidUntil] = useState('');
  const [items, setItems] = useState<PriceOfferItem[]>([]);
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('Draft');
  const [taxPercentage, setTaxPercentage] = useState(11);

  useEffect(() => {
    if (user) {
      fetchOffers();
      fetchClients();
      fetchProducts();
    }
  }, [user]);

  const fetchOffers = async () => {
    try {
      const { data, error } = await supabase
        .from('price_offers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOffers(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Gagal memuat data penawaran harga",
        variant: "destructive",
      });
    }
  };

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('status', 'Aktif')
        .order('name');

      if (error) throw error;
      setClients(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Gagal memuat data klien",
        variant: "destructive",
      });
    }
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('status', 'Aktif')
        .order('name');

      if (error) throw error;
      setProducts(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Gagal memuat data produk",
        variant: "destructive",
      });
    }
  };

  const handleClientSelect = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    if (client) {
      setSelectedClientId(clientId);
      setClientName(client.name);
      setClientEmail(client.email);
      setClientPhone(client.phone);
      setClientAddress(client.address);
    }
  };

  const addItem = () => {
    setItems([...items, {
      product_id: '',
      product_name: '',
      description: '',
      quantity: 1,
      unit_price: 0,
      subtotal: 0,
    }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: string, value: any) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };

    if (field === 'product_id') {
      const product = products.find(p => p.id === value);
      if (product) {
        updatedItems[index].product_name = product.name;
        updatedItems[index].unit_price = product.price;
        updatedItems[index].subtotal = updatedItems[index].quantity * product.price;
      }
    }

    if (field === 'quantity' || field === 'unit_price') {
      updatedItems[index].subtotal = updatedItems[index].quantity * updatedItems[index].unit_price;
    }

    setItems(updatedItems);
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    const taxAmount = (subtotal * taxPercentage) / 100;
    const totalAmount = subtotal + taxAmount;
    return { subtotal, taxAmount, totalAmount };
  };

  const resetForm = () => {
    setSelectedClientId('');
    setClientName('');
    setClientEmail('');
    setClientPhone('');
    setClientAddress('');
    setOfferDate(new Date().toISOString().split('T')[0]);
    setValidUntil('');
    setItems([]);
    setNotes('');
    setStatus('Draft');
    setTaxPercentage(11);
    setEditingOffer(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedClientId || items.length === 0) {
      toast({
        title: "Error",
        description: "Harap lengkapi semua field yang diperlukan",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { subtotal, taxAmount, totalAmount } = calculateTotals();
      
      let offerNumber = '';
      if (!editingOffer) {
        const { data: numberData, error: numberError } = await supabase
          .rpc('generate_offer_number');
        
        if (numberError) throw numberError;
        offerNumber = numberData;
      }

      const offerData = {
        user_id: user.id,
        offer_number: editingOffer ? editingOffer.offer_number : offerNumber,
        client_id: selectedClientId,
        client_name: clientName,
        client_email: clientEmail,
        client_phone: clientPhone,
        client_address: clientAddress,
        offer_date: offerDate,
        valid_until: validUntil,
        subtotal,
        tax_amount: taxAmount,
        tax_percentage: taxPercentage,
        total_amount: totalAmount,
        notes,
        status,
      };

      let offerId: string;

      if (editingOffer) {
        const { error } = await supabase
          .from('price_offers')
          .update(offerData)
          .eq('id', editingOffer.id);

        if (error) throw error;
        offerId = editingOffer.id;

        // Delete existing items
        await supabase
          .from('price_offer_items')
          .delete()
          .eq('price_offer_id', editingOffer.id);
      } else {
        const { data, error } = await supabase
          .from('price_offers')
          .insert(offerData)
          .select()
          .single();

        if (error) throw error;
        offerId = data.id;
      }

      // Insert items
      const itemsData = items.map(item => ({
        price_offer_id: offerId,
        product_id: item.product_id,
        product_name: item.product_name,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        subtotal: item.subtotal,
      }));

      const { error: itemsError } = await supabase
        .from('price_offer_items')
        .insert(itemsData);

      if (itemsError) throw itemsError;

      toast({
        title: "Berhasil",
        description: `Penawaran harga berhasil ${editingOffer ? 'diperbarui' : 'dibuat'}`,
      });

      setIsDialogOpen(false);
      resetForm();
      fetchOffers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (offer: PriceOffer) => {
    setEditingOffer(offer);
    setSelectedClientId('');
    setClientName(offer.client_name);
    setClientEmail(offer.client_email);
    setClientPhone(offer.client_phone);
    setOfferDate(offer.offer_date);
    setValidUntil(offer.valid_until);
    setNotes(offer.notes);
    setStatus(offer.status);
    setTaxPercentage(offer.tax_percentage);

    // Fetch items
    try {
      const { data, error } = await supabase
        .from('price_offer_items')
        .select('*')
        .eq('price_offer_id', offer.id);

      if (error) throw error;
      setItems(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Gagal memuat item penawaran",
        variant: "destructive",
      });
    }

    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus penawaran harga ini?')) return;

    try {
      const { error } = await supabase
        .from('price_offers')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Berhasil",
        description: "Penawaran harga berhasil dihapus",
      });

      fetchOffers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSendEmail = async (offer: PriceOffer) => {
    if (!offer.client_email) {
      toast({
        title: "Error",
        description: "Email klien tidak tersedia",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('send-offer-email', {
        body: { offerId: offer.id }
      });

      if (error) throw error;

      // Update status to Sent
      await supabase
        .from('price_offers')
        .update({ status: 'Sent' })
        .eq('id', offer.id);

      toast({
        title: "Berhasil",
        description: "Penawaran harga berhasil dikirim via email",
      });

      fetchOffers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendWhatsApp = (offer: PriceOffer) => {
    if (!offer.client_phone) {
      toast({
        title: "Error",
        description: "Nomor WhatsApp klien tidak tersedia",
        variant: "destructive",
      });
      return;
    }

    const phone = offer.client_phone.replace(/[^0-9]/g, '');
    const message = `Halo ${offer.client_name}, kami telah mengirimkan penawaran harga ${offer.offer_number} untuk Anda. Silakan cek email Anda untuk detailnya. Terima kasih!`;
    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    
    window.open(whatsappUrl, '_blank');
  };

  const filteredOffers = offers.filter(offer =>
    offer.offer_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    offer.client_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const statusOption = statusOptions.find(s => s.value === status);
    return (
      <Badge className={`${statusOption?.color} text-white`}>
        {statusOption?.label || status}
      </Badge>
    );
  };

  const { subtotal, taxAmount, totalAmount } = calculateTotals();

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Penawaran Harga</h1>
          <p className="text-muted-foreground">Kelola penawaran harga untuk klien</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Tambah Penawaran
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingOffer ? 'Edit Penawaran Harga' : 'Tambah Penawaran Harga'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="client">Klien *</Label>
                  <Select value={selectedClientId} onValueChange={handleClientSelect}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih klien" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="offer_date">Tanggal Penawaran</Label>
                  <Input
                    type="date"
                    value={offerDate}
                    onChange={(e) => setOfferDate(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="valid_until">Berlaku Hingga</Label>
                  <Input
                    type="date"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Item Penawaran</h3>
                  <Button type="button" onClick={addItem} variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah Item
                  </Button>
                </div>

                {items.map((item, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                        <div>
                          <Label>Produk/Jasa</Label>
                          <Select 
                            value={item.product_id} 
                            onValueChange={(value) => updateItem(index, 'product_id', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih produk" />
                            </SelectTrigger>
                            <SelectContent>
                              {products.map((product) => (
                                <SelectItem key={product.id} value={product.id}>
                                  {product.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Kuantitas</Label>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                          />
                        </div>
                        <div>
                          <Label>Harga Satuan</Label>
                          <Input
                            type="number"
                            min="0"
                            value={item.unit_price}
                            onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                          />
                        </div>
                        <div>
                          <Label>Subtotal</Label>
                          <Input
                            value={new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(item.subtotal)}
                            readOnly
                            className="bg-muted"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeItem(index)}
                          className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="mt-2">
                        <Label>Deskripsi</Label>
                        <Textarea
                          value={item.description}
                          onChange={(e) => updateItem(index, 'description', e.target.value)}
                          placeholder="Deskripsi item (opsional)"
                          rows={2}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="notes">Catatan</Label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Catatan tambahan..."
                    rows={4}
                  />
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="tax_percentage">Persentase Pajak (%)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={taxPercentage}
                      onChange={(e) => setTaxPercentage(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2 p-4 bg-muted rounded-lg">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pajak ({taxPercentage}%):</span>
                      <span>{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(taxAmount)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>Total:</span>
                      <span>{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(totalAmount)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Batal
                </Button>
                <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90">
                  {loading ? 'Menyimpan...' : editingOffer ? 'Perbarui' : 'Simpan'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Penawaran Harga</CardTitle>
          <CardDescription>
            <div className="flex justify-between items-center">
              <span>Kelola semua penawaran harga Anda</span>
              <Input
                placeholder="Cari berdasarkan nomor atau nama klien..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
              />
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No. Penawaran</TableHead>
                <TableHead>Klien</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOffers.map((offer) => (
                <TableRow key={offer.id}>
                  <TableCell className="font-medium">{offer.offer_number}</TableCell>
                  <TableCell>{offer.client_name}</TableCell>
                  <TableCell>{new Date(offer.offer_date).toLocaleDateString('id-ID')}</TableCell>
                  <TableCell>
                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(offer.total_amount)}
                  </TableCell>
                  <TableCell>{getStatusBadge(offer.status)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(offer)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSendEmail(offer)}
                        disabled={!offer.client_email || loading}
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSendWhatsApp(offer)}
                        disabled={!offer.client_phone}
                      >
                        <MessageSquare className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(offer.id)}
                        className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
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
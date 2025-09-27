import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { User, Shield, Calendar } from 'lucide-react';

export default function Profile() {
  const { user, profile, updateProfile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await updateProfile({
        full_name: formData.full_name,
      });

      if (error) {
        toast({
          title: 'Error',
          description: 'Gagal memperbarui profil',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Berhasil',
          description: 'Profil berhasil diperbarui',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Terjadi kesalahan saat memperbarui profil',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadge = (role: string) => {
    return role === 'owner' ? (
      <Badge className="bg-gold text-navy-dark">Owner</Badge>
    ) : (
      <Badge variant="secondary">Administrator</Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Profil Saya</h1>
        <p className="text-muted-foreground mt-1">
          Kelola informasi akun dan preferensi Anda
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Information */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Informasi Profil
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Email tidak dapat diubah
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="full_name">Nama Lengkap</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData(prev => ({...prev, full_name: e.target.value}))}
                  placeholder="Masukkan nama lengkap"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                disabled={loading}
              >
                {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Account Details */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Detail Akun
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Peran:</span>
              {profile && getRoleBadge(profile.role)}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Status:</span>
              <Badge className="bg-success text-success-foreground">Aktif</Badge>
            </div>

            {profile && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Bergabung:</span>
                  <span className="text-muted-foreground">
                    {formatDate(profile.created_at)}
                  </span>
                </div>
              </div>
            )}

            <div className="pt-4 border-t">
              <h4 className="text-sm font-medium mb-2">Akses Modul:</h4>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span>Dashboard</span>
                  <Badge variant="outline" className="text-xs">Penuh</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Data Master</span>
                  <Badge variant="outline" className="text-xs">Penuh</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Penjualan</span>
                  <Badge variant="outline" className="text-xs">Penuh</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Keuangan</span>
                  <Badge variant="outline" className="text-xs">
                    {profile?.role === 'owner' ? 'Penuh' : 'Terbatas'}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
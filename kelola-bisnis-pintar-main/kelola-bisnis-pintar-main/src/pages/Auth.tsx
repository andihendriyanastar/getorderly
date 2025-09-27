import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Building2 } from 'lucide-react';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    confirmPassword: '',
  });

  const { user, signIn, signUp } = useAuth();
  const { toast } = useToast();

  // Redirect if already logged in
  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!isLogin) {
        // Sign up validation
        if (formData.password !== formData.confirmPassword) {
          toast({
            title: 'Error',
            description: 'Password tidak cocok',
            variant: 'destructive',
          });
          return;
        }

        if (formData.password.length < 6) {
          toast({
            title: 'Error',
            description: 'Password minimal 6 karakter',
            variant: 'destructive',
          });
          return;
        }

        const { error } = await signUp(formData.email, formData.password, formData.fullName);
        if (error) {
          toast({
            title: 'Error',
            description: error.message,
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Berhasil',
            description: 'Akun berhasil dibuat. Silakan cek email untuk verifikasi.',
          });
        }
      } else {
        // Sign in
        const { error } = await signIn(formData.email, formData.password);
        if (error) {
          toast({
            title: 'Error',
            description: 'Email atau password salah',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Berhasil',
            description: 'Login berhasil',
          });
        }
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Terjadi kesalahan',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-navy-dark via-navy to-navy-light p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-gold to-gold-hover p-3 rounded-xl">
              <Building2 className="w-8 h-8 text-navy-dark" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Orderly</h1>
          <p className="text-white/80">Sistem Manajemen Bisnis Cerdas</p>
        </div>

        <Card className="shadow-xl border-white/10">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">
              {isLogin ? 'Masuk' : 'Daftar Akun Baru'}
            </CardTitle>
            <CardDescription className="text-center">
              {isLogin 
                ? 'Masuk ke akun Orderly Anda' 
                : 'Buat akun Orderly untuk memulai'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={isLogin ? 'login' : 'signup'} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger 
                  value="login" 
                  onClick={() => setIsLogin(true)}
                >
                  Masuk
                </TabsTrigger>
                <TabsTrigger 
                  value="signup" 
                  onClick={() => setIsLogin(false)}
                >
                  Daftar
                </TabsTrigger>
              </TabsList>

              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                {!isLogin && (
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Nama Lengkap *</Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Masukkan nama lengkap"
                      value={formData.fullName}
                      onChange={(e) => setFormData(prev => ({...prev, fullName: e.target.value}))}
                      required={!isLogin}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="nama@perusahaan.com"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({...prev, email: e.target.value}))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder={isLogin ? 'Masukkan password' : 'Minimal 6 karakter'}
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({...prev, password: e.target.value}))}
                      required
                      minLength={isLogin ? undefined : 6}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {!isLogin && (
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Konfirmasi Password *</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Masukkan ulang password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData(prev => ({...prev, confirmPassword: e.target.value}))}
                      required={!isLogin}
                    />
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-gold to-gold-hover text-navy-dark font-semibold hover:from-gold-hover hover:to-gold"
                  disabled={loading}
                >
                  {loading 
                    ? (isLogin ? 'Sedang masuk...' : 'Sedang mendaftar...') 
                    : (isLogin ? 'Masuk' : 'Daftar Sekarang')
                  }
                </Button>
              </form>
            </Tabs>
          </CardContent>
        </Card>

        <p className="text-center text-white/60 text-sm mt-6">
          © 2025 Orderly. Semua hak cipta dilindungi.
        </p>
      </div>
    </div>
  );
}
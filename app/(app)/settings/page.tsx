'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { usePreferences } from '@/hooks/use-preferences';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useRouter } from 'next/navigation';
import { AlertCircle, Moon, Sun, Settings, Bell, LogOut, Check, Camera, X, Eye, EyeOff } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function SettingsPage() {
  const { user, logout, refreshUser } = useAuth();
  const { preferences, updateTheme, updateNotificationSettings } = usePreferences();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [theme, setTheme] = useState(preferences?.theme || 'light');
  const [notifyLikes, setNotifyLikes] = useState(preferences?.notificationSettings.likes ?? true);
  const [notifyComments, setNotifyComments] = useState(preferences?.notificationSettings.comments ?? true);
  const [notifyFollows, setNotifyFollows] = useState(preferences?.notificationSettings.follows ?? true);
  const [notifyMessages, setNotifyMessages] = useState(preferences?.notificationSettings.messages ?? true);
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [visible, setVisible] = useState(false);

  // Password change
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (preferences) {
      setTheme(preferences.theme);
      setNotifyLikes(preferences.notificationSettings.likes);
      setNotifyComments(preferences.notificationSettings.comments);
      setNotifyFollows(preferences.notificationSettings.follows);
      setNotifyMessages(preferences.notificationSettings.messages);
    }
  }, [preferences]);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setBio(user.bio || '');
      setAvatar(user.avatar || '');
    }
  }, [user]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setError('Định dạng ảnh không hỗ trợ. Chỉ JPEG, PNG, WebP, GIF.');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Ảnh quá lớn. Tối đa 5MB.');
      return;
    }

    // Preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setAvatarPreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAvatarSave = async () => {
    if (!avatarPreview) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, bio, avatar: avatarPreview }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Cập nhật thất bại');
      }

      setAvatar(avatarPreview);
      setAvatarPreview(null);
      setSuccess('Đổi ảnh đại diện thành công!');
      await refreshUser();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Cập nhật thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, bio, avatar }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Cập nhật thất bại');
      }

      setSuccess('Cập nhật hồ sơ thành công!');
      await refreshUser();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Cập nhật hồ sơ thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu mới không khớp');
      return;
    }

    if (newPassword.length < 8) {
      setError('Mật khẩu mới phải từ 8 ký tự');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Đổi mật khẩu thất bại');
      }

      setSuccess('Đổi mật khẩu thành công!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordForm(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đổi mật khẩu thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleThemeChange = async (newTheme: string) => {
    try {
      setTheme(newTheme);
      await updateTheme(newTheme as 'light' | 'dark' | 'system');
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else if (newTheme === 'light') {
        document.documentElement.classList.remove('dark');
      }
    } catch {
      setError('Cập nhật giao diện thất bại');
    }
  };

  const handleNotificationUpdate = async () => {
    try {
      await updateNotificationSettings({
        likes: notifyLikes,
        comments: notifyComments,
        follows: notifyFollows,
        messages: notifyMessages,
      });
      setSuccess('Cập nhật thông báo thành công!');
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError('Cập nhật thông báo thất bại');
    }
  };

  const handleLogout = async () => {
    if (confirm('Bạn có chắc muốn đăng xuất?')) {
      await logout();
      router.push('/login');
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div
        className={`mb-8 transition-all duration-500 ease-out ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
          <div className="p-2 rounded-full bg-primary/10">
            <Settings className="w-6 h-6 text-primary" />
          </div>
          Cài đặt
        </h1>
        <p className="text-muted-foreground text-sm">Quản lý tài khoản và tùy chọn của bạn</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-sm text-destructive flex items-center gap-2 animate-fade-in">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-sm text-green-700 flex items-center gap-2 animate-fade-in">
          <Check className="w-4 h-4 flex-shrink-0" />
          {success}
        </div>
      )}

      {/* Avatar */}
      <Card
        className={`mb-6 border-border/40 transition-all duration-500 ease-out hover-lift ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        <CardHeader>
          <CardTitle>Ảnh đại diện</CardTitle>
          <CardDescription>Thay đổi ảnh đại diện của bạn</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="relative group">
              <Avatar className="w-24 h-24 ring-2 ring-primary/20">
                <AvatarImage src={avatarPreview || avatar} alt={name} />
                <AvatarFallback className="text-2xl">{name?.charAt(0) || '?'}</AvatarFallback>
              </Avatar>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              >
                <Camera className="w-6 h-6 text-white" />
              </button>
            </div>
            <div className="flex-1 space-y-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleAvatarUpload}
                className="hidden"
              />
              <p className="text-sm text-muted-foreground">
                JPG, PNG, GIF hoặc WebP. Tối đa 5MB.
              </p>
              {avatarPreview && (
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleAvatarSave} disabled={loading}>
                    Lưu ảnh
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setAvatarPreview(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile */}
      <Card
        className={`mb-6 border-border/40 transition-all duration-500 ease-out hover-lift ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
        style={{ transitionDelay: '50ms' }}
      >
        <CardHeader>
          <CardTitle>Cài đặt hồ sơ</CardTitle>
          <CardDescription>Cập nhật thông tin cá nhân của bạn</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Tên</label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                className="transition-all duration-200 focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Tiểu sử</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={150}
                disabled={loading}
                className="w-full min-h-20 p-3 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 resize-none"
                placeholder="Giới thiệu về bản thân bạn (tối đa 150 ký tự)"
              />
              <p className={`text-xs transition-colors duration-200 ${bio.length > 130 ? 'text-destructive' : 'text-muted-foreground'}`}>
                {bio.length}/150
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Email</label>
              <Input
                type="email"
                value={user?.email || ''}
                disabled
                className="bg-muted text-muted-foreground cursor-not-allowed"
              />
              <p className="text-xs text-muted-foreground">Email không thể thay đổi</p>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="transition-all duration-200 active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Đang lưu...
                </span>
              ) : 'Lưu thay đổi'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card
        className={`mb-6 border-border/40 transition-all duration-500 ease-out hover-lift ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
        style={{ transitionDelay: '100ms' }}
      >
        <CardHeader>
          <CardTitle>Đổi mật khẩu</CardTitle>
          <CardDescription>Cập nhật mật khẩu để bảo vệ tài khoản</CardDescription>
        </CardHeader>
        <CardContent>
          {!showPasswordForm ? (
            <Button variant="outline" onClick={() => setShowPasswordForm(true)}>
              Đổi mật khẩu
            </Button>
          ) : (
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Mật khẩu hiện tại</label>
                <div className="relative">
                  <Input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Nhập mật khẩu hiện tại"
                    disabled={loading}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Mật khẩu mới</label>
                <div className="relative">
                  <Input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Tối thiểu 8 ký tự"
                    disabled={loading}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Xác nhận mật khẩu mới</label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu mới"
                    disabled={loading}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Đang xử lý...' : 'Xác nhận đổi mật khẩu'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowPasswordForm(false);
                    setCurrentPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                  }}
                >
                  Hủy
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Theme */}
      <Card
        className={`mb-6 border-border/40 transition-all duration-500 ease-out hover-lift ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
        style={{ transitionDelay: '150ms' }}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sun className="w-4 h-4" />
            Giao diện
          </CardTitle>
          <CardDescription>Tùy chỉnh giao diện hiển thị của ứng dụng</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Chủ đề</label>
            <Select value={theme} onValueChange={handleThemeChange}>
              <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-primary/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light" className="flex items-center gap-2">
                  <Sun className="w-4 h-4" /> Sáng
                </SelectItem>
                <SelectItem value="dark" className="flex items-center gap-2">
                  <Moon className="w-4 h-4" /> Tối
                </SelectItem>
                <SelectItem value="system">Hệ thống</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card
        className={`mb-6 border-border/40 transition-all duration-500 ease-out hover-lift ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
        style={{ transitionDelay: '200ms' }}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Thông báo
          </CardTitle>
          <CardDescription>Chọn loại thông báo bạn muốn nhận</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {[
              { checked: notifyLikes, setChecked: setNotifyLikes, label: 'Thông báo khi có người thích bài viết của bạn' },
              { checked: notifyComments, setChecked: setNotifyComments, label: 'Thông báo khi có người bình luận bài viết của bạn' },
              { checked: notifyFollows, setChecked: setNotifyFollows, label: 'Thông báo khi có người theo dõi bạn' },
              { checked: notifyMessages, setChecked: setNotifyMessages, label: 'Thông báo khi có tin nhắn mới' },
            ].map((item, index) => (
              <label
                key={index}
                className="flex items-center gap-3 cursor-pointer group transition-all duration-200 hover:bg-muted/50 p-2 rounded-lg"
              >
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={(e) => item.setChecked(e.target.checked)}
                  className="w-4 h-4 accent-primary transition-all duration-200"
                />
                <span className="text-sm group-hover:text-foreground transition-colors duration-200">
                  {item.label}
                </span>
              </label>
            ))}
          </div>

          <Button
            onClick={handleNotificationUpdate}
            disabled={loading}
            className="transition-all duration-200 active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Đang lưu...
              </span>
            ) : 'Lưu cài đặt thông báo'}
          </Button>
        </CardContent>
      </Card>

      {/* Account */}
      <Card
        className={`border-border/40 transition-all duration-500 ease-out hover-lift ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
        style={{ transitionDelay: '250ms' }}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LogOut className="w-4 h-4" />
            Tài khoản
          </CardTitle>
          <CardDescription>Quản lý tài khoản của bạn</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            variant="destructive"
            onClick={handleLogout}
            className="w-full transition-all duration-200 active:scale-95"
          >
            Đăng xuất
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

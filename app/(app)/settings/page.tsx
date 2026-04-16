'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { usePreferences } from '@/hooks/use-preferences';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { AlertCircle, Moon, Sun, Settings, Bell, LogOut, Check } from 'lucide-react';
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

  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [theme, setTheme] = useState(preferences?.theme || 'light');
  const [notifyLikes, setNotifyLikes] = useState(preferences?.notificationSettings.likes ?? true);
  const [notifyComments, setNotifyComments] = useState(preferences?.notificationSettings.comments ?? true);
  const [notifyFollows, setNotifyFollows] = useState(preferences?.notificationSettings.follows ?? true);
  const [notifyMessages, setNotifyMessages] = useState(preferences?.notificationSettings.messages ?? true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [visible, setVisible] = useState(false);

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

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, bio }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update profile');
      }

      setSuccess('Profile updated successfully!');
      await refreshUser();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
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
    } catch (err) {
      setError('Failed to update theme');
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
      setSuccess('Notification settings updated!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update notification settings');
    }
  };

  const handleLogout = async () => {
    if (confirm('Are you sure you want to log out?')) {
      await logout();
      router.push('/login');
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div
        className={`mb-8 transition-all duration-500 ease-out ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
          <div className="p-2 rounded-full bg-primary/10">
            <Settings className="w-6 h-6 text-primary" />
          </div>
          Settings
        </h1>
        <p className="text-muted-foreground text-sm">Manage your account and preferences</p>
      </div>

      {/* Profile Settings */}
      <Card
        className={`mb-6 border-border/40 transition-all duration-500 ease-out hover-lift ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
        style={{ transitionDelay: '50ms' }}
      >
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
          <CardDescription>Update your profile information</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/30 rounded text-sm text-destructive flex items-center gap-2 animate-fade-in">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 bg-green-500/10 border border-green-500/30 rounded text-sm text-green-700 flex items-center gap-2 animate-fade-in">
                <Check className="w-4 h-4" />
                {success}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Name</label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                className="transition-all duration-200 focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={150}
                disabled={loading}
                className="w-full min-h-20 p-3 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none transition-all duration-200"
                placeholder="Tell us about yourself (max 150 characters)"
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
              <p className="text-xs text-muted-foreground">Email cannot be changed</p>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="transition-all duration-200 active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </span>
              ) : 'Save Changes'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Appearance Settings */}
      <Card
        className={`mb-6 border-border/40 transition-all duration-500 ease-out hover-lift ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
        style={{ transitionDelay: '100ms' }}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sun className="w-4 h-4" />
            Appearance
          </CardTitle>
          <CardDescription>Customize how the app looks</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Theme</label>
            <Select value={theme} onValueChange={handleThemeChange}>
              <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-primary/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light" className="flex items-center gap-2">
                  <Sun className="w-4 h-4" /> Light
                </SelectItem>
                <SelectItem value="dark" className="flex items-center gap-2">
                  <Moon className="w-4 h-4" /> Dark
                </SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card
        className={`mb-6 border-border/40 transition-all duration-500 ease-out hover-lift ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
        style={{ transitionDelay: '150ms' }}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Notifications
          </CardTitle>
          <CardDescription>Choose what notifications you receive</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/30 rounded text-sm text-destructive flex items-center gap-2 animate-fade-in">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-500/10 border border-green-500/30 rounded text-sm text-green-700 flex items-center gap-2 animate-fade-in">
              <Check className="w-4 h-4" />
              {success}
            </div>
          )}

          <div className="space-y-3">
            {[
              { checked: notifyLikes, setChecked: setNotifyLikes, label: 'Notify when someone likes your post' },
              { checked: notifyComments, setChecked: setNotifyComments, label: 'Notify when someone comments on your post' },
              { checked: notifyFollows, setChecked: setNotifyFollows, label: 'Notify when someone follows you' },
              { checked: notifyMessages, setChecked: setNotifyMessages, label: 'Notify when you receive a message' },
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
                Saving...
              </span>
            ) : 'Save Notification Settings'}
          </Button>
        </CardContent>
      </Card>

      {/* Account Settings */}
      <Card
        className={`border-border/40 transition-all duration-500 ease-out hover-lift ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
        style={{ transitionDelay: '200ms' }}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LogOut className="w-4 h-4" />
            Account
          </CardTitle>
          <CardDescription>Manage your account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            variant="destructive"
            onClick={handleLogout}
            className="w-full transition-all duration-200 active:scale-95"
          >
            Log Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
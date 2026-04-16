'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { usePreferences } from '@/hooks/use-preferences';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { AlertCircle, Moon, Sun } from 'lucide-react';
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
      // Apply theme to document
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
      <h1 className="text-3xl font-bold text-foreground mb-8">Settings</h1>

      {/* Profile Settings */}
      <Card className="mb-6 border-border/40">
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
          <CardDescription>Update your profile information</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/30 rounded text-sm text-destructive flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 bg-green-500/10 border border-green-500/30 rounded text-sm text-green-700">
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
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={150}
                disabled={loading}
                className="w-full min-h-20 p-3 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                placeholder="Tell us about yourself (max 150 characters)"
              />
              <p className="text-xs text-muted-foreground">{bio.length}/150</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Email</label>
              <Input
                type="email"
                value={user?.email || ''}
                disabled
                className="bg-muted text-muted-foreground"
              />
              <p className="text-xs text-muted-foreground">Email cannot be changed</p>
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Appearance Settings */}
      <Card className="mb-6 border-border/40">
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
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card className="mb-6 border-border/40">
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Choose what notifications you receive</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/30 rounded text-sm text-destructive flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-500/10 border border-green-500/30 rounded text-sm text-green-700">
              {success}
            </div>
          )}

          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={notifyLikes}
                onChange={(e) => setNotifyLikes(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm">Notify when someone likes your post</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={notifyComments}
                onChange={(e) => setNotifyComments(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm">Notify when someone comments on your post</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={notifyFollows}
                onChange={(e) => setNotifyFollows(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm">Notify when someone follows you</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={notifyMessages}
                onChange={(e) => setNotifyMessages(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm">Notify when you receive a message</span>
            </label>
          </div>

          <Button onClick={handleNotificationUpdate} disabled={loading}>
            {loading ? 'Saving...' : 'Save Notification Settings'}
          </Button>
        </CardContent>
      </Card>

      {/* Account Settings */}
      <Card className="border-border/40">
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>Manage your account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            variant="destructive"
            onClick={handleLogout}
            className="w-full"
          >
            Log Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

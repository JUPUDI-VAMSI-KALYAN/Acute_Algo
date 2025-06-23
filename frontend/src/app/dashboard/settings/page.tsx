"use client"

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { Settings, User, Bell, Palette, Shield, Github, Calendar, Mail } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function SettingsPage() {
  const { user, isLoading } = useAuth();

  const [userSettings, setUserSettings] = useState({
    name: '',
    email: '',
    company: '',
    bio: '',
  });

  const [preferences, setPreferences] = useState({
    theme: 'system',
    language: 'en',
    codeStyle: 'compact',
    notifications: {
      email: true,
      push: true,
      analysis: true,
      updates: false,
    },
  });

  // Update user settings when user data is loaded
  useEffect(() => {
    if (user) {
      setUserSettings({
        name: user.name || '',
        email: user.email || '',
        company: '',
        bio: '',
      });
    }
  }, [user]);

  const handleSaveProfile = () => {
    // TODO: Implement API call to save profile
    toast.success('Profile settings saved successfully!');
  };

  const handleSavePreferences = () => {
    // TODO: Implement API call to save preferences
    toast.success('Preferences saved successfully!');
  };

  if (isLoading) {
    return (
      <main className="flex h-full flex-col gap-4 p-4 lg:gap-6 lg:p-6 overflow-y-auto">
        <div className="flex items-center gap-2 shrink-0">
          <Settings className="h-6 w-6" />
          <h1 className="text-lg font-semibold md:text-2xl text-foreground">
            Settings
          </h1>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading user settings...</div>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex h-full flex-col gap-4 p-4 lg:gap-6 lg:p-6 overflow-y-auto">
        <div className="flex items-center gap-2 shrink-0">
          <Settings className="h-6 w-6" />
          <h1 className="text-lg font-semibold md:text-2xl text-foreground">
            Settings
          </h1>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Please log in to view settings.</div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex h-full flex-col gap-4 p-4 lg:gap-6 lg:p-6 overflow-y-auto">
      <div className="flex items-center gap-2 shrink-0">
        <Settings className="h-6 w-6" />
        <h1 className="text-lg font-semibold md:text-2xl text-foreground">
          Settings
        </h1>
      </div>

      <div className="grid gap-6 max-w-4xl">
        {/* User Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Github className="h-5 w-5" />
              Account Information
            </CardTitle>
            <CardDescription>
              Your GitHub authentication details and account information.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user.avatarUrl || ''} alt={user.name || user.email} />
                <AvatarFallback className="text-lg">
                  {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h3 className="text-lg font-medium">{user.name || 'GitHub User'}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  {user.email}
                </div>
                {user.githubUsername && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Github className="h-4 w-4" />
                    <a 
                      href={`https://github.com/${user.githubUsername}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      @{user.githubUsername}
                    </a>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Member since {new Date(user.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">User ID:</span>
                <p className="text-muted-foreground font-mono break-all">{user.id}</p>
              </div>
              <div>
                <span className="font-medium">Authentication:</span>
                <Badge variant="outline" className="ml-2">
                  <Github className="h-3 w-3 mr-1" />
                  GitHub OAuth
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Settings
            </CardTitle>
            <CardDescription>
              Manage your personal information and account details.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={userSettings.name}
                  onChange={(e) => setUserSettings(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter your full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={userSettings.email}
                  onChange={(e) => setUserSettings(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter your email"
                  disabled
                />
                <p className="text-xs text-muted-foreground">
                  Email is managed through your GitHub account
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company (Optional)</Label>
              <Input
                id="company"
                value={userSettings.company}
                onChange={(e) => setUserSettings(prev => ({ ...prev, company: e.target.value }))}
                placeholder="Enter your company name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio (Optional)</Label>
              <Textarea
                id="bio"
                value={userSettings.bio}
                onChange={(e) => setUserSettings(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="Tell us about yourself"
                rows={3}
              />
            </div>
            <Button onClick={handleSaveProfile} className="w-fit">
              Save Profile
            </Button>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Preferences
            </CardTitle>
            <CardDescription>
              Customize your experience with Acute Algo.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="theme">Theme</Label>
                <Select
                  value={preferences.theme}
                  onValueChange={(value) => setPreferences(prev => ({ ...prev, theme: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select
                  value={preferences.language}
                  onValueChange={(value) => setPreferences(prev => ({ ...prev, language: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="codeStyle">Code Display Style</Label>
              <Select
                value={preferences.codeStyle}
                onValueChange={(value) => setPreferences(prev => ({ ...prev, codeStyle: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select code style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="compact">Compact</SelectItem>
                  <SelectItem value="comfortable">Comfortable</SelectItem>
                  <SelectItem value="spacious">Spacious</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleSavePreferences} className="w-fit">
              Save Preferences
            </Button>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>
              Configure how you want to receive notifications.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="email-notifications"
                  checked={preferences.notifications.email}
                  onCheckedChange={(checked) => 
                    setPreferences(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, email: !!checked }
                    }))
                  }
                />
                <Label htmlFor="email-notifications">Email notifications</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="push-notifications"
                  checked={preferences.notifications.push}
                  onCheckedChange={(checked) => 
                    setPreferences(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, push: !!checked }
                    }))
                  }
                />
                <Label htmlFor="push-notifications">Push notifications</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="analysis-notifications"
                  checked={preferences.notifications.analysis}
                  onCheckedChange={(checked) => 
                    setPreferences(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, analysis: !!checked }
                    }))
                  }
                />
                <Label htmlFor="analysis-notifications">Analysis completion notifications</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="update-notifications"
                  checked={preferences.notifications.updates}
                  onCheckedChange={(checked) => 
                    setPreferences(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, updates: !!checked }
                    }))
                  }
                />
                <Label htmlFor="update-notifications">Product updates and announcements</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Account Security
            </CardTitle>
            <CardDescription>
              Manage your account security and privacy settings.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Two-Factor Authentication</h4>
                <p className="text-sm text-muted-foreground">
                  Add an extra layer of security to your account
                </p>
              </div>
              <Badge variant="outline">Coming Soon</Badge>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Change Password</h4>
                <p className="text-sm text-muted-foreground">
                  Update your account password
                </p>
              </div>
              <Button variant="outline" disabled>
                Change Password
              </Button>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Delete Account</h4>
                <p className="text-sm text-muted-foreground">
                  Permanently delete your account and all data
                </p>
              </div>
              <Button variant="destructive" disabled>
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
} 
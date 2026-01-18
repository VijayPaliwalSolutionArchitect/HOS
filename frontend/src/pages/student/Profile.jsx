import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User, Mail, Lock, Bell, Shield, Settings, Save,
  Camera, Award, TrendingUp, Target, CheckCircle
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuthStore } from '../../store';
import { usersAPI } from '../../lib/api';
import { toast } from 'sonner';

const Profile = () => {
  const { user, setUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    avatar: user?.avatar || ''
  });

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  const [notificationSettings, setNotificationSettings] = useState({
    exam_reminders: true,
    result_notifications: true,
    course_updates: true,
    promotional_emails: false,
    weekly_summary: true
  });

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await usersAPI.update(user.id, profileData);
      setUser(response.data);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
      console.error('Profile update error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error('Passwords do not match');
      return;
    }

    if (passwordData.new_password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      // Implement password change API call
      toast.success('Password changed successfully!');
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
    } catch (error) {
      toast.error('Failed to change password');
      console.error('Password change error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Implement notification settings update API call
      toast.success('Notification settings updated!');
    } catch (error) {
      toast.error('Failed to update settings');
      console.error('Notification update error:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'password', name: 'Password', icon: Lock },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'stats', name: 'Statistics', icon: TrendingUp }
  ];

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 font-outfit">My Profile</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Profile Summary Card */}
      <Card className="mb-8 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white border-0">
        <CardContent className="pt-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <img
                src={user?.avatar || 'https://ui-avatars.com/api/?name=User&background=4F46E5&color=fff'}
                alt={user?.name}
                className="w-24 h-24 rounded-full border-4 border-white/20"
              />
              <button className="absolute bottom-0 right-0 bg-white text-primary rounded-full p-2 hover:bg-white/90 transition-colors">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-1">{user?.name}</h2>
              <p className="text-white/80 mb-3">{user?.email}</p>
              <div className="flex items-center gap-4">
                <Badge className="bg-white/20 text-white border-white/30">
                  {user?.role}
                </Badge>
                <div className="flex items-center">
                  <Award className="w-5 h-5 mr-1" />
                  Level {user?.level || 1}
                </div>
                <div className="flex items-center">
                  <Target className="w-5 h-5 mr-1" />
                  {user?.xp_points || 0} XP
                </div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-1">{user?.streak || 0}</div>
              <p className="text-sm text-white/80">Day Streak 🔥</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Tabs Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{tab.name}</span>
                    </button>
                  );
                })}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Full Name</label>
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Email Address</label>
                    <input
                      type="email"
                      value={profileData.email}
                      disabled
                      className="w-full px-4 py-2 border border-border rounded-lg bg-muted cursor-not-allowed"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Email cannot be changed. Contact support if needed.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Avatar URL</label>
                    <input
                      type="url"
                      value={profileData.avatar}
                      onChange={(e) => setProfileData({ ...profileData, avatar: e.target.value })}
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="https://example.com/avatar.jpg"
                    />
                  </div>

                  <Button type="submit" disabled={loading}>
                    <Save className="w-4 h-4 mr-2" />
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Password Tab */}
          {activeTab === 'password' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lock className="w-5 h-5 mr-2" />
                  Change Password
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Current Password</label>
                    <input
                      type="password"
                      value={passwordData.current_password}
                      onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">New Password</label>
                    <input
                      type="password"
                      value={passwordData.new_password}
                      onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                      minLength={6}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Confirm New Password</label>
                    <input
                      type="password"
                      value={passwordData.confirm_password}
                      onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                      minLength={6}
                    />
                  </div>

                  <Button type="submit" disabled={loading}>
                    <Shield className="w-4 h-4 mr-2" />
                    {loading ? 'Updating...' : 'Update Password'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="w-5 h-5 mr-2" />
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleNotificationUpdate} className="space-y-4">
                  {Object.entries(notificationSettings).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                      <div>
                        <p className="font-medium capitalize">
                          {key.replace(/_/g, ' ')}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Receive notifications for this activity
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={(e) => setNotificationSettings({
                            ...notificationSettings,
                            [key]: e.target.checked
                          })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                  ))}

                  <Button type="submit" disabled={loading}>
                    <Save className="w-4 h-4 mr-2" />
                    {loading ? 'Saving...' : 'Save Preferences'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Statistics Tab */}
          {activeTab === 'stats' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Learning Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Total XP</p>
                      <p className="text-2xl font-bold">{user?.xp_points || 0}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Current Level</p>
                      <p className="text-2xl font-bold">Level {user?.level || 1}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Current Streak</p>
                      <p className="text-2xl font-bold">{user?.streak || 0} days</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Best Streak</p>
                      <p className="text-2xl font-bold">{user?.streak || 0} days</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Progress to Level {(user?.level || 1) + 1}</span>
                      <span className="font-medium">{((user?.xp_points || 0) % 1000)} / 1000 XP</span>
                    </div>
                    <Progress value={((user?.xp_points || 0) % 1000) / 10} className="h-3" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Achievements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {/* Mock achievements */}
                    <div className="flex flex-col items-center p-4 border border-border rounded-lg">
                      <CheckCircle className="w-8 h-8 text-green-500 mb-2" />
                      <p className="text-sm font-medium text-center">First Exam</p>
                      <p className="text-xs text-muted-foreground">Completed</p>
                    </div>
                    <div className="flex flex-col items-center p-4 border border-border rounded-lg opacity-50">
                      <Award className="w-8 h-8 text-yellow-500 mb-2" />
                      <p className="text-sm font-medium text-center">Perfect Score</p>
                      <p className="text-xs text-muted-foreground">Locked</p>
                    </div>
                    <div className="flex flex-col items-center p-4 border border-border rounded-lg opacity-50">
                      <Target className="w-8 h-8 text-blue-500 mb-2" />
                      <p className="text-sm font-medium text-center">10 Day Streak</p>
                      <p className="text-xs text-muted-foreground">Locked</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;

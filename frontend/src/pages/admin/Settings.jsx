import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings as SettingsIcon, Save, Globe, Mail, Shield, Bell,
  Palette, Database, Key, AlertTriangle, CheckCircle, Upload, Image
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import DashboardLayout from '../../components/DashboardLayout';
import { toast } from 'sonner';

const Settings = () => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    general: {
      app_name: 'HOS - Hybrid Online System',
      app_logo: '',
      timezone: 'UTC',
      language: 'en',
      maintenance_mode: false,
    },
    features: {
      ai_question_generation: true,
      proctoring: true,
      gamification: true,
      social_learning: false,
      mobile_app: true,
      api_access: true,
    },
    email: {
      smtp_host: 'smtp.example.com',
      smtp_port: '587',
      smtp_user: 'notifications@hos.com',
      smtp_password: '********',
      from_email: 'noreply@hos.com',
      from_name: 'HOS Notifications',
    },
    security: {
      password_min_length: 8,
      require_2fa: false,
      session_timeout: 60,
      max_login_attempts: 5,
      ip_whitelist_enabled: false,
      audit_logging: true,
    },
  });

  const handleSave = (section) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success(`${section.charAt(0).toUpperCase() + section.slice(1)} settings saved successfully!`);
    }, 1000);
  };

  const handleToggleMaintenance = () => {
    const newValue = !settings.general.maintenance_mode;
    setSettings({
      ...settings,
      general: { ...settings.general, maintenance_mode: newValue }
    });
    
    toast[newValue ? 'warning' : 'success'](
      `Maintenance mode ${newValue ? 'enabled' : 'disabled'}`,
      {
        description: newValue 
          ? 'Users will see a maintenance page' 
          : 'System is now accessible to all users'
      }
    );
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Globe },
    { id: 'features', label: 'Features', icon: Palette },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8" data-testid="admin-settings">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-bold font-outfit mb-2">System Settings</h1>
          <p className="text-muted-foreground">
            Configure application settings and preferences
          </p>
        </motion.div>

        {/* Maintenance Mode Warning */}
        {settings.general.maintenance_mode && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-orange-500 bg-orange-50 dark:bg-orange-950">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-6 h-6 text-orange-500" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-orange-900 dark:text-orange-100">
                      Maintenance Mode Active
                    </h3>
                    <p className="text-sm text-orange-700 dark:text-orange-300">
                      The system is currently in maintenance mode. Regular users cannot access the application.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleToggleMaintenance}
                    className="border-orange-500 text-orange-700 hover:bg-orange-100"
                  >
                    Disable
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex gap-2 border-b border-border overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-b-2 border-primary text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* General Settings */}
        {activeTab === 'general' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Application Name
                  </label>
                  <input
                    type="text"
                    value={settings.general.app_name}
                    onChange={(e) => setSettings({
                      ...settings,
                      general: { ...settings.general, app_name: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Application Logo
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 border border-border rounded-lg flex items-center justify-center bg-muted">
                      {settings.general.app_logo ? (
                        <img src={settings.general.app_logo} alt="Logo" className="max-w-full max-h-full" />
                      ) : (
                        <Image className="w-8 h-8 text-muted-foreground" />
                      )}
                    </div>
                    <Button variant="outline">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Logo
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Timezone
                    </label>
                    <select
                      value={settings.general.timezone}
                      onChange={(e) => setSettings({
                        ...settings,
                        general: { ...settings.general, timezone: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">Eastern Time</option>
                      <option value="America/Chicago">Central Time</option>
                      <option value="America/Los_Angeles">Pacific Time</option>
                      <option value="Europe/London">London</option>
                      <option value="Asia/Tokyo">Tokyo</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Default Language
                    </label>
                    <select
                      value={settings.general.language}
                      onChange={(e) => setSettings({
                        ...settings,
                        general: { ...settings.general, language: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                      <option value="zh">Chinese</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <h4 className="font-medium">Maintenance Mode</h4>
                    <p className="text-sm text-muted-foreground">
                      Enable to prevent users from accessing the application
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.general.maintenance_mode}
                      onChange={handleToggleMaintenance}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                  </label>
                </div>

                <Button onClick={() => handleSave('general')} disabled={loading}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Feature Flags */}
        {activeTab === 'features' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Card>
              <CardHeader>
                <CardTitle>Feature Flags</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(settings.features).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                      <h4 className="font-medium capitalize">
                        {key.replace(/_/g, ' ')}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {key === 'ai_question_generation' && 'Enable AI-powered question generation'}
                        {key === 'proctoring' && 'Enable exam proctoring features'}
                        {key === 'gamification' && 'Enable XP points and leaderboards'}
                        {key === 'social_learning' && 'Enable social features and collaboration'}
                        {key === 'mobile_app' && 'Enable mobile app access'}
                        {key === 'api_access' && 'Enable REST API access for third parties'}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => setSettings({
                          ...settings,
                          features: { ...settings.features, [key]: e.target.checked }
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                    </label>
                  </div>
                ))}

                <Button onClick={() => handleSave('features')} disabled={loading}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Email Configuration */}
        {activeTab === 'email' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Card>
              <CardHeader>
                <CardTitle>Email Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      SMTP Host
                    </label>
                    <input
                      type="text"
                      value={settings.email.smtp_host}
                      onChange={(e) => setSettings({
                        ...settings,
                        email: { ...settings.email, smtp_host: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      SMTP Port
                    </label>
                    <input
                      type="text"
                      value={settings.email.smtp_port}
                      onChange={(e) => setSettings({
                        ...settings,
                        email: { ...settings.email, smtp_port: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      SMTP Username
                    </label>
                    <input
                      type="text"
                      value={settings.email.smtp_user}
                      onChange={(e) => setSettings({
                        ...settings,
                        email: { ...settings.email, smtp_user: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      SMTP Password
                    </label>
                    <input
                      type="password"
                      value={settings.email.smtp_password}
                      onChange={(e) => setSettings({
                        ...settings,
                        email: { ...settings.email, smtp_password: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      From Email
                    </label>
                    <input
                      type="email"
                      value={settings.email.from_email}
                      onChange={(e) => setSettings({
                        ...settings,
                        email: { ...settings.email, from_email: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      From Name
                    </label>
                    <input
                      type="text"
                      value={settings.email.from_name}
                      onChange={(e) => setSettings({
                        ...settings,
                        email: { ...settings.email, from_name: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={() => handleSave('email')} disabled={loading}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                  <Button variant="outline">
                    <Mail className="w-4 h-4 mr-2" />
                    Send Test Email
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Security Settings */}
        {activeTab === 'security' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Minimum Password Length
                    </label>
                    <input
                      type="number"
                      value={settings.security.password_min_length}
                      onChange={(e) => setSettings({
                        ...settings,
                        security: { ...settings.security, password_min_length: parseInt(e.target.value) }
                      })}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      min="6"
                      max="32"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Session Timeout (minutes)
                    </label>
                    <input
                      type="number"
                      value={settings.security.session_timeout}
                      onChange={(e) => setSettings({
                        ...settings,
                        security: { ...settings.security, session_timeout: parseInt(e.target.value) }
                      })}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      min="5"
                      max="1440"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Max Login Attempts
                    </label>
                    <input
                      type="number"
                      value={settings.security.max_login_attempts}
                      onChange={(e) => setSettings({
                        ...settings,
                        security: { ...settings.security, max_login_attempts: parseInt(e.target.value) }
                      })}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      min="3"
                      max="10"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    { key: 'require_2fa', label: 'Require Two-Factor Authentication', desc: 'Enforce 2FA for all users' },
                    { key: 'ip_whitelist_enabled', label: 'IP Whitelist', desc: 'Restrict access to whitelisted IPs' },
                    { key: 'audit_logging', label: 'Audit Logging', desc: 'Log all user actions for security audits' },
                  ].map(({ key, label, desc }) => (
                    <div key={key} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div>
                        <h4 className="font-medium">{label}</h4>
                        <p className="text-sm text-muted-foreground">{desc}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.security[key]}
                          onChange={(e) => setSettings({
                            ...settings,
                            security: { ...settings.security, [key]: e.target.checked }
                          })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                      </label>
                    </div>
                  ))}
                </div>

                <Button onClick={() => handleSave('security')} disabled={loading}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Settings;

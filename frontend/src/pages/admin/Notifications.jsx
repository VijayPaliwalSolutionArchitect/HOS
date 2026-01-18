import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Bell, Plus, Send, Users, Calendar, Clock, CheckCircle,
  MessageSquare, Mail, Target, Filter, Edit, Trash2, Eye
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import DashboardLayout from '../../components/DashboardLayout';
import { notificationsAPI } from '../../lib/api';
import { toast } from 'sonner';
import { formatDate } from '../../lib/utils';

const Notifications = () => {
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    target_audience: 'all',
    target_roles: [],
    schedule_for: '',
    type: 'info',
    template_id: '',
  });

  useEffect(() => {
    fetchNotifications();
    fetchTemplates();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      
      // Mock campaign data
      setCampaigns([
        {
          id: 1,
          title: 'Welcome to New Semester',
          message: 'Get ready for an amazing learning experience!',
          target_audience: 'all',
          sent_to: 1245,
          opened: 892,
          clicked: 234,
          status: 'sent',
          sent_at: '2024-01-15T10:00:00Z',
          type: 'info',
        },
        {
          id: 2,
          title: 'Exam Schedule Update',
          message: 'Your upcoming exams have been rescheduled.',
          target_audience: 'students',
          sent_to: 856,
          opened: 745,
          clicked: 512,
          status: 'sent',
          sent_at: '2024-01-12T14:30:00Z',
          type: 'warning',
        },
        {
          id: 3,
          title: 'New Features Released',
          message: 'Check out the latest features in your dashboard!',
          target_audience: 'managers',
          sent_to: 45,
          opened: 38,
          clicked: 22,
          status: 'sent',
          sent_at: '2024-01-10T09:00:00Z',
          type: 'success',
        },
        {
          id: 4,
          title: 'Maintenance Scheduled',
          message: 'System will be down for maintenance on Sunday.',
          target_audience: 'all',
          status: 'scheduled',
          scheduled_for: '2024-01-21T02:00:00Z',
          type: 'error',
        },
      ]);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = () => {
    setTemplates([
      { id: 'welcome', name: 'Welcome Message', content: 'Welcome to HOS! We\'re excited to have you here.' },
      { id: 'exam-reminder', name: 'Exam Reminder', content: 'Don\'t forget about your upcoming exam!' },
      { id: 'results-ready', name: 'Results Ready', content: 'Your exam results are now available.' },
      { id: 'maintenance', name: 'Maintenance Notice', content: 'Scheduled maintenance notification.' },
    ]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await notificationsAPI.create(formData);
      toast.success('Notification campaign created successfully!');
      setShowCreateForm(false);
      resetForm();
      fetchNotifications();
    } catch (error) {
      console.error('Failed to create notification:', error);
      toast.error('Failed to create notification');
    }
  };

  const handleSendNow = (campaignId) => {
    toast.success('Sending notification campaign...', {
      description: 'Your message will be delivered shortly.'
    });
  };

  const handleDelete = (campaignId, campaignTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${campaignTitle}"?`)) {
      return;
    }
    toast.success('Campaign deleted successfully');
    fetchNotifications();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      message: '',
      target_audience: 'all',
      target_roles: [],
      schedule_for: '',
      type: 'info',
      template_id: '',
    });
  };

  const loadTemplate = (templateId) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setFormData({
        ...formData,
        title: template.name,
        message: template.content,
        template_id: templateId,
      });
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      sent: 'success',
      scheduled: 'warning',
      draft: 'secondary',
      failed: 'destructive',
    };
    return colors[status] || 'secondary';
  };

  const getTypeColor = (type) => {
    const colors = {
      info: 'default',
      success: 'success',
      warning: 'warning',
      error: 'destructive',
    };
    return colors[type] || 'default';
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading notifications...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8" data-testid="admin-notifications">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div>
            <h1 className="text-4xl font-bold font-outfit mb-2">Notifications & Campaigns</h1>
            <p className="text-muted-foreground">
              Create and manage broadcast notifications and campaigns
            </p>
          </div>
          {!showCreateForm && (
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Campaign
            </Button>
          )}
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: 'Total Sent',
              value: campaigns.filter(c => c.status === 'sent').reduce((acc, c) => acc + (c.sent_to || 0), 0),
              icon: Send,
              color: 'indigo',
            },
            {
              title: 'Opened',
              value: campaigns.filter(c => c.status === 'sent').reduce((acc, c) => acc + (c.opened || 0), 0),
              icon: Mail,
              color: 'green',
            },
            {
              title: 'Clicked',
              value: campaigns.filter(c => c.status === 'sent').reduce((acc, c) => acc + (c.clicked || 0), 0),
              icon: Target,
              color: 'orange',
            },
            {
              title: 'Campaigns',
              value: campaigns.length,
              icon: Bell,
              color: 'pink',
            },
          ].map((stat, i) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                      <p className="text-3xl font-bold">{stat.value}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-xl bg-${stat.color}-500/10 flex items-center justify-center`}>
                      <stat.icon className={`w-6 h-6 text-${stat.color}-500`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Create Form */}
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Create New Campaign</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-2">
                        Template (Optional)
                      </label>
                      <select
                        value={formData.template_id}
                        onChange={(e) => loadTemplate(e.target.value)}
                        className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="">Start from scratch</option>
                        {templates.map(template => (
                          <option key={template.id} value={template.id}>
                            {template.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-2">
                        Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                        placeholder="e.g., Welcome to New Semester"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-2">
                        Message <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        rows="4"
                        required
                        placeholder="Your notification message..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Target Audience <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.target_audience}
                        onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
                        className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                      >
                        <option value="all">All Users</option>
                        <option value="students">Students Only</option>
                        <option value="managers">Managers Only</option>
                        <option value="admins">Admins Only</option>
                        <option value="custom">Custom Selection</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                      >
                        <option value="info">Info</option>
                        <option value="success">Success</option>
                        <option value="warning">Warning</option>
                        <option value="error">Error</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-2">
                        Schedule For (Optional)
                      </label>
                      <input
                        type="datetime-local"
                        value={formData.schedule_for}
                        onChange={(e) => setFormData({ ...formData, schedule_for: e.target.value })}
                        className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Leave empty to send immediately
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit">
                      <Send className="w-4 h-4 mr-2" />
                      {formData.schedule_for ? 'Schedule' : 'Send Now'}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => {
                      setShowCreateForm(false);
                      resetForm();
                    }}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Campaign History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Campaign History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {campaigns.map((campaign) => (
                  <div
                    key={campaign.id}
                    className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold">{campaign.title}</h3>
                          <Badge variant={getStatusColor(campaign.status)}>
                            {campaign.status}
                          </Badge>
                          <Badge variant={getTypeColor(campaign.type)}>
                            {campaign.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {campaign.message}
                        </p>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            Target: {campaign.target_audience}
                          </div>
                          {campaign.status === 'sent' && (
                            <>
                              <div className="flex items-center gap-1">
                                <Send className="w-4 h-4" />
                                Sent: {campaign.sent_to}
                              </div>
                              <div className="flex items-center gap-1">
                                <Mail className="w-4 h-4" />
                                Opened: {campaign.opened} ({Math.round((campaign.opened / campaign.sent_to) * 100)}%)
                              </div>
                              <div className="flex items-center gap-1">
                                <Target className="w-4 h-4" />
                                Clicked: {campaign.clicked} ({Math.round((campaign.clicked / campaign.sent_to) * 100)}%)
                              </div>
                            </>
                          )}
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {campaign.status === 'sent' 
                              ? `Sent: ${formatDate(campaign.sent_at)}`
                              : `Scheduled: ${formatDate(campaign.scheduled_for)}`
                            }
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {campaign.status === 'scheduled' && (
                          <Button
                            size="sm"
                            onClick={() => handleSendNow(campaign.id)}
                          >
                            <Send className="w-4 h-4 mr-2" />
                            Send Now
                          </Button>
                        )}
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(campaign.id, campaign.title)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Templates Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Notification Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold">{template.name}</h4>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          loadTemplate(template.id);
                          setShowCreateForm(true);
                        }}
                      >
                        Use
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">{template.content}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Notifications;

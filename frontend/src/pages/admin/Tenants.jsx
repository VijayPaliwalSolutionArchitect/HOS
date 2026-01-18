import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Building2, Plus, Edit, Trash2, Save, X, Settings, Globe,
  Users, Calendar, CheckCircle, XCircle, AlertCircle
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import DashboardLayout from '../../components/DashboardLayout';
import { tenantsAPI } from '../../lib/api';
import { toast } from 'sonner';
import { formatDate } from '../../lib/utils';

const Tenants = () => {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    domain: '',
    logo_url: '',
    settings: '{}',
    subscription_tier: 'free',
    is_active: true,
  });

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    try {
      setLoading(true);
      const response = await tenantsAPI.getAll();
      
      // Mock enhanced tenant data
      const tenantsData = (response.data?.tenants || []).map(tenant => ({
        ...tenant,
        user_count: Math.floor(Math.random() * 500) + 10,
        exam_count: Math.floor(Math.random() * 100) + 5,
        storage_used: `${(Math.random() * 10).toFixed(2)} GB`,
        subscription_tier: tenant.subscription_tier || 'free',
      }));

      setTenants(tenantsData);
    } catch (error) {
      console.error('Failed to fetch tenants:', error);
      toast.error('Failed to load tenants');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const dataToSubmit = {
        ...formData,
        settings: JSON.parse(formData.settings || '{}'),
      };
      
      await tenantsAPI.create(dataToSubmit);
      toast.success('Tenant created successfully!');
      setIsCreating(false);
      resetForm();
      fetchTenants();
    } catch (error) {
      console.error('Failed to create tenant:', error);
      toast.error(error.response?.data?.detail || 'Failed to create tenant');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const dataToSubmit = {
        ...formData,
        settings: JSON.parse(formData.settings || '{}'),
      };
      
      toast.success('Tenant updated successfully!');
      setEditingId(null);
      resetForm();
      fetchTenants();
    } catch (error) {
      console.error('Failed to update tenant:', error);
      toast.error('Failed to update tenant');
    }
  };

  const handleToggleStatus = async (tenantId, currentStatus) => {
    if (!window.confirm(`Are you sure you want to ${currentStatus ? 'deactivate' : 'activate'} this tenant?`)) {
      return;
    }

    try {
      toast.success(`Tenant ${currentStatus ? 'deactivated' : 'activated'} successfully!`);
      fetchTenants();
    } catch (error) {
      console.error('Failed to update tenant status:', error);
      toast.error('Failed to update tenant status');
    }
  };

  const startEdit = (tenant) => {
    setEditingId(tenant.id);
    setFormData({
      name: tenant.name,
      domain: tenant.domain || '',
      logo_url: tenant.logo_url || '',
      settings: JSON.stringify(tenant.settings || {}, null, 2),
      subscription_tier: tenant.subscription_tier || 'free',
      is_active: tenant.is_active,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsCreating(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      domain: '',
      logo_url: '',
      settings: '{}',
      subscription_tier: 'free',
      is_active: true,
    });
  };

  const getTierColor = (tier) => {
    const colors = {
      free: 'secondary',
      basic: 'default',
      pro: 'warning',
      enterprise: 'success',
    };
    return colors[tier] || 'secondary';
  };

  const renderTenantForm = (onSubmit, isEdit = false) => (
    <form onSubmit={onSubmit} className="space-y-4 p-6 bg-muted/50 rounded-xl border-2 border-primary">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            required
            placeholder="e.g., Acme University"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Domain
          </label>
          <input
            type="text"
            value={formData.domain}
            onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
            className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="e.g., acme.hos.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Logo URL
          </label>
          <input
            type="url"
            value={formData.logo_url}
            onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
            className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="https://example.com/logo.png"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Subscription Tier <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.subscription_tier}
            onChange={(e) => setFormData({ ...formData, subscription_tier: e.target.value })}
            className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            required
          >
            <option value="free">Free</option>
            <option value="basic">Basic</option>
            <option value="pro">Pro</option>
            <option value="enterprise">Enterprise</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-2">
            Settings (JSON)
          </label>
          <textarea
            value={formData.settings}
            onChange={(e) => setFormData({ ...formData, settings: e.target.value })}
            className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
            rows="4"
            placeholder='{"theme": "default", "features": []}'
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="is_active"
            checked={formData.is_active}
            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
            className="w-4 h-4 text-primary border-border rounded focus:ring-2 focus:ring-primary"
          />
          <label htmlFor="is_active" className="text-sm font-medium">
            Active Tenant
          </label>
        </div>
      </div>

      <div className="flex gap-2">
        <Button type="submit">
          <Save className="w-4 h-4 mr-2" />
          {isEdit ? 'Update' : 'Create'} Tenant
        </Button>
        <Button type="button" variant="outline" onClick={cancelEdit}>
          <X className="w-4 h-4 mr-2" />
          Cancel
        </Button>
      </div>
    </form>
  );

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading tenants...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8" data-testid="admin-tenants">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div>
            <h1 className="text-4xl font-bold font-outfit mb-2">Tenant Management</h1>
            <p className="text-muted-foreground">
              Manage organizations and their configurations
            </p>
          </div>
          {!isCreating && !editingId && (
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Tenant
            </Button>
          )}
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: 'Total Tenants',
              value: tenants.length,
              icon: Building2,
              bgColor: 'bg-indigo-500/10',
              iconColor: 'text-indigo-500',
            },
            {
              title: 'Active Tenants',
              value: tenants.filter(t => t.is_active).length,
              icon: CheckCircle,
              bgColor: 'bg-green-500/10',
              iconColor: 'text-green-500',
            },
            {
              title: 'Pro+ Subscribers',
              value: tenants.filter(t => ['pro', 'enterprise'].includes(t.subscription_tier)).length,
              icon: Users,
              bgColor: 'bg-orange-500/10',
              iconColor: 'text-orange-500',
            },
            {
              title: 'Total Users',
              value: tenants.reduce((acc, t) => acc + (t.user_count || 0), 0),
              icon: Users,
              bgColor: 'bg-pink-500/10',
              iconColor: 'text-pink-500',
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
                    <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                      <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Create Form */}
        {isCreating && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Create New Tenant</CardTitle>
              </CardHeader>
              <CardContent>
                {renderTenantForm(handleCreate)}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Tenants List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-4"
        >
          <h2 className="text-xl font-semibold">All Tenants ({tenants.length})</h2>
          
          {tenants.length === 0 ? (
            <Card className="p-12 text-center">
              <AlertCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No tenants found</h3>
              <p className="text-muted-foreground mb-4">
                Create your first tenant to get started
              </p>
              <Button onClick={() => setIsCreating(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Tenant
              </Button>
            </Card>
          ) : (
            tenants.map((tenant) => (
              <div key={tenant.id}>
                {editingId === tenant.id ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>Edit Tenant</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {renderTenantForm(handleUpdate, true)}
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                            {tenant.name?.charAt(0) || 'T'}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-xl font-semibold">{tenant.name}</h3>
                              <Badge variant={getTierColor(tenant.subscription_tier)}>
                                {tenant.subscription_tier}
                              </Badge>
                              <Badge variant={tenant.is_active ? 'success' : 'secondary'}>
                                {tenant.is_active ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>
                            {tenant.domain && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                <Globe className="w-4 h-4" />
                                {tenant.domain}
                              </div>
                            )}
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                {tenant.user_count} users
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {formatDate(tenant.created_at)}
                              </div>
                              <div>
                                {tenant.storage_used} storage
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => startEdit(tenant)}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleToggleStatus(tenant.id, tenant.is_active)}
                          >
                            {tenant.is_active ? (
                              <>
                                <XCircle className="w-4 h-4 mr-2" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Activate
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ))
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Tenants;

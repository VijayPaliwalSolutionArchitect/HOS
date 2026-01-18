import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  CreditCard, TrendingUp, Download, Calendar, CheckCircle,
  AlertCircle, Package, Zap, Users, Database, Crown
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import DashboardLayout from '../../components/DashboardLayout';
import { subscriptionsAPI } from '../../lib/api';
import { toast } from 'sonner';
import { formatDate } from '../../lib/utils';

const Billing = () => {
  const [loading, setLoading] = useState(true);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [usage, setUsage] = useState(null);

  useEffect(() => {
    fetchBillingData();
  }, []);

  const fetchBillingData = async () => {
    try {
      setLoading(true);
      const response = await subscriptionsAPI.getCurrent();
      
      // Mock current plan
      setCurrentPlan({
        tier: 'pro',
        status: 'active',
        billing_cycle: 'monthly',
        amount: 99,
        next_billing_date: '2024-02-15',
        started_at: '2023-08-15',
      });

      // Mock invoices
      setInvoices([
        { id: 1, date: '2024-01-15', amount: 99, status: 'paid', invoice_number: 'INV-2024-001' },
        { id: 2, date: '2023-12-15', amount: 99, status: 'paid', invoice_number: 'INV-2023-012' },
        { id: 3, date: '2023-11-15', amount: 99, status: 'paid', invoice_number: 'INV-2023-011' },
        { id: 4, date: '2023-10-15', amount: 99, status: 'paid', invoice_number: 'INV-2023-010' },
        { id: 5, date: '2023-09-15', amount: 99, status: 'paid', invoice_number: 'INV-2023-009' },
      ]);

      // Mock usage data
      setUsage({
        users: { current: 245, limit: 500 },
        storage: { current: 8.5, limit: 50 },
        exams: { current: 145, limit: 1000 },
        api_calls: { current: 12500, limit: 50000 },
      });
    } catch (error) {
      console.error('Failed to fetch billing data:', error);
      toast.error('Failed to load billing information');
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = (plan) => {
    toast.success(`Upgrading to ${plan} plan...`, {
      description: 'You will be redirected to the payment page.'
    });
  };

  const handleDowngrade = (plan) => {
    toast.info(`Downgrading to ${plan} plan...`, {
      description: 'Changes will take effect at the end of the billing cycle.'
    });
  };

  const handleCancelSubscription = () => {
    if (!window.confirm('Are you sure you want to cancel your subscription? You will lose access to premium features.')) {
      return;
    }
    toast.success('Subscription cancelled', {
      description: 'Your subscription will remain active until the end of the billing period.'
    });
  };

  const downloadInvoice = (invoice) => {
    toast.success(`Downloading invoice ${invoice.invoice_number}...`);
  };

  const plans = [
    {
      name: 'Free',
      price: 0,
      billing: 'Forever',
      features: [
        '50 Users',
        '5 GB Storage',
        '100 Exams/month',
        'Basic Support',
        'Community Access',
      ],
      color: 'secondary',
      icon: Package,
    },
    {
      name: 'Basic',
      price: 29,
      billing: 'per month',
      features: [
        '200 Users',
        '20 GB Storage',
        '500 Exams/month',
        'Email Support',
        'Advanced Analytics',
      ],
      color: 'default',
      icon: Zap,
    },
    {
      name: 'Pro',
      price: 99,
      billing: 'per month',
      features: [
        '500 Users',
        '50 GB Storage',
        'Unlimited Exams',
        'Priority Support',
        'Custom Branding',
        'API Access',
      ],
      color: 'warning',
      icon: Crown,
      popular: true,
    },
    {
      name: 'Enterprise',
      price: null,
      billing: 'Custom',
      features: [
        'Unlimited Users',
        'Unlimited Storage',
        'Unlimited Exams',
        '24/7 Dedicated Support',
        'Custom Features',
        'SLA Guarantee',
        'SSO Integration',
      ],
      color: 'success',
      icon: Database,
    },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading billing information...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8" data-testid="admin-billing">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-bold font-outfit mb-2">Billing & Subscriptions</h1>
          <p className="text-muted-foreground">
            Manage your subscription plan and billing information
          </p>
        </motion.div>

        {/* Current Plan */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <Crown className="w-8 h-8" />
                    <h2 className="text-3xl font-bold">
                      {currentPlan?.tier?.toUpperCase()} Plan
                    </h2>
                    <Badge variant="secondary" className="bg-white/20 text-white">
                      {currentPlan?.status}
                    </Badge>
                  </div>
                  <p className="text-white/80 mb-4">
                    ${currentPlan?.amount}/{currentPlan?.billing_cycle}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-white/80">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Next billing: {formatDate(currentPlan?.next_billing_date)}
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Since {formatDate(currentPlan?.started_at)}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={handleCancelSubscription}>
                    Cancel Plan
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Usage Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Usage This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    label: 'Users',
                    current: usage?.users.current,
                    limit: usage?.users.limit,
                    icon: Users,
                    color: 'indigo',
                  },
                  {
                    label: 'Storage',
                    current: usage?.storage.current,
                    limit: usage?.storage.limit,
                    unit: 'GB',
                    icon: Database,
                    color: 'green',
                  },
                  {
                    label: 'Exams',
                    current: usage?.exams.current,
                    limit: usage?.exams.limit,
                    icon: Package,
                    color: 'orange',
                  },
                  {
                    label: 'API Calls',
                    current: usage?.api_calls.current,
                    limit: usage?.api_calls.limit,
                    icon: Zap,
                    color: 'pink',
                  },
                ].map((item, idx) => {
                  const percentage = (item.current / item.limit) * 100;
                  return (
                    <div key={idx} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <item.icon className={`w-5 h-5 text-${item.color}-500`} />
                          <span className="font-medium">{item.label}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {item.current}{item.unit || ''} / {item.limit}{item.unit || ''}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-${item.color}-500 transition-all`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {percentage.toFixed(0)}% used
                      </p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Available Plans */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-2xl font-bold mb-6">Available Plans</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan, idx) => (
              <Card
                key={idx}
                className={`relative ${
                  plan.popular ? 'border-2 border-primary shadow-lg' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-white">Most Popular</Badge>
                  </div>
                )}
                <CardContent className="pt-6">
                  <div className="text-center mb-6">
                    <plan.icon className={`w-12 h-12 mx-auto mb-3 text-${plan.color}-500`} />
                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                    <div className="mb-4">
                      {plan.price !== null ? (
                        <>
                          <span className="text-4xl font-bold">${plan.price}</span>
                          <span className="text-muted-foreground">/{plan.billing}</span>
                        </>
                      ) : (
                        <span className="text-2xl font-bold">Contact Us</span>
                      )}
                    </div>
                  </div>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, fidx) => (
                      <li key={fidx} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full"
                    variant={plan.name.toLowerCase() === currentPlan?.tier ? 'secondary' : 'default'}
                    onClick={() => {
                      if (plan.name.toLowerCase() === currentPlan?.tier) {
                        return;
                      }
                      const currentIndex = plans.findIndex(p => p.name.toLowerCase() === currentPlan?.tier);
                      if (idx > currentIndex) {
                        handleUpgrade(plan.name);
                      } else {
                        handleDowngrade(plan.name);
                      }
                    }}
                  >
                    {plan.name.toLowerCase() === currentPlan?.tier
                      ? 'Current Plan'
                      : idx > plans.findIndex(p => p.name.toLowerCase() === currentPlan?.tier)
                      ? 'Upgrade'
                      : 'Downgrade'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Invoice History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Invoice History</CardTitle>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Download All
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-semibold">Invoice #</th>
                      <th className="text-left py-3 px-4 font-semibold">Date</th>
                      <th className="text-left py-3 px-4 font-semibold">Amount</th>
                      <th className="text-left py-3 px-4 font-semibold">Status</th>
                      <th className="text-left py-3 px-4 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((invoice) => (
                      <tr key={invoice.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                        <td className="py-3 px-4 font-medium">{invoice.invoice_number}</td>
                        <td className="py-3 px-4">{formatDate(invoice.date)}</td>
                        <td className="py-3 px-4 font-semibold">${invoice.amount.toFixed(2)}</td>
                        <td className="py-3 px-4">
                          <Badge variant={invoice.status === 'paid' ? 'success' : 'warning'}>
                            {invoice.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => downloadInvoice(invoice)}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Payment Method */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-8 h-8 text-primary" />
                  <div>
                    <p className="font-medium">•••• •••• •••• 4242</p>
                    <p className="text-sm text-muted-foreground">Expires 12/25</p>
                  </div>
                </div>
                <Button variant="outline">Update</Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Billing;

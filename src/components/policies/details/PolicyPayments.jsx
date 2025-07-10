
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  CreditCard, 
  Plus, 
  Calendar, 
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { usePolicyPayments, useAddPayment } from '@/hooks/usePolicyFeatures';

const PolicyPayments = ({ policyId }) => {
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [paymentData, setPaymentData] = useState({
    amount: '',
    method: 'bank_transfer',
    transactionId: '',
    notes: ''
  });

  const { data: payments = [], isLoading, refetch } = usePolicyPayments(policyId);
  const addPayment = useAddPayment();

  const paymentMethods = [
    { value: 'cash', label: 'Cash' },
    { value: 'cheque', label: 'Cheque' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'credit_card', label: 'Credit Card' },
    { value: 'debit_card', label: 'Debit Card' },
    { value: 'upi', label: 'UPI' },
    { value: 'online', label: 'Online Payment' }
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'refunded':
        return <RefreshCw className="h-4 w-4 text-orange-500" />;
      case 'pending':
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'completed': 'bg-green-100 text-green-800',
      'pending': 'bg-yellow-100 text-yellow-800',
      'failed': 'bg-red-100 text-red-800',
      'refunded': 'bg-orange-100 text-orange-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const handleAddPayment = async () => {
    if (!paymentData.amount || isNaN(paymentData.amount)) {
      toast.error('Please enter a valid payment amount');
      return;
    }

    try {
      await addPayment.mutateAsync({
        policyId,
        paymentData: {
          ...paymentData,
          amount: parseFloat(paymentData.amount)
        }
      });

      setPaymentData({
        amount: '',
        method: 'bank_transfer',
        transactionId: '',
        notes: ''
      });
      setShowAddPayment(false);
      refetch();
    } catch (error) {
      console.error('Add payment error:', error);
    }
  };

  const totalPaid = payments.filter(p => p.status === 'completed')
    .reduce((sum, payment) => sum + (payment.amount || 0), 0);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Payment History</h3>
          <p className="text-sm text-gray-600">Track all premium payments and transactions</p>
        </div>
        <Button onClick={() => setShowAddPayment(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Payment
        </Button>
      </div>

      {/* Payment Summary */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <DollarSign className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-sm font-medium text-gray-600">Total Paid</span>
              </div>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(totalPaid)}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <CreditCard className="h-5 w-5 text-blue-500 mr-2" />
                <span className="text-sm font-medium text-gray-600">Total Payments</span>
              </div>
              <p className="text-2xl font-bold text-blue-600">{payments.length}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Calendar className="h-5 w-5 text-purple-500 mr-2" />
                <span className="text-sm font-medium text-gray-600">Last Payment</span>
              </div>
              <p className="text-sm text-gray-900">
                {payments.length > 0 ? formatDate(payments[0]?.date) : 'No payments yet'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Payment Form */}
      {showAddPayment && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Plus className="h-5 w-5 mr-2" />
              Add New Payment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Amount *</label>
                <Input
                  type="number"
                  value={paymentData.amount}
                  onChange={(e) => setPaymentData({...paymentData, amount: e.target.value})}
                  placeholder="Enter payment amount"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Payment Method *</label>
                <select
                  value={paymentData.method}
                  onChange={(e) => setPaymentData({...paymentData, method: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  {paymentMethods.map((method) => (
                    <option key={method.value} value={method.value}>
                      {method.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Transaction ID</label>
              <Input
                value={paymentData.transactionId}
                onChange={(e) => setPaymentData({...paymentData, transactionId: e.target.value})}
                placeholder="Enter transaction reference ID"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Notes</label>
              <textarea
                value={paymentData.notes}
                onChange={(e) => setPaymentData({...paymentData, notes: e.target.value})}
                placeholder="Add any additional notes..."
                className="w-full p-2 border border-gray-300 rounded-md"
                rows="3"
              />
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={handleAddPayment}
                disabled={addPayment.isLoading}
              >
                {addPayment.isLoading ? 'Adding...' : 'Add Payment'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowAddPayment(false)}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payments List */}
      <div className="space-y-4">
        {payments.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No payments recorded</h3>
              <p className="text-gray-500 mb-4">Add payment records to track premium payments</p>
              <Button onClick={() => setShowAddPayment(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Payment
              </Button>
            </CardContent>
          </Card>
        ) : (
          payments.map((payment) => (
            <Card key={payment._id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <CreditCard className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-lg">{formatCurrency(payment.amount)}</h4>
                        <Badge className={getStatusColor(payment.status)}>
                          <div className="flex items-center">
                            {getStatusIcon(payment.status)}
                            <span className="ml-1 capitalize">{payment.status}</span>
                          </div>
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDate(payment.date)}
                        </span>
                        <span className="capitalize">{payment.method?.replace('_', ' ')}</span>
                        {payment.transactionId && (
                          <span>ID: {payment.transactionId}</span>
                        )}
                      </div>
                      {payment.notes && (
                        <p className="text-sm text-gray-600 mt-1">{payment.notes}</p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default PolicyPayments;

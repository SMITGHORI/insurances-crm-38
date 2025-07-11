
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { formatCurrency } from '@/lib/utils';
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  DollarSign, 
  Calendar,
  Target,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

const InvoiceAnalytics = ({ invoice, relatedInvoices = [] }) => {
  const analytics = useMemo(() => {
    if (!invoice) return null;

    // Calculate days since issue and until due
    const issueDate = new Date(invoice.issueDate);
    const dueDate = new Date(invoice.dueDate);
    const today = new Date();
    
    const daysSinceIssue = Math.floor((today - issueDate) / (1000 * 60 * 60 * 24));
    const daysUntilDue = Math.floor((dueDate - today) / (1000 * 60 * 60 * 24));
    const totalDaysPeriod = Math.floor((dueDate - issueDate) / (1000 * 60 * 60 * 24));
    
    // Calculate payment timeline progress
    const paymentProgress = Math.min(100, Math.max(0, (daysSinceIssue / totalDaysPeriod) * 100));
    
    // Client analytics from related invoices
    const clientInvoices = relatedInvoices.filter(inv => inv.clientId === invoice.clientId);
    const clientTotalAmount = clientInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
    const clientPaidInvoices = clientInvoices.filter(inv => inv.status === 'paid');
    const clientPaymentRate = clientInvoices.length > 0 ? (clientPaidInvoices.length / clientInvoices.length) * 100 : 0;
    
    // Average payment time for this client
    const paidInvoicesWithDates = clientPaidInvoices.filter(inv => inv.paidAt && inv.issueDate);
    const avgPaymentDays = paidInvoicesWithDates.length > 0 
      ? paidInvoicesWithDates.reduce((sum, inv) => {
          const issued = new Date(inv.issueDate);
          const paid = new Date(inv.paidAt);
          return sum + Math.floor((paid - issued) / (1000 * 60 * 60 * 24));
        }, 0) / paidInvoicesWithDates.length
      : null;

    // Risk assessment
    const isOverdue = daysUntilDue < 0 && invoice.status !== 'paid';
    const isDueSoon = daysUntilDue <= 3 && daysUntilDue >= 0 && invoice.status !== 'paid';
    const isHighValue = invoice.total > 5000;
    const hasLowClientPaymentRate = clientPaymentRate < 70;

    let riskLevel = 'low';
    let riskFactors = [];

    if (isOverdue) {
      riskLevel = 'high';
      riskFactors.push('Invoice is overdue');
    } else if (isDueSoon) {
      riskLevel = 'medium';
      riskFactors.push('Due within 3 days');
    }

    if (hasLowClientPaymentRate && clientInvoices.length > 2) {
      riskLevel = riskLevel === 'low' ? 'medium' : 'high';
      riskFactors.push(`Client has ${Math.round(clientPaymentRate)}% payment rate`);
    }

    if (isHighValue) {
      riskFactors.push('High value invoice');
    }

    return {
      daysSinceIssue,
      daysUntilDue,
      paymentProgress,
      clientTotalAmount,
      clientInvoicesCount: clientInvoices.length,
      clientPaymentRate,
      avgPaymentDays,
      riskLevel,
      riskFactors,
      isOverdue,
      isDueSoon
    };
  }, [invoice, relatedInvoices]);

  if (!invoice || !analytics) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            Analytics data not available
          </div>
        </CardContent>
      </Card>
    );
  }

  const getRiskColor = (level) => {
    switch (level) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-green-600 bg-green-50 border-green-200';
    }
  };

  const getRiskIcon = (level) => {
    switch (level) {
      case 'high': return AlertTriangle;
      case 'medium': return Clock;
      default: return CheckCircle;
    }
  };

  const RiskIcon = getRiskIcon(analytics.riskLevel);

  return (
    <div className="space-y-6">
      {/* Payment Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Payment Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span>Issued {analytics.daysSinceIssue} days ago</span>
              <span>
                {analytics.daysUntilDue >= 0 
                  ? `Due in ${analytics.daysUntilDue} days`
                  : `${Math.abs(analytics.daysUntilDue)} days overdue`
                }
              </span>
            </div>
            <Progress 
              value={analytics.paymentProgress} 
              className="h-3"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Issue Date</span>
              <span>Due Date</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Assessment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Risk Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className={`flex items-center gap-2 p-3 rounded-lg border ${getRiskColor(analytics.riskLevel)}`}>
              <RiskIcon className="w-5 h-5" />
              <div>
                <div className="font-medium capitalize">
                  {analytics.riskLevel} Risk
                </div>
                <div className="text-sm opacity-80">
                  Collection probability assessment
                </div>
              </div>
            </div>
            
            {analytics.riskFactors.length > 0 && (
              <div>
                <div className="text-sm font-medium mb-2">Risk Factors:</div>
                <ul className="space-y-1">
                  {analytics.riskFactors.map((factor, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-current rounded-full" />
                      {factor}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Client Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Client Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Total Business Volume</div>
              <div className="text-2xl font-bold">{formatCurrency(analytics.clientTotalAmount)}</div>
              <div className="text-sm text-muted-foreground">
                Across {analytics.clientInvoicesCount} invoices
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Payment Rate</div>
              <div className="flex items-center gap-2">
                <div className="text-2xl font-bold">{Math.round(analytics.clientPaymentRate)}%</div>
                {analytics.clientPaymentRate >= 80 ? (
                  <TrendingUp className="w-4 h-4 text-green-600" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-600" />
                )}
              </div>
              <Progress value={analytics.clientPaymentRate} className="h-2" />
            </div>
            
            {analytics.avgPaymentDays && (
              <div className="space-y-2 md:col-span-2">
                <div className="text-sm text-muted-foreground">Average Payment Time</div>
                <div className="text-xl font-bold">
                  {Math.round(analytics.avgPaymentDays)} days
                </div>
                <div className="text-sm text-muted-foreground">
                  Historical payment behavior
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Time to Payment</span>
              </div>
              <Badge variant="outline">
                {analytics.avgPaymentDays ? `${Math.round(analytics.avgPaymentDays)} days avg` : 'No data'}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Collection Efficiency</span>
              </div>
              <Badge variant="outline">
                {analytics.clientPaymentRate >= 80 ? 'Excellent' : 
                 analytics.clientPaymentRate >= 60 ? 'Good' : 'Needs Attention'}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Invoice Value</span>
              </div>
              <Badge variant="outline">
                {invoice.total > 10000 ? 'High' : invoice.total > 1000 ? 'Medium' : 'Standard'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InvoiceAnalytics;


import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { formatCurrency } from '@/lib/utils';
import { getInvoiceStatusColor, formatInvoiceDateForDisplay } from '@/utils/invoiceUtils';
import { 
  Calendar, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  FileText, 
  CreditCard,
  Clock,
  AlertCircle
} from 'lucide-react';

const InvoiceOverview = ({ invoice, onStatusUpdate, onSendInvoice }) => {
  if (!invoice) return null;

  const isDueToday = new Date(invoice.dueDate).toDateString() === new Date().toDateString();
  const isOverdue = new Date(invoice.dueDate) < new Date() && invoice.status !== 'paid';

  return (
    <div className="space-y-6">
      {/* Status and Actions Card */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl">Invoice {invoice.invoiceNumber}</CardTitle>
              <div className="flex items-center gap-2 mt-2">
                <Badge className={getInvoiceStatusColor(invoice.status)}>
                  {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                </Badge>
                {isDueToday && (
                  <Badge variant="outline" className="text-orange-600 border-orange-200">
                    <Clock className="w-3 h-3 mr-1" />
                    Due Today
                  </Badge>
                )}
                {isOverdue && (
                  <Badge variant="destructive">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Overdue
                  </Badge>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{formatCurrency(invoice.total)}</div>
              <div className="text-sm text-muted-foreground">Total Amount</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">Issue Date</div>
                <div className="font-medium">{formatInvoiceDateForDisplay(invoice.issueDate)}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">Due Date</div>
                <div className="font-medium">{formatInvoiceDateForDisplay(invoice.dueDate)}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">Payment Terms</div>
                <div className="font-medium">{invoice.paymentTerms || 'Net 30'}</div>
              </div>
            </div>
          </div>
          
          {invoice.status === 'draft' && (
            <div className="mt-4 pt-4 border-t">
              <Button onClick={() => onSendInvoice(invoice)} className="w-full sm:w-auto">
                Send Invoice
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Client Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Client Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <h4 className="font-medium text-lg">{invoice.clientName}</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span>{invoice.clientEmail}</span>
              </div>
              {invoice.clientPhone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span>{invoice.clientPhone}</span>
                </div>
              )}
            </div>
            {invoice.clientAddress && (
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                <span>{invoice.clientAddress}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Invoice Items Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Invoice Items
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {invoice.items?.map((item, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <div className="flex-1">
                  <div className="font-medium">{item.description}</div>
                  <div className="text-sm text-muted-foreground">
                    Qty: {item.quantity} × {formatCurrency(item.unitPrice)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{formatCurrency(item.total || (item.quantity * item.unitPrice))}</div>
                  {item.tax > 0 && (
                    <div className="text-sm text-muted-foreground">+{formatCurrency(item.tax)} tax</div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <Separator className="my-4" />
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatCurrency(invoice.subtotal)}</span>
            </div>
            {invoice.discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>-{formatCurrency(invoice.discount)}</span>
              </div>
            )}
            {invoice.tax > 0 && (
              <div className="flex justify-between">
                <span>Tax</span>
                <span>{formatCurrency(invoice.tax)}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>{formatCurrency(invoice.total)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Policy Information (if available) */}
      {invoice.policyNumber && (
        <Card>
          <CardHeader>
            <CardTitle>Policy Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Policy Number</div>
                <div className="font-medium">{invoice.policyNumber}</div>
              </div>
              {invoice.insuranceType && (
                <div>
                  <div className="text-sm text-muted-foreground">Insurance Type</div>
                  <div className="font-medium">{invoice.insuranceType}</div>
                </div>
              )}
              {invoice.premiumPeriod && (
                <div>
                  <div className="text-sm text-muted-foreground">Premium Period</div>
                  <div className="font-medium">{invoice.premiumPeriod}</div>
                </div>
              )}
              {invoice.agentName && (
                <div>
                  <div className="text-sm text-muted-foreground">Agent</div>
                  <div className="font-medium">{invoice.agentName}</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notes (if available) */}
      {invoice.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{invoice.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default InvoiceOverview;

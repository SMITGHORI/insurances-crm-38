
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useSendInvoice } from '@/hooks/useInvoices';
import { Mail, Send, Clock, CheckCircle, AlertCircle } from 'lucide-react';

const InvoiceSend = ({ invoice }) => {
  const [emailData, setEmailData] = useState({
    to: invoice?.clientEmail || '',
    cc: '',
    bcc: '',
    subject: `Invoice ${invoice?.invoiceNumber} from Your Company`,
    message: `Dear ${invoice?.clientName || 'Valued Customer'},

Please find attached your invoice ${invoice?.invoiceNumber} for the amount of ${invoice?.total ? `$${invoice.total}` : ''}.

Payment is due by ${invoice?.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : ''}.

If you have any questions about this invoice, please don't hesitate to contact us.

Thank you for your business!

Best regards,
Your Company Team`,
    sendCopy: false,
    includePaymentLink: true,
    autoReminder: false
  });

  const [isPreview, setIsPreview] = useState(false);
  const sendInvoiceMutation = useSendInvoice();

  const handleInputChange = (field, value) => {
    setEmailData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSendInvoice = async () => {
    if (!emailData.to.trim()) {
      toast.error('Recipient email is required');
      return;
    }

    try {
      await sendInvoiceMutation.mutateAsync({
        invoiceId: invoice.id || invoice._id,
        emailData: {
          ...emailData,
          invoiceNumber: invoice.invoiceNumber,
          clientName: invoice.clientName
        }
      });
      
      toast.success('Invoice sent successfully!');
    } catch (error) {
      console.error('Error sending invoice:', error);
      toast.error('Failed to send invoice. Please try again.');
    }
  };

  const getSendingStatus = () => {
    if (invoice?.status === 'sent') {
      return { icon: CheckCircle, text: 'Sent', color: 'text-green-600' };
    } else if (invoice?.status === 'draft') {
      return { icon: Clock, text: 'Draft', color: 'text-yellow-600' };
    } else if (invoice?.status === 'overdue') {
      return { icon: AlertCircle, text: 'Overdue', color: 'text-red-600' };
    }
    return { icon: Mail, text: 'Ready to Send', color: 'text-blue-600' };
  };

  if (!invoice) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            Invoice data not available
          </div>
        </CardContent>
      </Card>
    );
  }

  const status = getSendingStatus();

  return (
    <div className="space-y-6">
      {/* Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <status.icon className={`w-5 h-5 ${status.color}`} />
              Send Invoice
            </div>
            <Badge variant="outline" className={status.color}>
              {status.text}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            Invoice {invoice.invoiceNumber} • {invoice.clientName}
          </div>
          {invoice.sentAt && (
            <div className="text-sm text-muted-foreground mt-1">
              Last sent: {new Date(invoice.sentAt).toLocaleString()}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Email Composition Card */}
      <Card>
        <CardHeader>
          <CardTitle>Email Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="to">To *</Label>
              <Input
                id="to"
                type="email"
                value={emailData.to}
                onChange={(e) => handleInputChange('to', e.target.value)}
                placeholder="client@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cc">CC</Label>
              <Input
                id="cc"
                type="email"
                value={emailData.cc}
                onChange={(e) => handleInputChange('cc', e.target.value)}
                placeholder="cc@example.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={emailData.subject}
              onChange={(e) => handleInputChange('subject', e.target.value)}
              placeholder="Invoice subject"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={emailData.message}
              onChange={(e) => handleInputChange('message', e.target.value)}
              placeholder="Email message body"
              rows={8}
              className="resize-none"
            />
          </div>

          {/* Email Options */}
          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="sendCopy">Send me a copy</Label>
                <div className="text-sm text-muted-foreground">
                  Receive a copy of this email
                </div>
              </div>
              <Switch
                id="sendCopy"
                checked={emailData.sendCopy}
                onCheckedChange={(checked) => handleInputChange('sendCopy', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="includePaymentLink">Include payment link</Label>
                <div className="text-sm text-muted-foreground">
                  Add a secure payment link to the email
                </div>
              </div>
              <Switch
                id="includePaymentLink"
                checked={emailData.includePaymentLink}
                onCheckedChange={(checked) => handleInputChange('includePaymentLink', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="autoReminder">Automatic reminders</Label>
                <div className="text-sm text-muted-foreground">
                  Send reminder emails before due date
                </div>
              </div>
              <Switch
                id="autoReminder"
                checked={emailData.autoReminder}
                onCheckedChange={(checked) => handleInputChange('autoReminder', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview Toggle */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Email Preview
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPreview(!isPreview)}
            >
              {isPreview ? 'Edit' : 'Preview'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isPreview ? (
            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="space-y-2 text-sm">
                <div><strong>To:</strong> {emailData.to}</div>
                {emailData.cc && <div><strong>CC:</strong> {emailData.cc}</div>}
                <div><strong>Subject:</strong> {emailData.subject}</div>
              </div>
              <div className="mt-4 p-4 bg-background rounded border">
                <pre className="whitespace-pre-wrap text-sm font-sans">
                  {emailData.message}
                </pre>
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              Click "Preview" to see how your email will look
            </div>
          )}
        </CardContent>
      </Card>

      {/* Send Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSendInvoice}
          disabled={sendInvoiceMutation.isLoading || !emailData.to.trim()}
          className="w-full sm:w-auto"
        >
          {sendInvoiceMutation.isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Sending...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Send Invoice
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default InvoiceSend;

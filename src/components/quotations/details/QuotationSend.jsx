
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Send, Mail, MessageSquare, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useSendQuotation } from '@/hooks/useQuotations';

const QuotationSend = ({ quotationId }) => {
  const [emailData, setEmailData] = useState({
    emailTo: '',
    emailSubject: '',
    emailMessage: ''
  });
  const [sendingMethod, setSendingMethod] = useState('email');

  const sendQuotationMutation = useSendQuotation();

  const handleSendEmail = async (e) => {
    e.preventDefault();
    
    if (!emailData.emailTo) {
      toast.error('Email address is required');
      return;
    }

    try {
      await sendQuotationMutation.mutateAsync({
        quotationId,
        emailData
      });
      toast.success('Quotation sent successfully!');
      setEmailData({ emailTo: '', emailSubject: '', emailMessage: '' });
    } catch (error) {
      toast.error('Failed to send quotation');
    }
  };

  const handleSendWhatsApp = () => {
    // This would integrate with WhatsApp Business API
    toast.info('WhatsApp integration coming soon');
  };

  const handleSendSMS = () => {
    // This would integrate with SMS service
    toast.info('SMS integration coming soon');
  };

  return (
    <div className="space-y-6">
      {/* Send Method Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Choose Sending Method</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button
              variant={sendingMethod === 'email' ? 'default' : 'outline'}
              onClick={() => setSendingMethod('email')}
              className="flex items-center gap-2"
            >
              <Mail className="h-4 w-4" />
              Email
            </Button>
            <Button
              variant={sendingMethod === 'whatsapp' ? 'default' : 'outline'}
              onClick={() => setSendingMethod('whatsapp')}
              className="flex items-center gap-2"
            >
              <MessageSquare className="h-4 w-4" />
              WhatsApp
            </Button>
            <Button
              variant={sendingMethod === 'sms' ? 'default' : 'outline'}
              onClick={() => setSendingMethod('sms')}
              className="flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              SMS
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Email Form */}
      {sendingMethod === 'email' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Send via Email
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSendEmail} className="space-y-4">
              <div>
                <Label htmlFor="emailTo">Recipient Email *</Label>
                <Input
                  id="emailTo"
                  type="email"
                  placeholder="client@example.com"
                  value={emailData.emailTo}
                  onChange={(e) => setEmailData(prev => ({ ...prev, emailTo: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="emailSubject">Subject</Label>
                <Input
                  id="emailSubject"
                  placeholder="Your Insurance Quotation"
                  value={emailData.emailSubject}
                  onChange={(e) => setEmailData(prev => ({ ...prev, emailSubject: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="emailMessage">Message</Label>
                <Textarea
                  id="emailMessage"
                  placeholder="Dear Client, please find your insurance quotation attached..."
                  rows={6}
                  value={emailData.emailMessage}
                  onChange={(e) => setEmailData(prev => ({ ...prev, emailMessage: e.target.value }))}
                />
              </div>

              <Button
                type="submit"
                disabled={sendQuotationMutation.isLoading}
                className="w-full"
              >
                {sendQuotationMutation.isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Quotation
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* WhatsApp Form */}
      {sendingMethod === 'whatsapp' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Send via WhatsApp
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="whatsappNumber">WhatsApp Number</Label>
                <Input
                  id="whatsappNumber"
                  placeholder="+1234567890"
                  type="tel"
                />
              </div>

              <div>
                <Label htmlFor="whatsappMessage">Message</Label>
                <Textarea
                  id="whatsappMessage"
                  placeholder="Hello! Your insurance quotation is ready..."
                  rows={4}
                />
              </div>

              <Button onClick={handleSendWhatsApp} className="w-full">
                <MessageSquare className="mr-2 h-4 w-4" />
                Send via WhatsApp
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* SMS Form */}
      {sendingMethod === 'sms' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Send via SMS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="smsNumber">Phone Number</Label>
                <Input
                  id="smsNumber"
                  placeholder="+1234567890"
                  type="tel"
                />
              </div>

              <div>
                <Label htmlFor="smsMessage">Message</Label>
                <Textarea
                  id="smsMessage"
                  placeholder="Your insurance quotation is ready. Please check your email."
                  rows={3}
                  maxLength={160}
                />
                <p className="text-xs text-gray-500 mt-1">Max 160 characters for SMS</p>
              </div>

              <Button onClick={handleSendSMS} className="w-full">
                <Send className="mr-2 h-4 w-4" />
                Send SMS
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sending History */}
      <Card>
        <CardHeader>
          <CardTitle>Sending History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm font-medium">Email sent successfully</p>
                  <p className="text-xs text-gray-500">to client@example.com</p>
                </div>
              </div>
              <div className="text-right">
                <Badge variant="outline">Email</Badge>
                <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 border rounded">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-4 w-4 text-orange-600" />
                <div>
                  <p className="text-sm font-medium">Email delivery pending</p>
                  <p className="text-xs text-gray-500">to backup@example.com</p>
                </div>
              </div>
              <div className="text-right">
                <Badge variant="outline">Email</Badge>
                <p className="text-xs text-gray-500 mt-1">1 day ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Email Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              variant="outline"
              onClick={() => setEmailData(prev => ({
                ...prev,
                emailSubject: 'Your Insurance Quotation - Review Required',
                emailMessage: 'Dear Valued Client,\n\nWe are pleased to provide you with your personalized insurance quotation. Please review the details and let us know if you have any questions.\n\nBest regards,\nYour Insurance Team'
              }))}
            >
              Professional Template
            </Button>
            <Button
              variant="outline"
              onClick={() => setEmailData(prev => ({
                ...prev,
                emailSubject: 'Quick Insurance Quote Ready!',
                emailMessage: 'Hi there!\n\nYour insurance quote is ready for review. Take a look and feel free to reach out with any questions.\n\nThanks!'
              }))}
            >
              Casual Template
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuotationSend;

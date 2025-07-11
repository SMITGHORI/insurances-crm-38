
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Printer,
  Share,
  Download,
  Edit,
  Trash2,
  Copy,
  ChevronLeft,
  Mail,
  MessageSquare,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import InvoicePreview from '@/components/invoices/InvoicePreview';
import InvoiceHistory from '@/components/invoices/InvoiceHistory';
import InvoiceOverview from '@/components/invoices/details/InvoiceOverview';
import InvoiceSend from '@/components/invoices/details/InvoiceSend';
import InvoiceAnalytics from '@/components/invoices/details/InvoiceAnalytics';
import InvoiceNotes from '@/components/invoices/details/InvoiceNotes';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { PageSkeleton } from '@/components/ui/professional-skeleton';
import { 
  useInvoiceBackend, 
  useUpdateInvoiceBackend, 
  useDeleteInvoiceBackend,
  useSendInvoiceBackend,
  useInvoicesBackend
} from '@/hooks/useInvoicesBackend';

const InvoiceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isSuperAdmin } = useAuth();
  const isMobile = useIsMobile();
  const [showSharePopup, setShowSharePopup] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const downloadRef = useRef();
  const printRef = useRef();

  const { data: invoiceResponse, isLoading: loading, error, isError } = useInvoiceBackend(id);
  const { data: relatedInvoicesResponse } = useInvoicesBackend({ clientId: invoiceResponse?.data?.clientId });
  const updateInvoiceMutation = useUpdateInvoiceBackend();
  const deleteInvoiceMutation = useDeleteInvoiceBackend();
  const sendInvoiceMutation = useSendInvoiceBackend();

  const invoice = invoiceResponse?.data;
  const relatedInvoices = relatedInvoicesResponse?.data || [];

  useEffect(() => {
    if (isError) {
      toast.error('Failed to load invoice details');
      navigate('/invoices');
    }
  }, [isError, navigate]);
  
  const handleEditInvoice = () => {
    if (!isSuperAdmin()) {
      toast.error("You don't have permission to edit invoices");
      return;
    }
    navigate(`/invoices/edit/${id}`);
  };
  
  const handleDeleteInvoice = async () => {
    if (!isSuperAdmin()) {
      toast.error("You don't have permission to delete invoices");
      return;
    }
    
    if (window.confirm("Are you sure you want to delete this invoice?")) {
      try {
        await deleteInvoiceMutation.mutateAsync(invoice._id || invoice.id);
        navigate('/invoices');
      } catch (error) {
        console.error('Error deleting invoice:', error);
      }
    }
  };
  
  const handleDuplicateInvoice = () => {
    if (!isSuperAdmin()) {
      toast.error("You don't have permission to duplicate invoices");
      return;
    }
    
    if (invoice) {
      // Navigate to invoice creation form with pre-filled data
      navigate('/invoices/create', { 
        state: { 
          duplicateFrom: invoice,
          isDuplicate: true 
        } 
      });
    }
  };

  const handleSendInvoice = async (invoiceData) => {
    try {
      await sendInvoiceMutation.mutateAsync({
        invoiceId: invoiceData.id || invoiceData._id,
        emailData: {
          to: invoiceData.clientEmail,
          subject: `Invoice ${invoiceData.invoiceNumber}`,
          message: `Please find your invoice ${invoiceData.invoiceNumber} attached.`
        }
      });
      toast.success('Invoice sent successfully!');
    } catch (error) {
      console.error('Error sending invoice:', error);
      toast.error('Failed to send invoice');
    }
  };

  const handleDownload = async () => {
    if (downloadRef.current?.generatePDF) {
      const success = await downloadRef.current.generatePDF();
      if (success) {
        toast.success("Invoice PDF downloaded successfully");
      } else {
        toast.error("Failed to generate PDF");
      }
    }
  };

  const handlePrint = async () => {
    if (printRef.current?.printInvoice) {
      const success = await printRef.current.printInvoice();
      if (success) {
        toast.success("Invoice prepared for printing");
      } else {
        toast.error("Failed to prepare invoice for printing");
      }
    }
  };

  const handleShare = () => {
    setShowSharePopup(true);
  };

  const handleEmailShare = () => {
    if (!invoice) return;
    
    const invoiceText = `Invoice ${invoice.invoiceNumber} for ${invoice.clientName}
Amount: ₹${invoice.total}
Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}

Client Details:
${invoice.clientName}
${invoice.clientPhone}
${invoice.clientEmail}`;

    const emailSubject = encodeURIComponent(`Invoice ${invoice.invoiceNumber} - ${invoice.clientName}`);
    const emailBody = encodeURIComponent(invoiceText);
    const emailUrl = `mailto:${invoice.clientEmail}?subject=${emailSubject}&body=${emailBody}`;
    
    window.open(emailUrl, '_blank');
    setShowSharePopup(false);
    toast.success("Email client opened with invoice details");
  };

  const handleWhatsAppShare = () => {
    if (!invoice) return;
    
    const invoiceText = `Invoice ${invoice.invoiceNumber} for ${invoice.clientName}
Amount: ₹${invoice.total}
Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}

Client Details:
${invoice.clientName}
${invoice.clientPhone}
${invoice.clientEmail}`;

    const whatsappText = encodeURIComponent(invoiceText);
    const whatsappPhone = invoice.clientPhone?.replace(/[^\d]/g, '');
    const whatsappUrl = `https://wa.me/${whatsappPhone}?text=${whatsappText}`;
    
    window.open(whatsappUrl, '_blank');
    setShowSharePopup(false);
    toast.success("WhatsApp opened with invoice details");
  };

  // Show professional loading skeleton
  if (loading) {
    return <PageSkeleton isMobile={isMobile} />;
  }

  if (!invoice) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Card className="p-6">
          <div className="text-center">
            <h2 className="text-lg font-semibold mb-2">Invoice not found</h2>
            <Button onClick={() => navigate('/invoices')} variant="outline">
              Back to Invoices
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <Button
        variant="outline"
        className="mb-6"
        onClick={() => navigate('/invoices')}
      >
        <ChevronLeft className="mr-2 h-4 w-4" />
        Back to Invoices
      </Button>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Invoice {invoice.invoiceNumber}</h1>
          <p className="text-gray-600">
            {invoice.clientName} • {new Date(invoice.issueDate).toLocaleDateString()}
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
          <Button
            variant="outline"
            onClick={handleShare}
            className="flex items-center"
          >
            <Share className="mr-2 h-4 w-4" />
            Share
          </Button>
          
          <Button
            variant="outline"
            onClick={handlePrint}
            className="flex items-center"
          >
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          
          <Button
            onClick={handleDownload}
            className="flex items-center"
          >
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
        </div>
      </div>
      
      {/* Tabs for different views */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="send">Send</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <InvoiceOverview 
                invoice={invoice} 
                onStatusUpdate={updateInvoiceMutation.mutateAsync}
                onSendInvoice={handleSendInvoice}
              />
            </div>
            
            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Invoice Actions</h3>
                  <div className="space-y-4">
                    {isSuperAdmin() && (
                      <>
                        <Button 
                          className="w-full justify-start"
                          onClick={handleEditInvoice}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Invoice
                        </Button>
                        <Button 
                          variant="outline" 
                          className="w-full justify-start"
                          onClick={handleDuplicateInvoice}
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          Duplicate
                        </Button>
                        <Button 
                          variant="destructive" 
                          className="w-full justify-start"
                          onClick={handleDeleteInvoice}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Invoice
                        </Button>
                      </>
                    )}
                    {!isSuperAdmin() && (
                      <div className="text-center py-4 text-gray-500">
                        <p className="text-sm">Only Super Admins can edit, duplicate, or delete invoices.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {invoice.history && (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Invoice History</h3>
                    <InvoiceHistory history={invoice.history} />
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="send" className="mt-6">
          <InvoiceSend invoice={invoice} />
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <InvoiceAnalytics invoice={invoice} relatedInvoices={relatedInvoices} />
        </TabsContent>

        <TabsContent value="notes" className="mt-6">
          <InvoiceNotes invoice={invoice} />
        </TabsContent>

        <TabsContent value="preview" className="mt-6">
          <InvoicePreview 
            invoice={invoice} 
            onDownload={downloadRef}
            onPrint={printRef}
          />
        </TabsContent>
      </Tabs>

      {/* Share Popup */}
      {showSharePopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Share Invoice</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSharePopup(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-gray-600 mb-6">
              Share invoice {invoice.invoiceNumber} with {invoice.clientName}
            </p>
            <div className="space-y-3">
              <Button
                className="w-full justify-start"
                onClick={handleEmailShare}
              >
                <Mail className="mr-2 h-4 w-4" />
                Send via Email
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleWhatsAppShare}
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Send via WhatsApp
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceDetails;

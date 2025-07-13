
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { formatCurrency } from '@/lib/utils';
import { useInvoiceBackend, useUpdateInvoiceBackend } from '@/hooks/useInvoicesBackend';
import { PageSkeleton } from '@/components/ui/professional-skeleton';

// Invoice validation schema
const InvoiceSchema = z.object({
  clientId: z.string().min(1, 'Client ID is required'),
  clientName: z.string().min(1, 'Client name is required'),
  clientEmail: z.string().email('Valid email is required'),
  clientPhone: z.string().optional(),
  clientAddress: z.string().optional(),
  invoiceNumber: z.string().min(1, 'Invoice number is required'),
  issueDate: z.string().min(1, 'Issue date is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  status: z.enum(['draft', 'sent', 'paid', 'overdue', 'cancelled']),
  subtotal: z.number().min(0, 'Subtotal must be positive'),
  tax: z.number().min(0, 'Tax must be positive').default(0),
  discount: z.number().min(0, 'Discount must be positive').default(0),
  total: z.number().min(0, 'Total must be positive'),
  notes: z.string().optional(),
  paymentTerms: z.string().optional(),
  insuranceType: z.string().optional(),
  policyNumber: z.string().optional(),
  agentName: z.string().optional(),
});

const InvoiceEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const isMobile = window.innerWidth <= 768;

  const { data: invoiceResponse, isLoading: isInvoiceLoading, error: invoiceError } = useInvoiceBackend(id);
  const updateInvoiceMutation = useUpdateInvoiceBackend();

  const invoice = invoiceResponse?.data;

  const form = useForm({
    resolver: zodResolver(InvoiceSchema),
    defaultValues: {
      clientId: '',
      clientName: '',
      clientEmail: '',
      clientPhone: '',
      clientAddress: '',
      invoiceNumber: '',
      issueDate: '',
      dueDate: '',
      status: 'draft',
      subtotal: 0,
      tax: 0,
      discount: 0,
      total: 0,
      notes: '',
      paymentTerms: '',
      insuranceType: '',
      policyNumber: '',
      agentName: '',
    },
  });

  useEffect(() => {
    if (invoice) {
      // Format dates for input fields
      const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
      };

      form.reset({
        clientId: invoice.clientId || '',
        clientName: invoice.clientName || '',
        clientEmail: invoice.clientEmail || '',
        clientPhone: invoice.clientPhone || '',
        clientAddress: invoice.clientAddress || '',
        invoiceNumber: invoice.invoiceNumber || '',
        issueDate: formatDateForInput(invoice.issueDate),
        dueDate: formatDateForInput(invoice.dueDate),
        status: invoice.status || 'draft',
        subtotal: invoice.subtotal || 0,
        tax: invoice.tax || 0,
        discount: invoice.discount || 0,
        total: invoice.total || 0,
        notes: invoice.notes || '',
        paymentTerms: invoice.paymentTerms || '',
        insuranceType: invoice.insuranceType || '',
        policyNumber: invoice.policyNumber || '',
        agentName: invoice.agentName || '',
      });
    }
    setLoading(false);
  }, [invoice, form]);

  const onSubmit = async (values) => {
    try {
      console.log('Submitting invoice update:', values);
      await updateInvoiceMutation.mutateAsync({ 
        id, 
        invoiceData: values 
      });
      toast.success('Invoice updated successfully');
      navigate('/invoices');
    } catch (error) {
      console.error('Error updating invoice:', error);
      toast.error('Failed to update invoice');
    }
  };

  if (loading || isInvoiceLoading) {
    return <PageSkeleton isMobile={isMobile} />;
  }

  if (invoiceError) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Card className="p-6">
          <div className="text-center text-red-600">
            <h2 className="text-lg font-semibold mb-2">Error Loading Invoice</h2>
            <p className="text-sm">{invoiceError.message}</p>
            <Button onClick={() => navigate('/invoices')} className="mt-4" variant="outline">
              Back to Invoices
            </Button>
          </div>
        </Card>
      </div>
    );
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
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Edit Invoice</h1>
        <Button onClick={() => navigate('/invoices')} variant="outline">
          Back to Invoices
        </Button>
      </div>
      
      <Card>
        <CardContent className="p-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Client Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="clientId">Client ID</Label>
                <Input 
                  id="clientId" 
                  type="text" 
                  {...form.register('clientId')} 
                />
                {form.formState.errors.clientId && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.clientId.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="clientName">Client Name</Label>
                <Input 
                  id="clientName" 
                  type="text" 
                  {...form.register('clientName')} 
                />
                {form.formState.errors.clientName && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.clientName.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="clientEmail">Client Email</Label>
                <Input 
                  id="clientEmail" 
                  type="email" 
                  {...form.register('clientEmail')} 
                />
                {form.formState.errors.clientEmail && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.clientEmail.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="clientPhone">Client Phone</Label>
                <Input 
                  id="clientPhone" 
                  type="text" 
                  {...form.register('clientPhone')} 
                />
              </div>
            </div>

            <div>
              <Label htmlFor="clientAddress">Client Address</Label>
              <Textarea 
                id="clientAddress" 
                {...form.register('clientAddress')} 
              />
            </div>

            {/* Invoice Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="invoiceNumber">Invoice Number</Label>
                <Input 
                  id="invoiceNumber" 
                  type="text" 
                  {...form.register('invoiceNumber')} 
                />
                {form.formState.errors.invoiceNumber && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.invoiceNumber.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={form.watch('status')} 
                  onValueChange={(value) => form.setValue('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="issueDate">Issue Date</Label>
                <Input 
                  id="issueDate" 
                  type="date" 
                  {...form.register('issueDate')} 
                />
                {form.formState.errors.issueDate && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.issueDate.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="dueDate">Due Date</Label>
                <Input 
                  id="dueDate" 
                  type="date" 
                  {...form.register('dueDate')} 
                />
                {form.formState.errors.dueDate && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.dueDate.message}</p>
                )}
              </div>
            </div>

            {/* Financial Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="subtotal">Subtotal</Label>
                <Input 
                  id="subtotal" 
                  type="number" 
                  step="0.01"
                  {...form.register('subtotal', { valueAsNumber: true })} 
                />
                {form.formState.errors.subtotal && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.subtotal.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="tax">Tax</Label>
                <Input 
                  id="tax" 
                  type="number" 
                  step="0.01"
                  {...form.register('tax', { valueAsNumber: true })} 
                />
                {form.formState.errors.tax && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.tax.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="discount">Discount</Label>
                <Input 
                  id="discount" 
                  type="number" 
                  step="0.01"
                  {...form.register('discount', { valueAsNumber: true })} 
                />
                {form.formState.errors.discount && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.discount.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="total">Total Amount</Label>
                <Input 
                  id="total" 
                  type="number" 
                  step="0.01"
                  {...form.register('total', { valueAsNumber: true })} 
                />
                {form.formState.errors.total && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.total.message}</p>
                )}
              </div>
            </div>

            {/* Additional Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="insuranceType">Insurance Type</Label>
                <Input 
                  id="insuranceType" 
                  type="text" 
                  {...form.register('insuranceType')} 
                />
              </div>
              
              <div>
                <Label htmlFor="policyNumber">Policy Number</Label>
                <Input 
                  id="policyNumber" 
                  type="text" 
                  {...form.register('policyNumber')} 
                />
              </div>
              
              <div>
                <Label htmlFor="agentName">Agent Name</Label>
                <Input 
                  id="agentName" 
                  type="text" 
                  {...form.register('agentName')} 
                />
              </div>
            </div>

            <div>
              <Label htmlFor="paymentTerms">Payment Terms</Label>
              <Textarea 
                id="paymentTerms" 
                {...form.register('paymentTerms')} 
                placeholder="e.g., Net 30 days"
              />
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea 
                id="notes" 
                {...form.register('notes')} 
                placeholder="Additional notes..."
              />
            </div>

            <div className="flex gap-4">
              <Button 
                type="submit" 
                disabled={updateInvoiceMutation.isLoading}
                className="flex-1"
              >
                {updateInvoiceMutation.isLoading ? 'Updating...' : 'Update Invoice'}
              </Button>
              
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate('/invoices')}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default InvoiceEdit;

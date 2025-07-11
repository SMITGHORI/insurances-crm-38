
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { getInvoiceStatusColor, formatInvoiceDateForDisplay } from '@/utils/invoiceUtils';
import { useIsMobile } from '@/hooks/use-mobile';
import InvoicesMobileView from '@/components/invoices/InvoicesMobileView';
import { 
  Eye, 
  Edit, 
  Trash2, 
  Mail, 
  Download, 
  MoreHorizontal, 
  CheckCircle,
  ArrowUpDown,
  Filter,
  Users,
  Calendar
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  useBulkUpdateInvoicesBackend, 
  useDeleteInvoiceBackend, 
  useSendInvoiceBackend,
  useMarkInvoiceAsPaidBackend
} from '@/hooks/useInvoicesBackend';

const InvoicesTable = ({ 
  invoicesData = {}, 
  filterParams = {}, 
  sortConfig = {}, 
  handleSort = () => {}, 
  handleExport = () => {},
  onPageChange = () => {},
  isLoading = false 
}) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [selectedInvoices, setSelectedInvoices] = useState([]);
  const [bulkAction, setBulkAction] = useState('');

  // Mutation hooks
  const bulkUpdateMutation = useBulkUpdateInvoicesBackend();
  const deleteInvoiceMutation = useDeleteInvoiceBackend();
  const sendInvoiceMutation = useSendInvoiceBackend();
  const markAsPaidMutation = useMarkInvoiceAsPaidBackend();

  const invoices = invoicesData?.data || [];
  const totalPages = invoicesData?.totalPages || 1;
  const currentPage = invoicesData?.page || 1;
  const totalCount = invoicesData?.total || 0;

  // Memoized processed invoices for better performance
  const processedInvoices = useMemo(() => {
    return invoices.map(invoice => ({
      ...invoice,
      id: invoice._id || invoice.id,
      formattedIssueDate: formatInvoiceDateForDisplay(invoice.issueDate),
      formattedDueDate: formatInvoiceDateForDisplay(invoice.dueDate),
      statusColor: getInvoiceStatusColor(invoice.status),
      isOverdue: new Date(invoice.dueDate) < new Date() && invoice.status !== 'paid',
      isDueSoon: (() => {
        const dueDate = new Date(invoice.dueDate);
        const today = new Date();
        const diffTime = dueDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 3 && diffDays >= 0 && invoice.status !== 'paid';
      })()
    }));
  }, [invoices]);

  const handleViewInvoice = (invoiceId) => {
    navigate(`/invoices/${invoiceId}`);
  };

  const handleEditInvoice = (invoiceId) => {
    navigate(`/invoices/edit/${invoiceId}`);
  };

  const handleDeleteInvoice = async (invoiceId) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      try {
        await deleteInvoiceMutation.mutateAsync(invoiceId);
      } catch (error) {
        console.error('Error deleting invoice:', error);
      }
    }
  };

  const handleSendInvoice = async (invoice) => {
    try {
      await sendInvoiceMutation.mutateAsync({
        invoiceId: invoice.id,
        emailData: {
          to: invoice.clientEmail,
          subject: `Invoice ${invoice.invoiceNumber}`,
          message: `Please find your invoice ${invoice.invoiceNumber} attached.`
        }
      });
    } catch (error) {
      console.error('Error sending invoice:', error);
    }
  };

  const handleMarkAsPaid = async (invoiceId) => {
    try {
      await markAsPaidMutation.mutateAsync({
        invoiceId,
        paymentData: {
          paymentDate: new Date().toISOString(),
          paymentMethod: 'Manual',
          notes: 'Marked as paid manually'
        }
      });
    } catch (error) {
      console.error('Error marking invoice as paid:', error);
    }
  };

  const handleSelectInvoice = (invoiceId, checked) => {
    if (checked) {
      setSelectedInvoices([...selectedInvoices, invoiceId]);
    } else {
      setSelectedInvoices(selectedInvoices.filter(id => id !== invoiceId));
    }
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedInvoices(processedInvoices.map(inv => inv.id));
    } else {
      setSelectedInvoices([]);
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedInvoices.length === 0) {
      toast.error('Please select invoices first');
      return;
    }

    try {
      switch (action) {
        case 'mark-paid':
          await bulkUpdateMutation.mutateAsync({
            invoiceIds: selectedInvoices,
            updateData: { 
              status: 'paid', 
              paidAt: new Date() 
            }
          });
          break;
        case 'mark-sent':
          await bulkUpdateMutation.mutateAsync({
            invoiceIds: selectedInvoices,
            updateData: { 
              status: 'sent', 
              sentAt: new Date() 
            }
          });
          break;
        case 'delete':
          if (window.confirm(`Are you sure you want to delete ${selectedInvoices.length} invoices?`)) {
            // Delete invoices one by one (in a real app, you'd have a bulk delete endpoint)
            for (const invoiceId of selectedInvoices) {
              await deleteInvoiceMutation.mutateAsync(invoiceId);
            }
          }
          break;
        default:
          break;
      }
      setSelectedInvoices([]);
    } catch (error) {
      console.error('Error performing bulk action:', error);
    }
  };

  const handlePageNavigation = (direction) => {
    if (direction === 'next' && currentPage < totalPages) {
      onPageChange(currentPage + 1);
    } else if (direction === 'prev' && currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Mobile view
  if (isMobile) {
    return <InvoicesMobileView invoices={processedInvoices} />;
  }

  // Desktop view with enhanced features
  return (
    <div className="space-y-4">
      {/* Bulk Actions Bar */}
      {selectedInvoices.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">
                  {selectedInvoices.length} invoice{selectedInvoices.length !== 1 ? 's' : ''} selected
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => handleBulkAction('mark-paid')}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Mark as Paid
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkAction('mark-sent')}
                >
                  <Mail className="h-4 w-4 mr-1" />
                  Mark as Sent
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleBulkAction('delete')}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedInvoices([])}
                >
                  Clear Selection
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedInvoices.length === processedInvoices.length && processedInvoices.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('invoiceNumber')}>
                  <div className="flex items-center gap-1">
                    Invoice #
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('clientName')}>
                  <div className="flex items-center gap-1">
                    Client
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('issueDate')}>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Issue Date
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('dueDate')}>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Due Date
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('status')}>
                  <div className="flex items-center gap-1">
                    Status
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer text-right" onClick={() => handleSort('total')}>
                  <div className="flex items-center justify-end gap-1">
                    Amount
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead className="w-12">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {processedInvoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No invoices found matching your criteria
                  </TableCell>
                </TableRow>
              ) : (
                processedInvoices.map((invoice) => (
                  <TableRow 
                    key={invoice.id} 
                    className="hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => handleViewInvoice(invoice.id)}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedInvoices.includes(invoice.id)}
                        onCheckedChange={(checked) => handleSelectInvoice(invoice.id, checked)}
                      />
                    </TableCell>
                    <TableCell className="font-medium text-blue-600">
                      {invoice.invoiceNumber}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{invoice.clientName}</div>
                        <div className="text-sm text-muted-foreground">{invoice.clientEmail}</div>
                      </div>
                    </TableCell>
                    <TableCell>{invoice.formattedIssueDate}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {invoice.formattedDueDate}
                        {invoice.isDueSoon && (
                          <Badge variant="outline" className="text-orange-600 border-orange-200">
                            Due Soon
                          </Badge>
                        )}
                        {invoice.isOverdue && (
                          <Badge variant="destructive" className="text-xs">
                            Overdue
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={invoice.statusColor}>
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(invoice.total)}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => handleViewInvoice(invoice.id)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditInvoice(invoice.id)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Invoice
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {invoice.status === 'draft' && (
                            <DropdownMenuItem onClick={() => handleSendInvoice(invoice)}>
                              <Mail className="mr-2 h-4 w-4" />
                              Send Invoice
                            </DropdownMenuItem>
                          )}
                          {invoice.status !== 'paid' && (
                            <DropdownMenuItem onClick={() => handleMarkAsPaid(invoice.id)}>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Mark as Paid
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem>
                            <Download className="mr-2 h-4 w-4" />
                            Download PDF
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleDeleteInvoice(invoice.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {((currentPage - 1) * (filterParams.limit || 50)) + 1} to {Math.min(currentPage * (filterParams.limit || 50), totalCount)} of {totalCount} invoices
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageNavigation('prev')}
              disabled={currentPage <= 1}
            >
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    className="w-8 h-8"
                    onClick={() => onPageChange(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageNavigation('next')}
              disabled={currentPage >= totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoicesTable;

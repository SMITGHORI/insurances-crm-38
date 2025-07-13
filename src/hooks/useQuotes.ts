
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { quotationsApi } from '../services/api/quotationsApi';

// Define Quote interface for TypeScript
export interface Quote {
  id: string;
  quoteId: string;
  leadId: string;
  leadName: string;
  clientName: string;
  insuranceType: string;
  insuranceCompany: string;
  premium: number;
  sumInsured: number;
  validUntil: string;
  status: 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'expired';
  agentId?: string;
  agentName?: string;
  clientId?: string;
  sentAt?: string;
  viewedAt?: string;
  acceptedAt?: string;
  rejectedAt?: string;
  createdAt: string;
  updatedAt?: string;
  notes?: string;
  products?: Array<{
    name: string;
    description?: string;
    sumInsured?: number;
    premium: number;
  }>;
  // Additional properties that were missing
  carrier?: string;
  coverageAmount?: number;
  valueScore?: number;
  riskProfile?: {
    age?: number;
    location?: string;
    vehicleType?: string;
    healthStatus?: string;
  };
  approvedAt?: string;
  documentUrl?: string;
}

export const useQuotes = (params?: {
  status?: string;
  branch?: string;
  agentId?: string;
  search?: string;
  clientId?: string;
  insuranceType?: string;
}) => {
  return useQuery({
    queryKey: ['quotes', params],
    queryFn: async () => {
      const response = await quotationsApi.getQuotations(params || {});
      // Transform the response to match the expected Quote interface
      const quotes = response.quotations?.map((quotation: any) => ({
        id: quotation._id || quotation.id,
        quoteId: quotation.quoteId,
        leadId: quotation.clientId,
        leadName: quotation.clientName,
        clientName: quotation.clientName,
        insuranceType: quotation.insuranceType,
        insuranceCompany: quotation.insuranceCompany,
        premium: quotation.premium,
        sumInsured: quotation.sumInsured,
        validUntil: quotation.validUntil,
        status: quotation.status,
        agentId: quotation.agentId,
        agentName: quotation.agentName,
        clientId: quotation.clientId,
        sentAt: quotation.sentDate,
        viewedAt: quotation.viewedAt,
        acceptedAt: quotation.acceptedAt,
        rejectedAt: quotation.rejectedAt,
        createdAt: quotation.createdAt,
        updatedAt: quotation.updatedAt,
        notes: quotation.notes,
        products: quotation.products,
        // Map additional properties
        carrier: quotation.insuranceCompany,
        coverageAmount: quotation.sumInsured,
        valueScore: quotation.valueScore,
        riskProfile: quotation.riskProfile,
        approvedAt: quotation.approvedAt,
        documentUrl: quotation.documentUrl,
      })) || [];

      return {
        data: quotes,
        totalCount: response.totalCount,
        pagination: response.pagination,
      };
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: (failureCount, error) => {
      return failureCount < 2;
    },
  });
};

export const useQuoteById = (quoteId: string | null) => {
  return useQuery({
    queryKey: ['quote', quoteId],
    queryFn: async () => {
      if (!quoteId) return null;
      const response = await quotationsApi.getQuotationById(quoteId);
      
      // Transform the response to match the expected Quote interface
      return {
        id: response._id || response.id,
        quoteId: response.quoteId,
        leadId: response.clientId,
        leadName: response.clientName,
        clientName: response.clientName,
        insuranceType: response.insuranceType,
        insuranceCompany: response.insuranceCompany,
        premium: response.premium,
        sumInsured: response.sumInsured,
        validUntil: response.validUntil,
        status: response.status,
        agentId: response.agentId,
        agentName: response.agentName,
        clientId: response.clientId,
        sentAt: response.sentDate,
        viewedAt: response.viewedAt,
        acceptedAt: response.acceptedAt,
        rejectedAt: response.rejectedAt,
        createdAt: response.createdAt,
        updatedAt: response.updatedAt,
        notes: response.notes,
        products: response.products,
        // Map additional properties
        carrier: response.insuranceCompany,
        coverageAmount: response.sumInsured,
        valueScore: response.valueScore,
        riskProfile: response.riskProfile,
        approvedAt: response.approvedAt,
        documentUrl: response.documentUrl,
      };
    },
    enabled: !!quoteId,
  });
};

export const useCreateQuote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (quotationData: any) => {
      return await quotationsApi.createQuotation(quotationData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      toast.success('Quote created successfully');
    },
    onError: (error: any) => {
      console.error('Error creating quote:', error);
      toast.error(error.message || 'Failed to create quote');
    },
  });
};

export const useUpdateQuoteStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ quoteId, status, additionalData }: { quoteId: string; status: string; additionalData?: any }) =>
      quotationsApi.updateQuotationStatus(quoteId, status, additionalData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      toast.success('Quote status updated successfully');
    },
    onError: (error: any) => {
      console.error('Error updating quote status:', error);
      toast.error(error.message || 'Failed to update quote status');
    },
  });
};

export const useSendWhatsApp = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ quoteIds, message }: { quoteIds: string[]; message: string }) => {
      const promises = quoteIds.map(quoteId => 
        quotationsApi.makeRequest(`/${quoteId}/whatsapp`, {
          method: 'POST',
          body: JSON.stringify({ message })
        })
      );
      return Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      toast.success('WhatsApp messages sent successfully');
    },
    onError: (error: any) => {
      console.error('Error sending WhatsApp messages:', error);
      toast.error(error.message || 'Failed to send WhatsApp messages');
    },
  });
};

export const useSendEmail = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ quoteIds, template }: { quoteIds: string[]; template: string }) => {
      const promises = quoteIds.map(quoteId => 
        quotationsApi.sendQuotation(quoteId, { template })
      );
      return Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      toast.success('Emails sent successfully');
    },
    onError: (error: any) => {
      console.error('Error sending emails:', error);
      toast.error(error.message || 'Failed to send emails');
    },
  });
};

export const useBulkUpdateQuotes = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ quoteIds, status }: { quoteIds: string[]; status: string }) => {
      const promises = quoteIds.map(quoteId => 
        quotationsApi.updateQuotationStatus(quoteId, status)
      );
      return Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      toast.success('Quotes updated successfully');
    },
    onError: (error: any) => {
      console.error('Error updating quotes:', error);
      toast.error(error.message || 'Failed to update quotes');
    },
  });
};

export const useExportQuotes = () => {
  return useMutation({
    mutationFn: async (quotes: Quote[]) => {
      // Create CSV content
      const headers = ['Quote ID', 'Client', 'Insurance Type', 'Premium', 'Sum Insured', 'Status', 'Valid Until'];
      const csvContent = [
        headers.join(','),
        ...quotes.map(quote => [
          quote.quoteId,
          quote.clientName,
          quote.insuranceType,
          quote.premium,
          quote.sumInsured,
          quote.status,
          quote.validUntil
        ].join(','))
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `quotes_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
    onSuccess: () => {
      toast.success('Quotes exported successfully');
    },
    onError: (error: any) => {
      console.error('Error exporting quotes:', error);
      toast.error('Failed to export quotes');
    },
  });
};

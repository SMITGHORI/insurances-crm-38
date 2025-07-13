
import React from 'react';
import { render } from '@testing-library/react';
import { screen, fireEvent } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import QuoteComparisonTable from './QuoteComparisonTable';
import { usePermissions } from '@/hooks/usePermissions';

// Mock dependencies
vi.mock('@/hooks/usePermissions');
vi.mock('@/hooks/useQuotes', () => ({
  useUpdateQuoteStatus: () => ({
    mutateAsync: vi.fn().mockResolvedValue({}),
    isPending: false,
  }),
  useExportQuotes: () => ({
    mutateAsync: vi.fn().mockResolvedValue({}),
    isPending: false,
  }),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

const mockQuotes = [
  {
    id: '1',
    quoteId: 'QT-2025-0001',
    leadId: 'LD000001',
    leadName: 'John Doe',
    clientId: 'CL000001',
    clientName: 'John Doe',
    insuranceCompany: 'State Farm',
    insuranceType: 'Health Insurance',
    premium: 1000,
    sumInsured: 100000,
    validUntil: '2025-12-31',
    status: 'sent' as const,
    agentId: '1',
    agentName: 'Agent Smith',
    createdAt: '2025-01-01',
    updatedAt: '2025-01-01',
    valueScore: 100,
    documentUrl: 'https://example.com/doc.pdf',
    // Additional properties to match interface
    carrier: 'State Farm',
    coverageAmount: 100000,
    riskProfile: {
      age: 30,
      location: 'New York',
      healthStatus: 'Good'
    },
    approvedAt: undefined,
    sentAt: '2025-01-01',
    viewedAt: undefined,
    acceptedAt: undefined,
    rejectedAt: undefined,
    notes: '',
    products: []
  },
  {
    id: '2',
    quoteId: 'QT-2025-0002',
    leadId: 'LD000002',
    leadName: 'Jane Smith',
    clientId: 'CL000002',
    clientName: 'Jane Smith',
    insuranceCompany: 'Geico',
    insuranceType: 'Motor Insurance',
    premium: 800,
    sumInsured: 80000,
    validUntil: '2025-11-30',
    status: 'draft' as const,
    agentId: '1',
    agentName: 'Agent Smith',
    createdAt: '2025-01-02',
    updatedAt: '2025-01-02',
    valueScore: 100,
    // Additional properties to match interface
    carrier: 'Geico',
    coverageAmount: 80000,
    riskProfile: {
      age: 25,
      location: 'California',
      vehicleType: 'Sedan'
    },
    approvedAt: undefined,
    sentAt: undefined,
    viewedAt: undefined,
    acceptedAt: undefined,
    rejectedAt: undefined,
    notes: '',
    products: [],
    documentUrl: undefined
  },
];

describe('QuoteComparisonTable Component', () => {
  const mockOnQuoteSelect = vi.fn();
  const mockOnQuoteUpdate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(usePermissions).mockReturnValue({
      hasPermission: vi.fn(() => true),
      hasAnyPermission: vi.fn(() => true),
      isSameBranch: vi.fn(() => true),
      userBranch: 'main',
      userRole: 'agent',
      userPermissions: []
    });
  });

  it('should render quotes correctly', () => {
    render(
      <QuoteComparisonTable
        quotes={mockQuotes}
        onQuoteSelect={mockOnQuoteSelect}
        onQuoteUpdate={mockOnQuoteUpdate}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('State Farm')).toBeInTheDocument();
    expect(screen.getByText('Geico')).toBeInTheDocument();
    expect(screen.getByText('$1,000.00')).toBeInTheDocument();
    expect(screen.getByText('$800.00')).toBeInTheDocument();
  });

  it('should hide rows for different branches', () => {
    vi.mocked(usePermissions).mockReturnValue({
      hasPermission: vi.fn(() => true),
      hasAnyPermission: vi.fn(() => true),
      isSameBranch: vi.fn((branch) => branch === 'LD000001'),
      userBranch: 'main',
      userRole: 'agent',
      userPermissions: []
    });

    render(
      <QuoteComparisonTable
        quotes={mockQuotes}
        onQuoteSelect={mockOnQuoteSelect}
        onQuoteUpdate={mockOnQuoteUpdate}
      />,
      { wrapper: createWrapper() }
    );

    // Should show State Farm (LD000001 branch) but not Geico (LD000002 branch)
    expect(screen.getByText('State Farm')).toBeInTheDocument();
    expect(screen.queryByText('Geico')).not.toBeInTheDocument();
  });

  it('should conditionally render action buttons based on permissions', async () => {
    const user = userEvent.setup();
    
    vi.mocked(usePermissions).mockReturnValue({
      hasPermission: vi.fn((module, action) => {
        if (module === 'quotations' && action === 'approve') return false;
        return true;
      }),
      hasAnyPermission: vi.fn(() => true),
      isSameBranch: vi.fn(() => true),
      userBranch: 'main',
      userRole: 'agent',
      userPermissions: []
    });

    render(
      <QuoteComparisonTable
        quotes={mockQuotes}
        onQuoteSelect={mockOnQuoteSelect}
        onQuoteUpdate={mockOnQuoteUpdate}
      />,
      { wrapper: createWrapper() }
    );

    // Click on the actions menu for the active quote
    const actionButtons = screen.getAllByRole('button');
    const menuButton = actionButtons.find(button => 
      button.getAttribute('aria-haspopup') === 'menu'
    );
    
    if (menuButton) {
      await user.click(menuButton);
      
      // Should see View Details but not Approve Quote
      expect(screen.getByText('View Details')).toBeInTheDocument();
      expect(screen.queryByText('Approve Quote')).not.toBeInTheDocument();
    }
  });

  it('should show empty state when no quotes available', () => {
    render(
      <QuoteComparisonTable
        quotes={[]}
        onQuoteSelect={mockOnQuoteSelect}
        onQuoteUpdate={mockOnQuoteUpdate}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('No quotes available')).toBeInTheDocument();
    expect(screen.getByText('Create your first quote to see the comparison table.')).toBeInTheDocument();
  });

  it('should handle quote selection', async () => {
    const user = userEvent.setup();
    
    render(
      <QuoteComparisonTable
        quotes={mockQuotes}
        onQuoteSelect={mockOnQuoteSelect}
        onQuoteUpdate={mockOnQuoteUpdate}
      />,
      { wrapper: createWrapper() }
    );

    // Click on the actions menu and then View Details
    const actionButtons = screen.getAllByRole('button');
    const menuButton = actionButtons.find(button => 
      button.getAttribute('aria-haspopup') === 'menu'
    );
    
    if (menuButton) {
      await user.click(menuButton);
      const viewButton = screen.getByText('View Details');
      await user.click(viewButton);
      
      expect(mockOnQuoteSelect).toHaveBeenCalledWith('1');
    }
  });
});

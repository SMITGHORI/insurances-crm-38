
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, Edit, MoreHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import ClaimStatusBadge from './ClaimStatusBadge';
import ClaimPriorityBadge from './ClaimPriorityBadge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const ClaimsTable = ({ 
  claims, 
  pagination, 
  isLoading, 
  filterParams, 
  setFilterParams,
  selectedClaims,
  onClaimSelection
}) => {
  const navigate = useNavigate();

  const handleViewClaim = (claimId) => {
    navigate(`/claims/${claimId}`);
  };

  const handleEditClaim = (claimId) => {
    navigate(`/claims/${claimId}/edit`);
  };

  const handleClaimSelect = (claimId, checked) => {
    if (onClaimSelection) {
      onClaimSelection(claimId, checked);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (error) {
      return '-';
    }
  };

  const handlePageChange = (newPage) => {
    setFilterParams(prev => ({ ...prev, page: newPage }));
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Claims</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Claims ({pagination.totalItems || 0})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox />
                </TableHead>
                <TableHead>Claim #</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Policy</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {claims.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="text-center py-8 text-gray-500">
                    No claims found. Try adjusting your filters.
                  </TableCell>
                </TableRow>
              ) : (
                claims.map((claim) => (
                  <TableRow key={claim._id} className="hover:bg-gray-50">
                    <TableCell>
                      <Checkbox
                        checked={selectedClaims.includes(claim._id)}
                        onCheckedChange={(checked) => handleClaimSelect(claim._id, checked)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      <Button
                        variant="link"
                        className="p-0 h-auto font-medium text-blue-600 hover:text-blue-800"
                        onClick={() => handleViewClaim(claim._id)}
                      >
                        {claim.claimNumber}
                      </Button>
                    </TableCell>
                    <TableCell>
                      {claim.clientId ? (
                        <div>
                          <div className="font-medium">
                            {claim.clientId.firstName} {claim.clientId.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {claim.clientId.email}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {claim.policyId ? (
                        <div>
                          <div className="font-medium">{claim.policyId.policyNumber}</div>
                          <div className="text-sm text-gray-500">{claim.policyId.policyType}</div>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{claim.claimType}</Badge>
                    </TableCell>
                    <TableCell>
                      <ClaimStatusBadge status={claim.status} />
                    </TableCell>
                    <TableCell>
                      <ClaimPriorityBadge priority={claim.priority} />
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{formatCurrency(claim.claimAmount)}</div>
                        {claim.approvedAmount > 0 && (
                          <div className="text-sm text-green-600">
                            Approved: {formatCurrency(claim.approvedAmount)}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="text-sm">Incident: {formatDate(claim.incidentDate)}</div>
                        <div className="text-xs text-gray-500">
                          Reported: {formatDate(claim.reportedDate)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {claim.assignedTo ? (
                        <div className="text-sm">
                          {claim.assignedTo.firstName} {claim.assignedTo.lastName}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">Unassigned</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewClaim(claim._id)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditClaim(claim._id)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Claim
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {pagination.totalItems > 0 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-700">
              Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to{' '}
              {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of{' '}
              {pagination.totalItems} results
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={!pagination.hasPrevPage}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <span className="text-sm">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={!pagination.hasNextPage}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ClaimsTable;


import React from 'react';
import ClientDetailTabs from './ClientDetailTabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';

const ClientDetails = ({ client, showFullDetails = false, onEditClient, onDeleteClient }) => {
  if (!client) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-gray-500">No client data available</p>
        </CardContent>
      </Card>
    );
  }

  if (!showFullDetails) {
    // Simple card view for list/table usage
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">{client.name || 'Unknown Client'}</h3>
              <p className="text-sm text-gray-600">{client.email}</p>
              <p className="text-sm text-gray-600">{client.phone}</p>
            </div>
            <div className="flex space-x-2">
              {onEditClient && (
                <Button variant="outline" size="sm" onClick={() => onEditClient(client._id)}>
                  <Edit className="h-4 w-4" />
                </Button>
              )}
              {onDeleteClient && (
                <Button variant="outline" size="sm" onClick={() => onDeleteClient(client._id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Full detailed view with tabs
  return (
    <div className="space-y-6">
      {/* Action buttons */}
      <div className="flex justify-end space-x-2">
        {onEditClient && (
          <Button variant="outline" onClick={() => onEditClient(client._id)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Client
          </Button>
        )}
        {onDeleteClient && (
          <Button variant="outline" onClick={() => onDeleteClient(client._id)} className="text-red-600 hover:text-red-700">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Client
          </Button>
        )}
      </div>

      {/* Client Detail Tabs */}
      <ClientDetailTabs client={client} />
    </div>
  );
};

export default ClientDetails;

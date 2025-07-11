
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  FileText, 
  Download, 
  Trash2, 
  Eye,
  Calendar,
  User
} from 'lucide-react';
import { toast } from 'sonner';
import { useUploadDocument } from '@/hooks/useClients';

const ClientDocuments = ({ clientId }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [documentType, setDocumentType] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const uploadDocumentMutation = useUploadDocument();

  const documentTypes = [
    { value: 'pan', label: 'PAN Card' },
    { value: 'aadhaar', label: 'Aadhaar Card' },
    { value: 'idProof', label: 'ID Proof' },
    { value: 'addressProof', label: 'Address Proof' },
    { value: 'gst', label: 'GST Certificate' },
    { value: 'registration', label: 'Registration Document' }
  ];

  const handleFileUpload = async () => {
    if (!selectedFile || !documentType) {
      toast.error('Please select a file and document type');
      return;
    }

    try {
      setIsUploading(true);
      await uploadDocumentMutation.mutateAsync({
        clientId,
        documentType,
        file: selectedFile
      });
      
      // Reset form
      setSelectedFile(null);
      setDocumentType('');
      toast.success('Document uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload document');
    } finally {
      setIsUploading(false);
    }
  };

  const mockDocuments = [
    {
      id: '1',
      type: 'pan',
      name: 'PAN_Card.pdf',
      size: '245 KB',
      uploadedAt: new Date(),
      uploadedBy: 'System Admin'
    },
    {
      id: '2',
      type: 'aadhaar',
      name: 'Aadhaar_Card.pdf',
      size: '189 KB',
      uploadedAt: new Date(Date.now() - 86400000),
      uploadedBy: 'Agent Smith'
    }
  ];

  const getDocumentTypeLabel = (type) => {
    const docType = documentTypes.find(dt => dt.value === type);
    return docType ? docType.label : type;
  };

  const getDocumentIcon = (filename) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    return <FileText className="h-5 w-5 text-blue-600" />;
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Upload className="h-5 w-5" />
            <span>Upload Document</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Document Type</label>
              <select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select document type</option>
                {documentTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Select File</label>
              <input
                type="file"
                onChange={(e) => setSelectedFile(e.target.files[0])}
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <Button 
            onClick={handleFileUpload}
            disabled={!selectedFile || !documentType || isUploading}
            className="w-full md:w-auto"
          >
            {isUploading ? 'Uploading...' : 'Upload Document'}
          </Button>
        </CardContent>
      </Card>

      {/* Documents List */}
      <Card>
        <CardHeader>
          <CardTitle>Uploaded Documents</CardTitle>
        </CardHeader>
        <CardContent>
          {mockDocuments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No documents uploaded yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {mockDocuments.map(doc => (
                <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    {getDocumentIcon(doc.name)}
                    <div>
                      <h4 className="font-medium">{doc.name}</h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <Badge variant="outline">{getDocumentTypeLabel(doc.type)}</Badge>
                        <span>{doc.size}</span>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>{doc.uploadedAt.toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <User className="h-3 w-3" />
                          <span>{doc.uploadedBy}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientDocuments;

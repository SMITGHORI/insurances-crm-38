
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Upload, 
  Download, 
  Trash2, 
  Eye,
  Plus,
  File,
  FileImage,
  FileVideo,
  Calendar
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  usePolicyDocuments, 
  useUploadPolicyDocument, 
  useDeletePolicyDocument 
} from '@/hooks/usePolicyFeatures';

const PolicyDocuments = ({ policyId }) => {
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [documentType, setDocumentType] = useState('policy_document');
  const [documentName, setDocumentName] = useState('');

  const { data: documents = [], isLoading, refetch } = usePolicyDocuments(policyId);
  const uploadDocument = useUploadPolicyDocument();
  const deleteDocument = useDeletePolicyDocument();

  const documentTypes = [
    { value: 'policy_document', label: 'Policy Document' },
    { value: 'proposal_form', label: 'Proposal Form' },
    { value: 'medical_report', label: 'Medical Report' },
    { value: 'claim_form', label: 'Claim Form' },
    { value: 'amendment', label: 'Amendment' },
    { value: 'renewal', label: 'Renewal' },
    { value: 'other', label: 'Other' }
  ];

  const getFileIcon = (fileName) => {
    const extension = fileName?.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) {
      return <FileImage className="h-5 w-5" />;
    } else if (['mp4', 'avi', 'mov'].includes(extension)) {
      return <FileVideo className="h-5 w-5" />;
    }
    return <File className="h-5 w-5" />;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown size';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file to upload');
      return;
    }

    try {
      await uploadDocument.mutateAsync({
        policyId,
        documentType,
        file: selectedFile,
        name: documentName || selectedFile.name
      });

      setSelectedFile(null);
      setDocumentName('');
      setDocumentType('policy_document');
      setUploadModalOpen(false);
      refetch();
    } catch (error) {
      console.error('Upload error:', error);
    }
  };

  const handleDeleteDocument = async (documentId) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      await deleteDocument.mutateAsync({ policyId, documentId });
      refetch();
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Policy Documents</h3>
          <p className="text-sm text-gray-600">Manage policy-related documents and files</p>
        </div>
        <Button onClick={() => setUploadModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Upload Document
        </Button>
      </div>

      {/* Upload Modal */}
      {uploadModalOpen && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Upload className="h-5 w-5 mr-2" />
              Upload New Document
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Document Type</label>
              <select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                {documentTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Document Name (Optional)</label>
              <Input
                value={documentName}
                onChange={(e) => setDocumentName(e.target.value)}
                placeholder="Enter custom document name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Select File</label>
              <Input
                type="file"
                onChange={(e) => setSelectedFile(e.target.files[0])}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
              />
              {selectedFile && (
                <p className="text-sm text-gray-600 mt-1">
                  Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={handleFileUpload}
                disabled={uploadDocument.isLoading || !selectedFile}
              >
                {uploadDocument.isLoading ? 'Uploading...' : 'Upload Document'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setUploadModalOpen(false);
                  setSelectedFile(null);
                  setDocumentName('');
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Documents List */}
      <div className="space-y-4">
        {documents.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No documents yet</h3>
              <p className="text-gray-500 mb-4">Upload policy documents to get started</p>
              <Button onClick={() => setUploadModalOpen(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Upload First Document
              </Button>
            </CardContent>
          </Card>
        ) : (
          documents.map((document) => (
            <Card key={document._id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      {getFileIcon(document.fileName)}
                    </div>
                    <div>
                      <h4 className="font-medium">{document.name || document.fileName}</h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDate(document.uploadedAt)}
                        </span>
                        <span>{formatFileSize(document.fileSize)}</span>
                        <Badge variant="outline" className="capitalize">
                          {document.documentType?.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDeleteDocument(document._id)}
                      disabled={deleteDocument.isLoading}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default PolicyDocuments;

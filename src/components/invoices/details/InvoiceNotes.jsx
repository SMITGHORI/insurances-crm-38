
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useUpdateInvoice } from '@/hooks/useInvoices';
import { 
  MessageSquare, 
  Plus, 
  Edit3, 
  Save, 
  X, 
  Clock, 
  User,
  AlertCircle,
  CheckCircle,
  Info
} from 'lucide-react';

const InvoiceNotes = ({ invoice }) => {
  const [notes, setNotes] = useState(invoice?.notes || '');
  const [isEditing, setIsEditing] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);
  
  const updateInvoiceMutation = useUpdateInvoice();

  // Mock internal notes (in a real app, these would come from the API)
  const [internalNotes, setInternalNotes] = useState([
    {
      id: 1,
      content: 'Client requested extended payment terms during initial discussion.',
      author: 'John Smith',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      type: 'info'
    },
    {
      id: 2,
      content: 'Follow up required if payment not received by due date.',
      author: 'Sarah Johnson',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      type: 'warning'
    }
  ]);

  const handleSaveNotes = async () => {
    try {
      await updateInvoiceMutation.mutateAsync({
        id: invoice.id || invoice._id,
        invoiceData: { notes }
      });
      setIsEditing(false);
      toast.success('Notes updated successfully');
    } catch (error) {
      console.error('Error updating notes:', error);
      toast.error('Failed to update notes');
    }
  };

  const handleAddInternalNote = () => {
    if (!newNote.trim()) {
      toast.error('Please enter a note');
      return;
    }

    const note = {
      id: Date.now(),
      content: newNote,
      author: 'Current User', // In a real app, get from auth context
      timestamp: new Date().toISOString(),
      type: 'info'
    };

    setInternalNotes([note, ...internalNotes]);
    setNewNote('');
    setIsAddingNote(false);
    toast.success('Note added successfully');
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} days ago`;
    }
  };

  const getNoteIcon = (type) => {
    switch (type) {
      case 'warning': return AlertCircle;
      case 'success': return CheckCircle;
      default: return Info;
    }
  };

  const getNoteColor = (type) => {
    switch (type) {
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'success': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  if (!invoice) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            Invoice data not available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Public Notes Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Invoice Notes
            </CardTitle>
            {!isEditing && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="space-y-4">
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes that will be visible to the client..."
                rows={4}
                className="resize-none"
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleSaveNotes}
                  disabled={updateInvoiceMutation.isLoading}
                  size="sm"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {updateInvoiceMutation.isLoading ? 'Saving...' : 'Save'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setNotes(invoice.notes || '');
                    setIsEditing(false);
                  }}
                  size="sm"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div>
              {notes ? (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm whitespace-pre-wrap">{notes}</p>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No notes added yet</p>
                  <p className="text-sm">Notes will be visible to the client</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Internal Notes Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Internal Notes
              <Badge variant="outline" className="ml-2">
                {internalNotes.length}
              </Badge>
            </CardTitle>
            {!isAddingNote && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAddingNote(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Note
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Add New Note Form */}
          {isAddingNote && (
            <div className="mb-6 p-4 border rounded-lg bg-muted/20">
              <Textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add an internal note (not visible to client)..."
                rows={3}
                className="resize-none mb-3"
              />
              <div className="flex gap-2">
                <Button onClick={handleAddInternalNote} size="sm">
                  <Save className="w-4 h-4 mr-2" />
                  Add Note
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setNewNote('');
                    setIsAddingNote(false);
                  }}
                  size="sm"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Notes List */}
          <div className="space-y-4">
            {internalNotes.length > 0 ? (
              internalNotes.map((note, index) => {
                const NoteIcon = getNoteIcon(note.type);
                return (
                  <div key={note.id}>
                    <div className={`p-4 rounded-lg border ${getNoteColor(note.type)}`}>
                      <div className="flex items-start gap-3">
                        <NoteIcon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm mb-2">{note.content}</p>
                          <div className="flex items-center gap-2 text-xs opacity-70">
                            <User className="w-3 h-3" />
                            <span>{note.author}</span>
                            <span>•</span>
                            <Clock className="w-3 h-3" />
                            <span>{formatTimestamp(note.timestamp)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    {index < internalNotes.length - 1 && <Separator className="my-4" />}
                  </div>
                );
              })
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No internal notes yet</p>
                <p className="text-sm">Add notes for your team (not visible to client)</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              variant="outline"
              onClick={() => {
                const note = {
                  id: Date.now(),
                  content: 'Payment reminder sent to client',
                  author: 'Current User',
                  timestamp: new Date().toISOString(),
                  type: 'info'
                };
                setInternalNotes([note, ...internalNotes]);
                toast.success('Payment reminder note added');
              }}
              className="justify-start"
            >
              <Clock className="w-4 h-4 mr-2" />
              Add Payment Reminder Note
            </Button>
            
            <Button
              variant="outline"
              onClick={() => {
                const note = {
                  id: Date.now(),
                  content: 'Follow-up call scheduled for tomorrow',
                  author: 'Current User',
                  timestamp: new Date().toISOString(),
                  type: 'warning'
                };
                setInternalNotes([note, ...internalNotes]);
                toast.success('Follow-up note added');
              }}
              className="justify-start"
            >
              <AlertCircle className="w-4 h-4 mr-2" />
              Add Follow-up Note
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InvoiceNotes;

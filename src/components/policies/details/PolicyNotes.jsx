
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  StickyNote, 
  Plus, 
  User, 
  Calendar,
  MessageSquare
} from 'lucide-react';
import { toast } from 'sonner';
import { usePolicyNotes, useAddNote } from '@/hooks/usePolicyFeatures';

const PolicyNotes = ({ policyId }) => {
  const [showAddNote, setShowAddNote] = useState(false);
  const [noteText, setNoteText] = useState('');

  const { data: notes = [], isLoading, refetch } = usePolicyNotes(policyId);
  const addNote = useAddNote();

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleAddNote = async () => {
    if (!noteText.trim()) {
      toast.error('Please enter a note');
      return;
    }

    try {
      await addNote.mutateAsync({
        policyId,
        noteData: { note: noteText.trim() }
      });

      setNoteText('');
      setShowAddNote(false);
      refetch();
    } catch (error) {
      console.error('Add note error:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Policy Notes</h3>
          <p className="text-sm text-gray-600">Track important information and updates</p>
        </div>
        <Button onClick={() => setShowAddNote(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Note
        </Button>
      </div>

      {/* Add Note Form */}
      {showAddNote && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Plus className="h-5 w-5 mr-2" />
              Add New Note
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Note Content *</label>
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Enter your note here..."
                className="w-full p-3 border border-gray-300 rounded-md"
                rows="4"
                required
              />
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={handleAddNote}
                disabled={addNote.isLoading || !noteText.trim()}
              >
                {addNote.isLoading ? 'Adding...' : 'Add Note'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowAddNote(false);
                  setNoteText('');
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notes List */}
      <div className="space-y-4">
        {notes.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <StickyNote className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No notes yet</h3>
              <p className="text-gray-500 mb-4">Add notes to track important policy information</p>
              <Button onClick={() => setShowAddNote(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Note
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {notes.map((note) => (
              <Card key={note._id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <MessageSquare className="h-5 w-5 text-blue-600" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="text-sm font-medium">
                            {note.addedBy?.name || 'Unknown User'}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            <Calendar className="h-3 w-3 mr-1" />
                            {formatDate(note.addedAt)}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-gray-800 whitespace-pre-wrap">{note.note}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Notes Summary */}
      {notes.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Total Notes: {notes.length}</span>
              <span>
                Latest: {notes.length > 0 ? formatDate(notes[0]?.addedAt) : 'N/A'}
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PolicyNotes;

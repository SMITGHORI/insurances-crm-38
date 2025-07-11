
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { User, Calendar, StickyNote, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useClaimNotes, useAddNote } from '../../../hooks/useClaimsBackend';
import { format } from 'date-fns';

const ClaimNotes = ({ claimId }) => {
  const [newNote, setNewNote] = useState('');
  const [noteType, setNoteType] = useState('internal');
  const [notePriority, setNotePriority] = useState('normal');

  const { data: notes = [], isLoading, error } = useClaimNotes(claimId);
  const addNoteMutation = useAddNote();

  const handleAddNote = async () => {
    if (!newNote.trim()) {
      toast.error('Note cannot be empty');
      return;
    }

    try {
      await addNoteMutation.mutateAsync({
        claimId,
        noteData: {
          content: newNote,
          type: noteType,
          priority: notePriority
        }
      });

      // Clear input
      setNewNote('');
      setNoteType('internal');
      setNotePriority('normal');
    } catch (error) {
      console.error('Add note error:', error);
    }
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
    } catch (error) {
      return dateString;
    }
  };

  const getNoteTypeColor = (type) => {
    switch (type) {
      case 'internal': return 'bg-blue-100 text-blue-800';
      case 'client_communication': return 'bg-green-100 text-green-800';
      case 'system': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'normal': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading notes...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-600">
        <p>Error loading notes. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="newNote" className="text-lg font-semibold">Add Note</Label>
        <Textarea
          id="newNote"
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Enter note..."
          className="h-24 mt-2"
        />
        
        <div className="flex gap-4 mt-3">
          <div className="flex-1">
            <Label htmlFor="noteType">Type</Label>
            <Select value={noteType} onValueChange={setNoteType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="internal">Internal Note</SelectItem>
                <SelectItem value="client_communication">Client Communication</SelectItem>
                <SelectItem value="system">System Note</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex-1">
            <Label htmlFor="notePriority">Priority</Label>
            <Select value={notePriority} onValueChange={setNotePriority}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <Button 
          onClick={handleAddNote} 
          className="mt-3"
          disabled={addNoteMutation.isLoading || !newNote.trim()}
        >
          {addNoteMutation.isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Adding...
            </>
          ) : (
            <>
              <StickyNote className="mr-2 h-4 w-4" /> 
              Add Note
            </>
          )}
        </Button>
      </div>

      <div className="space-y-4 mt-6">
        <h2 className="text-lg font-semibold">Notes History</h2>
        
        {notes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No notes added yet
          </div>
        ) : (
          <div className="space-y-3">
            {notes.map(note => (
              <Card key={note._id} className="border-l-4 border-l-blue-500">
                <CardContent className="pt-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">
                        {note.createdBy?.firstName} {note.createdBy?.lastName}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${getNoteTypeColor(note.type)}`}>
                        {note.type.replace('_', ' ')}
                      </span>
                      {note.priority !== 'normal' && (
                        <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(note.priority)}`}>
                          {note.priority}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center">
                      <Calendar className="h-3.5 w-3.5 mr-1" />
                      <span>{formatDate(note.createdAt)}</span>
                    </div>
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap">{note.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClaimNotes;

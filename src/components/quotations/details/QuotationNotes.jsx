
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit2, Trash2, User, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { formatDate } from '@/lib/utils';

const QuotationNotes = ({ quotationId }) => {
  const [notes, setNotes] = useState([
    {
      id: 1,
      content: 'Client requested additional coverage for critical illness',
      createdBy: 'John Agent',
      createdAt: new Date().toISOString(),
      type: 'general'
    },
    {
      id: 2,
      content: 'Follow up call scheduled for next week',
      createdBy: 'Sarah Manager',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      type: 'follow-up'
    }
  ]);

  const [newNote, setNewNote] = useState('');
  const [editingNote, setEditingNote] = useState(null);
  const [editContent, setEditContent] = useState('');

  const handleAddNote = () => {
    if (!newNote.trim()) {
      toast.error('Please enter a note');
      return;
    }

    const note = {
      id: Date.now(),
      content: newNote,
      createdBy: 'Current User',
      createdAt: new Date().toISOString(),
      type: 'general'
    };

    setNotes(prev => [note, ...prev]);
    setNewNote('');
    toast.success('Note added successfully');
  };

  const handleEditNote = (note) => {
    setEditingNote(note.id);
    setEditContent(note.content);
  };

  const handleSaveEdit = () => {
    if (!editContent.trim()) {
      toast.error('Note cannot be empty');
      return;
    }

    setNotes(prev => prev.map(note => 
      note.id === editingNote 
        ? { ...note, content: editContent, updatedAt: new Date().toISOString() }
        : note
    ));

    setEditingNote(null);
    setEditContent('');
    toast.success('Note updated successfully');
  };

  const handleDeleteNote = (noteId) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      setNotes(prev => prev.filter(note => note.id !== noteId));
      toast.success('Note deleted successfully');
    }
  };

  const getNoteTypeBadge = (type) => {
    const typeConfig = {
      general: { color: 'bg-blue-100 text-blue-800', label: 'General' },
      'follow-up': { color: 'bg-yellow-100 text-yellow-800', label: 'Follow-up' },
      important: { color: 'bg-red-100 text-red-800', label: 'Important' },
      client: { color: 'bg-green-100 text-green-800', label: 'Client' }
    };

    const config = typeConfig[type] || typeConfig.general;
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Add New Note */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add New Note
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Enter your note here..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            rows={3}
          />
          <div className="flex gap-2">
            <Button onClick={handleAddNote}>
              <Plus className="mr-2 h-4 w-4" />
              Add Note
            </Button>
            <Button variant="outline" onClick={() => setNewNote('')}>
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notes List */}
      <Card>
        <CardHeader>
          <CardTitle>Notes History ({notes.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {notes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No notes available</p>
              <p className="text-sm">Add the first note above</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notes.map((note) => (
                <div key={note.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      {getNoteTypeBadge(note.type)}
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <User className="h-3 w-3" />
                        {note.createdBy}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Calendar className="h-3 w-3" />
                        {formatDate(note.createdAt)}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditNote(note)}
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteNote(note.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {editingNote === note.id ? (
                    <div className="space-y-3">
                      <Textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleSaveEdit}>
                          Save
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => {
                            setEditingNote(null);
                            setEditContent('');
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-gray-700 whitespace-pre-wrap">{note.content}</p>
                      {note.updatedAt && (
                        <p className="text-xs text-gray-500 mt-2">
                          Last updated: {formatDate(note.updatedAt)}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Note Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{notes.length}</p>
              <p className="text-sm text-gray-600">Total Notes</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {notes.filter(n => n.type === 'follow-up').length}
              </p>
              <p className="text-sm text-gray-600">Follow-up Notes</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">
                {notes.filter(n => n.type === 'important').length}
              </p>
              <p className="text-sm text-gray-600">Important Notes</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QuotationNotes;

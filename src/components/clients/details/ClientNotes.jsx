
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  StickyNote, 
  Plus, 
  Edit, 
  Trash2, 
  User, 
  Calendar
} from 'lucide-react';
import { toast } from 'sonner';

const ClientNotes = ({ clientId }) => {
  const [newNote, setNewNote] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [editingNote, setEditingNote] = useState(null);

  // Mock notes data - replace with actual API call
  const [notes, setNotes] = useState([
    {
      id: '1',
      content: 'Client is interested in health insurance with higher coverage. Discussed family floater options.',
      createdAt: new Date(Date.now() - 86400000),
      createdBy: 'Agent Smith',
      priority: 'high',
      category: 'sales'
    },
    {
      id: '2',
      content: 'Submitted all required documents. Processing pending for verification.',
      createdAt: new Date(Date.now() - 172800000),
      createdBy: 'System Admin',
      priority: 'medium',
      category: 'documentation'
    },
    {
      id: '3',
      content: 'Client prefers digital communication via email. Updated preference in system.',
      createdAt: new Date(Date.now() - 259200000),
      createdBy: 'Agent Smith',
      priority: 'low',
      category: 'preference'
    }
  ]);

  const handleAddNote = () => {
    if (!newNote.trim()) {
      toast.error('Please enter a note');
      return;
    }

    const note = {
      id: Date.now().toString(),
      content: newNote,
      createdAt: new Date(),
      createdBy: 'Current User', // Replace with actual user
      priority: 'medium',
      category: 'general'
    };

    setNotes([note, ...notes]);
    setNewNote('');
    setIsAddingNote(false);
    toast.success('Note added successfully');
  };

  const handleEditNote = (noteId, newContent) => {
    setNotes(notes.map(note => 
      note.id === noteId 
        ? { ...note, content: newContent, updatedAt: new Date() }
        : note
    ));
    setEditingNote(null);
    toast.success('Note updated successfully');
  };

  const handleDeleteNote = (noteId) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      setNotes(notes.filter(note => note.id !== noteId));
      toast.success('Note deleted successfully');
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'sales': return 'bg-blue-100 text-blue-800';
      case 'documentation': return 'bg-purple-100 text-purple-800';
      case 'preference': return 'bg-indigo-100 text-indigo-800';
      case 'follow-up': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Add Note Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <StickyNote className="h-5 w-5" />
              <span>Client Notes</span>
            </CardTitle>
            <Button 
              onClick={() => setIsAddingNote(!isAddingNote)}
              className="flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Note</span>
            </Button>
          </div>
        </CardHeader>
        
        {isAddingNote && (
          <CardContent className="border-t">
            <div className="space-y-4">
              <Textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Enter your note here..."
                rows={3}
                className="w-full"
              />
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsAddingNote(false);
                    setNewNote('');
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleAddNote}>
                  Save Note
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Notes List */}
      <div className="space-y-4">
        {notes.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8 text-gray-500">
              <StickyNote className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No notes available</p>
            </CardContent>
          </Card>
        ) : (
          notes.map(note => (
            <Card key={note.id}>
              <CardContent className="p-4">
                {editingNote === note.id ? (
                  <EditNoteForm 
                    note={note}
                    onSave={(content) => handleEditNote(note.id, content)}
                    onCancel={() => setEditingNote(null)}
                  />
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm text-gray-900 leading-relaxed">
                          {note.content}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setEditingNote(note.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteNote(note.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <User className="h-3 w-3" />
                          <span>{note.createdBy}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>{note.createdAt.toLocaleDateString()}</span>
                        </div>
                        {note.updatedAt && (
                          <span className="text-gray-400">
                            (edited {note.updatedAt.toLocaleDateString()})
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Badge className={getPriorityColor(note.priority)} variant="outline">
                          {note.priority}
                        </Badge>
                        <Badge className={getCategoryColor(note.category)} variant="outline">
                          {note.category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

const EditNoteForm = ({ note, onSave, onCancel }) => {
  const [content, setContent] = useState(note.content);

  const handleSave = () => {
    if (!content.trim()) {
      toast.error('Note content cannot be empty');
      return;
    }
    onSave(content);
  };

  return (
    <div className="space-y-4">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
        className="w-full"
      />
      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave}>
          Save Changes
        </Button>
      </div>
    </div>
  );
};

export default ClientNotes;

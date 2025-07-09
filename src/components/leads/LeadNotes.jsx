
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Plus, User } from 'lucide-react';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';

const LeadNotes = ({ lead }) => {
  const [notes, setNotes] = useState(lead.notes || []);
  const [openDialog, setOpenDialog] = useState(false);
  const isMobile = useIsMobile();
  
  const form = useForm({
    defaultValues: {
      content: '',
    }
  });

  const handleAddNote = (data) => {
    const newNote = {
      id: notes.length + 1,
      date: format(new Date(), 'yyyy-MM-dd'),
      content: data.content,
      createdBy: 'Raj Malhotra', // In a real app, this would come from the current user
    };
    
    setNotes([newNote, ...notes]);
    setOpenDialog(false);
    form.reset();
    toast.success('Note added successfully');
  };

  return (
    <>
      <div className="mb-4 flex flex-wrap justify-between items-center gap-2">
        <h2 className="text-lg font-semibold">Notes</h2>
        <Button onClick={() => setOpenDialog(true)} className={isMobile ? "w-full" : ""}>
          <Plus className="h-4 w-4 mr-2" /> Add Note
        </Button>
      </div>
      
      {notes.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-gray-500">
            No notes recorded for this lead yet.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {notes.map((note) => (
            <Card key={note.id}>
              <CardContent className="p-4">
                <div className="flex flex-wrap justify-between items-start mb-2 gap-2">
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                    <span>{note.date}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <User className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                    <span>{note.createdBy}</span>
                  </div>
                </div>
                <p className="whitespace-pre-line break-words">{note.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {/* Add Note Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-[500px] w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Note</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleAddNote)} className="space-y-4">
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Note</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter your note here" 
                        className="min-h-[150px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter className="flex flex-col sm:flex-row gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setOpenDialog(false)}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button type="submit" className="w-full sm:w-auto">Save</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default LeadNotes;

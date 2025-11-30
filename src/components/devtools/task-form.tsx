
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { Task } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';

const taskSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  description: z.string().min(5, 'Description must be at least 5 characters.'),
  points: z.coerce.number().int().positive('Points must be a positive number.'),
  type: z.enum(['read', 'video'], {
    required_error: 'You need to select a task type.',
  }),
  link: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  content: z.string().min(1, 'Content must not be empty.'),
});

type TaskFormProps = {
  task?: Task | null;
  onSubmit: (data: z.infer<typeof taskSchema>) => Promise<void>;
};

export default function TaskForm({ task, onSubmit }: TaskFormProps) {
  const form = useForm<z.infer<typeof taskSchema>>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: task?.title || '',
      description: task?.description || '',
      points: task?.points || 50,
      type: task?.type || 'read',
      link: task?.link || '',
      content: task?.content || 'This is the default content. Please replace it with instructions on how to complete the task.',
    },
  });

  useEffect(() => {
    // When the `task` prop updates (e.g., after data fetching),
    // reset the form with the new default values.
    form.reset({
      title: task?.title || '',
      description: task?.description || '',
      points: task?.points || 50,
      type: task?.type || 'read',
      link: task?.link || '',
      content: task?.content || '',
    });
  }, [task, form]);


  const { isSubmitting } = form.formState;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Watch introductory video" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input placeholder="A short description of the task" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="points"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Points</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Task Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a task type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="read">Read</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="link"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Task Link</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com/task-details" {...field} />
              </FormControl>
              <FormDescription>
                Optional: The destination URL for the 'Start' button.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Task Instructions</FormLabel>
              <FormControl>
                <Textarea 
                    placeholder="Provide detailed steps on how to complete the task..." 
                    className="min-h-[200px]"
                    {...field} 
                />
              </FormControl>
              <FormDescription>
                This content will be displayed on the task detail page.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {task ? 'Update Task' : 'Create Task'}
          </Button>
        </div>
      </form>
    </Form>
  );
}

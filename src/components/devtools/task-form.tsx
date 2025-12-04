'use client';

import React from 'react';
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from '@/lib/utils';


const taskSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  description: z.string().min(5, 'Description must be at least 5 characters.'),
  points: z.coerce.number().int().positive('Points must be a positive number.'),
  type: z.enum(['read', 'video'], {
    required_error: 'You need to select a task type.',
  }),
  category: z.string().min(1, 'You need to select a category.'),
  link: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  content: z.string().min(1, 'Content must not be empty.'),
});

type TaskFormProps = {
  task?: Task | null;
  categories: string[];
  taskOptions: {
    title: string[];
    description: string[];
    points: number[];
    link: string[];
    content: string[];
  };
  onSubmit: (data: z.infer<typeof taskSchema>) => Promise<void>;
};

const ComboboxInput = ({ field, options, placeholder }: { field: any, options: (string | number)[], placeholder: string }) => {
  const [open, setOpen] = React.useState(false);

  const handleSelect = (currentValue: string) => {
    field.onChange(currentValue);
    setOpen(false);
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    field.onChange(e.target.value);
  }

  return (
    <div className="flex gap-2">
      <Input
        placeholder={placeholder}
        {...field}
        onChange={handleInputChange}
        value={field.value || ''}
      />
      {options.length > 0 && (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-[50px] justify-between"
            >
              <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent 
            className="w-[300px] p-0" 
            style={{
                left: '50%',
                transform: 'translateX(-50%)',
            }}
          >
            <Command>
              <CommandInput placeholder="Search options..." />
              <CommandEmpty>No options found.</CommandEmpty>
              <CommandGroup>
                {options.map((option, index) => (
                  <CommandItem
                    key={index}
                    value={String(option)}
                    onSelect={handleSelect}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        String(field.value) === String(option) ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {String(option)}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
};

export default function TaskForm({ task, categories, taskOptions, onSubmit }: TaskFormProps) {
  const form = useForm<z.infer<typeof taskSchema>>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: task?.title || '',
      description: task?.description || '',
      points: task?.points || 50,
      type: task?.type || 'read',
      category: task?.category || 'All',
      link: task?.link || '',
      content: task?.content || 'This is the default content. Please replace it with instructions on how to complete the task.',
    },
  });

  useEffect(() => {
    form.reset({
      title: task?.title || '',
      description: task?.description || '',
      points: task?.points || 50,
      type: task?.type || 'read',
      category: task?.category || 'All',
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
                <ComboboxInput field={field} options={taskOptions.title} placeholder="e.g., Watch introductory video" />
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
                <ComboboxInput field={field} options={taskOptions.description} placeholder="A short description of the task" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <FormField
            control={form.control}
            name="points"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Points</FormLabel>
                <FormControl>
                  <ComboboxInput field={field} options={taskOptions.points} placeholder="50" />
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
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="link"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Task Link</FormLabel>
              <FormControl>
                 <ComboboxInput field={field} options={taskOptions.link} placeholder="https://example.com/task-details" />
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
               {taskOptions.content.length > 0 && (
                 <Select onValueChange={(value) => field.onChange(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a content template" />
                  </SelectTrigger>
                  <SelectContent>
                    {taskOptions.content.map((template, index) => (
                      <SelectItem key={index} value={template}>{template.substring(0, 50)}...</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
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


'use client';

import {
  collection,
  doc,
  getDocs,
  writeBatch,
  type Firestore,
} from 'firebase/firestore';
import { masterTasks } from '@/lib/data';
import type { Task } from '@/lib/types';

/**
 * Seeds the global /tasks collection with the master task list.
 * This function is designed to be run once, manually, or via a trusted environment.
 * For this app, we will call it from the user service for simplicity on first user creation.
 * A more robust solution would be a separate admin script.
 */
export const seedMasterTasks = async (firestore: Firestore): Promise<void> => {
  const tasksRef = collection(firestore, 'tasks');
  const snapshot = await getDocs(tasksRef);

  // Only seed if the collection is empty
  if (snapshot.empty) {
    console.log('Seeding master tasks...');
    const batch = writeBatch(firestore);
    masterTasks.forEach((task) => {
      const docRef = doc(firestore, 'tasks', task.id);
      const taskData: Task = {
        title: task.title,
        description: task.description,
        points: task.points,
        type: task.type,
        category: 'Technology', // Assign a default category
        link: task.link || '',
        content: "This is the default content for the task. You can edit this in the DevTools.",
      };
      batch.set(docRef, taskData);
    });
    await batch.commit();
    console.log('Master tasks seeded.');
  }
};

/**
 * Initializes the tasks subcollection for a new user.
 * It copies all tasks from the master /tasks collection and sets their status to 'available'.
 * @param firestore - The Firestore database instance.
 * @param userId - The ID of the new user.
 */
export const initializeUserTasks = async (
  firestore: Firestore,
  userId: string
): Promise<void> => {
  // First, ensure master tasks are seeded
  await seedMasterTasks(firestore);

  const masterTasksRef = collection(firestore, 'tasks');
  const userTasksRef = collection(firestore, 'users', userId, 'tasks');
  const batch = writeBatch(firestore);

  const masterTasksSnapshot = await getDocs(masterTasksRef);

  masterTasksSnapshot.forEach((taskDoc) => {
    const userTaskRef = doc(userTasksRef, taskDoc.id);
    batch.set(userTaskRef, {
      status: 'available',
      completedAt: null,
    });
  });

  await batch.commit();
};

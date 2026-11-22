// Requirement R4: two pure functions for the filter bar. No React in this file.
import type { Status, Task } from './taskReducer'

export type Filter = 'all' | Status

export const FILTERS: Filter[] = ['all', 'todo', 'in-progress', 'done']

/** The text on each filter button. */
export const FILTER_LABELS: Record<Filter, string> = {
  all: 'All',
  todo: 'To do',
  'in-progress': 'In progress',
  done: 'Done',
}

/** Return the tasks to show for the chosen filter. 'all' returns every task. */
export function filterTasks(tasks: Task[], filter: Filter): Task[] {
  if (filter === 'all') return tasks
  return tasks.filter((t) => t.status === filter)
}

/** Return how many tasks each filter button would show, for example { all: 3, todo: 1, ... }. */
export function countByFilter(tasks: Task[]): Record<Filter, number> {
  // A new object made here, so changing it inside the loop keeps the function pure.
  const counts: Record<Filter, number> = { all: tasks.length, todo: 0, 'in-progress': 0, done: 0 }
  for (const t of tasks) {
    counts[t.status] += 1
  }
  return counts
}

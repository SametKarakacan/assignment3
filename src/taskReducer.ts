// Ad Soyad, Öğrenci No: 0000000000
// MIS 233 Assignment 3: Task Manager with a Reducer
import type { Filter } from './filter'

export type Status = 'todo' | 'in-progress' | 'done'
export type Task = { id: string; title: string; status: Status }

// past holds the earlier task lists for Undo (Bonus 1), the newest one last.
export type State = { tasks: Task[]; filter: Filter; past: Task[][] }

export const initialState: State = { tasks: [], filter: 'all', past: [] }

export type Action =
  | { type: 'add'; id: string; title: string }
  | { type: 'advance'; id: string }
  | { type: 'remove'; id: string }
  | { type: 'setFilter'; filter: Filter }
  | { type: 'clearDone' }
  | { type: 'undo' }

const NEXT: Record<Status, Status> = {
  todo: 'in-progress',
  'in-progress': 'done',
  done: 'todo',
}

// If a new action type is added to Action and the switch does not handle it,
// `action` in the default branch is no longer `never`, and TypeScript reports an error.
function assertNever(x: never): never {
  throw new Error(`Unhandled action: ${JSON.stringify(x)}`)
}

// Puts the new task list in place and remembers the old one, so Undo can bring it back.
// The old array can be kept as it is, because the reducer never changes an array.
function commit(state: State, tasks: Task[]): State {
  return { ...state, tasks, past: [...state.past, state.tasks] }
}

function hasTask(tasks: Task[], id: string): boolean {
  return tasks.some((t) => t.id === id)
}

export function taskReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'add':
      return commit(state, [
        ...state.tasks,
        { id: action.id, title: action.title, status: 'todo' },
      ])
    case 'advance':
      // An unknown id changes nothing, so it does not add an Undo step either.
      if (!hasTask(state.tasks, action.id)) return state
      return commit(
        state,
        state.tasks.map((t) => (t.id === action.id ? { ...t, status: NEXT[t.status] } : t)),
      )
    case 'remove':
      if (!hasTask(state.tasks, action.id)) return state
      return commit(state, state.tasks.filter((t) => t.id !== action.id))
    case 'setFilter':
      // Only the filter changes; past stays the same, so changing the filter is not undoable.
      return { ...state, filter: action.filter }
    case 'clearDone':
      if (!state.tasks.some((t) => t.status === 'done')) return state
      return commit(state, state.tasks.filter((t) => t.status !== 'done'))
    case 'undo': {
      if (state.past.length === 0) return state
      return {
        ...state,
        tasks: state.past[state.past.length - 1],
        past: state.past.slice(0, -1),
      }
    }
    default:
      return assertNever(action)
  }
}

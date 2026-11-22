// Ad Soyad, Öğrenci No: 0000000000
// MIS 233 Assignment 3: Task Manager with a Reducer
import type { Filter } from './filter'

export type Status = 'todo' | 'in-progress' | 'done'
export type Task = { id: string; title: string; status: Status }

export type State = { tasks: Task[]; filter: Filter }

export const initialState: State = { tasks: [], filter: 'all' }

export type Action =
  | { type: 'add'; id: string; title: string }
  | { type: 'advance'; id: string }
  | { type: 'remove'; id: string }
  | { type: 'setFilter'; filter: Filter }
  | { type: 'clearDone' }

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

export function taskReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'add':
      return {
        ...state,
        tasks: [...state.tasks, { id: action.id, title: action.title, status: 'todo' }],
      }
    case 'advance':
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.id ? { ...t, status: NEXT[t.status] } : t,
        ),
      }
    case 'remove':
      return { ...state, tasks: state.tasks.filter((t) => t.id !== action.id) }
    case 'setFilter':
      return { ...state, filter: action.filter }
    case 'clearDone':
      return { ...state, tasks: state.tasks.filter((t) => t.status !== 'done') }
    default:
      return assertNever(action)
  }
}

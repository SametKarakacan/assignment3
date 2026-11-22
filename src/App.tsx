// The state lives in App with useReducer and goes down to the components as props.
import { useReducer } from 'react'
import type { Dispatch } from 'react'
import { taskReducer, initialState, type Task, type Action } from './taskReducer'
import { FILTERS, FILTER_LABELS, filterTasks, countByFilter, type Filter } from './filter'
import TaskRow from './TaskRow'

function AddForm({ dispatch }: { dispatch: Dispatch<Action> }) {
  function addTask(formData: FormData) {
    const title = String(formData.get('title') ?? '').trim()
    // The id is made here, in the event handler, so the reducer stays pure.
    if (title) dispatch({ type: 'add', id: crypto.randomUUID(), title })
  }
  return (
    <form action={addTask} className="add-form">
      <input name="title" placeholder="New task" aria-label="New task" />
      <button type="submit">Add</button>
    </form>
  )
}

type FilterBarProps = {
  active: Filter
  counts: Record<Filter, number>
  dispatch: Dispatch<Action>
}

function FilterBar({ active, counts, dispatch }: FilterBarProps) {
  return (
    <div className="filter-bar" role="group" aria-label="Filter tasks">
      {FILTERS.map((f) => (
        <button
          key={f}
          type="button"
          className={f === active ? 'filter active' : 'filter'}
          aria-pressed={f === active}
          onClick={() => dispatch({ type: 'setFilter', filter: f })}
        >
          {FILTER_LABELS[f]} ({counts[f]})
        </button>
      ))}
    </div>
  )
}

function TaskList({ tasks, dispatch }: { tasks: Task[]; dispatch: Dispatch<Action> }) {
  if (tasks.length === 0) return <p className="empty">No tasks here.</p>
  return (
    <ul className="task-list">
      {tasks.map((t) => (
        <TaskRow
          key={t.id}
          task={t}
          onNext={() => dispatch({ type: 'advance', id: t.id })}
          onDelete={() => dispatch({ type: 'remove', id: t.id })}
        />
      ))}
    </ul>
  )
}

export default function App() {
  const [state, dispatch] = useReducer(taskReducer, initialState)

  // Derived while rendering, never stored in state: they always match state.tasks.
  const visible = filterTasks(state.tasks, state.filter)
  const counts = countByFilter(state.tasks)

  return (
    <main>
      <h1>Task Manager</h1>
      <AddForm dispatch={dispatch} />
      <FilterBar active={state.filter} counts={counts} dispatch={dispatch} />
      <TaskList tasks={visible} dispatch={dispatch} />
      <div className="toolbar">
        <button
          type="button"
          onClick={() => dispatch({ type: 'clearDone' })}
          disabled={counts.done === 0}
        >
          Clear done
        </button>
      </div>
    </main>
  )
}

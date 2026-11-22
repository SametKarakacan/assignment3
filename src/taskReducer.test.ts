import { describe, it, expect } from 'vitest'
import { taskReducer, initialState, type State, type Task, type Action } from './taskReducer'

// Freezes the state, its arrays and every task, so any mutation in the reducer throws.
function deepFreeze(state: State): State {
  state.tasks.forEach((t) => Object.freeze(t))
  state.past.forEach((list) => {
    list.forEach((t) => Object.freeze(t))
    Object.freeze(list)
  })
  Object.freeze(state.tasks)
  Object.freeze(state.past)
  return Object.freeze(state)
}

const a: Task = { id: 'a', title: 'Read slides', status: 'todo' }
const b: Task = { id: 'b', title: 'Write reducer', status: 'in-progress' }
const c: Task = { id: 'c', title: 'Take screenshots', status: 'done' }

function stateWith(tasks: Task[]): State {
  return { ...initialState, tasks }
}

function run(state: State, ...actions: Action[]): State {
  return actions.reduce(taskReducer, state)
}

describe('initialState', () => {
  it('has no tasks, filter all and no undo history', () => {
    expect(initialState).toEqual({ tasks: [], filter: 'all', past: [] })
  })
})

describe('add', () => {
  it('appends a task with status todo and the given id', () => {
    const next = taskReducer(initialState, { type: 'add', id: 'x', title: 'New' })
    expect(next.tasks).toEqual([{ id: 'x', title: 'New', status: 'todo' }])
  })

  it('appends to the end and keeps the filter', () => {
    const start = { ...stateWith([a]), filter: 'done' as const }
    const next = taskReducer(start, { type: 'add', id: 'x', title: 'New' })
    expect(next.tasks.map((t) => t.id)).toEqual(['a', 'x'])
    expect(next.filter).toBe('done')
  })
})

describe('advance', () => {
  it('moves todo to in-progress to done', () => {
    const s1 = taskReducer(stateWith([a]), { type: 'advance', id: 'a' })
    expect(s1.tasks[0].status).toBe('in-progress')
    const s2 = taskReducer(s1, { type: 'advance', id: 'a' })
    expect(s2.tasks[0].status).toBe('done')
  })

  it('returns to todo after three advances', () => {
    const next = run(
      stateWith([a]),
      { type: 'advance', id: 'a' },
      { type: 'advance', id: 'a' },
      { type: 'advance', id: 'a' },
    )
    expect(next.tasks[0].status).toBe('todo')
  })

  it('changes only the task with that id', () => {
    const next = taskReducer(stateWith([a, b]), { type: 'advance', id: 'a' })
    expect(next.tasks[1]).toBe(b)
  })

  it('returns the same state for an unknown id', () => {
    const start = stateWith([a, b])
    expect(taskReducer(start, { type: 'advance', id: 'nope' })).toBe(start)
  })
})

describe('remove', () => {
  it('deletes the task with that id', () => {
    const next = taskReducer(stateWith([a, b, c]), { type: 'remove', id: 'b' })
    expect(next.tasks).toEqual([a, c])
  })

  it('returns the same state for an unknown id', () => {
    const start = stateWith([a])
    expect(taskReducer(start, { type: 'remove', id: 'nope' })).toBe(start)
  })

  it('does nothing on an empty list', () => {
    expect(taskReducer(initialState, { type: 'remove', id: 'a' })).toBe(initialState)
  })
})

describe('setFilter', () => {
  it('stores the filter and keeps the same tasks', () => {
    const start = stateWith([a, b])
    const next = taskReducer(start, { type: 'setFilter', filter: 'in-progress' })
    expect(next.filter).toBe('in-progress')
    expect(next.tasks).toBe(start.tasks)
  })

  it('is not undoable: it does not add to past', () => {
    const next = taskReducer(stateWith([a]), { type: 'setFilter', filter: 'done' })
    expect(next.past).toEqual([])
  })
})

describe('clearDone', () => {
  it('deletes every done task and keeps the filter', () => {
    const start = { ...stateWith([a, c, b, { ...c, id: 'd' }]), filter: 'done' as const }
    const next = taskReducer(start, { type: 'clearDone' })
    expect(next.tasks).toEqual([a, b])
    expect(next.filter).toBe('done')
  })

  it('returns the same state when nothing is done', () => {
    const start = stateWith([a, b])
    expect(taskReducer(start, { type: 'clearDone' })).toBe(start)
  })

  it('does nothing on an empty list', () => {
    expect(taskReducer(initialState, { type: 'clearDone' })).toBe(initialState)
  })
})

describe('undo', () => {
  it('reverts the last change to the tasks', () => {
    const s1 = taskReducer(initialState, { type: 'add', id: 'x', title: 'X' })
    const s2 = taskReducer(s1, { type: 'advance', id: 'x' })
    const back = taskReducer(s2, { type: 'undo' })
    expect(back.tasks).toEqual(s1.tasks)
    expect(back.past).toEqual(s1.past)
  })

  it('brings cleared tasks back after clearDone', () => {
    const start = stateWith([a, b, c])
    const cleared = taskReducer(start, { type: 'clearDone' })
    expect(cleared.tasks).toEqual([a, b])
    expect(taskReducer(cleared, { type: 'undo' }).tasks).toEqual([a, b, c])
  })

  it('does nothing when there is nothing to undo', () => {
    expect(taskReducer(initialState, { type: 'undo' })).toBe(initialState)
  })

  it('keeps the current filter', () => {
    const s1 = taskReducer(initialState, { type: 'add', id: 'x', title: 'X' })
    const s2 = taskReducer(s1, { type: 'setFilter', filter: 'todo' })
    expect(taskReducer(s2, { type: 'undo' }).filter).toBe('todo')
  })

  it('can undo every step back to the empty list', () => {
    const end = run(
      initialState,
      { type: 'add', id: 'x', title: 'X' },
      { type: 'add', id: 'y', title: 'Y' },
      { type: 'remove', id: 'x' },
      { type: 'undo' },
      { type: 'undo' },
      { type: 'undo' },
      { type: 'undo' },
    )
    expect(end).toEqual(initialState)
  })
})

describe('purity', () => {
  it('never changes the old state, for any action', () => {
    const before = stateWith([a, b, c])
    const start = deepFreeze({ ...before, past: [[a]] })
    const snapshot = structuredClone(start)
    const actions: Action[] = [
      { type: 'add', id: 'x', title: 'X' },
      { type: 'advance', id: 'a' },
      { type: 'remove', id: 'b' },
      { type: 'setFilter', filter: 'done' },
      { type: 'clearDone' },
      { type: 'undo' },
    ]
    for (const action of actions) {
      const next = taskReducer(start, action)
      expect(next).not.toBe(start)
    }
    // Frozen objects throw on mutation, and the copy shows nothing changed.
    expect(start).toEqual(snapshot)
  })

  it('returns a new tasks array and a new task object for advance', () => {
    const start = stateWith([a])
    const next = taskReducer(start, { type: 'advance', id: 'a' })
    expect(next.tasks).not.toBe(start.tasks)
    expect(next.tasks[0]).not.toBe(a)
    expect(a.status).toBe('todo')
  })
})

import { describe, it, expect } from 'vitest'
import { filterTasks, countByFilter } from './filter'
import { taskReducer, initialState, type Task } from './taskReducer'

const tasks: Task[] = [
  { id: 'a', title: 'A', status: 'todo' },
  { id: 'b', title: 'B', status: 'in-progress' },
  { id: 'c', title: 'C', status: 'done' },
  { id: 'd', title: 'D', status: 'in-progress' },
]

describe('filterTasks', () => {
  it("returns every task for 'all'", () => {
    expect(filterTasks(tasks, 'all')).toEqual(tasks)
  })

  it('returns only the tasks with that status, in order', () => {
    expect(filterTasks(tasks, 'todo').map((t) => t.id)).toEqual(['a'])
    expect(filterTasks(tasks, 'in-progress').map((t) => t.id)).toEqual(['b', 'd'])
    expect(filterTasks(tasks, 'done').map((t) => t.id)).toEqual(['c'])
  })

  it('returns an empty list when nothing matches', () => {
    expect(filterTasks([tasks[0]], 'done')).toEqual([])
  })

  it('works on an empty list', () => {
    expect(filterTasks([], 'all')).toEqual([])
    expect(filterTasks([], 'todo')).toEqual([])
  })

  it('does not change the input array', () => {
    const input = [...tasks]
    Object.freeze(input)
    filterTasks(input, 'todo')
    expect(input).toEqual(tasks)
  })
})

describe('countByFilter', () => {
  it('counts every filter', () => {
    expect(countByFilter(tasks)).toEqual({ all: 4, todo: 1, 'in-progress': 2, done: 1 })
  })

  it('gives zeros for an empty list', () => {
    expect(countByFilter([])).toEqual({ all: 0, todo: 0, 'in-progress': 0, done: 0 })
  })

  it('all equals the sum of the three statuses', () => {
    const counts = countByFilter(tasks)
    expect(counts.all).toBe(counts.todo + counts['in-progress'] + counts.done)
  })

  it('updates after a delete', () => {
    const state = taskReducer({ ...initialState, tasks }, { type: 'remove', id: 'b' })
    expect(countByFilter(state.tasks)).toEqual({ all: 3, todo: 1, 'in-progress': 1, done: 1 })
  })

  it('updates after advance and clearDone', () => {
    let state = taskReducer({ ...initialState, tasks }, { type: 'advance', id: 'b' })
    expect(countByFilter(state.tasks)).toEqual({ all: 4, todo: 1, 'in-progress': 1, done: 2 })
    state = taskReducer(state, { type: 'clearDone' })
    expect(countByFilter(state.tasks)).toEqual({ all: 2, todo: 1, 'in-progress': 1, done: 0 })
  })
})

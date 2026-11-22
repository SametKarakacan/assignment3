# Assignment 3: Task Manager with a Reducer

**Name:** Samet Kaan Karakaçan
**Student number:** 2022502147

MIS 233 Web Based Application Programming, Week 5.

## Run it

Needs Node.js 20.19 or newer.

```
npm install
npm run dev       # open the address it prints
npm run build     # type check (strict) and build
npm test          # run the Vitest tests
```

## What is in the project

```
src/
  taskReducer.ts       State, Action, initialState, taskReducer (R1 to R3, Bonus 1)
  filter.ts            Filter, filterTasks, countByFilter (R4), no React
  App.tsx              useReducer; AddForm, FilterBar, TaskList get props (R5, R6)
  TaskRow.tsx          one row: title, status, Next, Delete
  App.css              styles; the active filter button is filled blue
  taskReducer.test.ts  reducer tests (Bonus 2)
  filter.test.ts       filter and count tests (Bonus 2)
screenshots/
  all.png  todo.png  in-progress.png  done.png
```

- The state is `{ tasks, filter, past }`. `past` is only there for Bonus 1.
- Actions: `add`, `advance`, `remove`, `setFilter`, `clearDone` and `undo`.
- The reducer's `switch` ends with `default: return assertNever(action)`. If a new action
  is added to `Action` and not handled, TypeScript reports an error there.
- `App` computes `filterTasks(state.tasks, state.filter)` and `countByFilter(state.tasks)`
  while rendering. Neither is stored in state.
- The id of a new task is made with `crypto.randomUUID()` in `AddForm`, not in the reducer.

## Bonus 1: Undo

The state is `{ tasks: Task[]; filter: Filter; past: Task[][] }`. Every action that really
changes the task list (`add`, `advance`, `remove`, `clearDone`) goes through a small `commit`
helper that pushes the old `tasks` array onto `past`. The `undo` action takes the last list
from `past` back into `tasks`.

- `setFilter` does not touch `past`, so changing the filter is not undoable.
- Undo after `clearDone` brings the cleared tasks back.
- `undo` with an empty `past` returns the same state, and the Undo button is disabled then.
- An action that changes nothing (an unknown id, or `clearDone` with no done tasks) returns
  the same state, so it does not add an empty Undo step.
- Keeping the old arrays in `past` is safe because the reducer never mutates an array.

## Bonus 2: Tests

Vitest tests in `src/taskReducer.test.ts` and `src/filter.test.ts`, run with `npm test`
(32 tests). They cover:

- every action: `add`, `advance`, `remove`, `setFilter`, `clearDone`, `undo`;
- `advance` three times returning to `todo`;
- purity: the old state is deep-frozen with `Object.freeze` and compared with a
  `structuredClone` copy after every action; `advance` returns a new array and a new task object;
- `filterTasks` and `countByFilter`;
- edge cases: an unknown id, an empty list, `clearDone` with nothing done, counts after a
  delete, counts after `advance` and `clearDone`, undo with nothing to undo, undo all the way
  back to `initialState`.

Output of `npm test`:

```
PASTE THE OUTPUT OF npm test HERE
```

## Bonus 3: Explain your reducer

**Why the reducer must be pure.** A reducer gets the old state and an action and returns the
new state. It must not change anything else. React compares the old state and the new state
to see if something changed. If I change the old state directly, for example with
`state.tasks.push(task)`, the reference stays the same. React thinks nothing changed and the
screen does not update. My Undo would also break, because the old lists in `past` would change
too.

**Why the caller creates the id.** `crypto.randomUUID()` gives a different value every time.
If the reducer called it, the same state and the same action would give different results, so
the reducer would not be pure. It would also be hard to test. In development, React runs the
reducer twice, so the two runs would make two different ids. So I make the id in `AddForm`
and put it in the action.

**Why the list and the counts are derived.** I can always compute the filtered list and the
counts from `tasks` and `filter`. If I stored them in state, I would have to update them in
every action. If I forgot one, they would go stale. For example, if `advance` did not update a
stored `filteredTasks`, a task that became done would still show under the To do filter, and
the counts would be wrong. Computing them while rendering keeps one source of truth.

**What changed when the filter moved into the reducer.** It became easier to keep all the
rules in one place. The reducer decides that changing the filter is not saved in `past`, so
Undo only works on tasks. I can also test the filter without React. One small downside is that
I need `dispatch` with an action instead of a simple `setFilter` function.

## Bonus 4: Git repository

PASTE THE REPOSITORY LINK HERE

The history has one commit per step (starter, filter functions, state change, filter bar,
undo, tests, README and screenshots). `.gitignore` leaves out `node_modules` and `dist`.

# Assignment 3: Task Manager with a Reducer

**Name:** Ad Soyad
**Student number:** 0000000000

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

A reducer must be pure because React decides whether to re-render by comparing the old state
and the new state by reference. If the reducer mutates the old state, for example with
`state.tasks.push(task)`, and returns the same object, React sees the same reference and may
skip the render, so the screen does not update. Mutation also breaks features that rely on
old states, such as Undo: the lists saved in `past` would change together with the current
list. In development, StrictMode calls the reducer twice, so a reducer with side effects would
do the side effect twice.

The caller creates the id with `crypto.randomUUID()` because a random id would make the
reducer impure: the same state and action would give a different result every time. That
makes the reducer hard to test, and in StrictMode the two calls would produce two different
ids. With the id inside the action, the action fully describes what happened.

The filtered list and the counts are derived because they can always be computed from
`tasks` and `filter`. If I stored a `filteredTasks` array, I would have to update it in every
action. If I forgot one case, for example `advance`, a task moved to Done would still show
under the To do filter and the counts would be wrong. Computing them while rendering means
there is only one source of truth.

Moving the filter into the reducer state made Undo easier: one action can change both the
tasks and the filter, and the reducer alone decides that the filter is not part of the undo
history. It also made the filter testable without React. A small cost is that every component
that changes the filter needs `dispatch` instead of a simple setter.

## Bonus 4: Git repository

PASTE THE REPOSITORY LINK HERE

The history has one commit per step (starter, filter functions, state change, filter bar,
undo, tests, README and screenshots). `.gitignore` leaves out `node_modules` and `dist`.

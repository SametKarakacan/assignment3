import type { Task } from './taskReducer'

type TaskRowProps = { task: Task; onNext: () => void; onDelete: () => void }

export default function TaskRow({ task, onNext, onDelete }: TaskRowProps) {
  return (
    <li className="task-row">
      <span className="title">{task.title}</span>
      <em className={`status status-${task.status}`}>{task.status}</em>
      <button type="button" onClick={onNext}>Next</button>
      <button type="button" onClick={onDelete}>Delete</button>
    </li>
  )
}

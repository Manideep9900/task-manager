import { useState } from "react";

function TaskItem({ task, onComplete, onDelete, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);

  const handleUpdate = () => {
    if (title.trim() === "") {
      return;
    }

    onUpdate(task.id, title.trim());
    setEditing(false);
  };

  const handleCancel = () => {
    setTitle(task.title);
    setEditing(false);
  };

  return (
    <div className="task-item">
      <div className="task-left">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => onComplete(task)}
        />

        {editing ? (
          <input
            className="edit-input"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                handleUpdate();
              }

              if (event.key === "Escape") {
                handleCancel();
              }
            }}
            autoFocus
          />
        ) : (
          <div>
  <span className={task.completed ? "completed" : ""}>
    {task.title}
  </span>
  {task.description && (
  <p className="task-description">
    {task.description}
  </p>
)}

  <span className={`priority priority-${task.priority}`}>
    {task.priority}
  </span>

  {task.due_date && (
  <span className="due-date">
    Due: {task.due_date}
  </span>
)}

{task.due_date &&
  !task.completed &&
  new Date(task.due_date) < new Date(new Date().toDateString()) && (
    <span className="overdue-badge">
      OVERDUE
    </span>
  )}

  {task.category && (
  <span className="category">
    {task.category}
  </span>
)}
</div>
        )}
      </div>

      <div className="task-actions">
        {editing ? (
          <>
            <button onClick={handleUpdate}>
              Save
            </button>

            <button onClick={handleCancel}>
              Cancel
            </button>
          </>
        ) : (
          <button onClick={() => setEditing(true)}>
            Edit
          </button>
        )}

        <button
          className="delete-button"
          onClick={() => onDelete(task.id)}
        >
          Delete
        </button>
      </div>
    </div>
  );
}

export default TaskItem;
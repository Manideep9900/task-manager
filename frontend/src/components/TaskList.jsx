import TaskItem from "./TaskItem";

function TaskList({ tasks, onComplete, onDelete, onUpdate }) {
  return (
    <div className="task-list">
      <h2>Tasks</h2>

      {tasks.length === 0 ? (
        <p className="empty-message">
          No tasks found.
        </p>
      ) : (
        tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onComplete={onComplete}
            onDelete={onDelete}
            onUpdate={onUpdate}
          />
        ))
      )}
    </div>
  );
}

export default TaskList;
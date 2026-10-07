import { useState } from "react";

function TaskForm({ onAddTask }) {
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (title.trim() === "") {
      setError("Please enter a task.");
      return;
    }

    onAddTask(title.trim());

    setTitle("");
    setError("");
  };

  return (
    <div className="task-form-container">
      <div className="task-form">
        <input
          type="text"
          placeholder="Enter a task"
          value={title}
          onChange={(event) => {
            setTitle(event.target.value);
            setError("");
          }}
        />

        <button onClick={handleSubmit}>
          Add Task
        </button>
      </div>

      {error && <p className="form-error">{error}</p>}
    </div>
  );
}

export default TaskForm;
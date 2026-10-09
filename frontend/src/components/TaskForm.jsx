import { useState } from "react";

function TaskForm({ onAddTask }) {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Personal");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSubmitting) return;

    if (title.trim() === "") {
      setError("Please enter a task.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      await onAddTask(
        title.trim(),
        priority,
        dueDate,
        description,
        category
      );

      // Clear the form only after a successful save.
      setTitle("");
      setPriority("medium");
      setDueDate("");
      setDescription("");
      setCategory("Personal");
    } catch (error) {
      setError(error.message || "Unable to add task. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="task-form-container">
      <form className="task-form" onSubmit={handleSubmit}>
        {/* Task title */}
        <input
          type="text"
          placeholder="Enter a task"
          value={title}
          onChange={(event) => {
            setTitle(event.target.value);
            setError("");
          }}
          disabled={isSubmitting}
        />

        {/* Priority selection */}
        <div className="form-field">
          <label htmlFor="task-priority">Priority</label>
          <select
            id="task-priority"
            value={priority}
            onChange={(event) => setPriority(event.target.value)}
            disabled={isSubmitting}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        {/* Due date */}
        <input
          type="date"
          value={dueDate}
          onChange={(event) => setDueDate(event.target.value)}
          aria-label="Due date"
          disabled={isSubmitting}
        />

        {/* Task description */}
        <textarea
          placeholder="Enter task description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          disabled={isSubmitting}
        />

        {/* Category selection */}
        <div className="form-field">
          <label htmlFor="task-category">Category</label>
          <select
            id="task-category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            disabled={isSubmitting}
          >
            <option value="Personal">Personal</option>
            <option value="College">College</option>
            <option value="Work">Work</option>
            <option value="Project">Project</option>
          </select>
        </div>

        {/* Add task */}
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Adding Task..." : "Add Task"}
        </button>
      </form>

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export default TaskForm;
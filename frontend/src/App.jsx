import { useEffect, useRef, useState } from "react";
import "./App.css";
import TaskForm from "./components/TaskForm";
import TaskList from "./components/TaskList";
import Auth from "./components/Auth";
import { apiRequest } from "./api";


function App() {
  const tasksSectionRef = useRef(null);
  const showSuccessMessage = (message) => {
  setError("");
  setSuccessMessage(message);

  setTimeout(() => {
    setSuccessMessage("");
  }, 3000);
};
  const scrollToTasks = () => {
    setTimeout(() => {
      tasksSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 150);
  };
  const [tasks, setTasks] = useState([]);
  const [user, setUser] = useState(() => {
  const savedUser = localStorage.getItem("user");
  return savedUser ? JSON.parse(savedUser) : null;
});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [filter, setFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [showUpcomingOnly, setShowUpcomingOnly] = useState(false);
  const [showOverdueOnly, setShowOverdueOnly] = useState(false);

  useEffect(() => {
  if (!user) {
    setLoading(false);
    return;
  }

  setLoading(true);
  setError("");

  apiRequest("/tasks")
    .then((data) => {
      setTasks(data);
    })
    .catch((error) => {
      setError(error.message);
    })
    .finally(() => {
      setLoading(false);
    });
}, [user]);

  const addTask = async (
  title,
  priority,
  dueDate,
  description,
  category
) => {
  try {
    setError("");

    const newTask = await apiRequest("/tasks", {
      method: "POST",
      body: JSON.stringify({
        title,
        priority,
        due_date: dueDate,
        description,
        category,
      }),
    });

    setTasks((previousTasks) => [...previousTasks, newTask]);

    showSuccessMessage("Task added successfully!");
  } catch (error) {
  console.error("Add task error:", error);
  setSuccessMessage("");
  setError(error.message || "Unable to add task. Please try again.");

  throw error;
}
};


  const completeTask = async (task) => {
    try {
      setError("");
      const updatedTask = await apiRequest(`/tasks/${task.id}`, {
        method: "PUT",
        body: JSON.stringify({
          title: task.title,
          completed: !task.completed,
          priority: task.priority,
        }),
      });

      setTasks((previousTasks) =>
        previousTasks.map((item) =>
          item.id === updatedTask.id ? updatedTask : item
        )
      );
      showSuccessMessage(
        updatedTask.completed ? "Task completed!" : "Task marked active."
      );
    } catch (error) {
      console.error("Complete task error:", error);
      setSuccessMessage("");
      setError(error.message || "Unable to update task.");
    }
  };

  const deleteTask = async (id) => {
    try {
      setError("");
      await apiRequest(`/tasks/${id}`, { method: "DELETE" });

      setTasks((previousTasks) =>
        previousTasks.filter((task) => task.id !== id)
      );
      showSuccessMessage("Task deleted successfully!");
    } catch (error) {
      console.error("Delete task error:", error);
      setSuccessMessage("");
      setError(error.message || "Unable to delete task.");
    }
  };

  const updateTask = async (id, title) => {
    try {
      const task = tasks.find((item) => item.id === id);
      if (!task) {
        setError("Task not found. Please refresh and try again.");
        return;
      }

      setError("");
      const updatedTask = await apiRequest(`/tasks/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          title,
          completed: task.completed,
          priority: task.priority,
        }),
      });

      setTasks((previousTasks) =>
        previousTasks.map((item) =>
          item.id === updatedTask.id ? updatedTask : item
        )
      );
      showSuccessMessage("Task updated successfully!");
    } catch (error) {
      console.error("Update task error:", error);
      setSuccessMessage("");
      setError(error.message || "Unable to update task.");
    }
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === "active") {
      return !task.completed;
    }

    if (filter === "completed") {
      return task.completed;
    }

    return true;
  });

  const categoryFilteredTasks = filteredTasks.filter((task) => {
  if (categoryFilter === "all") {
    return true;
  }

  return task.category === categoryFilter;
});

const searchedTasks = categoryFilteredTasks.filter((task) =>
  task.title.toLowerCase().includes(search.toLowerCase())
);
const tasksToSort = searchedTasks.filter((task) => {
  if (showOverdueOnly) {
    if (!task.due_date || task.completed) {
      return false;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dueDate = new Date(task.due_date);
    dueDate.setHours(0, 0, 0, 0);

    return dueDate < today;
  }

  if (showUpcomingOnly) {
    if (!task.due_date || task.completed) {
      return false;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dueDate = new Date(task.due_date);
    dueDate.setHours(0, 0, 0, 0);

    const daysUntilDue =
      (dueDate - today) / (1000 * 60 * 60 * 24);

    return daysUntilDue >= 0 && daysUntilDue <= 3;
  }

  return true;
});
const sortedTasks = [...tasksToSort].sort((a, b) => {
  if (sortBy === "priority") {
    const priorityOrder = {
      high: 1,
      medium: 2,
      low: 3,
    };

    return (
      (priorityOrder[a.priority] ?? 4) -
      (priorityOrder[b.priority] ?? 4)
    );
  }

  if (sortBy === "dueDate") {
    if (!a.due_date) return 1;
    if (!b.due_date) return -1;

    return new Date(a.due_date) - new Date(b.due_date);
  }

  return b.id - a.id;
});

  const totalTasks = tasks.length;

  const completedTasks = tasks.filter(
    (task) => task.completed
  ).length;

  const activeTasks = tasks.filter(
    (task) => !task.completed
  ).length;

  const highPriorityTasks = tasks.filter(
  (task) => task.priority === "high"
).length;

const upcomingTasks = tasks.filter((task) => {
  if (!task.due_date || task.completed) {
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dueDate = new Date(task.due_date);
  dueDate.setHours(0, 0, 0, 0);

  const daysUntilDue =
    (dueDate - today) / (1000 * 60 * 60 * 24);

  return daysUntilDue >= 0 && daysUntilDue <= 3;
}).length;

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setTasks([]);
    setError("");
    setSuccessMessage("");
  };

  useEffect(() => {
    const handleSessionExpired = () => {
      logout();
    };

    window.addEventListener("session-expired", handleSessionExpired);
    return () => {
      window.removeEventListener("session-expired", handleSessionExpired);
    };
  }, []);

  if (!user) {
    return <Auth onLogin={setUser} />;
  }

  return (
    <div className="app">
      <div className="background-shape shape-one"></div>
      <div className="background-shape shape-two"></div>

      <main className="container">
        {successMessage && (
  <div className="success-notification" role="status">
    {successMessage}
  </div>
)}
        <header className="header">
          <div>
            <p className="eyebrow">YOUR DAILY ORGANIZER</p>
            <h1>TaskYard</h1>
            <p className="subtitle">
              Organize your work. Get things done.
            </p>
            <p className="welcome-user">
  Welcome, {user.name}
</p>
          </div>

          <div className="task-count">
            <strong>{totalTasks}</strong>
            <span>Tasks</span>
          </div>
          <button className="logout-button" onClick={logout}>
  Logout
</button>
        </header>

        <TaskForm onAddTask={addTask} />

        <section className="task-summary">
          <div className="summary-card total-card">
            <span className="summary-label">Total</span>
            <strong>{totalTasks}</strong>
          </div>

          <div className="summary-card active-card">
            <span className="summary-label">Active</span>
            <strong>{activeTasks}</strong>
          </div>

          <div className="summary-card completed-card">
            <span className="summary-label">Completed</span>
            <strong>{completedTasks}</strong>
          </div>
          <div className="summary-card high-card">
  <span className="summary-label">High Priority</span>
  <strong>{highPriorityTasks}</strong>
</div>
<div className="summary-card upcoming-card">
  <span className="summary-label">Upcoming (3 Days)</span>
  <strong>{upcomingTasks}</strong>
</div>
        </section>
        <section className="progress-section">
  <div className="progress-header">
    <h3>Your Progress</h3>
    <strong>
      {totalTasks === 0
        ? 0
        : Math.round((completedTasks / totalTasks) * 100)}%
    </strong>
  </div>

  <div className="progress-track">
    <div
      className="progress-fill"
      style={{
        width: `${
          totalTasks === 0
            ? 0
            : (completedTasks / totalTasks) * 100
        }%`,
      }}
    />
  </div>

  <p>
    {completedTasks} of {totalTasks} tasks completed
  </p>
</section>
<section className="upcoming-section">
  <div className="upcoming-header">
    <div>
      <h2>Upcoming Tasks</h2>
      <p>Stay ahead of your deadlines.</p>
    </div>

    <button
      className="view-all-button"
      onClick={() => {
        setFilter("all");
        setCategoryFilter("all");
        setSearch("");
        setShowOverdueOnly(false);
        setShowUpcomingOnly(true);
        scrollToTasks();
      }}
    >
      View All
    </button>
    <button
  className="view-all-button"
  onClick={() => {
    setFilter("all");
    setCategoryFilter("all");
    setSearch("");
    setShowUpcomingOnly(false);
    setShowOverdueOnly(true);
    scrollToTasks();
  }}
>
  View Overdue
</button>
    {(showUpcomingOnly || showOverdueOnly) && (
  <button
    className="view-all-button"
    onClick={() => {
  setShowUpcomingOnly(false);
  setShowOverdueOnly(false);
      scrollToTasks();
}}
  >
    Show All Tasks
  </button>
)}
  </div>

  <div className="upcoming-list">
    {tasks
      .filter((task) => {
        if (!task.due_date || task.completed) {
          return false;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const dueDate = new Date(task.due_date);
        dueDate.setHours(0, 0, 0, 0);

        const daysUntilDue =
          (dueDate - today) / (1000 * 60 * 60 * 24);

        return daysUntilDue >= 0 && daysUntilDue <= 3;
      })
      .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
      .slice(0, 3)
      .map((task) => (
        <div className="upcoming-task" key={task.id}>
          <div className="upcoming-task-info">
            <strong>{task.title}</strong>

            <span>
              Due: {task.due_date}
            </span>
          </div>

          <span className={`priority priority-${task.priority}`}>
            {task.priority}
          </span>
        </div>
      ))}

    {!tasks.some((task) => {
      if (!task.due_date || task.completed) {
        return false;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const dueDate = new Date(task.due_date);
      dueDate.setHours(0, 0, 0, 0);

      const daysUntilDue =
        (dueDate - today) / (1000 * 60 * 60 * 24);

      return daysUntilDue >= 0 && daysUntilDue <= 3;
    }) && (
      <p className="no-upcoming-tasks">
        No upcoming tasks. You're all caught up!
      </p>
    )}
  </div>
</section>

        <section className="controls">
  {/* Search row */}
  <div className="search-box">
    <input
      type="text"
      placeholder="Search tasks by title..."
      value={search}
      onChange={(event) => setSearch(event.target.value)}
    />
  </div>

  {/* Status filters */}
  <div className="filter-group">
    <p className="filter-heading">STATUS</p>

    <div className="filters">
      <button
        className={filter === "all" ? "active-filter" : ""}
        onClick={() => setFilter("all")}
      >
        All Tasks
      </button>

      <button
        className={filter === "active" ? "active-filter" : ""}
        onClick={() => setFilter("active")}
      >
        Active
      </button>

      <button
        className={filter === "completed" ? "active-filter" : ""}
        onClick={() => setFilter("completed")}
      >
        Completed
      </button>
    </div>
  </div>

  {/* Category filters */}
  <div className="filter-group">
    <p className="filter-heading">CATEGORY</p>

    <div className="filters">
      <button
        className={categoryFilter === "all" ? "active-filter" : ""}
        onClick={() => setCategoryFilter("all")}
      >
        All Categories
      </button>

      <button
        className={categoryFilter === "Personal" ? "active-filter" : ""}
        onClick={() => setCategoryFilter("Personal")}
      >
        Personal
      </button>

      <button
        className={categoryFilter === "College" ? "active-filter" : ""}
        onClick={() => setCategoryFilter("College")}
      >
        College
      </button>

      <button
        className={categoryFilter === "Work" ? "active-filter" : ""}
        onClick={() => setCategoryFilter("Work")}
      >
        Work
      </button>

      <button
        className={categoryFilter === "Project" ? "active-filter" : ""}
        onClick={() => setCategoryFilter("Project")}
      >
        Project
      </button>
    </div>
  </div>
</section>

<div className="sort-controls">
  <label htmlFor="sortTasks">Sort tasks:</label>

  <select
    id="sortTasks"
    value={sortBy}
    onChange={(event) => setSortBy(event.target.value)}
  >
    <option value="newest">Newest First</option>
    <option value="priority">Priority: High to Low</option>
    <option value="dueDate">Due Date: Earliest First</option>
  </select>
</div>

        {loading && (
          <p className="status-message">
            Loading tasks...
          </p>
        )}

        {error && (
          <p className="error-message">
            {error}
          </p>
        )}
      

        <div ref={tasksSectionRef} id="tasks-section">
          {!loading && !error && (
  sortedTasks.length === 0 ? (
    <div className="empty-state">
      {tasks.length === 0 ? (
        <>
          <h3>No tasks yet</h3>
          <p>Add your first task to get started!</p>
        </>
      ) : (
        <>
          <h3>No tasks found</h3>
          <p>
            No tasks match your current search or filters.
            Try changing them.
          </p>
        </>
      )}
    </div>
  ) : (
    <TaskList
      tasks={sortedTasks}
      onComplete={completeTask}
      onDelete={deleteTask}
      onUpdate={updateTask}
    />
  )
)}
        </div>
      </main>
    </div>
  );
}

export default App;
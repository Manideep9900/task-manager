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

  const completionPercent = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
  const overdueTasks = tasks.filter((task) => {
    if (!task.due_date || task.completed) return false;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const due = new Date(task.due_date); due.setHours(0, 0, 0, 0);
    return due < today;
  }).length;

  const jumpToTasks = (mode = "all") => {
    setFilter(mode === "completed" ? "completed" : mode === "active" ? "active" : "all");
    setShowUpcomingOnly(mode === "upcoming");
    setShowOverdueOnly(mode === "overdue");
    setCategoryFilter("all");
    setSearch("");
    scrollToTasks();
  };

  return (
    <div className="app ty-dashboard">
      <aside className="ty-sidebar">
        <a className="ty-brand" href="#dashboard" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
          <span className="ty-brand-mark">✓</span>
          <span>Task<span>Yard</span><small>YOUR DAILY WORKSPACE</small></span>
        </a>
        <p className="ty-nav-label">WORKSPACE</p>
        <nav className="ty-nav" aria-label="Main navigation">
          <button className="ty-nav-item active" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}><span>⌂</span> Dashboard</button>
          <button className="ty-nav-item" onClick={() => jumpToTasks("all")}><span>▤</span> My tasks <b>{activeTasks}</b></button>
          <button className="ty-nav-item" onClick={() => jumpToTasks("upcoming")}><span>◷</span> Upcoming <b>{upcomingTasks}</b></button>
          <button className="ty-nav-item" onClick={() => jumpToTasks("completed")}><span>✓</span> Completed</button>
          <button className="ty-nav-item" onClick={() => jumpToTasks("overdue")}><span>⚑</span> Overdue <b className="ty-nav-danger">{overdueTasks}</b></button>
        </nav>
        <div className="ty-sidebar-bottom">
          <div className="ty-sidebar-tip"><span>✦</span><strong>Small steps add up.</strong><p>Keep moving forward, one task at a time.</p></div>
          <button className="ty-profile" onClick={logout} title="Log out"><span className="ty-avatar">{(user.name || user.email || "U").charAt(0).toUpperCase()}</span><span className="ty-profile-text"><strong>{user.name || "Your account"}</strong><small>Signed in · Log out</small></span><span className="ty-logout-icon">↗</span></button>
        </div>
      </aside>

      <main className="ty-main" id="dashboard">
        {successMessage && <div className="success-notification" role="status">✓ &nbsp;{successMessage}</div>}
        <header className="ty-topbar">
          <div><p className="ty-eyebrow">YOUR PERSONAL WORKSPACE</p><h1>Good to see you, {user.name?.split(" ")[0] || "there"} <span>✦</span></h1><p className="ty-subtitle">Here's what's happening with your tasks today.</p></div>
          <div className="ty-topbar-actions"><span className="ty-date">◷ &nbsp;{new Date().toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}</span><button className="ty-logout-button" onClick={logout}>Log out ↗</button></div>
        </header>

        {error && <p className="error-message ty-error">{error}</p>}
        {loading && <p className="status-message">Loading your tasks…</p>}

        <section className="ty-stat-grid" aria-label="Task summary">
          <article className="ty-stat-card"><span className="ty-stat-icon ty-icon-purple">▤</span><span className="ty-stat-label">Total tasks</span><strong>{totalTasks}</strong><small>Across all categories</small></article>
          <article className="ty-stat-card"><span className="ty-stat-icon ty-icon-blue">◷</span><span className="ty-stat-label">In progress</span><strong>{activeTasks}</strong><small>Tasks to keep moving</small></article>
          <article className="ty-stat-card"><span className="ty-stat-icon ty-icon-green">✓</span><span className="ty-stat-label">Completed</span><strong>{completedTasks}</strong><small>Nice work so far</small></article>
          <article className="ty-stat-card"><span className="ty-stat-icon ty-icon-orange">⚑</span><span className="ty-stat-label">Overdue</span><strong>{overdueTasks}</strong><small>Need your attention</small></article>
        </section>

        <section className="ty-overview-grid">
          <article className="ty-panel ty-progress-panel">
            <div className="ty-panel-heading"><div><p className="ty-eyebrow">YOUR MOMENTUM</p><h2>Task completion</h2></div><span className="ty-pill">All time</span></div>
            <div className="ty-progress-content"><div className="ty-ring" style={{ "--progress": `${completionPercent}%` }}><div className="ty-ring-inner"><strong>{completionPercent}%</strong><span>completed</span></div></div><div className="ty-progress-copy"><h3>{completionPercent === 100 && totalTasks ? "Everything done!" : completionPercent >= 60 ? "You're doing great!" : "Every task counts."}</h3><p>{completedTasks} of {totalTasks} tasks completed. Keep your momentum going.</p><div className="ty-legend"><span><i className="ty-dot ty-dot-green" /> Completed <b>{completedTasks}</b></span><span><i className="ty-dot ty-dot-purple" /> In progress <b>{activeTasks}</b></span></div><button className="ty-text-button" onClick={() => jumpToTasks("all")}>View all tasks <span>→</span></button></div></div>
          </article>
          <article className="ty-panel ty-deadline-panel"><div className="ty-panel-heading"><div><p className="ty-eyebrow">STAY ON TRACK</p><h2>Coming up next</h2></div><span className="ty-stat-icon ty-icon-blue">◷</span></div><p className="ty-panel-description">Your open tasks due within the next 3 days.</p><div className="ty-deadline-number">{upcomingTasks}<span> upcoming {upcomingTasks === 1 ? "task" : "tasks"}</span></div><div className="ty-mini-track"><span style={{ width: `${totalTasks ? Math.min(100, upcomingTasks / totalTasks * 100) : 0}%` }} /></div><button className="ty-secondary-button" onClick={() => jumpToTasks("upcoming")}>Review upcoming tasks <span>→</span></button><div className="ty-deadline-footer"><span className="ty-dot ty-dot-orange" /> {overdueTasks ? `${overdueTasks} overdue — review when you can` : "You're all caught up on overdue tasks"}</div></article>
        </section>

        <section className="ty-panel ty-create-panel" id="create-task"><div className="ty-panel-heading"><div><p className="ty-eyebrow">MAKE IT HAPPEN</p><h2>Create a task</h2><p className="ty-panel-description">Add the next thing you want to get done.</p></div><span className="ty-create-mark">＋</span></div><div className="ty-task-form-wrap"><TaskForm onAddTask={addTask} /></div></section>

        <section className="ty-panel ty-tasks-panel" id="tasks-section" ref={tasksSectionRef}>
          <div className="ty-panel-heading ty-tasks-heading"><div><p className="ty-eyebrow">YOUR WORK, ORGANIZED</p><h2>My tasks <span className="ty-count-pill">{sortedTasks.length}</span></h2></div><button className="ty-secondary-button" onClick={() => { setFilter("all"); setCategoryFilter("all"); setSearch(""); setShowUpcomingOnly(false); setShowOverdueOnly(false); setSortBy("newest"); }}>Reset filters ↺</button></div>
          <div className="ty-controls">
            <label className="ty-search"><span>⌕</span><input type="text" placeholder="Search tasks by title…" value={search} onChange={(event) => setSearch(event.target.value)} /><kbd>⌕</kbd></label>
            <div className="ty-filter-row"><div className="ty-filter-block"><span className="ty-filter-label">STATUS</span><div className="ty-filter-buttons"><button className={filter === "all" ? "selected" : ""} onClick={() => setFilter("all")}>All tasks</button><button className={filter === "active" ? "selected" : ""} onClick={() => setFilter("active")}>Active</button><button className={filter === "completed" ? "selected" : ""} onClick={() => setFilter("completed")}>Completed</button></div></div><div className="ty-filter-block"><label className="ty-filter-label" htmlFor="ty-category">CATEGORY</label><select id="ty-category" value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}><option value="all">All categories</option><option value="Personal">Personal</option><option value="College">College</option><option value="Work">Work</option><option value="Project">Project</option></select></div><div className="ty-filter-block ty-sort-block"><label className="ty-filter-label" htmlFor="sortTasks">SORT BY</label><select id="sortTasks" value={sortBy} onChange={(event) => setSortBy(event.target.value)}><option value="newest">Newest first</option><option value="priority">Priority: high to low</option><option value="dueDate">Due date: earliest</option></select></div></div>
            {(showUpcomingOnly || showOverdueOnly) && <div className="ty-active-filter-note">Showing {showUpcomingOnly ? "upcoming tasks due within 3 days" : "overdue tasks"}. <button onClick={() => { setShowUpcomingOnly(false); setShowOverdueOnly(false); }}>Clear filter</button></div>}
          </div>
          {loading ? <div className="ty-empty-state"><span>◷</span><h3>Loading tasks</h3><p>Your workspace is getting ready.</p></div> : sortedTasks.length === 0 ? <div className="ty-empty-state"><span>{tasks.length ? "⌕" : "✦"}</span><h3>{tasks.length ? "No tasks match these filters" : "A fresh start"}</h3><p>{tasks.length ? "Try another search or reset your filters." : "Create your first task above and start building momentum."}</p>{tasks.length > 0 && <button className="ty-secondary-button" onClick={() => { setFilter("all"); setCategoryFilter("all"); setSearch(""); setShowUpcomingOnly(false); setShowOverdueOnly(false); }}>Clear filters</button>}</div> : <div className="ty-task-list-wrap"><TaskList tasks={sortedTasks} onComplete={completeTask} onDelete={deleteTask} onUpdate={updateTask} /></div>}
        </section>
        <footer className="ty-footer"><span className="ty-brand-mark ty-footer-mark">✓</span><span><strong>TaskYard</strong> · Make room for what matters.</span><span className="ty-footer-right">One task at a time ✦</span></footer>
      </main>
    </div>
  );
}

export default App;
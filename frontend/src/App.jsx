import { useEffect, useState } from "react";
import "./App.css";
import TaskForm from "./components/TaskForm";
import TaskList from "./components/TaskList";

const API_URL = import.meta.env.VITE_API_URL;

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/tasks`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load tasks");
        }

        return response.json();
      })
      .then((data) => {
        setTasks(data);
        setLoading(false);
      })
      .catch((error) => {
        console.log(error);
        setError("Unable to load tasks.");
        setLoading(false);
      });
  }, []);

  const addTask = async (title) => {
    try {
      const response = await fetch(`${API_URL}/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add task");
      }

      const newTask = await response.json();

      setTasks([...tasks, newTask]);
    } catch (error) {
      console.log(error);
      setError("Unable to add task.");
    }
  };

  const completeTask = async (task) => {
    try {
      const response = await fetch(
        `${API_URL}/tasks/${task.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: task.title,
            completed: !task.completed,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update task");
      }

      const updatedTask = await response.json();

      setTasks(
        tasks.map((item) =>
          item.id === updatedTask.id ? updatedTask : item
        )
      );
    } catch (error) {
      console.log(error);
      setError("Unable to update task.");
    }
  };

  const deleteTask = async (id) => {
    try {
      const response = await fetch(
        `${API_URL}/tasks/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete task");
      }

      setTasks(tasks.filter((task) => task.id !== id));
    } catch (error) {
      console.log(error);
      setError("Unable to delete task.");
    }
  };

  const updateTask = async (id, title) => {
    try {
      const task = tasks.find((item) => item.id === id);

      const response = await fetch(
        `${API_URL}/tasks/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: title,
            completed: task.completed,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update task");
      }

      const updatedTask = await response.json();

      setTasks(
        tasks.map((item) =>
          item.id === updatedTask.id ? updatedTask : item
        )
      );
    } catch (error) {
      console.log(error);
      setError("Unable to update task.");
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

  const searchedTasks = filteredTasks.filter((task) =>
    task.title.toLowerCase().includes(search.toLowerCase())
  );

  const totalTasks = tasks.length;

  const completedTasks = tasks.filter(
    (task) => task.completed
  ).length;

  const activeTasks = tasks.filter(
    (task) => !task.completed
  ).length;

  return (
    <div className="app">
      <div className="background-shape shape-one"></div>
      <div className="background-shape shape-two"></div>

      <main className="container">
        <header className="header">
          <div>
            <p className="eyebrow">YOUR DAILY ORGANIZER</p>
            <h1>TaskFlow</h1>
            <p className="subtitle">
              Organize your work. Get things done.
            </p>
          </div>

          <div className="task-count">
            <strong>{totalTasks}</strong>
            <span>Tasks</span>
          </div>
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
        </section>

        <section className="controls">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search your tasks..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <div className="filters">
            <button
              className={filter === "all" ? "active-filter" : ""}
              onClick={() => setFilter("all")}
            >
              All
            </button>

            <button
              className={filter === "active" ? "active-filter" : ""}
              onClick={() => setFilter("active")}
            >
              Active
            </button>

            <button
              className={
                filter === "completed" ? "active-filter" : ""
              }
              onClick={() => setFilter("completed")}
            >
              Completed
            </button>
          </div>
        </section>

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

        {!loading && !error && (
          <TaskList
            tasks={searchedTasks}
            onComplete={completeTask}
            onDelete={deleteTask}
            onUpdate={updateTask}
          />
        )}
      </main>
    </div>
  );
}

export default App;
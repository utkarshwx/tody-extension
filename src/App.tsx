import { useState } from "react";

type TaskStatus = "TODO" | "IN_PROGRESS" | "COMPLETED";

interface Task {
  id: string;
  title: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  period: "DAY" | "WEEK" | "MONTH" | "YEAR";
  status: TaskStatus;
}

function App() {
  const [task, setTask] = useState<Task>({
    id: "1",
    title: "Build Tody extension",
    priority: "HIGH",
    period: "DAY",
    status: "TODO"
  });

  function handleStart() {
    setTask((current) => ({
      ...current,
      status: "IN_PROGRESS"
    }));
  }

  function handleComplete() {
    setTask((current) => ({
      ...current,
      status: "COMPLETED"
    }));
  }

  const completed = task.status === "COMPLETED";
  const inProgress = task.status === "IN_PROGRESS";

  return (
    <main className="app">
      <header className="header">
        <h1>Tody</h1>

        <span className="date">
          Friday, October 2
        </span>
      </header>

      <section className="next">
        <p className="label">WHAT'S NEXT</p>

        {completed ? (
          <>
            <h2>Nothing pending.</h2>

            <p>
              You're done with your current task.
            </p>
          </>
        ) : (
          <>
            <h2>{task.title}</h2>

            <div className="task-meta">
              <span>{task.priority}</span>
              <span>{task.period}</span>
            </div>

            {inProgress ? (
              <button onClick={handleComplete}>
                Complete
              </button>
            ) : (
              <button onClick={handleStart}>
                Start
              </button>
            )}
          </>
        )}
      </section>
    </main>
  );
}

export default App;
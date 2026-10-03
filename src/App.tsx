import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type UIEvent,
} from "react";

import Login from "./components/Login";
import CreateTask from "./components/CreateTask";

import { getMe } from "./api/auth";
import {
  getTasks,
  startTask,
  completeTask,
  deleteTask,
} from "./api/tasks";

import {
  getToken,
  removeToken,
} from "./storage/auth";

import type { Task } from "./types/task";

function getPriorityWeight(
  priority: Task["priority"]
): number {
  switch (priority) {
    case "HIGH":
      return 3;

    case "MEDIUM":
      return 2;

    case "LOW":
      return 1;

    default:
      return 0;
  }
}

function getPeriodWeight(
  period: Task["period"]
): number {
  switch (period) {
    case "DAY":
      return 4;

    case "WEEK":
      return 3;

    case "MONTH":
      return 2;

    case "YEAR":
      return 1;

    default:
      return 0;
  }
}

function getDomain(
  url?: string
): string | null {
  if (!url) {
    return null;
  }

  try {
    const hostname = new URL(url).hostname;

    return hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

function App() {
  const [authenticated, setAuthenticated] =
    useState<boolean | null>(null);

  const [actionLoading, setActionLoading] =
    useState<string | null>(null);

  const [user, setUser] = useState<{
    email: string;
    name?: string;
  } | null>(null);

  const [tasks, setTasks] =
    useState<Task[]>([]);

  const [loadingTasks, setLoadingTasks] =
    useState(false);

  const [taskError, setTaskError] =
    useState("");

  const [creatingTask, setCreatingTask] =
    useState(false);

  // Pagination
  const [page, setPage] = useState(1);

  const [hasNextPage, setHasNextPage] =
    useState(true);

  const [loadingMore, setLoadingMore] =
    useState(false);

  /*
   * React state updates asynchronously.
   *
   * This ref prevents multiple scroll events from
   * triggering the same page request before
   * loadingMore state has updated.
   */
  const loadingMoreRef =
    useRef(false);

  useEffect(() => {
    async function checkAuth() {
      const token = await getToken();

      if (!token) {
        setAuthenticated(false);
        return;
      }

      try {
        const currentUser =
          await getMe();

        setUser(currentUser);
        setAuthenticated(true);
      } catch {
        await removeToken();
        setAuthenticated(false);
      }
    }

    checkAuth();
  }, []);

  const activeTasks = useMemo(() => {
    return tasks
      .filter(
        (task) =>
          task.status !== "COMPLETED"
      )
      .sort((a, b) => {
        // IN_PROGRESS always comes first.
        const aInProgress =
          a.status === "IN_PROGRESS";

        const bInProgress =
          b.status === "IN_PROGRESS";

        if (
          aInProgress !== bInProgress
        ) {
          return aInProgress ? -1 : 1;
        }

        // Priority.
        const priorityDifference =
          getPriorityWeight(b.priority) -
          getPriorityWeight(a.priority);

        if (priorityDifference !== 0) {
          return priorityDifference;
        }

        // Period.
        const periodDifference =
          getPeriodWeight(b.period) -
          getPeriodWeight(a.period);

        if (periodDifference !== 0) {
          return periodDifference;
        }

        // Due date.
        const dateA = a.dueDate
          ? new Date(
              a.dueDate
            ).getTime()
          : Infinity;

        const dateB = b.dueDate
          ? new Date(
              b.dueDate
            ).getTime()
          : Infinity;

        if (dateA !== dateB) {
          return dateA - dateB;
        }

        // Oldest task first.
        return (
          new Date(
            a.createdAt
          ).getTime() -
          new Date(
            b.createdAt
          ).getTime()
        );
      });
  }, [tasks]);

  const nextTask =
    activeTasks[0];

  const otherTasks =
    activeTasks.slice(1);

  async function handleStart(
    task: Task
  ) {
    setActionLoading(task._id);

    try {
      const updatedTask =
        await startTask(
          task._id
        );

      setTasks((current) =>
        current.map((item) =>
          item._id ===
          updatedTask._id
            ? updatedTask
            : item
        )
      );
    } catch (error) {
      if (error instanceof Error) {
        setTaskError(
          error.message
        );
      } else {
        setTaskError(
          "Failed to start task"
        );
      }
    } finally {
      setActionLoading(null);
    }
  }

  async function handleComplete(
    task: Task
  ) {
    setActionLoading(task._id);

    try {
      const updatedTask =
        await completeTask(
          task._id
        );

      setTasks((current) =>
        current.map((item) =>
          item._id ===
          updatedTask._id
            ? updatedTask
            : item
        )
      );
    } catch (error) {
      if (error instanceof Error) {
        setTaskError(
          error.message
        );
      } else {
        setTaskError(
          "Failed to complete task"
        );
      }
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDelete(
    task: Task
  ) {
    const confirmed =
      window.confirm(
        `Delete "${task.title}"?`
      );

    if (!confirmed) {
      return;
    }

    setActionLoading(task._id);

    try {
      await deleteTask(
        task._id
      );

      setTasks((current) =>
        current.filter(
          (item) =>
            item._id !== task._id
        )
      );
    } catch (error) {
      if (error instanceof Error) {
        setTaskError(
          error.message
        );
      } else {
        setTaskError(
          "Failed to delete task"
        );
      }
    } finally {
      setActionLoading(null);
    }
  }

  useEffect(() => {
    if (!authenticated) {
      return;
    }

    async function loadTasks() {
      setLoadingTasks(true);
      setTaskError("");

      try {
        const result =
          await getTasks(
            1,
            20
          );

        setTasks(
          result.tasks
        );

        setPage(1);

        setHasNextPage(
          result.pagination
            .hasNextPage
        );
      } catch (error) {
        if (error instanceof Error) {
          setTaskError(
            error.message
          );
        } else {
          setTaskError(
            "Failed to load tasks"
          );
        }
      } finally {
        setLoadingTasks(false);
      }
    }

    loadTasks();
  }, [authenticated]);

  async function loadMoreTasks() {
    if (
      loadingMoreRef.current ||
      !hasNextPage
    ) {
      return;
    }

    loadingMoreRef.current = true;
    setLoadingMore(true);

    try {
      const nextPage =
        page + 1;

      const result =
        await getTasks(
          nextPage,
          20
        );

      setTasks(
        (currentTasks) => [
          ...currentTasks,
          ...result.tasks,
        ]
      );

      setPage(
        nextPage
      );

      setHasNextPage(
        result.pagination
          .hasNextPage
      );
    } catch (error) {
      if (error instanceof Error) {
        setTaskError(
          error.message
        );
      } else {
        setTaskError(
          "Failed to load more tasks"
        );
      }
    } finally {
      loadingMoreRef.current =
        false;

      setLoadingMore(false);
    }
  }

  function handleTaskScroll(
    event: UIEvent<HTMLDivElement>
  ) {
    const element =
      event.currentTarget;

    const distanceFromBottom =
      element.scrollHeight -
      element.scrollTop -
      element.clientHeight;

    /*
     * Start loading before the user
     * actually reaches the bottom.
     */
    if (
      distanceFromBottom <= 200 &&
      hasNextPage &&
      !loadingMoreRef.current
    ) {
      loadMoreTasks();
    }
  }

  if (authenticated === null) {
    return (
      <main className="app">
        <p>Loading...</p>
      </main>
    );
  }

  if (!authenticated) {
    return (
      <Login
        onLogin={() =>
          setAuthenticated(true)
        }
      />
    );
  }

  if (creatingTask) {
    return (
      <main className="app">
        <header className="header">
          <div className="header-title">
            <h1>Tody</h1>

            <span className="date">
              Know what to do.
            </span>
          </div>

          <button
            className="add-task-button"
            onClick={() =>
              setCreatingTask(false)
            }
            aria-label="Close"
          >
            ×
          </button>
        </header>

        <CreateTask
          onCreated={(task) => {
            setTasks(
              (current) => [
                task,
                ...current,
              ]
            );

            setCreatingTask(false);
          }}
          onCancel={() =>
            setCreatingTask(false)
          }
        />
      </main>
    );
  }

  return (
    <div
      className="app-shell"
      onScroll={handleTaskScroll}
    >
      <main className="app">
        <header className="header">
          <div className="header-title">
            <h1>Tody</h1>

            <span className="date">
              Know what to do.
            </span>
          </div>

          <div className="header-actions">
            <span className="user">
              {user?.name ||
                user?.email}
            </span>

            <button
              className="add-task-button"
              onClick={() =>
                setCreatingTask(true)
              }
              aria-label="Add task"
            >
              + Add Task
            </button>
          </div>
        </header>
        <section className="next">
          <p className="label">
            WHAT'S NEXT
          </p>

          {loadingTasks && (
            <h2>Loading...</h2>
          )}

          {!loadingTasks &&
            taskError && (
              <p className="error">
                {taskError}
              </p>
            )}

          {!loadingTasks &&
            !taskError &&
            tasks.length === 0 && (
              <>
                <h2>
                  Nothing yet.
                </h2>

                <p>
                  Add a task to get
                  started.
                </p>
              </>
            )}

          {!loadingTasks &&
            !taskError &&
            tasks.length > 0 &&
            activeTasks.length ===
              0 && (
              <>
                <h2>
                  All clear.
                </h2>

                <p>
                  Nothing else needs
                  your attention.
                </p>
              </>
            )}

          {!loadingTasks &&
            !taskError &&
            nextTask && (
              <>
                <div className="task-meta">
                  <span>
                    {nextTask.priority}
                  </span>

                  <span>
                    {nextTask.period}
                  </span>
                </div>

                <h2>
                  {nextTask.title}
                </h2>

                {nextTask.description && (
                  <p className="task-description">
                    {
                      nextTask.description
                    }
                  </p>
                )}

                {nextTask.resourceUrl && (
                  <a
                    className="resource-link"
                    href={
                      nextTask.resourceUrl
                    }
                    target="_blank"
                    rel="noreferrer"
                  >
                    {getDomain(
                      nextTask.resourceUrl
                    )}
                  </a>
                )}

                <button
                  onClick={() =>
                    nextTask.status ===
                    "IN_PROGRESS"
                      ? handleComplete(
                          nextTask
                        )
                      : handleStart(
                          nextTask
                        )
                  }
                  disabled={
                    actionLoading ===
                    nextTask._id
                  }
                >
                  {actionLoading ===
                  nextTask._id
                    ? "Updating..."
                    : nextTask.status ===
                        "IN_PROGRESS"
                      ? "Complete"
                      : "Start"}
                </button>
              </>
            )}
        </section>

        {!loadingTasks &&
          !taskError &&
          otherTasks.length > 0 && (
            <section className="task-list">
              <p className="label">
                UP NEXT
              </p>

              <div className="task-list-items">
                {otherTasks.map(
                  (task) => (
                    <div
                      className="task-item"
                      key={task._id}
                    >
                      <div className="task-item-main">
                        <h3>
                          {task.title}
                        </h3>

                        <div className="task-item-meta">
                          <span
                            className={`priority-${task.priority.toLowerCase()}`}
                          >
                            {
                              task.priority
                            }
                          </span>

                          <span>
                            {
                              task.period
                            }
                          </span>

                          {task.resourceUrl && (
                            <a
                              href={
                                task.resourceUrl
                              }
                              target="_blank"
                              rel="noreferrer"
                              className="task-resource"
                              title={
                                getDomain(
                                  task.resourceUrl
                                ) ??
                                ""
                              }
                            >
                              Link
                            </a>
                          )}
                        </div>
                      </div>

                      <button
                        className="delete-task-button"
                        onClick={() =>
                          handleDelete(
                            task
                          )
                        }
                        aria-label={`Delete ${task.title}`}
                        title="Delete task"
                      >
                        ×
                      </button>
                    </div>
                  )
                )}
              </div>
            </section>
          )}

        {loadingMore && (
          <p className="loading-more">
            Loading more...
          </p>
        )}
      </main>
    </div>
  );
}

export default App;
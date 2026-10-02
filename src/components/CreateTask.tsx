import { useState } from "react";
import type { SyntheticEvent } from "react";
import { createTask } from "../api/tasks";
import type {
    Task,
    TaskPeriod,
    TaskPriority
} from "../types/task";

interface Props {
    onCreated: (task: Task) => void;
    onCancel: () => void;
}

function CreateTask({
    onCreated,
    onCancel
}: Props) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [resourceUrl, setResourceUrl] = useState("");

    const [priority, setPriority] =
        useState<TaskPriority>("MEDIUM");

    const [period, setPeriod] =
        useState<TaskPeriod>("DAY");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(
        event: SyntheticEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        if (!title.trim()) {
            return;
        }

        setLoading(true);
        setError("");

        try {
            const task = await createTask({
                title: title.trim(),
                description:
                    description.trim() || undefined,
                resourceUrl:
                    resourceUrl.trim() || undefined,
                priority,
                period
            });

            onCreated(task);
        } catch (error) {
            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError("Failed to create task");
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <section className="create-task">
            <p className="label">
                NEW TASK
            </p>

            <h2>Add a task</h2>

            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="What needs to be done?"
                    value={title}
                    onChange={(event) =>
                        setTitle(event.target.value)
                    }
                    autoFocus
                    required
                />

                <textarea
                    placeholder="Description (optional)"
                    value={description}
                    onChange={(event) =>
                        setDescription(event.target.value)
                    }
                    rows={3}
                />

                <input
                    type="url"
                    placeholder="Resource link (optional)"
                    value={resourceUrl}
                    onChange={(event) =>
                        setResourceUrl(event.target.value)
                    }
                />

                <div className="form-row">
                    <label>
                        Priority

                        <select
                            value={priority}
                            onChange={(event) =>
                                setPriority(
                                    event.target.value as TaskPriority
                                )
                            }
                        >
                            <option value="LOW">
                                Low
                            </option>

                            <option value="MEDIUM">
                                Medium
                            </option>

                            <option value="HIGH">
                                High
                            </option>
                        </select>
                    </label>

                    <label>
                        Period

                        <select
                            value={period}
                            onChange={(event) =>
                                setPeriod(
                                    event.target.value as TaskPeriod
                                )
                            }
                        >
                            <option value="DAY">
                                Today
                            </option>

                            <option value="WEEK">
                                This week
                            </option>

                            <option value="MONTH">
                                This month
                            </option>

                            <option value="YEAR">
                                This year
                            </option>
                        </select>
                    </label>
                </div>

                {error && (
                    <p className="error">
                        {error}
                    </p>
                )}

                <div className="form-actions">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={loading}
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        disabled={
                            loading ||
                            !title.trim()
                        }
                    >
                        {loading
                            ? "Adding..."
                            : "Add task"}
                    </button>
                </div>
            </form>
        </section>
    );
}

export default CreateTask;
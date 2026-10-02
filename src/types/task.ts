export type TaskStatus =
    | "TODO"
    | "IN_PROGRESS"
    | "COMPLETED";

export type TaskPriority =
    | "LOW"
    | "MEDIUM"
    | "HIGH";

export type TaskPeriod =
    | "YEAR"
    | "MONTH"
    | "WEEK"
    | "DAY";

export interface Task {
    _id: string;
    title: string;
    description?: string;
    resourceUrl?: string;
    status: TaskStatus;
    priority: TaskPriority;
    period: TaskPeriod;
    dueDate?: string;
    completedAt?: string;
    goalId?: string;
    createdAt: string;
    updatedAt: string;
}
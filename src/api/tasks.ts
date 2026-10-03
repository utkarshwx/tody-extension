import { request } from "./client";
import type { Task, TaskPriority, TaskPeriod } from "../types/task";

export interface TasksResponse {
    success: boolean;
    tasks: Task[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
    };
}

interface TaskResponse {
    success: boolean;
    task: Task;
}

export interface CreateTaskInput {
    title: string;
    description?: string;
    resourceUrl?: string;
    priority: TaskPriority;
    period: TaskPeriod;
    dueDate?: string;
    goalId?: string;
}

export async function getTasks(
    page = 1,
    limit = 20
): Promise<TasksResponse> {
    return request<TasksResponse>(
        `/tasks?page=${page}&limit=${limit}`
    );
}

export async function startTask(
    id: string
): Promise<Task> {
    const response = await request<TaskResponse>(
        `/tasks/${id}`,
        {
            method: "PATCH",
            body: JSON.stringify({
                status: "IN_PROGRESS"
            })
        }
    );

    return response.task;
}

export async function completeTask(
    id: string
): Promise<Task> {
    const response = await request<TaskResponse>(
        `/tasks/${id}`,
        {
            method: "PATCH",
            body: JSON.stringify({
                status: "COMPLETED"
            })
        }
    );

    return response.task;
}

export async function createTask(
    input: CreateTaskInput
): Promise<Task> {
    const response = await request<TaskResponse>(
        "/tasks",
        {
            method: "POST",
            body: JSON.stringify(input)
        }
    );

    return response.task;
}

export async function deleteTask(
  id: string
): Promise<void> {
  await request<{ success: boolean }>(
    `/tasks/${id}`,
    {
      method: "DELETE"
    }
  );
}
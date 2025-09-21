import { Task } from "../schemas/Task";

export async function createTask(proj: Task) {
  return fetch(`${process.env.REACT_APP_SERVER_URL}/tasks`, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    method: "POST",
    credentials: "include",
    body: JSON.stringify(proj),
  });
}

export async function listTasks(): Promise<Task[]> {
  const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/tasks`, {
    method: "GET",
    credentials: "include",
  });

  const data = await response.json();
  return data as Task[];
}

export async function getTask(id: string): Promise<Task> {
  const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/tasks/${id}`, {
    method: "GET",
    credentials: "include",
  });

  const data = await response.json();
  return data as Task;
}

export async function deleteTask(id: string): Promise<void> {
  await fetch(`${process.env.REACT_APP_SERVER_URL}/tasks/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
}

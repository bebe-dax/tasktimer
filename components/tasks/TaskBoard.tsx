"use client";
import { useState } from "react";
import TaskArea from "./TaskArea";
import "../../styles/taskboard.css";

interface Task {
  id: string;
  title: string;
  description: string;
  priority: "Low" | "Middle" | "High";
  status: "Todo" | "In Progress" | "Completed";
  time?: {
    hours: string;
    minutes: string;
    seconds: string;
  };
}

export default function TaskBoard() {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "1",
      title: "タスク1",
      description: "タスク1の説明",
      priority: "High",
      status: "Todo",
      time: { hours: "01", minutes: "30", seconds: "00" },
    },
    {
      id: "2",
      title: "タスク2",
      description: "タスク2の説明",
      priority: "Middle",
      status: "Todo",
      time: { hours: "02", minutes: "00", seconds: "30" },
    },
    {
      id: "3",
      title: "タスク3",
      description: "タスク3の説明",
      priority: "Low",
      status: "In Progress",
      time: { hours: "00", minutes: "40", seconds: "00" },
    },
    {
      id: "4",
      title: "タスク4",
      description: "タスク4の説明",
      priority: "High",
      status: "In Progress",
      time: { hours: "03", minutes: "20", seconds: "30" },
    },
    {
      id: "5",
      title: "タスク5",
      description: "タスク5の説明",
      priority: "Middle",
      status: "Completed",
      time: { hours: "00", minutes: "50", seconds: "00" },
    },
    {
      id: "6",
      title: "タスク6",
      description: "タスク6の説明",
      priority: "Low",
      status: "Completed",
      time: { hours: "01", minutes: "10", seconds: "30" },
    },
  ]);

  const handleDrop = (taskId: string, newStatus: "Todo" | "In Progress" | "Completed") => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    );
  };

  const handleAddTask = (task: Task) => {
    setTasks((prevTasks) => [...prevTasks, task]);
  };

  const handleUpdateTask = (updatedTask: Task) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === updatedTask.id ? updatedTask : task
      )
    );
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
  };

  const sortTasks = (tasksToSort: Task[]) => {
    const priorityOrder = { High: 0, Middle: 1, Low: 2 };
    return tasksToSort.sort((a, b) => {
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) {
        return priorityDiff;
      }
      return a.id.localeCompare(b.id);
    });
  };

  return (
    <div className="taskboard">
      <TaskArea
        areaName="Todo"
        className="todoArea"
        tasks={sortTasks(tasks.filter((task) => task.status === "Todo"))}
        onDrop={handleDrop}
        onAddTask={handleAddTask}
        onUpdateTask={handleUpdateTask}
        onDeleteTask={handleDeleteTask}
      />
      <TaskArea
        areaName="In Progress"
        className="progressArea"
        tasks={sortTasks(tasks.filter((task) => task.status === "In Progress"))}
        onDrop={handleDrop}
        onAddTask={handleAddTask}
        onUpdateTask={handleUpdateTask}
        onDeleteTask={handleDeleteTask}
      />
      <TaskArea
        areaName="Completed"
        className="completedArea"
        tasks={sortTasks(tasks.filter((task) => task.status === "Completed"))}
        onDrop={handleDrop}
        onAddTask={handleAddTask}
        onUpdateTask={handleUpdateTask}
        onDeleteTask={handleDeleteTask}
      />
    </div>
  );
}

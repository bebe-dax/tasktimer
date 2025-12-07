"use client";
import { useState } from "react";
import TaskCard from "./TaskCard";
import TaskDetail from "./TaskDetail";
import "../../styles/taskarea.css";

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

interface TaskAreaProps {
  areaName: string;
  className: string;
  tasks: Task[];
  onDrop: (
    taskId: string,
    newStatus: "Todo" | "In Progress" | "Completed"
  ) => void;
  onAddTask: (task: Task) => void;
  onUpdateTask: (updatedTask: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

export default function TaskArea({
  areaName,
  className,
  tasks,
  onDrop,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
}: TaskAreaProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>();
  const [isDragOver, setIsDragOver] = useState(false);

  const handleTaskClick = (task?: Task) => {
    if (task) {
      setSelectedTask(task);
    } else {
      setSelectedTask({
        id: Date.now().toString(),
        title: "",
        description: "",
        priority: "Low",
        status: areaName as "Todo" | "In Progress" | "Completed",
        time: { hours: "00", minutes: "00", seconds: "00" },
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTask(undefined);
  };

  const handleSaveTask = (taskData: {
    title: string;
    description: string;
    priority: "Low" | "Middle" | "High";
    time: { hours: string; minutes: string; seconds: string };
  }) => {
    if (selectedTask) {
      const isNewTask = !tasks.find((t) => t.id === selectedTask.id);
      const updatedTask: Task = {
        ...selectedTask,
        ...taskData,
      };

      if (isNewTask) {
        onAddTask(updatedTask);
      } else {
        onUpdateTask(updatedTask);
      }
    }
    handleCloseModal();
  };

  const handleDeleteTaskClick = () => {
    if (selectedTask) {
      onDeleteTask(selectedTask.id);
    }
    handleCloseModal();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDropOnArea = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const taskId = e.dataTransfer.getData("taskId");
    if (taskId) {
      onDrop(taskId, areaName as "Todo" | "In Progress" | "Completed");
    }
  };

  return (
    <div
      className={`taskarea ${isDragOver ? "drag-over" : ""}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDropOnArea}
    >
      <h2 className={className}>{areaName}</h2>
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          id={task.id}
          title={task.title}
          priority={task.priority}
          time={task.time}
          onClick={() => handleTaskClick(task)}
        />
      ))}
      <h3>
        <button
          className="addTaskButton"
          type="button"
          onClick={() => handleTaskClick()}
        >
          + Add Task
        </button>
      </h3>
      <TaskDetail
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        task={selectedTask}
        onSave={handleSaveTask}
        onDelete={handleDeleteTaskClick}
      />
    </div>
  );
}

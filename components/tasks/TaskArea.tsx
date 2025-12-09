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
  initialTime: {
    hours: string;
    minutes: string;
    seconds: string;
  };
  time?: {
    hours: string;
    minutes: string;
    seconds: string;
  };
  isRunning?: boolean;
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
  onToggleTimer: (taskId: string) => void;
}

export default function TaskArea({
  areaName,
  className,
  tasks,
  onDrop,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onToggleTimer,
}: TaskAreaProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>();
  const [isDragOver, setIsDragOver] = useState(false);

  const handleTaskClick = (task?: Task) => {
    // In Progressエリアでは編集を許可しない
    if (areaName === "In Progress") {
      return;
    }

    if (task) {
      setSelectedTask(task);
    } else {
      const defaultTime = { hours: "00", minutes: "00", seconds: "00" };
      setSelectedTask({
        id: Date.now().toString(),
        title: "",
        description: "",
        priority: "Low",
        status: areaName as "Todo" | "In Progress" | "Completed",
        initialTime: defaultTime,
        time: defaultTime,
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
        initialTime: taskData.time, // 保存時にinitialTimeも更新
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
          status={task.status}
          time={task.time}
          isRunning={task.isRunning}
          onClick={areaName !== "In Progress" ? () => handleTaskClick(task) : undefined}
          onToggle={
            task.status === "In Progress"
              ? () => onToggleTimer(task.id)
              : undefined
          }
        />
      ))}
      {areaName !== "In Progress" && (
        <h3>
          <button
            className="addTaskButton"
            type="button"
            onClick={() => handleTaskClick()}
          >
            + Add Task
          </button>
        </h3>
      )}
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

"use client";
import "../../styles/taskcard.css";

interface TaskCardProps {
  id: string;
  title: string;
  description?: string;
  priority?: "Low" | "Middle" | "High";
  status?: "Todo" | "In Progress" | "Completed";
  time?: {
    hours: string;
    minutes: string;
    seconds: string;
  };
  isRunning?: boolean;
  onClick?: () => void;
  onToggle?: () => void;
}

export default function TaskCard({ id, title, priority, status, time, isRunning, onClick, onToggle }: TaskCardProps) {
  const getPriorityClass = () => {
    if (priority === "High") return "priority-high";
    if (priority === "Middle") return "priority-middle";
    return "priority-low";
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("taskId", id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleToggleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggle) {
      onToggle();
    }
  };

  return (
    <div
      className={`taskcard ${status === "In Progress" ? "in-progress" : ""}`}
      draggable
      onDragStart={handleDragStart}
    >
      <div className="taskcard-left">
        <h3
          className={`taskcard-title ${onClick ? "clickable" : "non-clickable"}`}
          onClick={onClick}
        >
          {title}
        </h3>
        {priority && (
          <span className={`taskcard-priority ${getPriorityClass()}`}>
            {priority}
          </span>
        )}
      </div>
      <div className="taskcard-right">
        {time && (
          <div className="taskcard-time">
            {time.minutes}:{time.seconds}
          </div>
        )}
        {onToggle && status === "In Progress" && (
          <button
            className={`taskcard-toggle-button ${isRunning ? "running" : "paused"}`}
            onClick={handleToggleClick}
            title={isRunning ? "Pause timer" : "Start timer"}
          >
            {isRunning ? "■" : "▶"}
          </button>
        )}
      </div>
    </div>
  );
}

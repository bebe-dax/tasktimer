"use client";
import "../../styles/taskcard.css";

interface TaskCardProps {
  id: string;
  title: string;
  description?: string;
  priority?: "Low" | "Middle" | "High";
  time?: {
    hours: string;
    minutes: string;
    seconds: string;
  };
  onClick?: () => void;
}

export default function TaskCard({ id, title, priority, time, onClick }: TaskCardProps) {
  const getPriorityClass = () => {
    if (priority === "High") return "priority-high";
    if (priority === "Middle") return "priority-middle";
    return "priority-low";
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("taskId", id);
    e.dataTransfer.effectAllowed = "move";
  };

  return (
    <div
      className="taskcard"
      draggable
      onDragStart={handleDragStart}
    >
      <div className="taskcard-left">
        <h3 className="taskcard-title" onClick={onClick}>
          {title}
        </h3>
        {priority && (
          <span className={`taskcard-priority ${getPriorityClass()}`}>
            {priority}
          </span>
        )}
      </div>
      {time && (
        <div className="taskcard-time">
          {time.hours}:{time.minutes}:{time.seconds}
        </div>
      )}
    </div>
  );
}

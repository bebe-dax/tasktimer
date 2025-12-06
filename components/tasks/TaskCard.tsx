"use client";
import "../../styles/taskcard.css";

interface TaskCardProps {
  title: string;
  description?: string;
  priority?: "Low" | "Middle" | "High";
}

export default function TaskCard({ title, priority }: TaskCardProps) {
  const getPriorityClass = () => {
    if (priority === "High") return "priority-high";
    if (priority === "Middle") return "priority-middle";
    return "priority-low";
  };

  return (
    <div className="taskcard">
      <h3 className="taskcard-title">{title}</h3>
      {priority && (
        <span className={`taskcard-priority ${getPriorityClass()}`}>
          {priority}
        </span>
      )}
    </div>
  );
}

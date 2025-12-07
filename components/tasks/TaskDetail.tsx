"use client";
import { useState } from "react";
import "../../styles/taskdetail.css";

interface TaskDetailProps {
  isOpen: boolean;
  onClose: () => void;
  task?: {
    title: string;
    description: string;
    priority: "Low" | "Middle" | "High";
    status: "Todo" | "In Progress" | "Completed";
    time?: {
      hours: string;
      minutes: string;
      seconds: string;
    };
  };
  onSave?: (taskData: {
    title: string;
    description: string;
    priority: "Low" | "Middle" | "High";
    time: { hours: string; minutes: string; seconds: string };
  }) => void;
  onDelete?: () => void;
}

export default function TaskDetail({
  isOpen,
  onClose,
  task,
  onSave,
  onDelete,
}: TaskDetailProps) {
  if (!isOpen || !task) return null;

  const [taskTitle, setTaskTitle] = useState(task.title);
  const [taskDescription, setTaskDescription] = useState(task.description);
  const [taskPriority, setTaskPriority] = useState<"Low" | "Middle" | "High">(
    task.priority
  );
  const [hours, setHours] = useState(task.time?.hours || "00");
  const [minutes, setMinutes] = useState(task.time?.minutes || "00");
  const [seconds, setSeconds] = useState(task.time?.seconds || "00");

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <button onClick={onClose} className="modal-close-button">
            ✕
          </button>
          <div className="modal-section">
            <label htmlFor="tasktitle">Title</label>
            <input
              type="text"
              id="tasktitle"
              name="tasktitle"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              placeholder="Title"
            ></input>
          </div>
        </div>
        <div className="modal-body">
          <div className="modal-section">
            <label htmlFor="taskdescription">Description</label>
            <textarea
              id="taskdescription"
              name="taskdescription"
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              placeholder="Description"
            ></textarea>
          </div>
          <div className="modal-section">
            <label htmlFor="taskpriority">Priority</label>
            <div className="priority-buttons" id="taskpriority">
              <button
                type="button"
                className={`priority-button priority-high ${
                  taskPriority === "High" ? "selected" : ""
                }`}
                onClick={() => setTaskPriority("High")}
              >
                High
              </button>
              <button
                type="button"
                className={`priority-button priority-middle ${
                  taskPriority === "Middle" ? "selected" : ""
                }`}
                onClick={() => setTaskPriority("Middle")}
              >
                Middle
              </button>
              <button
                type="button"
                className={`priority-button priority-low ${
                  taskPriority === "Low" ? "selected" : ""
                }`}
                onClick={() => setTaskPriority("Low")}
              >
                Low
              </button>
            </div>
          </div>
          <div className="modal-section">
            <label>Time</label>
            <div className="time-inputs">
              <div className="time-input-group">
                <select
                  id="hours"
                  name="hours"
                  className="time-select"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                >
                  {Array.from({ length: 24 }, (_, i) => i).map((num) => (
                    <option key={num} value={num.toString().padStart(2, "0")}>
                      {num.toString().padStart(2, "0")}
                    </option>
                  ))}
                </select>
                <span className="time-separator">:</span>
              </div>
              <div className="time-input-group">
                <select
                  id="minutes"
                  name="minutes"
                  className="time-select"
                  value={minutes}
                  onChange={(e) => setMinutes(e.target.value)}
                >
                  {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map((num) => (
                    <option key={num} value={num.toString().padStart(2, "0")}>
                      {num.toString().padStart(2, "0")}
                    </option>
                  ))}
                </select>
                <span className="time-separator">:</span>
              </div>
              <div className="time-input-group">
                <select
                  id="seconds"
                  name="seconds"
                  className="time-select"
                  value={seconds}
                  onChange={(e) => setSeconds(e.target.value)}
                >
                  {[0, 30].map((num) => (
                    <option key={num} value={num.toString().padStart(2, "0")}>
                      {num.toString().padStart(2, "0")}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="modal-button delete-button"
              onClick={() => {
                if (onDelete) {
                  onDelete();
                } else {
                  onClose();
                }
              }}
            >
              Delete
            </button>
            <button
              type="button"
              className="modal-button save-button"
              onClick={() => {
                if (onSave) {
                  onSave({
                    title: taskTitle,
                    description: taskDescription,
                    priority: taskPriority,
                    time: { hours, minutes, seconds },
                  });
                } else {
                  onClose();
                }
              }}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

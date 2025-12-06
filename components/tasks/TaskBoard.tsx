"use client";
import TaskArea from "./TaskArea";
import "../../styles/taskboard.css";

export default function TaskBoard() {
  return (
    <div className="taskboard">
      <TaskArea areaName="Todo" className="todoArea" />
      <TaskArea areaName="In Progress" className="progressArea" />
      <TaskArea areaName="Completed" className="completedArea" />
    </div>
  );
}

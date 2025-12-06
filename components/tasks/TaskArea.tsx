"use client";
import TaskCard from "./TaskCard";
import "../../styles/taskarea.css";
import Button from "../ui/Button";

interface TaskAreaProps {
  areaName: string;
  className: string;
}

export default function TaskArea({ areaName, className }: TaskAreaProps) {
  return (
    <div className="taskarea">
      <h2 className={className}>{areaName}</h2>
      <TaskCard title="タスク1" priority="High" />
      <TaskCard title="タスク2" priority="Middle" />
      <TaskCard title="タスク3" priority="Low" />
      <TaskCard title="タスク4" priority="High" />
      <TaskCard title="タスク5" priority="Middle" />
      <TaskCard title="タスク6" priority="Low" />
      <h3>
        <button className="addTaskButton" type="button">
          + Add Task
        </button>
      </h3>
    </div>
  );
}

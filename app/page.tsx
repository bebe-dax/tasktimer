import { redirect } from "next/navigation";
import TaskBoard from "@/components/tasks/TaskBoard";
import "../styles/home.css";

export default function Home() {
  return (
    <>
      <header>
        <h1 className="title">Task Board</h1>
      </header>
      <div className="task_list">
        <TaskBoard />
      </div>
    </>
  );
}

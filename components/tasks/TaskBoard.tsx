"use client";
import { useState, useEffect, useRef } from "react";
import TaskArea from "./TaskArea";
import { Task, TaskStatus } from "../../lib/types";
import { timeToSeconds, secondsToTime, areTimesEqual } from "../../lib/timeUtils";
import { PRIORITY_ORDER } from "../../lib/constants";
import "../../styles/taskboard.css";

export default function TaskBoard() {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "1",
      title: "タスク1",
      description: "タスク1の説明",
      priority: "High",
      status: "Todo",
      initialTime: { hours: "01", minutes: "30", seconds: "00" },
      time: { hours: "01", minutes: "30", seconds: "00" },
    },
    {
      id: "2",
      title: "タスク2",
      description: "タスク2の説明",
      priority: "Middle",
      status: "Todo",
      initialTime: { hours: "02", minutes: "00", seconds: "30" },
      time: { hours: "02", minutes: "00", seconds: "30" },
    },
    {
      id: "3",
      title: "タスク3",
      description: "タスク3の説明",
      priority: "Low",
      status: "In Progress",
      initialTime: { hours: "00", minutes: "40", seconds: "00" },
      time: { hours: "00", minutes: "40", seconds: "00" },
    },
    {
      id: "4",
      title: "タスク4",
      description: "タスク4の説明",
      priority: "High",
      status: "In Progress",
      initialTime: { hours: "03", minutes: "20", seconds: "30" },
      time: { hours: "03", minutes: "20", seconds: "30" },
    },
    {
      id: "5",
      title: "タスク5",
      description: "タスク5の説明",
      priority: "Middle",
      status: "Completed",
      initialTime: { hours: "00", minutes: "50", seconds: "00" },
      time: { hours: "00", minutes: "50", seconds: "00" },
    },
    {
      id: "6",
      title: "タスク6",
      description: "タスク6の説明",
      priority: "Low",
      status: "Completed",
      initialTime: { hours: "01", minutes: "10", seconds: "30" },
      time: { hours: "01", minutes: "10", seconds: "30" },
    },
  ]);

  const timerRef = useRef<{ [key: string]: NodeJS.Timeout }>({});

  const startTimer = (taskId: string) => {
    if (timerRef.current[taskId]) {
      clearInterval(timerRef.current[taskId]);
    }

    // isRunningをtrueに設定
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, isRunning: true } : task
      )
    );

    timerRef.current[taskId] = setInterval(() => {
      setTasks((prevTasks) =>
        prevTasks.map((task) => {
          if (task.id === taskId && task.status === "In Progress" && task.isRunning) {
            const currentRemaining =
              task.remainingTime ?? timeToSeconds(task.time);
            const newRemaining = currentRemaining - 1;

            if (newRemaining <= 0) {
              clearInterval(timerRef.current[taskId]);
              delete timerRef.current[taskId];
              return {
                ...task,
                status: "Completed" as const,
                remainingTime: undefined,
                time: task.initialTime, // DB保存時の初期時間に戻す
                isRunning: false,
              };
            }

            return {
              ...task,
              remainingTime: newRemaining,
              time: secondsToTime(newRemaining),
            };
          }
          return task;
        })
      );
    }, 1000);
  };

  const stopTimer = (taskId: string) => {
    if (timerRef.current[taskId]) {
      clearInterval(timerRef.current[taskId]);
      delete timerRef.current[taskId];
    }
  };

  const handleDrop = (
    taskId: string,
    newStatus: "Todo" | "In Progress" | "Completed"
  ) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) => {
        if (task.id === taskId) {
          if (newStatus === "In Progress" && task.status !== "In Progress") {
            // In Progressに移動した場合、タイマーを開始
            const remainingTime =
              task.remainingTime ?? timeToSeconds(task.time);
            setTimeout(() => startTimer(taskId), 0);
            return {
              ...task,
              status: newStatus,
              remainingTime,
            };
          } else if (
            newStatus !== "In Progress" &&
            task.status === "In Progress"
          ) {
            // In Progressから移動した場合、タイマーを停止し初期時間に戻す
            stopTimer(taskId);
            return {
              ...task,
              status: newStatus,
              remainingTime: undefined,
              time: task.initialTime,
            };
          }
          return { ...task, status: newStatus };
        }
        return task;
      })
    );
  };

  useEffect(() => {
    // 初期化時にIn Progressのタスクのタイマーを開始
    tasks.forEach((task) => {
      if (task.status === "In Progress") {
        startTimer(task.id);
      }
    });

    return () => {
      // クリーンアップ: すべてのタイマーを停止
      Object.keys(timerRef.current).forEach((taskId) => {
        clearInterval(timerRef.current[taskId]);
      });
      timerRef.current = {};
    };
  }, []);

  useEffect(() => {
    // tasksが変更されたときにタイマーの状態を同期
    tasks.forEach((task) => {
      if (task.status === "In Progress" && !timerRef.current[task.id]) {
        startTimer(task.id);
      } else if (task.status !== "In Progress" && timerRef.current[task.id]) {
        stopTimer(task.id);
      }
    });
  }, [tasks.map((t) => `${t.id}-${t.status}`).join(",")]);

  const handleAddTask = (task: Task) => {
    setTasks((prevTasks) => [...prevTasks, task]);
  };

  const handleUpdateTask = (updatedTask: Task) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) => {
        if (task.id === updatedTask.id) {
          // In Progress中に時間が変更されたかチェック
          const isInProgress = updatedTask.status === "In Progress" && task.status === "In Progress";
          const timeChanged = !areTimesEqual(updatedTask.initialTime, task.initialTime);

          if (isInProgress && timeChanged) {
            // 古いタイマーを停止
            stopTimer(updatedTask.id);

            // 新しい時間でタスクをリセット
            const resetTask = {
              ...updatedTask,
              remainingTime: undefined,
              time: { ...updatedTask.initialTime },
              isRunning: undefined,
            };

            // 新しい時間でタイマーを再開
            setTimeout(() => startTimer(updatedTask.id), 0);
            return resetTask;
          }
          return updatedTask;
        }
        return task;
      })
    );
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
  };

  const handleToggleTimer = (taskId: string) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) => {
        if (task.id === taskId && task.status === "In Progress") {
          if (task.isRunning) {
            // 停止する
            stopTimer(taskId);
            return { ...task, isRunning: false };
          } else {
            // 再開する
            setTimeout(() => startTimer(taskId), 0);
            return task;
          }
        }
        return task;
      })
    );
  };

  const sortTasks = (tasksToSort: Task[]) => {
    return tasksToSort.sort((a, b) => {
      const priorityDiff =
        PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
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
        onToggleTimer={handleToggleTimer}
      />
      <TaskArea
        areaName="In Progress"
        className="progressArea"
        tasks={sortTasks(tasks.filter((task) => task.status === "In Progress"))}
        onDrop={handleDrop}
        onAddTask={handleAddTask}
        onUpdateTask={handleUpdateTask}
        onDeleteTask={handleDeleteTask}
        onToggleTimer={handleToggleTimer}
      />
      <TaskArea
        areaName="Completed"
        className="completedArea"
        tasks={sortTasks(tasks.filter((task) => task.status === "Completed"))}
        onDrop={handleDrop}
        onAddTask={handleAddTask}
        onUpdateTask={handleUpdateTask}
        onDeleteTask={handleDeleteTask}
        onToggleTimer={handleToggleTimer}
      />
    </div>
  );
}

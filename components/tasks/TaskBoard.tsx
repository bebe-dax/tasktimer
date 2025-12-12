"use client";
import { useState, useEffect, useRef } from "react";
import TaskArea from "./TaskArea";
import { Task, TaskStatus } from "../../lib/types";
import {
  timeToSeconds,
  secondsToTime,
  areTimesEqual,
} from "../../lib/timeUtils";
import { PRIORITY_ORDER } from "../../lib/constants";
import "../../styles/taskboard.css";
import { db } from "../../lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { mapFirestoreTaskToApp } from "../../lib/firestoreMapper";
import type { FirestoreTask } from "../../lib/types";
import {
  addTaskToFirestore,
  updateTaskInFirestore,
  deleteTaskFromFirestore,
} from "../../lib/firestoreOperations";
import { useAuth } from "../../contexts/AuthContext";

export default function TaskBoard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const { user } = useAuth();

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
          if (
            task.id === taskId &&
            task.status === "In Progress" &&
            task.isRunning
          ) {
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

  const handleDrop = async (
    taskId: string,
    newStatus: "Todo" | "In Progress" | "Completed"
  ) => {
    // ローカルステートを更新
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

    // Firestoreを更新（非同期で実行）
    if (!user) return;

    try {
      const taskToUpdate = tasks.find((t) => t.id === taskId);
      if (taskToUpdate) {
        await updateTaskInFirestore(
          { ...taskToUpdate, status: newStatus },
          user.uid
        );
      }
    } catch (error) {
      console.error("ステータス更新の保存に失敗しました:", error);
      // エラーが発生してもUIは更新済みなので、ユーザーには通知のみ
      alert("ステータスの保存に失敗しましたが、再読み込み時に元に戻ります。");
    }
  };

  // Firestoreからデータを取得（初回のみ）
  useEffect(() => {
    const fetchTasks = async () => {
      if (!user) return;

      try {
        console.log("Firestoreからタスクを取得中...");
        // 現在のユーザーのタスクのみ取得
        const q = query(
          collection(db, "tasks"),
          where("userId", "==", user.uid)
        );
        const querySnapshot = await getDocs(q);
        console.log("取得したドキュメント数:", querySnapshot.size);

        const fetchedTasks = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          console.log("ドキュメントID:", doc.id, "生データ:", data);

          // FirestoreのデータをFirestoreTask型として扱い、アプリケーション用のTask型に変換
          const firestoreTask: FirestoreTask = {
            id: doc.id,
            title: data.title,
            description: data.description,
            priority: data.priority,
            status: data.status,
            minutes: data.minutes,
            seconds: data.seconds,
            userId: data.userId,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
          };

          // マッピング関数を使用してアプリケーション用のTask型に変換
          const task = mapFirestoreTaskToApp(firestoreTask);
          console.log("変換後のタスク:", task);
          return task;
        });

        console.log("取得したタスク一覧:", fetchedTasks);
        console.log("タスク数:", fetchedTasks.length);

        // データがあれば無条件でセット（空配列でもOK）
        setTasks(fetchedTasks);
      } catch (error) {
        console.error("Firestoreからのデータ取得エラー:", error);
      }
    };

    fetchTasks();
  }, []);

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

  const handleAddTask = async (task: Task) => {
    if (!user) return;

    try {
      // Firestoreに追加
      const newTaskId = await addTaskToFirestore(
        {
          title: task.title,
          description: task.description,
          priority: task.priority,
          status: task.status,
          initialTime: task.initialTime,
          time: task.time,
        },
        user.uid
      );

      // ローカルステートに追加（IDを付与）
      const newTask = { ...task, id: newTaskId };
      setTasks((prevTasks) => [...prevTasks, newTask]);
    } catch (error) {
      console.error("タスクの追加に失敗しました:", error);
      alert("タスクの追加に失敗しました。");
    }
  };

  const handleUpdateTask = async (updatedTask: Task) => {
    if (!user) return;

    try {
      // Firestoreを更新
      await updateTaskInFirestore(updatedTask, user.uid);

      // ローカルステートを更新
      setTasks((prevTasks) =>
        prevTasks.map((task) => {
          if (task.id === updatedTask.id) {
            // In Progress中に時間が変更されたかチェック
            const isInProgress =
              updatedTask.status === "In Progress" &&
              task.status === "In Progress";
            const timeChanged = !areTimesEqual(
              updatedTask.initialTime,
              task.initialTime
            );

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
    } catch (error) {
      console.error("タスクの更新に失敗しました:", error);
      alert("タスクの更新に失敗しました。");
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      // Firestoreから削除
      await deleteTaskFromFirestore(taskId);

      // ローカルステートから削除
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));

      // タイマーが動いていれば停止
      if (timerRef.current[taskId]) {
        stopTimer(taskId);
      }
    } catch (error) {
      console.error("タスクの削除に失敗しました:", error);
      alert("タスクの削除に失敗しました。");
    }
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

import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import { Task } from "./types";
import { mapAppTaskToFirestore } from "./firestoreMapper";

/**
 * Firestoreに新しいタスクを追加
 * @param task - 追加するタスク（idは自動生成されるため不要）
 * @param userId - ユーザーID
 * @returns 作成されたタスクのID
 */
export async function addTaskToFirestore(
  task: Omit<Task, "id">,
  userId: string
): Promise<string> {
  try {
    // アプリケーションのTask型をFirestore形式に変換
    const firestoreData = mapAppTaskToFirestore(
      { ...task, id: "" } as Task,
      userId
    );

    // Firestoreに追加（タイムスタンプを自動設定）
    const docRef = await addDoc(collection(db, "tasks"), {
      ...firestoreData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    console.log("タスクを追加しました。ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("タスク追加エラー:", error);
    throw error;
  }
}

/**
 * Firestoreのタスクを更新
 * @param task - 更新するタスク（idを含む）
 * @param userId - ユーザーID
 */
export async function updateTaskInFirestore(
  task: Task,
  userId: string
): Promise<void> {
  try {
    // アプリケーションのTask型をFirestore形式に変換
    const firestoreData = mapAppTaskToFirestore(task, userId);

    // Firestoreのドキュメント参照を取得
    const taskRef = doc(db, "tasks", task.id);

    // 更新（updatedAtタイムスタンプを自動設定）
    await updateDoc(taskRef, {
      ...firestoreData,
      updatedAt: serverTimestamp(),
    });

    console.log("タスクを更新しました。ID:", task.id);
  } catch (error) {
    console.error("タスク更新エラー:", error);
    throw error;
  }
}

/**
 * Firestoreからタスクを削除
 * @param taskId - 削除するタスクのID
 */
export async function deleteTaskFromFirestore(taskId: string): Promise<void> {
  try {
    // Firestoreのドキュメント参照を取得
    const taskRef = doc(db, "tasks", taskId);

    // 削除
    await deleteDoc(taskRef);

    console.log("タスクを削除しました。ID:", taskId);
  } catch (error) {
    console.error("タスク削除エラー:", error);
    throw error;
  }
}
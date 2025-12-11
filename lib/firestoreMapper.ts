import { Task, FirestoreTask, Priority, TaskStatus } from "./types";

/**
 * Firestoreの優先度文字列をアプリケーションのPriority型に変換
 * @param firestorePriority - "1" (High), "2" (Middle), "3" (Low)
 * @returns Priority型の値
 */
export function mapFirestorePriorityToApp(firestorePriority: string): Priority {
  switch (firestorePriority) {
    case "1":
      return "High";
    case "2":
      return "Middle";
    case "3":
      return "Low";
    default:
      console.warn(`未知の優先度: ${firestorePriority}, デフォルトで"Low"を使用`);
      return "Low";
  }
}

/**
 * アプリケーションのPriority型をFirestoreの文字列に変換
 * @param appPriority - Priority型の値
 * @returns "1" (High), "2" (Middle), "3" (Low)
 */
export function mapAppPriorityToFirestore(appPriority: Priority): string {
  switch (appPriority) {
    case "High":
      return "1";
    case "Middle":
      return "2";
    case "Low":
      return "3";
  }
}

/**
 * Firestoreのステータス文字列をアプリケーションのTaskStatus型に変換
 * @param firestoreStatus - "1" (Todo), "2" (In Progress), "3" (Completed)
 * @returns TaskStatus型の値
 */
export function mapFirestoreStatusToApp(firestoreStatus: string): TaskStatus {
  switch (firestoreStatus) {
    case "1":
      return "Todo";
    case "2":
      return "In Progress";
    case "3":
      return "Completed";
    default:
      console.warn(`未知のステータス: ${firestoreStatus}, デフォルトで"Todo"を使用`);
      return "Todo";
  }
}

/**
 * アプリケーションのTaskStatus型をFirestoreの文字列に変換
 * @param appStatus - TaskStatus型の値
 * @returns "1" (Todo), "2" (In Progress), "3" (Completed)
 */
export function mapAppStatusToFirestore(appStatus: TaskStatus): string {
  switch (appStatus) {
    case "Todo":
      return "1";
    case "In Progress":
      return "2";
    case "Completed":
      return "3";
  }
}

/**
 * FirestoreTaskをアプリケーション用のTask型に変換
 * @param firestoreTask - Firestoreから取得したタスクデータ
 * @returns アプリケーション内部で使用するTask型
 */
export function mapFirestoreTaskToApp(firestoreTask: FirestoreTask): Task {
  const totalSeconds = firestoreTask.minutes * 60 + firestoreTask.seconds;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  const timeObject = {
    hours: "00",
    minutes: minutes.toString().padStart(2, "0"),
    seconds: seconds.toString().padStart(2, "0"),
  };

  return {
    id: firestoreTask.id,
    title: firestoreTask.title,
    description: firestoreTask.description,
    priority: mapFirestorePriorityToApp(firestoreTask.priority),
    status: mapFirestoreStatusToApp(firestoreTask.status),
    initialTime: timeObject,
    time: timeObject,
    remainingTime: undefined,
    isRunning: false,
  };
}

/**
 * アプリケーションのTask型をFirestore保存用のデータに変換
 * @param task - アプリケーション内部のTask型
 * @param userId - ユーザーID
 * @returns Firestoreに保存する形式のオブジェクト
 */
export function mapAppTaskToFirestore(
  task: Task,
  userId: string
): Omit<FirestoreTask, "id" | "createdAt" | "updatedAt"> {
  const totalSeconds =
    parseInt(task.initialTime.hours) * 3600 +
    parseInt(task.initialTime.minutes) * 60 +
    parseInt(task.initialTime.seconds);

  return {
    title: task.title,
    description: task.description,
    priority: mapAppPriorityToFirestore(task.priority),
    status: mapAppStatusToFirestore(task.status),
    minutes: Math.floor(totalSeconds / 60),
    seconds: totalSeconds % 60,
    userId,
  };
}
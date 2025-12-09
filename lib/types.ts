// タスクの優先度レベル
export type Priority = "Low" | "Middle" | "High";

// タスクのステータス
export type TaskStatus = "Todo" | "In Progress" | "Completed";

// 時間オブジェクトの構造（時、分、秒）
export interface Time {
  hours: string;
  minutes: string;
  seconds: string;
}

// タスクインターフェース
export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: TaskStatus;
  // タスクの初期時間（変更されない）
  initialTime: Time;
  // 現在の表示時間（カウントダウン中に変化する）
  time?: Time;
  // タイマーの残り時間（秒単位）
  remainingTime?: number;
  // タイマーが現在実行中かどうか
  isRunning?: boolean;
}
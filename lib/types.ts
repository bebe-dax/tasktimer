import { Timestamp } from "firebase/firestore";

// タスクの優先度レベル（アプリケーション用）
export type Priority = "Low" | "Middle" | "High";

// タスクのステータス（アプリケーション用）
export type TaskStatus = "Todo" | "In Progress" | "Completed";

// 時間オブジェクトの構造（時、分、秒）
export interface Time {
  hours: string;
  minutes: string;
  seconds: string;
}

// タスクインターフェース（アプリケーション内部で使用）
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

// Firestoreに保存されているタスクの型定義
export interface FirestoreTask {
  id: string;
  title: string;
  description: string;
  priority: string; // "1" (High), "2" (Middle), "3" (Low)
  status: string; // "1" (Todo), "2" (In Progress), "3" (Completed)
  minutes: number;
  seconds: number;
  userId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Firestoreに保存されているユーザーの型定義
export interface FirestoreUser {
  uid: string; // Firebase AuthenticationのUID（ドキュメントID）
  email: string; // メールアドレス
  displayName: string; // 表示名
  createdAt: Timestamp; // アカウント作成日時
  updatedAt: Timestamp; // 最終更新日時
  lastLoginAt: Timestamp; // 最終ログイン日時
}
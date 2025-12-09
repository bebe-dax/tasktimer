import { Priority } from "./types";

// タイマーの間隔（ミリ秒）
export const TIMER_INTERVAL = 1000;

// デフォルトの時間
export const DEFAULT_TIME = {
  hours: "00",
  minutes: "00",
  seconds: "00",
} as const;

// ソート用の優先度順序（数値が小さいほど優先度が高い）
export const PRIORITY_ORDER: Record<Priority, number> = {
  High: 0,
  Middle: 1,
  Low: 2,
};

// タスクステータスの値
export const TASK_STATUS = {
  TODO: "Todo",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
} as const;
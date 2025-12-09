import { Time } from "./types";

/**
 * 時間オブジェクトを総秒数に変換
 * 注: このアプリケーションでは時間は常に"00"なので無視される
 */
export function timeToSeconds(time?: Time): number {
  if (!time) return 0;
  return parseInt(time.minutes) * 60 + parseInt(time.seconds);
}

/**
 * 秒数を時間オブジェクトに変換
 * このアプリでは分と秒のみ使用するため、時間は常に"00"
 */
export function secondsToTime(seconds: number): Time {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return {
    hours: "00",
    minutes: minutes.toString().padStart(2, "0"),
    seconds: secs.toString().padStart(2, "0"),
  };
}

/**
 * 2つの時間オブジェクトが等しいか比較
 */
export function areTimesEqual(time1: Time, time2: Time): boolean {
  return (
    time1.hours === time2.hours &&
    time1.minutes === time2.minutes &&
    time1.seconds === time2.seconds
  );
}
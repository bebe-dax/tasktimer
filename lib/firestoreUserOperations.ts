import { db } from "./firebase";
import { doc, setDoc, getDoc, updateDoc, Timestamp } from "firebase/firestore";
import type { FirestoreUser } from "./types";

/**
 * Firestoreにユーザードキュメントを作成
 * @param uid - Firebase AuthenticationのUID
 * @param email - メールアドレス
 * @param displayName - 表示名（省略時はメールアドレスから生成）
 */
export async function createUserDocument(
  uid: string,
  email: string,
  displayName?: string
): Promise<void> {
  const userRef = doc(db, "users", uid);

  // 既にドキュメントが存在するかチェック
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    console.log("ユーザードキュメントは既に存在します");
    return;
  }

  const userData: FirestoreUser = {
    uid,
    email,
    displayName: displayName || email.split("@")[0], // メールアドレスから仮の名前を生成
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    lastLoginAt: Timestamp.now(),
  };

  await setDoc(userRef, userData);
  console.log("ユーザードキュメントを作成しました:", uid);
}

/**
 * Firestoreからユーザー情報を取得
 * @param uid - Firebase AuthenticationのUID
 * @returns FirestoreUserオブジェクト、存在しない場合はnull
 */
export async function getUserDocument(
  uid: string
): Promise<FirestoreUser | null> {
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    return userSnap.data() as FirestoreUser;
  }

  console.log("ユーザードキュメントが見つかりません:", uid);
  return null;
}

/**
 * ユーザー情報を更新
 * @param uid - Firebase AuthenticationのUID
 * @param updates - 更新するフィールド
 */
export async function updateUserDocument(
  uid: string,
  updates: Partial<Omit<FirestoreUser, "uid" | "createdAt">>
): Promise<void> {
  const userRef = doc(db, "users", uid);

  await updateDoc(userRef, {
    ...updates,
    updatedAt: Timestamp.now(),
  });

  console.log("ユーザードキュメントを更新しました:", uid);
}

/**
 * 最終ログイン日時を更新
 * @param uid - Firebase AuthenticationのUID
 */
export async function updateLastLogin(uid: string): Promise<void> {
  const userRef = doc(db, "users", uid);

  try {
    await updateDoc(userRef, {
      lastLoginAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    console.log("最終ログイン日時を更新しました:", uid);
  } catch (error) {
    console.error("最終ログイン日時の更新に失敗しました:", error);
    // エラーが発生してもアプリの動作は継続
  }
}
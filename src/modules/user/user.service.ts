// src/modules/user/user.service.ts
interface User {
  id: number;
  name: string;
}

const users: User[] = [];

// ユーザー一覧取得
export const fetchUsers = async (): Promise<User[]> => {
  return users;
};

// ユーザー追加
export const createUser = async (name: string): Promise<User> => {
  const trimmedName = name.trim(); // 空白除去

  // id は配列長 + 1
  const id = users.length + 1;

  const newUser: User = { id, name: trimmedName };
  users.push(newUser);
  return newUser;
};
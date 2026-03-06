import prisma from "../../utils/prisma";

// ユーザー一覧取得
export const fetchUsers = async () => {
  return prisma.user.findMany();
};

// ユーザー追加
export const createUser = async (name: string) => {
  return prisma.user.create({
    data: { name },
  }); 
  };

export const updateUser = async (id: number, name: string) =>{
  return prisma.user.update({
    data: { name: name.trim(),},
    where: {
      id: id,
    },
  });
};

export const deleteUser = async (id: number) => {
  return prisma.user.delete({
    where: {
      id: id,
    },
  });
};
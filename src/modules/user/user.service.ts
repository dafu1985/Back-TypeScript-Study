import prisma from "../../utils/prisma";

// ユーザー一覧取得
export const fetchUsers = async () => {
  return prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      // password は含めない
    },
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
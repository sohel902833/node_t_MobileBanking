import User from "../../models/user.model";

export const updateUserBalance = async (id: string, balance: number) => {
  return User.findOneAndUpdate({ _id: id }, { balance: balance.toFixed(3) });
};
export const getUser = async (filter: any) => {
  return User.findOne(filter);
};

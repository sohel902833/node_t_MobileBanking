import MainAccount from "../../models/mainaccount.model";

export const updateMainAccountBalance = async (
  id: string,
  balance: number,
  trId: string
) => {
  return MainAccount.findOneAndUpdate(
    { _id: id },
    {
      balance: balance.toFixed(3),
      $push: { transections: { transection: trId } },
    }
  );
};

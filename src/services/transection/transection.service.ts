import { getRandomNumber } from "../../lib/randomGenerator";
import Transection, {
  CASHIN_TRANSECTION_TYPE,
  CASHOUT_TRANSECTION_TYPE,
  ITransection,
} from "../../models/transection.model";

export const createTransection = async (transection: ITransection) => {
  const newTransection = new Transection(transection);
  return newTransection.save();
};
export const createManyTransections = async (transections: ITransection[]) => {
  return Transection.insertMany(transections);
};

export const generateTransection = (
  amount: number,
  isCashIn: boolean,
  type: string,
  userId: string
): ITransection => {
  const newTr: ITransection = {
    amount: amount,
    transectionType: isCashIn
      ? CASHIN_TRANSECTION_TYPE
      : CASHOUT_TRANSECTION_TYPE,
    text: type,
    trxId: new Date().getTime().toString() + getRandomNumber(),
    user: userId,
  };
  return newTr;
};

import { getRandomNumber } from "../../lib/randomGenerator";
import Transection, { ITransection } from "../../models/transection.model";
import { TransectionTypes } from "./../../models/transection.model";

export const createTransection = async (transection: ITransection) => {
  const newTransection = new Transection(transection);
  return newTransection.save();
};
export const createManyTransections = async (transections: ITransection[]) => {
  return Transection.insertMany(transections);
};

export const generateTransection = ({
  amount,
  transectionType,
  description,
  senderUserId,
  receiverUserId,
  senderUserType,
  receiverUserType,
}: {
  amount: number;
  transectionType: TransectionTypes;
  description: string;
  senderUserId: string;
  receiverUserId: string;
  senderUserType: string;
  receiverUserType: string;
}): ITransection => {
  const newTr: ITransection = {
    amount: amount,
    transectionType: transectionType,
    description: description,
    trxId: new Date().getTime().toString() + getRandomNumber(),
    senderUser: senderUserId,
    receiverUser: receiverUserId,
    senderUserType: senderUserType,
    receiverUserType: receiverUserType,
  };
  return newTr;
};

import moment from "moment";
import User from "../../models/user.model";
const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const getAllUsersSignupHistoryForYear = (
  y: string,
  userType: string
) => {
  const year = Number(y);
  const startDate = new Date(year, 0, 1); // January 1st of the specified year
  const endDate = new Date(year + 1, 0, 1); // January 1st of the next year

  const matchStage: any = {
    createdAt: { $gte: startDate, $lt: endDate },
  };
  if (userType !== "all") {
    matchStage.userType = userType;
  }
  return User.aggregate([
    {
      $match: matchStage,
    },
    {
      $group: {
        _id: { $month: "$createdAt" },
        count: { $sum: 1 },
        users: {
          $push: {
            firstName: "$firstName",
            registaredAt: "$createdAt",
            lastName: "$lastName",
            email: "$email",
            userType: "$userType",
            _id: "$_id",
          },
        },
      },
    },
    {
      $sort: {
        _id: 1,
      },
    },
    {
      $project: {
        _id: 0,
        name: {
          $arrayElemAt: [monthNames, { $subtract: ["$_id", 1] }],
        },
        count: 1,
        users: 1,
      },
    },
  ]);
};

export const getAllUsersSignupHistoryForMonth = (
  y: string,
  m: string,
  userType: string
) => {
  const year = Number(y);
  const month = Number(m);
  const startDate = new Date(year, month - 1, 1); // Start of the specified month
  const endDate = new Date(year, month, 0); // End of the specified month
  const matchStage: any = {
    createdAt: { $gte: startDate, $lt: endDate },
  };
  if (userType !== "all") {
    matchStage.userType = userType;
  }
  return User.aggregate([
    {
      $match: matchStage,
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
        },

        // _id: { $month: "$createdAt" },
        count: { $sum: 1 },
        users: {
          $push: {
            firstName: "$firstName",
            registaredAt: "$createdAt",
            lastName: "$lastName",
            email: "$email",
            userType: "$userType",
            _id: "$_id",
          },
        },
      },
    },
    {
      $sort: {
        _id: 1,
      },
    },
    {
      $project: {
        _id: 0,
        month: 1,
        count: 1,
        users: 1,
        name: "$_id",
      },
    },
  ]);
};

export const getAllUsersSignupHistoryForDate = (
  date: string,
  userType: string
) => {
  const startDate = moment(date).startOf("day").toDate();
  const endDate = moment(date).endOf("day").toDate();

  const matchStage: any = {
    createdAt: { $gte: startDate, $lt: endDate },
  };
  if (userType !== "all") {
    matchStage.userType = userType;
  }
  return User.aggregate([
    {
      $match: matchStage,
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: "%Y-%m-%d %H:00:00",
            date: "$createdAt",
          },
        },
        count: { $sum: 1 },
        users: {
          $push: {
            firstName: "$firstName",
            registaredAt: "$createdAt",
            lastName: "$lastName",
            email: "$email",
            userType: "$userType",
            _id: "$_id",
          },
        },
      },
    },
    {
      $sort: {
        _id: 1,
      },
    },
    {
      $project: {
        _id: 0,
        month: 1,
        count: 1,
        users: 1,
        name: "$_id",
      },
    },
  ]);
};
export const getAllUsersSignupHistoryForDateRange = (
  stDate: string,
  enDate: string,
  userType: string
) => {
  const startDate = moment(stDate).startOf("day").toDate();
  const endDate = moment(enDate).endOf("day").toDate();
  const matchStage: any = {
    createdAt: { $gte: startDate, $lt: endDate },
  };
  if (userType !== "all") {
    matchStage.userType = userType;
  }
  return User.aggregate([
    {
      $match: matchStage,
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
        },
        count: { $sum: 1 },
        users: {
          $push: {
            firstName: "$firstName",
            registaredAt: "$createdAt",
            lastName: "$lastName",
            email: "$email",
            userType: "$userType",
            _id: "$_id",
          },
        },
      },
    },
    {
      $sort: {
        _id: 1,
      },
    },
    {
      $project: {
        _id: 0,
        month: 1,
        count: 1,
        users: 1,
        name: "$_id",
      },
    },
  ]);
};

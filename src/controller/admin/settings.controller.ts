import { NextFunction, Response } from "express";
import Settings, { ISettings } from "../../models/settings.model";
import { IRequest } from "../../types/express";

export const validateSettingsInfo = (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  const {
    sendMoneyCharge,
    cashoutCharge,
    registrationBonous,
    agentCashoutProfit,
  } = req.body as ISettings;
  const newErrors: any = {};
  if (!sendMoneyCharge && sendMoneyCharge !== 0) {
    newErrors.sendMoneyCharge = "Please enter send money charge";
  }
  if (!cashoutCharge && cashoutCharge !== 0) {
    newErrors.cashoutCharge = "Please enter cashout charge";
  }
  if (!registrationBonous && registrationBonous !== 0) {
    newErrors.registrationBonous = "Please enter registration bonous";
  }
  if (!agentCashoutProfit && agentCashoutProfit !== 0) {
    newErrors.agentCashoutProfit = "Please enter agent cashout profit amount";
  }

  Object.keys(req.body).forEach((key) => {
    if (Number(req.body[key]) < 0) {
      newErrors[key] = "Invalid Input";
    }
  });

  if (Object.keys(newErrors).length > 0) {
    return res.status(200).json({
      message: "Missing Information",
      success: false,
      errors: newErrors,
    });
  } else {
    next();
  }
};

const settingsPublicValue = {
  sendMoneyCharge: 1,
  cashoutCharge: 1,
  registrationBonous: 1,
  agentCashoutProfit: 1,
  _id: 0,
};

export const updateSettingsInfo = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    let {
      sendMoneyCharge,
      cashoutCharge,
      registrationBonous,
      agentCashoutProfit,
    } = req.body as ISettings;

    sendMoneyCharge = Number(sendMoneyCharge);
    cashoutCharge = Number(cashoutCharge);
    registrationBonous = Number(registrationBonous);
    agentCashoutProfit = Number(agentCashoutProfit);

    const prevSettings = await Settings.find();
    if (prevSettings.length > 0) {
      //need to update settings
      const settingsId = await prevSettings[0]?._id;
      await Settings.findOneAndUpdate(
        { _id: settingsId },
        {
          sendMoneyCharge,
          cashoutCharge,
          registrationBonous,
          agentCashoutProfit,
        }
      );
      return res.status(201).json({
        message: "Settings Updated Successfully",
        success: true,
      });
    } else {
      //need to crete settings

      const newSettings = new Settings({
        cashoutCharge,
        registrationBonous,
        sendMoneyCharge,
        agentCashoutProfit,
      });

      await newSettings.save();

      return res.status(201).json({
        message: "Settings Updated Successfully",
        success: true,
      });
    }
  } catch (err) {
    res.status(404).json({
      message: "Session timeout.",
      error: err,
    });
  }
};

export const getSettingsInfo = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const prevSettings = await Settings.find({}, settingsPublicValue);
    if (prevSettings.length > 0) {
      //need to update settings

      return res.status(201).json({
        settings: prevSettings[0],
        success: true,
      });
    } else {
      //need to crete settings

      const newSettings = new Settings({
        cashoutCharge: 0,
        registrationBonous: 0,
        sendMoneyCharge: 0,
        agentCashoutProfit: 0,
      });

      await newSettings.save();
      const settings = await Settings.find({}, settingsPublicValue);

      return res.status(201).json({
        settings: settings[0],
        success: true,
      });
    }
  } catch (err) {
    res.status(404).json({
      message: "Session timeout.",
      error: err,
    });
  }
};

export const pushSettingsToReq = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const prevSettings = await Settings.find({}, settingsPublicValue);
    if (prevSettings?.length > 0) {
      req.appSetting = prevSettings[0];
      next();
    } else {
      res.status(200).json({
        success: false,
        message: "Settings missing.",
      });
    }
  } catch (err) {
    res.status(404).json({
      message: "Session timeout.",
      error: err,
    });
  }
};

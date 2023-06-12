export interface DashboardDataType {
  totalUser: number;
  totalUserBalance: number;
  totalAgentCount: number;
  totalAgentBalance: number;
  totalAdminCount: number;
  mainAccountBalance: number;
  totalAdminCashIn: number;
}

export interface IUserStatsItem {
  count: number;
  balanceSum: number;
  userType: "user" | "agent" | "admin";
}

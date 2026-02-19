
export interface CalculatorInputs {
  workerSalary: number;      // S_worker
  smzTaxEnabled: boolean;    // T_smz
  overheadPercent: number;   // C_overhead
  managerPercent: number;    // M_manager
  deptHeadSalary: number;    // M_head
  profitPercent: number;     // P_profit
  shiftHours: number;        // H_shift
}

export interface CalculationResult {
  pricePerHour: number;
  pricePerShift: number;
  grossProfitPerShift: number;
  breakdown: {
    workerTotal: number;
    overhead: number;
    staffTotal: number;
    netProfit: number;
    workerPercent: number;
    overheadPercent: number;
    staffPercent: number;
    profitPercent: number;
  };
}

export interface SavedCalculation {
  id: string;
  name: string;
  inputs: CalculatorInputs;
  result: CalculationResult;
  timestamp: number;
}

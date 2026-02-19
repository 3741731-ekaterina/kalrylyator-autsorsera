
import { CalculatorInputs, CalculationResult } from '../types';

export const calculateOutsourcingRate = (inputs: CalculatorInputs): CalculationResult => {
  const {
    workerSalary,
    smzTaxEnabled,
    overheadPercent,
    managerPercent,
    deptHeadSalary,
    profitPercent,
    shiftHours
  } = inputs;

  // S_smz = S_worker * 0.06 (если налог включен)
  const smzTax = smzTaxEnabled ? workerSalary * 0.06 : 0;
  
  // S_manager = S_worker * (M_manager / 100)
  const managerSalary = workerSalary * (managerPercent / 100);

  // Price = (S_worker + S_smz + S_manager + M_head) / (1 - (C_overhead/100) - (P_profit/100))
  const directCosts = workerSalary + smzTax + managerSalary + deptHeadSalary;
  const divisor = 1 - (overheadPercent / 100) - (profitPercent / 100);
  
  // Guard against division by zero (e.g. overhead + profit >= 100%)
  const pricePerHour = divisor > 0 ? directCosts / divisor : 0;
  
  const pricePerShift = pricePerHour * shiftHours;
  const grossProfitPerShift = pricePerShift * (profitPercent / 100);

  // Details for breakdown
  const workerTotal = workerSalary + smzTax;
  const staffTotal = managerSalary + deptHeadSalary;
  const overheadAmount = pricePerHour * (overheadPercent / 100);
  const netProfitAmount = pricePerHour * (profitPercent / 100);

  return {
    pricePerHour,
    pricePerShift,
    grossProfitPerShift,
    breakdown: {
      workerTotal,
      overhead: overheadAmount,
      staffTotal,
      netProfit: netProfitAmount,
      workerPercent: pricePerHour > 0 ? (workerTotal / pricePerHour) * 100 : 0,
      overheadPercent: pricePerHour > 0 ? (overheadAmount / pricePerHour) * 100 : 0,
      staffPercent: pricePerHour > 0 ? (staffTotal / pricePerHour) * 100 : 0,
      profitPercent: pricePerHour > 0 ? (netProfitAmount / pricePerHour) * 100 : 0,
    }
  };
};

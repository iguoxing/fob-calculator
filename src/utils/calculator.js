/**
 * FOB报价计算器 - 计算逻辑模块
 * 中道之星 ZDSTAR Auto
 */

/** 默认输入值 */
export const DEFAULT_VALUES = {
  guidePrice: 222800,
  discount: 49000,
  logistics: 1100,
  profit: 600,
  portCharge: 400,
  exchangeRate: 6.75,
};

/** 增值税率 */
const VAT_RATE = 0.13;

/** 消费税率 */
const CONSUMPTION_TAX_RATE = 0.05;

/** 改装基础费 */
const MODIFICATION_BASE_FEE = 500;

/**
 * 执行FOB报价全链路计算
 * @param {object} inputs - 用户输入值
 * @param {number} inputs.guidePrice - 主机厂指导价（￥）
 * @param {number} inputs.discount - 优惠价（￥）
 * @param {number} inputs.logistics - 首段物流+二段物流+刷机（￥）
 * @param {number} inputs.profit - 利润（$）
 * @param {number} inputs.portCharge - 港杂+装箱（$）
 * @param {number} inputs.exchangeRate - 美元汇率
 * @returns {object} 计算结果
 */
export function calculate(inputs) {
  const {
    guidePrice,
    discount,
    logistics,
    profit,
    portCharge,
    exchangeRate,
  } = inputs;

  // 优惠后报价 = 指导价 - 优惠价
  const priceAfterDiscount = guidePrice - discount;

  // 可退税金额 = 优惠后报价 / 1.13 * 0.13
  const taxRefund = priceAfterDiscount / (1 + VAT_RATE) * VAT_RATE;

  // 不含税车辆成本 = 优惠后报价 - 可退税金额
  const costExclTax = priceAfterDiscount - taxRefund;

  // 改装费 = 优惠后报价 * 5% + 500
  const modificationFee = priceAfterDiscount * CONSUMPTION_TAX_RATE + MODIFICATION_BASE_FEE;

  // 最终报价($FOB) = (不含税车辆成本 + 改装费 + 物流) / 汇率 + 利润 + 港杂
  const totalCostCNY = costExclTax + modificationFee + logistics;
  const totalCostUSD = totalCostCNY / exchangeRate;
  const fobPrice = totalCostUSD + profit + portCharge;

  return {
    priceAfterDiscount,
    taxRefund,
    costExclTax,
    modificationFee,
    totalCostCNY,
    totalCostUSD,
    fobPrice,
  };
}

/**
 * 格式化数字为千分位字符串
 * @param {number} value - 数值
 * @param {number} decimals - 小数位数，默认2
 * @returns {string} 千分位格式字符串
 */
export function formatNumber(value, decimals = 2) {
  if (value === null || value === undefined || isNaN(value)) {
    return '0.00';
  }
  return value.toLocaleString('zh-CN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * 解析千分位格式字符串为数字
 * @param {string} str - 千分位格式字符串
 * @returns {number} 数值
 */
export function parseFormattedNumber(str) {
  if (!str) return 0;
  const cleaned = String(str).replace(/,/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

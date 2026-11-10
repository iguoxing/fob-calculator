/**
 * FOB / CIF 汽车出口报价逻辑。
 * 与 FOB汽车出口价格计算器_新图片验证版.xlsx 口径一致。
 * 提醒：退税按含税价拆分仅为估算，实际退税须依法核实。
 */
export const DEFAULT_VALUES = Object.freeze({
  guidePrice: 149800,
  discount: 38000,
  vatRate: 13,
  modificationFee: 6090,
  logistics: 8300,
  profit: 200,
  portCharge: 44.4,
  exchangeRate: 6.72,
  oceanFreight: 1300,
  insuranceRate: 0.4,
});

export const EXAMPLES = Object.freeze({
  latest: Object.freeze({ ...DEFAULT_VALUES }),
  original: Object.freeze({
    ...DEFAULT_VALUES,
    guidePrice: 159800,
    discount: 48000,
    modificationFee: 7208,
  }),
});

const round2 = (value) => Math.round((value + Number.EPSILON) * 100) / 100;

function requireNonnegative(name, value) {
  if (value === '' || value == null || !Number.isFinite(Number(value)) || Number(value) < 0) {
    throw new Error(name + '必须为非负数字');
  }
  return Number(value);
}

/**
 * 输入为单台车辆报价参数，返回所有 Excel 计算中间项。
 * 修改费是人工录入的含税费总额，不在此重复乘以 5% / 6% 或再加 500。
 */
export function calculate(inputs) {
  const guidePrice = requireNonnegative('指导价', inputs.guidePrice);
  const discount = requireNonnegative('优惠金额', inputs.discount);
  const vatRate = requireNonnegative('示例税率', inputs.vatRate);
  const modificationFee = requireNonnegative('改装费', inputs.modificationFee);
  const logistics = requireNonnegative('物流刷机费', inputs.logistics);
  const profit = requireNonnegative('美元利润', inputs.profit);
  const portCharge = requireNonnegative('港杂装箱费', inputs.portCharge);
  const exchangeRate = requireNonnegative('美元汇率', inputs.exchangeRate);

  if (discount > guidePrice) throw new Error('优惠金额不能高于指导价');
  if (exchangeRate <= 0) throw new Error('美元汇率必须大于 0');
  if (vatRate > 100) throw new Error('示例税率不能超过 100%');

  const priceAfterDiscount = round2(guidePrice - discount);
  // Excel: ROUND((优惠后报价 / (1 + 税率)) × 税率, 2)
  const taxRefund = round2(priceAfterDiscount / (1 + vatRate / 100) * (vatRate / 100));
  const costExclTax = round2(priceAfterDiscount - taxRefund);
  const totalCostCNY = round2(costExclTax + modificationFee + logistics);
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
    fobPriceRounded: Math.round(fobPrice),
  };
}

/**
 * 保险按 CIF × 110% × 保险费率计价，CIF 需反解。
 * insuranceRate 输入百分数，如 0.4 表示 0.4%。
 */
export function calculateCIF(inputs, fobPrice) {
  const freight = requireNonnegative('国际海运费', inputs.oceanFreight);
  const insuranceRate = requireNonnegative('保险费率', inputs.insuranceRate);
  const denominator = 1 - 1.1 * insuranceRate / 100;
  if (denominator <= 0) throw new Error('保险费率过高，无法计算 CIF');
  const cifPrice = (fobPrice + freight) / denominator;
  return {
    freight,
    insurance: cifPrice - fobPrice - freight,
    cifPrice,
    cifPriceRounded: Math.round(cifPrice),
  };
}

export function formatNumber(value, decimals = 2) {
  if (!Number.isFinite(value)) return '—';
  return value.toLocaleString('zh-CN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function parseFormattedNumber(value) {
  const parsed = parseFloat(String(value ?? '').replace(/,/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
}

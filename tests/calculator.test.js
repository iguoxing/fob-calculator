import test from 'node:test';
import assert from 'node:assert/strict';
import { calculate, calculateCIF, DEFAULT_VALUES, EXAMPLES } from '../src/utils/calculator.js';

test('新截图 FOB $17,109 和逐项明细与 Excel 一致', () => {
  const r = calculate(EXAMPLES.latest);
  assert.equal(r.priceAfterDiscount, 111800);
  assert.equal(r.taxRefund, 12861.95);
  assert.equal(r.costExclTax, 98938.05);
  assert.equal(r.modificationFee, 6090);
  assert.equal(r.totalCostCNY, 113328.05);
  assert.equal(r.fobPriceRounded, 17109);
});

test('旧截图 FOB $17,275', () => {
  const r = calculate(EXAMPLES.original);
  assert.equal(r.priceAfterDiscount, 111800);
  assert.equal(r.taxRefund, 12861.95);
  assert.equal(r.costExclTax, 98938.05);
  assert.equal(r.modificationFee, 7208);
  assert.equal(r.totalCostCNY, 114446.05);
  assert.equal(r.fobPriceRounded, 17275);
});

test('税率变化会重新计算示例退税', () => {
  const r = calculate({ ...DEFAULT_VALUES, vatRate: 0 });
  assert.equal(r.taxRefund, 0);
  assert.equal(r.costExclTax, 111800);
});

test('改装费仅计算一次，不重复叠加', () => {
  const r = calculate({ ...DEFAULT_VALUES, modificationFee: 6090 });
  assert.equal(r.totalCostCNY, 98938.05 + 6090 + 8300);
});

test('拒绝无效汇率和过高优惠', () => {
  assert.throws(() => calculate({ ...DEFAULT_VALUES, exchangeRate: 0 }), /汇率/);
  assert.throws(() => calculate({ ...DEFAULT_VALUES, discount: 150000 }), /优惠/);
});

test('CIF含海运和保险，并保留FOB计算结果', () => {
  const r = calculate(DEFAULT_VALUES);
  const cif = calculateCIF(DEFAULT_VALUES, r.fobPrice);
  assert.ok(cif.cifPrice > r.fobPrice + DEFAULT_VALUES.oceanFreight);
  assert.ok(cif.insurance > 0);
});

test('保险费率异常时阻止错误报价', () => {
  assert.throws(() => calculateCIF({ ...DEFAULT_VALUES, insuranceRate: 100 }, 17109), /保险/);
});

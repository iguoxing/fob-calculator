import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Box, Button, Chip, Paper, Snackbar, Typography, Table, TableBody, TableCell, TableContainer, TableRow } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DownloadIcon from '@mui/icons-material/Download';
import InputField from './InputField';
import { calculate, calculateCIF, formatNumber, DEFAULT_VALUES, EXAMPLES } from '../utils/calculator';

const fields = [
  ['guidePrice', '主机厂指导价', '￥', '车辆含税指导价（人民币）', true],
  ['discount', '优惠金额', '￥', '指导价扣除的优惠金额，输入正数', true],
  ['vatRate', '示例退税税率（%）', '', '默认13%，仅是Excel含税价拆分示例，实际退税需核实', false],
  ['modificationFee', '改装费（含相关税费合计）', '￥', '人工填写改装及相关税费总额，不再重复加5%或500元', true],
  ['logistics', '首段物流＋二段物流＋刷机', '￥', '国内物流、刷机费用合计（人民币）', true],
  ['profit', '利润（美金）', '$', '期望美元利润', false],
  ['portCharge', '港杂＋装箱（美金）', '$', '港杂及装箱费用（美元）', false],
  ['exchangeRate', '美元汇率（CNY/USD）', '', '例如6.72表示1美元=6.72元人民币', false],
];

function Item({ name, value, highlight = false }) {
  return <TableRow sx={highlight ? { bgcolor: '#f0f4ff' } : undefined}>
    <TableCell sx={{ fontSize: '0.85rem', fontWeight: highlight ? 700 : 400 }}>{name}</TableCell>
    <TableCell align="right" sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>{value}</TableCell>
  </TableRow>;
}

export default function Calculator({ mode = 'fob', onModeChange }) {
  const [inputs, setInputs] = useState(() => ({ ...DEFAULT_VALUES }));
  const [message, setMessage] = useState('');
  const isCif = mode === 'cif';
  useEffect(() => { document.title = (isCif ? 'CIF' : 'FOB') + '报价计算器 - 中道之星 ZDSTAR Auto'; }, [isCif]);
  const update = (field, value) => setInputs(prev => ({ ...prev, [field]: value }));
  const result = useMemo(() => {
    try {
      const fob = calculate(inputs);
      return { fob, cif: isCif ? calculateCIF(inputs, fob.fobPrice) : null, error: '' };
    } catch (e) {
      return { fob: null, cif: null, error: e.message };
    }
  }, [inputs, isCif]);
  const rounded = isCif ? result.cif?.cifPriceRounded : result.fob?.fobPriceRounded;
  const amount = isCif ? result.cif?.cifPrice : result.fob?.fobPrice;
  const money = n => '¥' + formatNumber(n);
  const dollars = n => '$' + formatNumber(n);
  const load = which => { setInputs({ ...EXAMPLES[which] }); setMessage('已载入' + (which === 'latest' ? '新图片' : '首张图片') + '示例'); };
  const copy = async () => {
    if (result.error) return;
    try {
      await navigator.clipboard.writeText((isCif ? 'CIF' : 'FOB') + ' US$' + formatNumber(rounded, 0));
      setMessage('报价已复制');
    } catch { setMessage('复制失败，请手动复制'); }
  };
  const exportCsv = () => {
    if (result.error) return;
    const f = result.fob;
    const rows = [
      ['项目','金额','币种'], ['指导价',inputs.guidePrice,'CNY'],
      ['优惠金额',inputs.discount,'CNY'], ['优惠后报价',f.priceAfterDiscount,'CNY'],
      ['示例税率',inputs.vatRate,'%'], ['可退税金额（示例）',f.taxRefund,'CNY'],
      ['不含税车辆成本',f.costExclTax,'CNY'], ['改装费',f.modificationFee,'CNY'],
      ['物流刷机费',inputs.logistics,'CNY'], ['人民币成本合计',f.totalCostCNY,'CNY'],
      ['美元利润',inputs.profit,'USD'], ['港杂装箱',inputs.portCharge,'USD'],
      ['美元汇率',inputs.exchangeRate,'CNY/USD'], ['FOB报价',f.fobPriceRounded,'USD'],
    ];
    if (isCif) rows.push(['国际海运',result.cif.freight,'USD'],['保险费',result.cif.insurance.toFixed(2),'USD'],['CIF报价',result.cif.cifPriceRounded,'USD']);
    const csv = '\ufeff' + rows.map(r => r.map(v => '"' + String(v).replaceAll('"','""') + '"').join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a'); a.href = url; a.download = (isCif ? 'CIF' : 'FOB') + '报价明细.csv';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setMessage('报价明细已导出');
  };
  return <Box sx={{ width:'100%', maxWidth:740, mx:'auto' }}>
    <Paper elevation={8} sx={{ borderRadius:3, overflow:'hidden' }}>
      <Box sx={{ p:{ xs:2, sm:4 } }}>
        <Box sx={{ display:'flex', gap:1, mb:2, p:.5, bgcolor:'#edf0f9', borderRadius:2 }}>
          {['fob','cif'].map(m => <Button key={m} fullWidth variant={mode===m?'contained':'text'}
            color={m==='fob'?'primary':'success'} onClick={() => onModeChange(m)} sx={{ fontWeight:700 }}>{m.toUpperCase()} 报价</Button>)}
        </Box>
        <Box sx={{ display:'flex', gap:1, flexWrap:'wrap', mb:2 }}>
          <Button variant="outlined" size="small" onClick={() => load('latest')}>新图示例 $17,109</Button>
          <Button variant="outlined" size="small" onClick={() => load('original')}>首图示例 $17,275</Button>
          <Button size="small" onClick={() => { setInputs({ ...DEFAULT_VALUES }); setMessage('已重置'); }}>重置</Button>
        </Box>
        <Typography sx={{ fontWeight:800, color:'#1a237e', mb:2 }}>
          输入参数 <Chip size="small" label="黄色背景为主要输入项" sx={{ ml:1, bgcolor:'#fff2ac' }}/>
        </Typography>
        <Box sx={{ display:'grid', gridTemplateColumns:{ xs:'1fr', sm:'1fr 1fr' }, gap:1 }}>
          {fields.map(([key,label,prefix,help,major]) => <Box key={key} sx={{ bgcolor:major?'#fffbe2':'#f7f8fb', p:1, borderRadius:2 }}>
            <InputField label={label} tooltip={help} value={inputs[key]} onChange={v => update(key,v)} prefix={prefix}/>
          </Box>)}
        </Box>
        {isCif && <Box sx={{ bgcolor:'#eaf6f2', p:2, borderRadius:2, mt:2 }}>
          <Typography sx={{ fontWeight:700, mb:1 }}>CIF 附加参数</Typography>
          <InputField label="国际海运费（美元/台）" tooltip="起运港至目的港的海运费" prefix="$" value={inputs.oceanFreight} onChange={v => update('oceanFreight',v)}/>
          <InputField label="保险费率（%）" tooltip="按 CIF × 110% 投保；0.4 表示 0.4%" prefix="" value={inputs.insuranceRate} onChange={v => update('insuranceRate',v)}/>
        </Box>}
      </Box>
      <Box sx={{ bgcolor:isCif?'#155e55':'#1a237e', color:'#fff', p:{ xs:3, sm:4 } }}>
        {result.error ? <Alert severity="error">{result.error}</Alert> : <>
          <Typography sx={{ opacity:.78 }}>最终报价 · {isCif ? 'CIF 目的港到岸价' : 'FOB 国内港口价'}</Typography>
          <Typography sx={{ fontSize:{xs:36,sm:48}, fontWeight:800, color:'#ffbf47' }}>{'US$' + formatNumber(rounded,0)}</Typography>
          <Typography variant="caption" sx={{ opacity:.7 }}>{'未取整 US$' + formatNumber(amount) + ' · 与Excel整数美元报价口径一致'}</Typography>
          <Box sx={{ display:'flex', gap:1, mt:2 }}>
            <Button variant="contained" color="warning" startIcon={<ContentCopyIcon/>} onClick={copy}>复制报价</Button>
            <Button variant="outlined" startIcon={<DownloadIcon/>} onClick={exportCsv} sx={{ color:'#fff', borderColor:'#999' }}>导出CSV</Button>
          </Box>
        </>}
      </Box>
      {!result.error && <Box sx={{ p:{xs:2,sm:4} }}>
        <Typography variant="h6" sx={{ fontWeight:800, color:'#1a237e', mb:1 }}>Excel 报价计算明细</Typography>
        <TableContainer sx={{ border:'1px solid #e3e7f0', borderRadius:2 }}><Table size="small"><TableBody>
          <Item name="主机厂指导价" value={money(inputs.guidePrice)}/>
          <Item name="优惠金额" value={money(inputs.discount)}/>
          <Item name="优惠后报价" value={money(result.fob.priceAfterDiscount)} highlight/>
          <Item name={'可退税金额（按 '+inputs.vatRate+'% 示例）'} value={money(result.fob.taxRefund)}/>
          <Item name="不含税车辆成本" value={money(result.fob.costExclTax)} highlight/>
          <Item name="改装费（含相关税费）" value={money(result.fob.modificationFee)}/>
          <Item name="物流刷机费" value={money(inputs.logistics)}/>
          <Item name="人民币成本合计" value={money(result.fob.totalCostCNY)} highlight/>
          <Item name="美元利润" value={dollars(inputs.profit)}/>
          <Item name="港杂及装箱" value={dollars(inputs.portCharge)}/>
          <Item name="美元汇率（CNY/USD）" value={formatNumber(inputs.exchangeRate)}/>
          <Item name="FOB最终报价" value={'US$'+formatNumber(result.fob.fobPriceRounded,0)} highlight/>
          {isCif && <>
            <Item name="国际海运费" value={dollars(result.cif.freight)}/>
            <Item name="保险费" value={dollars(result.cif.insurance)}/>
            <Item name="CIF最终报价" value={'US$'+formatNumber(result.cif.cifPriceRounded,0)} highlight/>
          </>}
        </TableBody></Table></TableContainer>
        <Alert severity="info" sx={{ mt:2 }}>
          退税额仅为Excel示例模型中的含税价拆分估算，实际金额须核实出口税率、发票和主体资格。改装费人工输入，不会重复叠加税费。FOB不含国际海运、保险及目的地进口税费。
        </Alert>
      </Box>}
    </Paper>
    <Typography variant="caption" sx={{ color:'rgba(255,255,255,.6)', display:'block', textAlign:'center', py:2 }}>
      {'© '+new Date().getFullYear()+' 中道之星 ZDSTAR Auto · fob.zdstar-auto.com'}
    </Typography>
    <Snackbar open={Boolean(message)} autoHideDuration={2600} onClose={() => setMessage('')} anchorOrigin={{ vertical:'bottom', horizontal:'center' }}>
      <Alert severity="success" onClose={() => setMessage('')}>{message}</Alert>
    </Snackbar>
  </Box>;
}

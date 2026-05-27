import React, { useState, useCallback, useMemo } from 'react';
import {
  Box,
  Grid,
  Paper,
  Button,
  Snackbar,
  Alert,
  Divider,
  Typography,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import InputField from './InputField';
import ResultCard from './ResultCard';
import { calculate, formatNumber, DEFAULT_VALUES } from '../utils/calculator';

/**
 * 主计算器组件
 * 包含输入区域、结果展示区域和最终报价展示
 */
function Calculator() {
  const [inputs, setInputs] = useState({ ...DEFAULT_VALUES });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');

  /** 更新单个输入值 */
  const handleInputChange = useCallback((field, value) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  }, []);

  /** 计算结果（实时） */
  const results = useMemo(() => calculate(inputs), [inputs]);

  /** 重置为默认值 */
  const handleReset = useCallback(() => {
    setInputs({ ...DEFAULT_VALUES });
    setSnackbarMsg('已重置为默认值');
    setSnackbarOpen(true);
  }, []);

  /** 复制最终报价 */
  const handleCopyFOB = useCallback(() => {
    const text = `$${formatNumber(results.fobPrice)}`;
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setSnackbarMsg(`已复制：${text}`);
        setSnackbarOpen(true);
      })
      .catch(() => {
        // 降级方案
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        setSnackbarMsg(`已复制：${text}`);
        setSnackbarOpen(true);
      });
  }, [results.fobPrice]);

  const handleCloseSnackbar = useCallback(() => {
    setSnackbarOpen(false);
  }, []);

  return (
    <Box sx={{ width: '100%', maxWidth: 1200, mx: 'auto' }}>
      <Paper
        elevation={8}
        sx={{
          borderRadius: { xs: 3, md: 4 },
          overflow: 'hidden',
          background: 'rgba(255, 255, 255, 0.97)',
          backdropFilter: 'blur(20px)',
        }}
      >
        {/* 主体内容区域 */}
        <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
          <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
            {/* 左栏：用户输入 */}
            <Grid item xs={12} md={5}>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 700,
                  color: '#1a237e',
                  mb: 2,
                  pb: 1,
                  borderBottom: '2px solid #e8eaf6',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <Box
                  component="span"
                  sx={{
                    width: 4,
                    height: 20,
                    bgcolor: '#1a237e',
                    borderRadius: 2,
                    display: 'inline-block',
                  }}
                />
                输入参数
              </Typography>

              <InputField
                label="主机厂指导价"
                tooltip="填入主机厂官方指导价（人民币）"
                value={inputs.guidePrice}
                onChange={(v) => handleInputChange('guidePrice', v)}
                prefix="￥"
                placeholder="222,800.00"
              />

              <InputField
                label="优惠价"
                tooltip="填资源给的优惠价（需确定增票金额）"
                value={inputs.discount}
                onChange={(v) => handleInputChange('discount', v)}
                prefix="￥"
                placeholder="49,000.00"
              />

              <InputField
                label="首段物流+二段物流+刷机"
                tooltip="卖方包邮首段为0；不包邮运费和车款一起收"
                value={inputs.logistics}
                onChange={(v) => handleInputChange('logistics', v)}
                prefix="￥"
                placeholder="1,100.00"
              />

              <Divider sx={{ my: 1.5 }} />

              <InputField
                label="利润（美金）"
                tooltip="期望的美元利润"
                value={inputs.profit}
                onChange={(v) => handleInputChange('profit', v)}
                prefix="$"
                placeholder="600.00"
              />

              <InputField
                label="港杂+装箱（美金）"
                tooltip="港口杂费和装箱费用（美元）"
                value={inputs.portCharge}
                onChange={(v) => handleInputChange('portCharge', v)}
                prefix="$"
                placeholder="400.00"
              />

              <InputField
                label="美元汇率"
                tooltip="汇款会有手续费差额，建议适当调高"
                value={inputs.exchangeRate}
                onChange={(v) => handleInputChange('exchangeRate', v)}
                prefix=""
                placeholder="6.75"
              />

              {/* 操作按钮 */}
              <Box
                sx={{
                  display: 'flex',
                  gap: 1.5,
                  mt: 2,
                }}
              >
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<RestartAltIcon />}
                  onClick={handleReset}
                  sx={{
                    borderColor: '#1a237e',
                    color: '#1a237e',
                    textTransform: 'none',
                    borderRadius: 2,
                    '&:hover': {
                      borderColor: '#1a237e',
                      bgcolor: 'rgba(26, 35, 126, 0.04)',
                    },
                  }}
                >
                  重置默认值
                </Button>
              </Box>
            </Grid>

            {/* 右栏：计算结果 */}
            <Grid item xs={12} md={7}>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 700,
                  color: '#1a237e',
                  mb: 2,
                  pb: 1,
                  borderBottom: '2px solid #e8eaf6',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <Box
                  component="span"
                  sx={{
                    width: 4,
                    height: 20,
                    bgcolor: '#ff9800',
                    borderRadius: 2,
                    display: 'inline-block',
                  }}
                />
                计算结果
              </Typography>

              <Grid container spacing={1.5}>
                <Grid item xs={12} sm={6}>
                  <ResultCard
                    label="优惠后报价"
                    value={formatNumber(results.priceAfterDiscount)}
                    currency="￥"
                    formula="指导价 - 优惠价"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <ResultCard
                    label="可退税金额"
                    value={formatNumber(results.taxRefund)}
                    currency="￥"
                    formula="优惠后报价 ÷ 1.13 × 0.13"
                    color="#2e7d32"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <ResultCard
                    label="不含税车辆成本"
                    value={formatNumber(results.costExclTax)}
                    currency="￥"
                    formula="优惠后报价 - 可退税金额"
                    color="#c62828"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <ResultCard
                    label="改装费"
                    value={formatNumber(results.modificationFee)}
                    currency="￥"
                    formula="优惠后报价 × 5% + 500"
                    color="#6a1b9a"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <ResultCard
                    label="成本合计（人民币）"
                    value={formatNumber(results.totalCostCNY)}
                    currency="￥"
                    formula="不含税成本 + 改装费 + 物流"
                    color="#00695c"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <ResultCard
                    label="成本折算（美元）"
                    value={formatNumber(results.totalCostUSD)}
                    currency="$"
                    formula="成本合计 ÷ 汇率"
                    color="#2e7d32"
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Box>

        {/* 最终FOB报价 - 突出展示 */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #1a237e 0%, #283593 60%, #1a237e 100%)',
            px: { xs: 3, sm: 4, md: 5 },
            py: { xs: 2.5, sm: 3 },
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'radial-gradient(ellipse at 30% 50%, rgba(255,152,0,0.08) 0%, transparent 70%)',
              pointerEvents: 'none',
            },
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'flex-start', sm: 'center' },
              justifyContent: 'space-between',
              gap: 2,
              position: 'relative',
              zIndex: 1,
            }}
          >
            <Box>
              <Typography
                variant="body2"
                sx={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontSize: { xs: '0.8rem', sm: '0.9rem' },
                  mb: 0.5,
                  letterSpacing: '0.05em',
                }}
              >
                最终报价 · FOB国内港口价
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                <Typography
                  sx={{
                    color: '#ff9800',
                    fontWeight: 800,
                    fontSize: { xs: '1.8rem', sm: '2.4rem', md: '3rem' },
                    letterSpacing: '-0.02em',
                    lineHeight: 1.2,
                  }}
                >
                  ${formatNumber(results.fobPrice)}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.5)',
                    fontSize: { xs: '0.75rem', sm: '0.85rem' },
                  }}
                >
                  USD
                </Typography>
              </Box>
            </Box>
            <Button
              variant="contained"
              startIcon={<ContentCopyIcon />}
              onClick={handleCopyFOB}
              sx={{
                bgcolor: '#ff9800',
                color: '#fff',
                fontWeight: 600,
                px: 3,
                py: 1,
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '0.9rem',
                boxShadow: '0 4px 12px rgba(255, 152, 0, 0.3)',
                '&:hover': {
                  bgcolor: '#fb8c00',
                  boxShadow: '0 6px 16px rgba(255, 152, 0, 0.4)',
                },
              }}
            >
              复制报价
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* 底部版权信息 */}
      <Box
        sx={{
          textAlign: 'center',
          py: 2,
          color: 'rgba(255, 255, 255, 0.35)',
          fontSize: '0.75rem',
        }}
      >
        © {new Date().getFullYear()} 中道之星 ZDSTAR Auto · fob.zdstar-auto.com
      </Box>

      {/* 提示消息 */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2500}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="success"
          variant="filled"
          sx={{
            bgcolor: '#1a237e',
            borderRadius: 2,
            '& .MuiAlert-icon': {
              color: '#ff9800',
            },
          }}
        >
          {snackbarMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Calculator;

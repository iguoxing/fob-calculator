import React, { useState, useCallback, useMemo, useEffect } from 'react';
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
import {
  calculate,
  calculateCIF,
  formatNumber,
  DEFAULT_VALUES,
} from '../utils/calculator';

/**
 * 主计算器组件
 * 支持 FOB / CIF 两种报价模式切换，右侧计算结果已隐藏，仅展示输入区域和最终报价
 * @param {object} props
 * @param {'fob'|'cif'} props.mode - 当前报价模式
 * @param {function} props.onModeChange - 切换报价模式
 */
function Calculator({ mode = 'fob', onModeChange }) {
  const [inputs, setInputs] = useState({ ...DEFAULT_VALUES });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');

  // 同步浏览器标签页标题
  useEffect(() => {
    document.title = `${mode === 'cif' ? 'CIF' : 'FOB'}报价计算器 - 中道之星 ZDSTAR Auto`;
  }, [mode]);

  /** 更新单个输入值 */
  const handleInputChange = useCallback((field, value) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  }, []);

  /** 计算结果（实时） */
  const results = useMemo(() => calculate(inputs), [inputs]);

  /** CIF附加结果（仅CIF模式需要） */
  const cifResults = useMemo(
    () => (mode === 'cif' ? calculateCIF(inputs, results.fobPrice) : null),
    [mode, inputs, results.fobPrice]
  );

  /** 当前模式最终报价 */
  const finalPrice = mode === 'cif' ? cifResults.cifPrice : results.fobPrice;

  /** 重置为默认值 */
  const handleReset = useCallback(() => {
    setInputs({ ...DEFAULT_VALUES });
    setSnackbarMsg('已重置为默认值');
    setSnackbarOpen(true);
  }, []);

  /** 复制最终报价 */
  const handleCopyQuote = useCallback(() => {
    const prefix = mode === 'cif' ? 'CIF' : 'FOB';
    const text = `${prefix} $${formatNumber(finalPrice)}`;
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setSnackbarMsg(`已复制：${text}`);
        setSnackbarOpen(true);
      })
      .catch(() => {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        setSnackbarMsg(`已复制：${text}`);
        setSnackbarOpen(true);
      });
  }, [mode, finalPrice]);

  const handleCloseSnackbar = useCallback(() => {
    setSnackbarOpen(false);
  }, []);

  const isCif = mode === 'cif';

  return (
    <Box sx={{ width: '100%', maxWidth: 560, mx: 'auto' }}>
      <Paper
        elevation={8}
        sx={{
          borderRadius: { xs: 3, md: 4 },
          overflow: 'hidden',
          background: 'rgba(255, 255, 255, 0.97)',
          backdropFilter: 'blur(20px)',
        }}
      >
        {/* 报价模式切换 */}
        <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, pt: { xs: 2, sm: 3, md: 4 } }}>
          <Box
            sx={{
              display: 'flex',
              gap: 0.5,
              p: 0.5,
              bgcolor: '#eef0fa',
              borderRadius: 3,
              mb: 3,
            }}
          >
            <Button
              fullWidth
              disableRipple
              onClick={() => onModeChange('fob')}
              sx={{
                py: 1,
                borderRadius: 2.5,
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '0.95rem',
                color: isCif ? '#5a6572' : '#fff',
                bgcolor: isCif ? 'transparent' : '#1a237e',
                boxShadow: isCif ? 'none' : '0 2px 8px rgba(26, 35, 126, 0.25)',
                '&:hover': {
                  bgcolor: isCif ? '#e2e6f5' : '#283593',
                },
              }}
            >
              FOB 报价
              <Typography
                component="span"
                sx={{
                  ml: 0.5,
                  fontSize: '0.7rem',
                  fontWeight: 400,
                  opacity: 0.75,
                  display: { xs: 'none', sm: 'inline' },
                }}
              >
                国内港口
              </Typography>
            </Button>
            <Button
              fullWidth
              disableRipple
              onClick={() => onModeChange('cif')}
              sx={{
                py: 1,
                borderRadius: 2.5,
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '0.95rem',
                color: isCif ? '#fff' : '#5a6572',
                bgcolor: isCif ? '#1b5e57' : 'transparent',
                boxShadow: isCif ? '0 2px 8px rgba(27, 94, 87, 0.25)' : 'none',
                '&:hover': {
                  bgcolor: isCif ? '#246b63' : '#e2e6f5',
                },
              }}
            >
              CIF 报价
              <Typography
                component="span"
                sx={{
                  ml: 0.5,
                  fontSize: '0.7rem',
                  fontWeight: 400,
                  opacity: 0.75,
                  display: { xs: 'none', sm: 'inline' },
                }}
              >
                含海运保险
              </Typography>
            </Button>
          </Box>
        </Box>

        {/* 主体内容区域 */}
        <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, pt: { xs: 0, sm: 0, md: 0 } }}>
          <Grid container>
            {/* 输入区域（占满全宽） */}
            <Grid item xs={12}>
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

              {/* CIF 模式附加参数 */}
              {isCif && (
                <>
                  <Divider sx={{ my: 1.5 }} />
                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block',
                      color: '#1b5e57',
                      fontWeight: 700,
                      mb: 1,
                      fontSize: '0.8rem',
                    }}
                  >
                    海运与保险（CIF 附加）
                  </Typography>

                  <InputField
                    label="海运费（单台）"
                    tooltip="起运港到目的港的海运费，按单台均摊（美元）"
                    value={inputs.oceanFreight}
                    onChange={(v) => handleInputChange('oceanFreight', v)}
                    prefix="$"
                    placeholder="1,300.00"
                  />

                  <InputField
                    label="保险费率（%）"
                    tooltip="按 CIF×110% 加成投保；费率0.4即0.4%"
                    value={inputs.insuranceRate}
                    onChange={(v) => handleInputChange('insuranceRate', v)}
                    prefix=""
                    placeholder="0.4"
                  />
                </>
              )}

              {/* 操作按钮 */}
              <Box sx={{ display: 'flex', gap: 1.5, mt: 2 }}>
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
          </Grid>
        </Box>

        {/* 最终报价 - 突出展示 */}
        <Box
          sx={{
            background: isCif
              ? 'linear-gradient(135deg, #0f3d38 0%, #1b5e57 60%, #0f3d38 100%)'
              : 'linear-gradient(135deg, #1a237e 0%, #283593 60%, #1a237e 100%)',
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
                {isCif ? '最终报价 · CIF目的港到岸价' : '最终报价 · FOB国内港口价'}
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
                  ${formatNumber(finalPrice)}
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
              {isCif && cifResults && (
                <Typography
                  variant="caption"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.55)',
                    fontSize: { xs: '0.7rem', sm: '0.78rem' },
                    mt: 0.5,
                    display: 'block',
                  }}
                >
                  FOB ${formatNumber(results.fobPrice)} + 海运费 $
                  {formatNumber(cifResults.freight)} + 保险费 $
                  {formatNumber(cifResults.insurance)}
                </Typography>
              )}
            </Box>
            <Button
              variant="contained"
              startIcon={<ContentCopyIcon />}
              onClick={handleCopyQuote}
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

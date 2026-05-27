import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

/**
 * 计算结果卡片组件
 * @param {object} props
 * @param {string} props.label - 结果标签
 * @param {string} props.value - 格式化后的结果值
 * @param {string} props.currency - 货币符号
 * @param {string} props.formula - 计算公式说明
 * @param {boolean} props.highlight - 是否高亮显示
 * @param {string} props.color - 自定义颜色主题
 */
function ResultCard({
  label,
  value,
  currency = '￥',
  formula = '',
  highlight = false,
  color,
}) {
  const defaultColor = currency === '$' ? '#2e7d32' : '#1a237e';

  return (
    <Paper
      elevation={highlight ? 3 : 1}
      sx={{
        p: { xs: 1.5, sm: 2 },
        borderRadius: 2,
        border: highlight ? `2px solid ${color || '#ff9800'}` : '1px solid #e8eaf6',
        background: highlight
          ? 'linear-gradient(135deg, #fff8e1 0%, #ffffff 100%)'
          : '#ffffff',
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: highlight
            ? '0 6px 24px rgba(255, 152, 0, 0.2)'
            : '0 4px 16px rgba(26, 35, 126, 0.1)',
          transform: 'translateY(-1px)',
        },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="body2"
            sx={{
              color: '#666',
              fontSize: '0.8rem',
              mb: 0.5,
              fontWeight: 500,
            }}
          >
            {label}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
            <Typography
              variant="body2"
              sx={{
                color: color || defaultColor,
                fontWeight: 700,
                fontSize: '0.85rem',
              }}
            >
              {currency}
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: color || defaultColor,
                fontWeight: 800,
                fontSize: highlight ? { xs: '1.3rem', sm: '1.5rem' } : { xs: '1.05rem', sm: '1.15rem' },
                letterSpacing: '-0.02em',
                wordBreak: 'break-all',
              }}
            >
              {value}
            </Typography>
          </Box>
          {formula && (
            <Typography
              variant="caption"
              sx={{
                color: '#999',
                fontSize: '0.7rem',
                display: 'block',
                mt: 0.5,
                lineHeight: 1.3,
              }}
            >
              {formula}
            </Typography>
          )}
        </Box>
      </Box>
    </Paper>
  );
}

export default React.memo(ResultCard);

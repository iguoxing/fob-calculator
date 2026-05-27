import React from 'react';
import { Box, Typography } from '@mui/material';
import DirectionsCarFilledIcon from '@mui/icons-material/DirectionsCarFilled';

/**
 * 顶部标题组件
 * 显示品牌名称和工具标题
 */
function Header() {
  return (
    <Box
      sx={{
        pt: { xs: 3, md: 4 },
        pb: { xs: 1, md: 2 },
        px: { xs: 2, sm: 3, md: 4 },
        textAlign: 'center',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1.5,
          mb: 1,
        }}
      >
        <DirectionsCarFilledIcon
          sx={{
            fontSize: { xs: 32, md: 40 },
            color: '#ff9800',
          }}
        />
        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            background: 'linear-gradient(135deg, #ff9800 0%, #ffb74d 50%, #ff9800 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontSize: { xs: '1.75rem', md: '2.5rem' },
            letterSpacing: '0.02em',
          }}
        >
          FOB报价计算器
        </Typography>
      </Box>
      <Typography
        variant="subtitle1"
        sx={{
          color: 'rgba(255, 255, 255, 0.7)',
          fontSize: { xs: '0.9rem', md: '1.1rem' },
          fontWeight: 400,
          letterSpacing: '0.15em',
          mb: 0.5,
        }}
      >
        中道之星 &nbsp;ZDSTAR AUTO
      </Typography>
      <Typography
        variant="body2"
        sx={{
          color: 'rgba(255, 255, 255, 0.45)',
          fontSize: { xs: '0.75rem', md: '0.85rem' },
        }}
      >
        专业汽车出口FOB报价 · 实时计算 · 精准透明
      </Typography>
    </Box>
  );
}

export default Header;

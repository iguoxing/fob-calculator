import React, { useCallback } from 'react';
import { TextField, Tooltip, Box, InputAdornment } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { formatNumber, parseFormattedNumber } from '../utils/calculator';

/**
 * 带标签和提示的输入字段组件
 * @param {object} props
 * @param {string} props.label - 字段标签
 * @param {string} props.tooltip - 提示文字
 * @param {number} props.value - 当前值
 * @param {function} props.onChange - 值变更回调
 * @param {string} props.prefix - 前缀符号（如￥或$）
 * @param {boolean} props.disabled - 是否禁用
 * @param {string} props.placeholder - 占位文本
 */
function InputField({
  label,
  tooltip = '',
  value,
  onChange,
  prefix = '￥',
  disabled = false,
  placeholder = '0.00',
}) {
  const [displayValue, setDisplayValue] = React.useState(() =>
    value !== undefined && value !== null ? formatNumber(value) : ''
  );
  const [isFocused, setIsFocused] = React.useState(false);

  // 同步外部value变化
  React.useEffect(() => {
    if (!isFocused) {
      setDisplayValue(value !== undefined && value !== null ? formatNumber(value) : '');
    }
  }, [value, isFocused]);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    // 聚焦时显示纯数字，方便编辑
    if (value !== undefined && value !== null) {
      setDisplayValue(String(value));
    }
  }, [value]);

  const handleChange = useCallback(
    (e) => {
      const raw = e.target.value;
      // 只允许数字和小数点
      const cleaned = raw.replace(/[^\d.]/g, '');
      // 防止多个小数点
      const parts = cleaned.split('.');
      const formatted = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : cleaned;
      setDisplayValue(formatted);
      const numValue = parseFormattedNumber(formatted);
      onChange(numValue);
    },
    [onChange]
  );

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    if (value !== undefined && value !== null) {
      setDisplayValue(formatNumber(value));
    }
  }, [value]);

  return (
    <Box sx={{ width: '100%', mb: 2 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          mb: 0.5,
          gap: 0.5,
        }}
      >
        <Box
          component="label"
          sx={{
            fontSize: '0.875rem',
            fontWeight: 600,
            color: '#555',
            whiteSpace: 'nowrap',
          }}
        >
          {label}
        </Box>
        {tooltip && (
          <Tooltip
            title={tooltip}
            arrow
            placement="top"
            slotProps={{
              tooltip: {
                sx: {
                  bgcolor: '#1a237e',
                  fontSize: '0.8rem',
                  maxWidth: 260,
                  '& .MuiTooltip-arrow': {
                    color: '#1a237e',
                  },
                },
              },
            }}
          >
            <InfoOutlinedIcon
              sx={{
                fontSize: 16,
                color: '#9e9e9e',
                cursor: 'pointer',
                '&:hover': { color: '#1a237e' },
                transition: 'color 0.2s',
              }}
            />
          </Tooltip>
        )}
      </Box>
      <TextField
        fullWidth
        size="small"
        value={displayValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        disabled={disabled}
        placeholder={placeholder}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Box
                component="span"
                sx={{
                  fontWeight: 700,
                  color: prefix === '$' ? '#2e7d32' : '#1a237e',
                  fontSize: '0.95rem',
                }}
              >
                {prefix}
              </Box>
            </InputAdornment>
          ),
          sx: {
            backgroundColor: disabled ? '#f5f5f5' : '#fafbfc',
            fontSize: '1rem',
            fontWeight: 500,
            '& input': {
              textAlign: 'right',
              padding: '10px 14px',
            },
          },
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: '#e0e0e0',
              borderWidth: '1.5px',
            },
            '&:hover fieldset': {
              borderColor: '#1a237e',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#1a237e',
              borderWidth: '2px',
            },
          },
        }}
      />
    </Box>
  );
}

export default React.memo(InputField);

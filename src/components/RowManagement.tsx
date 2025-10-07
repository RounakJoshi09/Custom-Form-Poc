'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Chip,
  Collapse,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { useBuilder } from '@/context/BuilderContext';
import { getLayoutStats, getEmptyRowsCount } from '@/lib/layout';

interface RowManagementProps {
  maxRows: number;
  onRowsChange: (newRowCount: number) => void;
}

export default function RowManagement({ maxRows, onRowsChange }: RowManagementProps) {
  const { state } = useBuilder();
  const [isExpanded, setIsExpanded] = useState(false);
  
  const { positions, layout } = state.schema;
  const stats = getLayoutStats(positions, layout);
  const emptyRows = getEmptyRowsCount(positions, layout, maxRows);

  const handleAddRows = () => {
    onRowsChange(maxRows + 2);
  };

  const handleRemoveRows = () => {
    if (maxRows > stats.maxUsedRow + 3) {
      onRowsChange(maxRows - 1);
    }
  };

  const canRemoveRows = maxRows > Math.max(5, stats.maxUsedRow + 3);

  return (
    <Box sx={{ mb: 2 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          cursor: 'pointer',
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <Typography variant="caption" color="text.secondary">
          Grid Management
        </Typography>
        <Chip 
          label={`${stats.totalFields} fields`} 
          size="small" 
          variant="outlined" 
        />
        <Chip 
          label={`${emptyRows} empty rows`} 
          size="small" 
          variant="outlined"
          color={emptyRows < 2 ? 'warning' : 'default'}
        />
        {isExpanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
      </Box>

      <Collapse in={isExpanded}>
        <Box sx={{ mt: 1, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Typography variant="body2">
              Rows: {maxRows}
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <Tooltip title="Add 2 more rows">
                <IconButton size="small" onClick={handleAddRows}>
                  <AddIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title={canRemoveRows ? "Remove 1 row" : "Cannot remove rows with content"}>
                <span>
                  <IconButton 
                    size="small" 
                    onClick={handleRemoveRows}
                    disabled={!canRemoveRows}
                  >
                    <RemoveIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Tooltip title="Layout utilization based on used rows">
              <Chip 
                icon={<InfoIcon />}
                label={`${stats.utilization}% utilized`} 
                size="small" 
                variant="filled"
                color={stats.utilization > 80 ? 'warning' : 'primary'}
              />
            </Tooltip>
            <Chip 
              label={`Last used row: ${stats.maxUsedRow + 1}`} 
              size="small" 
              variant="outlined" 
            />
          </Box>
          
          {emptyRows < 2 && (
            <Typography 
              variant="caption" 
              color="warning.main" 
              sx={{ display: 'block', mt: 1 }}
            >
              ⚠️ Consider adding more rows for better drop zone availability
            </Typography>
          )}
        </Box>
      </Collapse>
    </Box>
  );
}
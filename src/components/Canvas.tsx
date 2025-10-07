'use client';

import React, { useState, useEffect } from 'react';
import {
  Paper,
  Box,
  Typography,
  ButtonGroup,
  Button,
  Divider,
} from '@mui/material';
import { useBuilder } from '@/context/BuilderContext';
import { getColumnConfig, getMaxRowsInLayout, getFieldAtPosition } from '@/lib/layout';
import { LayoutType } from '@/lib/schema';
import GridCell from './GridCell';
import RowManagement from './RowManagement';

interface GridColumnProps {
  columnId: string;
  width: number;
  maxRows: number;
}

function GridColumn({ columnId, width, maxRows }: GridColumnProps) {
  const { state } = useBuilder();
  const { fields, positions } = state.schema;
  
  const columnConfig = getColumnConfig(state.schema.layout, columnId);
  
  if (!columnConfig) {
    return null;
  }

  const { slotsPerRow } = columnConfig;

  return (
    <Box sx={{ flex: `0 0 ${width}%`, maxWidth: `${width}%` }}>
      <Paper
        elevation={0}
        sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1 }}
      >
        <Box sx={{ p: 1 }}>
          <Typography variant="caption" color="text.secondary" gutterBottom>
            Column {width}% ({slotsPerRow} per row)
          </Typography>
        </Box>
        <Divider />
        
        {/* Grid of cells */}
        <Box sx={{ p: 1 }}>
          {Array.from({ length: maxRows }).map((_, rowIndex) => (
            <Box key={rowIndex} sx={{ display: 'flex', gap: 1, mb: 1 }}>
              {Array.from({ length: slotsPerRow }).map((_, slotIndex) => {
                const position = { columnId, rowIndex, slotIndex };
                const fieldId = getFieldAtPosition(position, positions);
                const field = fieldId ? fields.find(f => f.id === fieldId) : undefined;
                const isSelected = field && state.selectedFieldId === field.id;
                
                return (
                  <GridCell
                    key={`${rowIndex}-${slotIndex}`}
                    columnId={columnId}
                    rowIndex={rowIndex}
                    slotIndex={slotIndex}
                    slotsPerRow={slotsPerRow}
                    field={field}
                    isSelected={isSelected}
                  />
                );
              })}
            </Box>
          ))}
        </Box>
      </Paper>
    </Box>
  );
}

export default function Canvas() {
  const { state, actions } = useBuilder();
  const { layout, positions } = state.schema;

  const layoutOptions: LayoutType[] = ['25-75', '50-50', '75-25', '100'];
  
  // Auto-expanding rows with manual override capability
  const autoCalculatedRows = getMaxRowsInLayout(positions, 3); // 3 empty rows minimum
  const [manualRowCount, setManualRowCount] = useState<number | null>(null);
  
  // Use manual row count if set, otherwise use auto-calculated
  const maxRows = manualRowCount || autoCalculatedRows;
  
  // Reset manual override when auto-calculated exceeds manual setting
  useEffect(() => {
    if (manualRowCount && autoCalculatedRows > manualRowCount) {
      setManualRowCount(null);
    }
  }, [autoCalculatedRows, manualRowCount]);

  return (
    <Paper
      elevation={1}
      sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      {/* Layout Selector */}
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Form Canvas
        </Typography>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Layout:
          </Typography>
          <ButtonGroup size="small" variant="outlined">
            {layoutOptions.map((layoutType) => (
              <Button
                key={layoutType}
                variant={layout.type === layoutType ? 'contained' : 'outlined'}
                onClick={() => actions.setLayout(layoutType)}
              >
                {layoutType}
              </Button>
            ))}
          </ButtonGroup>
        </Box>
        
        {/* Row Management Component */}
        <RowManagement 
          maxRows={maxRows} 
          onRowsChange={setManualRowCount}
        />
      </Box>

      <Divider />

      {/* Canvas Area */}
      <Box sx={{ flex: 1, p: 2, overflow: 'auto' }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {layout.columns.map((column) => (
            <GridColumn 
              key={column.id} 
              columnId={column.id} 
              width={column.width} 
              maxRows={maxRows}
            />
          ))}
        </Box>
      </Box>
    </Paper>
  );
}

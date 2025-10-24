'use client';

import React, { useState, useEffect } from 'react';
import {
  Paper,
  Box,
  Typography,
  ButtonGroup,
  Button,
  Divider,
  TextField,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { useBuilder } from '@/context/BuilderContext';
import { getColumnConfig, getMaxRowsInLayout, getFieldAtPosition, getSections } from '@/lib/layout';
import { LayoutType } from '@/lib/schema';
import GridCell from './GridCell';
import RowManagement from './RowManagement';
import SectionContainer from './SectionContainer';

interface GridColumnProps {
  columnId: string;
  width: number;
  maxRows: number;
}

function GridColumn({ columnId, width, maxRows }: GridColumnProps) {
  const { state, actions } = useBuilder();
  const { fields, positions } = state.schema;

  const columnConfig = getColumnConfig(state.schema.layout, columnId);

  if (!columnConfig) {
    return null;
  }

  const { slotsPerRow } = columnConfig;
  const isFullWidth = width === 100;
  const sections = getSections(columnConfig);

  // Render sections for 100% width columns, or single column for others
  if (isFullWidth && sections.length > 0) {
    return (
      <Box sx={{
        width: '100%',
        minWidth: 0,
        overflow: 'hidden'
      }}>
        {sections.map((section) => (
          <SectionContainer
            key={section.id}
            section={section}
            columnId={columnId}
            maxRows={maxRows}
          />
        ))}
        
        {/* Add Section Button */}
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Button
            variant="outlined"
            onClick={() => actions.addSection(columnId)}
            sx={{
              borderStyle: 'dashed',
              borderWidth: 2,
              py: 2,
              px: 4,
              color: 'text.secondary',
              borderColor: 'grey.300',
              '&:hover': {
                borderColor: 'primary.main',
                color: 'primary.main',
                backgroundColor: 'primary.50',
              },
            }}
          >
            + Add Section
          </Button>
        </Box>
      </Box>
    );
  }

  // Original single column rendering for non-100% layouts
  return (
    <Box sx={{
      width: '100%',
      minWidth: 0,
      overflow: 'hidden'
    }}>
      <Paper
        elevation={0}
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          height: '100%',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Box sx={{ p: 1 }}>
          {columnConfig.sectionName && (
            <Typography variant="subtitle2" color="text.primary" gutterBottom sx={{ fontWeight: 600 }}>
              {columnConfig.sectionName}
            </Typography>
          )}
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

        {/* Tabify Checkbox - Only show for 100% layouts with sections */}
        {layout.type === '100' && layout.columns[0]?.sections && layout.columns[0].sections.length > 1 && (
          <Box sx={{ mb: 2 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={layout.tabify || false}
                  onChange={(e) => actions.setTabify(e.target.checked)}
                />
              }
              label="Tabify Sections (render sections as tabs in preview and form)"
            />
          </Box>
        )}

        {/* Section Names Configuration - Only show for non-100% layouts or 100% without sections */}
        {layout.type !== '100' || !layout.columns[0]?.sections?.length ? (
          <Box sx={{ mb: 0 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Section Names:
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              {layout.columns.map((column, index) => {
              // Create descriptive labels based on layout and column position
              const getSectionLabel = () => {
                if (layout.type === '100') return 'Section Name';
                if (layout.type === '50-50') return `Section ${index + 1} Name (${column.width}%)`;
                if (layout.type === '25-75') {
                  return index === 0 ? 'Left Section Name (25%)' : 'Right Section Name (75%)';
                }
                if (layout.type === '75-25') {
                  return index === 0 ? 'Left Section Name (75%)' : 'Right Section Name (25%)';
                }
                return `Section ${index + 1} Name`;
              };

                return (
                  <Box sx={{
                    flex: `0 0 ${column.width}%`,
                    maxWidth: `${column.width}%`,
                    minWidth: 0
                  }} key={column.id}>
                    <TextField
                      size="small"
                      label={getSectionLabel()}
                      placeholder="Optional section label"
                      value={column.sectionName || ''}
                      onChange={(e) => actions.updateColumnSectionName(column.id, e.target.value)}
                      fullWidth
                    />
                  </Box>
                );
              })}
            </Box>
          </Box>
        ) : null}

        {/* Row Management Component */}
        <RowManagement
          maxRows={maxRows}
          onRowsChange={setManualRowCount}
        />
      </Box>

      <Divider />

      {/* Canvas Area */}
      <Box sx={{ flex: 1, p: 2, overflow: 'auto' }}>
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: layout.columns.map(col => `${col.width}fr`).join(' '),
          gap: 2,
          width: '100%',
          overflow: 'hidden'
        }}>
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

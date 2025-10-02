'use client';

import React from 'react';
import {
  Paper,
  Box,
  Typography,
  Grid,
  ButtonGroup,
  Button,
  Divider,
} from '@mui/material';
import { useDrop } from 'react-dnd';
import { useBuilder } from '@/context/BuilderContext';
import { getColumnFields, getColumnConfig } from '@/lib/layout';
import { DND_ITEM_TYPES, DragItem } from '@/lib/dnd-types';
import { FieldType, LayoutType, FieldPosition } from '@/lib/schema';
import FieldCard from './FieldCard';

interface DropZoneProps {
  columnId: string;
  children: React.ReactNode;
}

function DropZone({ columnId, children }: DropZoneProps) {
  const { actions, state } = useBuilder();

  const [{ isOver }, drop] = useDrop(
    () => ({
      accept: [
        DND_ITEM_TYPES.FIELD_FROM_PALETTE,
        DND_ITEM_TYPES.EXISTING_FIELD,
      ],
      drop: (item: DragItem) => {
        if (item.type === DND_ITEM_TYPES.FIELD_FROM_PALETTE) {
          actions.addField(item.fieldType as FieldType, columnId);
        }
        // For existing field moves, we'll implement this in a future iteration
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
      }),
    }),
    [columnId, actions]
  );

  return (
    <Box
      ref={drop}
      sx={{
        minHeight: 200,
        p: 1,
        border: '2px dashed',
        borderColor: isOver ? 'primary.main' : 'grey.300',
        borderRadius: 1,
        backgroundColor: isOver ? 'primary.50' : 'transparent',
        transition: 'all 0.2s ease-in-out',
      }}
    >
      {children}
    </Box>
  );
}

interface ColumnProps {
  columnId: string;
  width: number;
}

function Column({ columnId, width }: ColumnProps) {
  const { state } = useBuilder();
  const columnFields = getColumnFields(
    columnId,
    state.schema.fields,
    state.schema.positions
  );
  const columnConfig = getColumnConfig(state.schema.layout, columnId);

  if (!columnConfig) {
    return null;
  }

  return (
    <Grid
      item
      xs={12}
      md={width === 25 ? 3 : width === 50 ? 6 : width === 75 ? 9 : 12}
    >
      <Paper
        elevation={0}
        sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1 }}
      >
        <Box sx={{ p: 1 }}>
          <Typography variant="caption" color="text.secondary" gutterBottom>
            Column {width}% ({columnConfig.slotsPerRow} per row,{' '}
            {columnConfig.maxRows} rows max)
          </Typography>
        </Box>
        <Divider />
        <DropZone columnId={columnId}>
          {columnFields.length === 0 ? (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 180,
                color: 'text.secondary',
              }}
            >
              <Typography variant="body2">Drop fields here</Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {/* Render fields in rows */}
              {columnFields.map((row, rowIndex) => (
                <Grid container spacing={1} key={rowIndex}>
                  {Array.from({ length: columnConfig.slotsPerRow }).map(
                    (_, slotIndex) => (
                      <Grid
                        item
                        xs={12 / columnConfig.slotsPerRow}
                        key={slotIndex}
                      >
                        {row[slotIndex] ? (
                          <FieldCard
                            field={row[slotIndex]}
                            isSelected={
                              state.selectedFieldId === row[slotIndex].id
                            }
                          />
                        ) : (
                          <Box
                            sx={{
                              minHeight: 60,
                              border: '1px dashed',
                              borderColor: 'grey.200',
                              borderRadius: 1,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Empty
                            </Typography>
                          </Box>
                        )}
                      </Grid>
                    )
                  )}
                </Grid>
              ))}
            </Box>
          )}
        </DropZone>
      </Paper>
    </Grid>
  );
}

export default function Canvas() {
  const { state, actions } = useBuilder();
  const { layout } = state.schema;

  const layoutOptions: LayoutType[] = ['25-75', '50-50', '75-25', '100'];

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
      </Box>

      <Divider />

      {/* Canvas Area */}
      <Box sx={{ flex: 1, p: 2, overflow: 'auto' }}>
        <Grid container spacing={2}>
          {layout.columns.map((column) => (
            <Column key={column.id} columnId={column.id} width={column.width} />
          ))}
        </Grid>
      </Box>
    </Paper>
  );
}

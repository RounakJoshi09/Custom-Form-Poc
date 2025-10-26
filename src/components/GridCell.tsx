'use client';

import React from 'react';
import { Box } from '@mui/material';
import { useDrop } from 'react-dnd';
import { useBuilder } from '@/context/BuilderContext';
import { FieldPosition, FieldType, FormField } from '@/lib/schema';
import { DND_ITEM_TYPES, DragItem } from '@/lib/dnd-types';
import FieldCard from './FieldCard';

interface GridCellProps {
  columnId: string;
  sectionId?: string;
  rowIndex: number;
  slotIndex: number;
  slotsPerRow: number;
  field?: FormField;
  isSelected?: boolean;
}

export default function GridCell({
  columnId,
  sectionId,
  rowIndex,
  slotIndex,
  slotsPerRow,
  field,
  isSelected = false,
}: GridCellProps) {
  const { actions } = useBuilder();

  const position: FieldPosition = {
    columnId,
    sectionId,
    rowIndex,
    slotIndex,
  };

  const [{ isOver, canDrop }, drop] = useDrop(
    () => ({
      accept: [
        DND_ITEM_TYPES.FIELD_FROM_PALETTE,
        DND_ITEM_TYPES.EXISTING_FIELD,
      ],
      drop: (item: DragItem) => {
        if (item.type === DND_ITEM_TYPES.FIELD_FROM_PALETTE) {
          // Add new field to this specific position
          actions.addField(item.fieldType as FieldType, columnId, sectionId, position);
        } else if (item.type === DND_ITEM_TYPES.EXISTING_FIELD) {
          // Move existing field to this position
          actions.moveField(item.fieldId, position);
        }
      },
      canDrop: (item: DragItem) => {
        // Allow drop if cell is empty, or if we're moving an existing field
        if (item.type === DND_ITEM_TYPES.EXISTING_FIELD) {
          // Don't allow dropping a field on itself
          return !field || field.id !== item.fieldId;
        }
        return true; // Always allow new fields to be dropped
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    }),
    [columnId, sectionId, rowIndex, slotIndex, field, actions]
  );

  const handleCellClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!field) {
      actions.selectField(null);
    }
  };

  return (
    <Box
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ref={drop as any}
      onClick={handleCellClick}
      sx={{
        flex: `0 0 calc(${100 / slotsPerRow}% - ${(slotsPerRow - 1) * 8 / slotsPerRow}px)`,
        maxWidth: `calc(${100 / slotsPerRow}% - ${(slotsPerRow - 1) * 8 / slotsPerRow}px)`,
        minHeight: 80,
        p: 0.5,
        position: 'relative',
        minWidth: 0,
        overflow: 'hidden',
      }}
    >
      {field ? (
        <FieldCard field={field} isSelected={isSelected} />
      ) : (
        <Box
          sx={{
            height: '100%',
            minHeight: 70,
            border: '2px dashed',
            borderColor: isOver && canDrop ? 'primary.main' : 'grey.300',
            borderRadius: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor:
              isOver && canDrop
                ? 'rgba(0, 151, 136, 0.08)'
                : isOver && !canDrop
                  ? 'rgba(211, 47, 47, 0.08)'
                  : 'transparent',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            cursor: 'pointer',
            position: 'relative',
            '&:hover': {
              borderColor: canDrop ? 'primary.main' : 'grey.400',
              backgroundColor: canDrop ? 'rgba(0, 151, 136, 0.04)' : 'rgba(0, 0, 0, 0.02)',
              transform: 'scale(1.01)',
              boxShadow: isOver && canDrop ? '0 4px 12px rgba(0, 151, 136, 0.15)' : 'none',
              '& .row-indicator': {
                opacity: 1,
              },
            },
          }}
        >
          {/* Row indicator for better UX */}
          <Box
            className="row-indicator"
            sx={{
              position: 'absolute',
              top: 4,
              left: 4,
              fontSize: '0.65rem',
              color: 'text.disabled',
              opacity: 0.5,
              transition: 'opacity 0.2s',
              fontFamily: 'monospace',
            }}
          >
            R{rowIndex + 1}C{slotIndex + 1}
          </Box>

          {isOver && !canDrop && (
            <Box
              sx={{
                position: 'absolute',
                top: 2,
                right: 2,
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: 'error.main',
              }}
            />
          )}
        </Box>
      )}

      {/* Visual feedback for occupied cells during drag operations */}
      {field && isOver && canDrop && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            border: '2px solid',
            borderColor: 'warning.main',
            borderRadius: 1,
            backgroundColor: 'warning.50',
            opacity: 0.8,
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.75rem',
            fontWeight: 'bold',
            color: 'warning.dark',
          }}
        >
          SWAP
        </Box>
      )}
    </Box>
  );
}
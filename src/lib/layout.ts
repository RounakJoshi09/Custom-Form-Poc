import {
  LayoutType,
  LayoutConfig,
  ColumnConfig,
  FormField,
  FieldPosition,
} from './schema';

// Mapping of layout types to column configurations
export const LAYOUT_CONFIGS: Record<LayoutType, ColumnConfig[]> = {
  '25-75': [
    { id: 'col-25', width: 25, slotsPerRow: 2 },
    { id: 'col-75', width: 75, slotsPerRow: 3 },
  ],
  '50-50': [
    { id: 'col-50-1', width: 50, slotsPerRow: 2 },
    { id: 'col-50-2', width: 50, slotsPerRow: 2 },
  ],
  '75-25': [
    { id: 'col-75', width: 75, slotsPerRow: 3 },
    { id: 'col-25', width: 25, slotsPerRow: 2 },
  ],
  '100': [{ id: 'col-100', width: 100, slotsPerRow: 5 }],
};

// Create layout configuration from type
export function createLayoutConfig(type: LayoutType): LayoutConfig {
  return {
    type,
    columns: LAYOUT_CONFIGS[type],
  };
}

// Get fields for a specific column organized into rows
export function getColumnFields(
  columnId: string,
  fields: FormField[],
  positions: Record<string, FieldPosition>
): FormField[][] {
  // Get fields in this column
  const columnFields = fields.filter((field) => {
    const position = positions[field.id];
    return position && position.columnId === columnId;
  });

  // Sort by position
  columnFields.sort((a, b) => {
    const posA = positions[a.id];
    const posB = positions[b.id];
    if (posA.rowIndex !== posB.rowIndex) {
      return posA.rowIndex - posB.rowIndex;
    }
    return posA.slotIndex - posB.slotIndex;
  });

  // Group into rows
  const rows: FormField[][] = [];
  const column = LAYOUT_CONFIGS['50-50'][0]; // Default for fallback

  columnFields.forEach((field) => {
    const position = positions[field.id];
    if (!rows[position.rowIndex]) {
      rows[position.rowIndex] = [];
    }
    rows[position.rowIndex][position.slotIndex] = field;
  });

  return rows;
}

// Get column configuration by ID
export function getColumnConfig(
  layout: LayoutConfig,
  columnId: string
): ColumnConfig | undefined {
  return layout.columns.find((col) => col.id === columnId);
}

// Find next available position in a column (no max rows constraint)
export function findNextPosition(
  columnId: string,
  layout: LayoutConfig,
  positions: Record<string, FieldPosition>
): FieldPosition | null {
  const column = getColumnConfig(layout, columnId);
  if (!column) return null;

  // Determine current maximum row index used in this column
  const used = Object.values(positions).filter((p) => p.columnId === columnId);
  const maxRowIndex = used.length > 0 ? Math.max(...used.map((p) => p.rowIndex)) : -1;

  // First, scan existing rows for any free slot
  for (let rowIndex = 0; rowIndex <= maxRowIndex; rowIndex++) {
    for (let slotIndex = 0; slotIndex < column.slotsPerRow; slotIndex++) {
      const isOccupied = used.some(
        (pos) => pos.rowIndex === rowIndex && pos.slotIndex === slotIndex
      );
      if (!isOccupied) {
        return { columnId, rowIndex, slotIndex };
      }
    }
  }

  // If all existing rows are full, start a new row at the next index
  return { columnId, rowIndex: maxRowIndex + 1, slotIndex: 0 };
}

// Check if a position is valid for a column
export function isValidPosition(
  position: FieldPosition,
  layout: LayoutConfig
): boolean {
  const column = getColumnConfig(layout, position.columnId);
  if (!column) return false;

  return (
    position.rowIndex >= 0 &&
    position.slotIndex >= 0 &&
    position.slotIndex < column.slotsPerRow
  );
}

// Chunk fields into rows for rendering
export function chunkFieldsIntoRows<T>(items: T[], slotsPerRow: number): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += slotsPerRow) {
    rows.push(items.slice(i, i + slotsPerRow));
  }
  return rows;
}

// Get maximum number of rows across all columns in the layout
// Auto-expands to ensure there are always empty rows available for dropping
export function getMaxRowsInLayout(
  positions: Record<string, FieldPosition>,
  minEmptyRows: number = 3
): number {
  const maxUsedRow = Object.values(positions).reduce((max, pos) => {
    return Math.max(max, pos.rowIndex);
  }, -1);
  
  // Calculate the minimum rows needed
  const minRowsNeeded = Math.max(5, maxUsedRow + 1 + minEmptyRows);
  
  return minRowsNeeded;
}

// Check if a specific position is occupied by a field
export function isPositionOccupied(
  position: FieldPosition,
  positions: Record<string, FieldPosition>
): boolean {
  return Object.values(positions).some(
    (pos) =>
      pos.columnId === position.columnId &&
      pos.rowIndex === position.rowIndex &&
      pos.slotIndex === position.slotIndex
  );
}

// Get the field ID at a specific position, if one exists
export function getFieldAtPosition(
  position: FieldPosition,
  positions: Record<string, FieldPosition>
): string | null {
  for (const [fieldId, pos] of Object.entries(positions)) {
    if (
      pos.columnId === position.columnId &&
      pos.rowIndex === position.rowIndex &&
      pos.slotIndex === position.slotIndex
    ) {
      return fieldId;
    }
  }
  return null;
}

// Check how many empty rows are available at the bottom of the layout
export function getEmptyRowsCount(
  positions: Record<string, FieldPosition>,
  layout: LayoutConfig,
  maxRows: number
): number {
  const maxUsedRow = Object.values(positions).reduce((max, pos) => {
    return Math.max(max, pos.rowIndex);
  }, -1);
  
  return Math.max(0, maxRows - maxUsedRow - 1);
}

// Check if a specific row is completely empty across all columns
export function isRowEmpty(
  rowIndex: number,
  positions: Record<string, FieldPosition>
): boolean {
  return !Object.values(positions).some(pos => pos.rowIndex === rowIndex);
}

// Get layout statistics for better row management
export function getLayoutStats(
  positions: Record<string, FieldPosition>,
  layout: LayoutConfig
) {
  const maxUsedRow = Object.values(positions).reduce((max, pos) => {
    return Math.max(max, pos.rowIndex);
  }, -1);
  
  const totalSlots = layout.columns.reduce((total, col) => total + col.slotsPerRow, 0);
  const usedSlots = Object.keys(positions).length;
  const utilization = usedSlots > 0 ? (usedSlots / ((maxUsedRow + 1) * totalSlots)) * 100 : 0;
  
  return {
    maxUsedRow,
    totalFields: usedSlots,
    utilization: Math.round(utilization),
    recommendedRows: Math.max(5, maxUsedRow + 4) // Always keep 3+ empty rows
  };
}

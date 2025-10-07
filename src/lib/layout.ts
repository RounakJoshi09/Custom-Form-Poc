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

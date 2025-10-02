import { LayoutType, LayoutConfig, ColumnConfig, FormField, FieldPosition } from './schema';

// Mapping of layout types to column configurations
export const LAYOUT_CONFIGS: Record<LayoutType, ColumnConfig[]> = {
  '25-75': [
    { id: 'col-25', width: 25, slotsPerRow: 2, maxRows: 2 },
    { id: 'col-75', width: 75, slotsPerRow: 3, maxRows: 4 },
  ],
  '50-50': [
    { id: 'col-50-1', width: 50, slotsPerRow: 2, maxRows: 3 },
    { id: 'col-50-2', width: 50, slotsPerRow: 2, maxRows: 3 },
  ],
  '75-25': [
    { id: 'col-75', width: 75, slotsPerRow: 3, maxRows: 4 },
    { id: 'col-25', width: 25, slotsPerRow: 2, maxRows: 2 },
  ],
  '100': [
    { id: 'col-100', width: 100, slotsPerRow: 5, maxRows: 5 },
  ],
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
  return layout.columns.find(col => col.id === columnId);
}

// Find next available position in a column
export function findNextPosition(
  columnId: string,
  layout: LayoutConfig,
  positions: Record<string, FieldPosition>
): FieldPosition | null {
  const column = getColumnConfig(layout, columnId);
  if (!column) return null;

  // Check each row and slot
  for (let rowIndex = 0; rowIndex < column.maxRows; rowIndex++) {
    for (let slotIndex = 0; slotIndex < column.slotsPerRow; slotIndex++) {
      // Check if this position is occupied
      const isOccupied = Object.values(positions).some(
        pos => pos.columnId === columnId && 
               pos.rowIndex === rowIndex && 
               pos.slotIndex === slotIndex
      );
      
      if (!isOccupied) {
        return { columnId, rowIndex, slotIndex };
      }
    }
  }
  
  return null; // No available positions
}

// Check if a position is valid for a column
export function isValidPosition(
  position: FieldPosition,
  layout: LayoutConfig
): boolean {
  const column = getColumnConfig(layout, position.columnId);
  if (!column) return false;
  
  return position.rowIndex >= 0 && 
         position.rowIndex < column.maxRows &&
         position.slotIndex >= 0 && 
         position.slotIndex < column.slotsPerRow;
}

// Chunk fields into rows for rendering
export function chunkFieldsIntoRows<T>(
  items: T[],
  slotsPerRow: number
): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += slotsPerRow) {
    rows.push(items.slice(i, i + slotsPerRow));
  }
  return rows;
}
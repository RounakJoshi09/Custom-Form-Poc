// Drag and drop item types
export const DND_ITEM_TYPES = {
  FIELD_FROM_PALETTE: 'field_from_palette',
  EXISTING_FIELD: 'existing_field',
} as const;

// Drag item interface for field from palette
export interface FieldFromPaletteDragItem {
  type: typeof DND_ITEM_TYPES.FIELD_FROM_PALETTE;
  fieldType: string;
}

// Drag item interface for existing field
export interface ExistingFieldDragItem {
  type: typeof DND_ITEM_TYPES.EXISTING_FIELD;
  fieldId: string;
}

// Union type for all drag items
export type DragItem = FieldFromPaletteDragItem | ExistingFieldDragItem;
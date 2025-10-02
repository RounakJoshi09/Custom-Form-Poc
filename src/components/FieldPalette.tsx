'use client';

import React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText,
  Divider 
} from '@mui/material';
import { useDrag } from 'react-dnd';
import { FIELD_REGISTRY } from '@/lib/field-registry';
import { DND_ITEM_TYPES, FieldFromPaletteDragItem } from '@/lib/dnd-types';
import * as Icons from '@mui/icons-material';

interface DraggableFieldItemProps {
  fieldType: string;
  label: string;
  description: string;
  icon: string;
}

function DraggableFieldItem({ fieldType, label, description, icon }: DraggableFieldItemProps) {
  const [{ isDragging }, drag] = useDrag<FieldFromPaletteDragItem, void, { isDragging: boolean }>(() => ({
    type: DND_ITEM_TYPES.FIELD_FROM_PALETTE,
    item: {
      type: DND_ITEM_TYPES.FIELD_FROM_PALETTE,
      fieldType,
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }), [fieldType]);

  // Get the icon component dynamically
  const IconComponent = (Icons as any)[icon] || Icons.Help;

  return (
    <ListItem
      ref={drag}
      sx={{
        cursor: 'grab',
        opacity: isDragging ? 0.5 : 1,
        '&:hover': {
          backgroundColor: 'action.hover',
        },
        '&:active': {
          cursor: 'grabbing',
        },
      }}
    >
      <ListItemIcon>
        <IconComponent color="primary" />
      </ListItemIcon>
      <ListItemText 
        primary={label} 
        secondary={description}
        secondaryTypographyProps={{ variant: 'caption' }}
      />
    </ListItem>
  );
}

export default function FieldPalette() {
  return (
    <Paper 
      elevation={1}
      sx={{ 
        width: 280,
        height: 'fit-content',
        maxHeight: '80vh',
        overflow: 'auto',
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Field Components
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Drag fields to the canvas to build your form
        </Typography>
      </Box>
      
      <Divider />
      
      <List dense>
        {FIELD_REGISTRY.map((field) => (
          <DraggableFieldItem
            key={field.type}
            fieldType={field.type}
            label={field.label}
            description={field.description}
            icon={field.icon}
          />
        ))}
      </List>
    </Paper>
  );
}
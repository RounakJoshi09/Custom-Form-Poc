'use client';

import React from 'react';
import { Card, CardContent, Typography, IconButton, Box } from '@mui/material';
import { Delete as DeleteIcon, Settings as SettingsIcon } from '@mui/icons-material';
import { useDrag } from 'react-dnd';
import { FormField } from '@/lib/schema';
import { useBuilder } from '@/context/BuilderContext';
import { getFieldDefinition } from '@/lib/field-registry';
import { DND_ITEM_TYPES, ExistingFieldDragItem } from '@/lib/dnd-types';
import * as Icons from '@mui/icons-material';

interface FieldCardProps {
  field: FormField;
  isSelected: boolean;
}

export default function FieldCard({ field, isSelected }: FieldCardProps) {
  const { actions } = useBuilder();
  
  const [{ isDragging }, drag] = useDrag<ExistingFieldDragItem, void, { isDragging: boolean }>(() => ({
    type: DND_ITEM_TYPES.EXISTING_FIELD,
    item: {
      type: DND_ITEM_TYPES.EXISTING_FIELD,
      fieldId: field.id,
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }), [field.id]);

  const fieldDefinition = getFieldDefinition(field.type);
  const IconComponent = fieldDefinition 
    ? (Icons as any)[fieldDefinition.icon] || Icons.Help
    : Icons.Help;

  const handleSelect = () => {
    actions.selectField(field.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    actions.removeField(field.id);
  };

  return (
    <Card
      ref={drag}
      onClick={handleSelect}
      sx={{
        cursor: 'move',
        opacity: isDragging ? 0.5 : 1,
        border: isSelected ? '2px solid' : '1px solid',
        borderColor: isSelected ? 'primary.main' : 'divider',
        '&:hover': {
          borderColor: 'primary.main',
          boxShadow: 1,
        },
        position: 'relative',
      }}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconComponent fontSize="small" color="primary" />
          <Typography variant="body2" sx={{ fontWeight: 500, flex: 1 }}>
            {field.props.label}
          </Typography>
          {isSelected && (
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <IconButton 
                size="small" 
                onClick={handleDelete}
                sx={{ p: 0.5 }}
                color="error"
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          )}
        </Box>
        {field.props.helperText && (
          <Typography 
            variant="caption" 
            color="text.secondary" 
            sx={{ mt: 0.5, display: 'block' }}
          >
            {field.props.helperText}
          </Typography>
        )}
        {field.validation.required && (
          <Typography 
            variant="caption" 
            color="error" 
            sx={{ mt: 0.5, display: 'block' }}
          >
            * Required
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
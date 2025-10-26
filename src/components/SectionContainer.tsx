'use client';

import React, { useState } from 'react';
import {
  Paper,
  Box,
  Typography,
  TextField,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import { MoreVert as MoreVertIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useBuilder } from '@/context/BuilderContext';
import { SectionConfig } from '@/lib/schema';
import { getFieldAtPosition, getSectionFields } from '@/lib/layout';
import GridCell from './GridCell';

interface SectionContainerProps {
  section: SectionConfig;
  columnId: string;
  maxRows: number;
}

export default function SectionContainer({ section, columnId, maxRows }: SectionContainerProps) {
  const { state, actions } = useBuilder();
  const { fields, positions } = state.schema;

  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState(section.name);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // Get fields in this section
  const sectionFields = getSectionFields(columnId, section.id, fields, positions);
  const hasFields = sectionFields.length > 0;

  const handleNameSubmit = () => {
    if (tempName.trim() && tempName !== section.name) {
      actions.renameSection(columnId, section.id, tempName.trim());
    } else {
      setTempName(section.name);
    }
    setEditingName(false);
  };

  const handleNameKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNameSubmit();
    } else if (e.key === 'Escape') {
      setTempName(section.name);
      setEditingName(false);
    }
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleRemoveSection = () => {
    if (!hasFields || window.confirm('This section contains fields. Are you sure you want to delete it?')) {
      actions.removeSection(columnId, section.id);
    }
    handleMenuClose();
  };

  return (
    <Paper
      elevation={0}
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        mb: 2,
        overflow: 'hidden',
      }}
    >
      {/* Section Header */}
      <Box
        sx={{
          p: 1.5,
          backgroundColor: 'grey.50',
          borderBottom: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ flex: 1, mr: 2 }}>
          {editingName ? (
            <TextField
              size="small"
              fullWidth
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              onBlur={handleNameSubmit}
              onKeyDown={handleNameKeyPress}
              autoFocus
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'background.paper',
                },
              }}
            />
          ) : (
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 600,
                cursor: 'pointer',
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
              onClick={() => setEditingName(true)}
            >
              {section.name}
            </Typography>
          )}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="caption" color="text.secondary">
            {section.slotsPerRow} slots per row
          </Typography>

          <IconButton size="small" onClick={handleMenuClick}>
            <MoreVertIcon fontSize="small" />
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <MenuItem onClick={() => { setEditingName(true); handleMenuClose(); }}>
              Rename Section
            </MenuItem>
            <MenuItem
              onClick={handleRemoveSection}
              disabled={hasFields}
              sx={{ color: hasFields ? 'text.disabled' : 'error.main' }}
            >
              <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
              {hasFields ? 'Remove (has fields)' : 'Remove Section'}
            </MenuItem>
          </Menu>
        </Box>
      </Box>

      {/* Section Grid */}
      <Box sx={{ p: 1, overflow: 'hidden' }}>
        {Array.from({ length: maxRows }).map((_, rowIndex) => (
          <Box key={rowIndex} sx={{
            display: 'flex',
            gap: 1,
            mb: 1,
            width: '100%',
            overflow: 'hidden'
          }}>
            {Array.from({ length: section.slotsPerRow }).map((_, slotIndex) => {
              const position = { columnId, sectionId: section.id, rowIndex, slotIndex };
              const fieldId = getFieldAtPosition(position, positions);
              const field = fieldId ? fields.find(f => f.id === fieldId) : undefined;
              const isSelected = field && state.selectedFieldId === field.id;

              return (
                <GridCell
                  key={`${rowIndex}-${slotIndex}`}
                  columnId={columnId}
                  sectionId={section.id}
                  rowIndex={rowIndex}
                  slotIndex={slotIndex}
                  slotsPerRow={section.slotsPerRow}
                  field={field}
                  isSelected={isSelected}
                />
              );
            })}
          </Box>
        ))}
      </Box>
    </Paper>
  );
}
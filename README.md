# Custom Forms - POC

A production-ready dynamic form builder built with Next.js, TypeScript, and Material UI. This application enables users to create custom forms through an intuitive drag-and-drop interface without any technical expertise.

## 🚀 Features

- **Drag & Drop Form Builder**: Intuitive interface for building forms
- **Multiple Field Types**: Text, Textarea, Select, Date, DateTime, Checkbox, File Upload
- **Flexible Layouts**: Support for 25-75, 50-50, 75-25, and 100% column layouts
- **Real-time Preview**: See how your form looks while building
- **Form Persistence**: Save and load forms using filesystem storage
- **Responsive Design**: Works on desktop and mobile devices
- **Field Validation**: Required field validation with extensible architecture
- **Form Rendering**: Shareable URLs for end-users to fill out forms

## 📋 Prerequisites

- Node.js 18+
- npm or yarn package manager

## 🛠️ Installation

1. **Clone the repository**:

   ```bash
   git clone <your-repo-url>
   cd custom-forms-poc
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Start the development server**:

   ```bash
   npm run dev
   ```

4. **Open your browser**:
   Navigate to `http://localhost:3000`

## 📖 Usage

### Creating a Form

1. Navigate to `/builder` or click "Open Form Builder" on the homepage
2. Drag field components from the right panel to the canvas
3. Configure field properties in the configuration panel
4. Switch between different layout options (25-75, 50-50, 75-25, 100%)
5. Preview your form by clicking the "Preview" tab
6. Save your form using the "Save Form" button

### Viewing Forms

1. Navigate to `/forms` to see all saved forms
2. Click "View Form" to see the rendered form for end-users
3. Forms can be shared via their unique URLs (`/forms/{form-id}`)

### Form Layout System

The application uses a sophisticated layout system:

- **25% Column**: Max 2 fields per row, 2 rows maximum
- **50% Column**: Max 2 fields per row, 3 rows maximum
- **75% Column**: Max 3 fields per row, 4 rows maximum
- **100% Column**: Max 5 fields per row, 5 rows maximum

This ensures proper field distribution and visual balance across different layout configurations.

## 🏗️ Architecture

### Project Structure

```
custom-forms-poc/
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── api/            # API routes
│   │   ├── builder/        # Form builder page
│   │   └── forms/          # Form rendering pages
│   ├── components/         # React components
│   ├── context/           # React Context providers
│   └── lib/               # Utilities and helpers
├── data/                  # Form storage (filesystem)
└── public/               # Static assets
```

### Key Components

- **BuilderContext**: State management for form building
- **Canvas**: Drag-and-drop form building interface
- **FieldPalette**: Available field types
- **FieldConfigPanel**: Field property configuration
- **PreviewPanel**: Real-time form preview
- **FormPreview**: Rendered form for end-users

### Data Schema

Forms are stored as JSON with the following structure:

```typescript
interface FormSchema {
  metadata: {
    id: string;
    name: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
    version: number;
  };
  layout: LayoutConfig;
  fields: FormField[];
  positions: Record<string, FieldPosition>;
}
```

## 🎨 Reusable Components

This project is designed as a reference implementation. Key reusable components include:

### Field Registry (`src/lib/field-registry.ts`)

Defines available field types with icons and metadata.

### Layout System (`src/lib/layout.ts`)

Handles column configurations and field positioning logic.

### Form Renderer (`src/components/PreviewPanel.tsx`)

Renders forms from JSON schema - can be extracted for use in other projects.

### Builder Context (`src/context/BuilderContext.tsx`)

Complete state management for form building operations.

## 📡 API Endpoints

- `GET /api/forms` - List all saved forms
- `POST /api/forms` - Create a new form
- `GET /api/forms/{id}` - Get a specific form
- `PUT /api/forms/{id}` - Update a form
- `DELETE /api/forms/{id}` - Delete a form

## 🚀 Production Deployment

### Environment Variables

```bash
# For server-side rendering of forms
VERCEL_URL=your-production-url.com
```

### Build Commands

```bash
# Build for production
npm run build

# Start production server
npm run start

# Format code
npm run format

# Lint code
npm run lint
```

### Deployment Options

The application can be deployed to:

- **Vercel** (recommended for Next.js apps)
- **Netlify**
- **Docker containers**
- **Traditional Node.js hosting**

## 🔧 Customization

### Adding New Field Types

1. Update the `FieldType` type in `src/lib/schema.ts`
2. Add field definition to `src/lib/field-registry.ts`
3. Implement rendering logic in `src/components/PreviewPanel.tsx`
4. Add any specific configuration options to `src/components/FieldConfigPanel.tsx`

### Extending Validation

The validation system is designed to be extensible:

1. Add new validation rules to `FieldValidation` interface
2. Implement validation logic in the preview component
3. Add configuration UI in the field config panel

### Custom Layouts

To add new layout configurations:

1. Update `LayoutType` in `src/lib/schema.ts`
2. Add layout configuration to `LAYOUT_CONFIGS` in `src/lib/layout.ts`
3. Update UI components to handle the new layout

## 🐛 Known Limitations

- **Storage**: Uses filesystem storage (not suitable for serverless deployments without persistent storage)
- **Concurrent Editing**: No real-time collaboration features
- **Form Submissions**: Basic form submission (shows alert) - needs backend integration for production
- **File Upload**: File handling is basic - needs cloud storage integration
- **User Management**: No authentication or user-specific forms

## 🤝 Contributing

This is a proof-of-concept project designed for reference and learning. For production use:

1. Integrate with a proper database (PostgreSQL, MongoDB)
2. Add user authentication and authorization
3. Implement proper file upload handling
4. Add form submission storage and management
5. Include comprehensive testing
6. Add monitoring and logging

## 📄 License

MIT License - feel free to use this code as a reference for your own projects.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components by [Material-UI](https://mui.com/)
- Drag and drop by [react-dnd](https://react-dnd.github.io/react-dnd/)
- Icons by [Material Design Icons](https://mui.com/material-ui/material-icons/)

## 📞 Support

This is a proof-of-concept project. For production implementations, consider:

- Adding comprehensive error handling
- Implementing proper logging and monitoring
- Adding unit and integration tests
- Setting up CI/CD pipelines
- Adding security measures and input validation

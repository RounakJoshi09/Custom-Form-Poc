/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    Container,
    Typography,
    Box,
    Alert,
    Button,
    Card,
    CardContent,
    Grid,
    Chip,
    Divider,
    Paper,
} from '@mui/material';
import Link from 'next/link';
import { ArrowBack, Visibility } from '@mui/icons-material';
import { FormSchema, FormSubmission } from '@/lib/schema';
import { getSectionFields } from '@/lib/layout';

interface FormSubmissionsPageProps {
    params: Promise<{
        id: string;
    }>;
}

// This is a server component that fetches the form and submissions data
async function getFormAndSubmissionsData(
    id: string
): Promise<{
    schema?: FormSchema;
    submissions?: FormSubmission[];
    error?: string
}> {
    try {
        // In a server component, we need to construct the full URL
        const baseUrl = process.env.VERCEL_URL
            ? `https://${process.env.VERCEL_URL}`
            : 'http://localhost:3000';

        const [formResponse, submissionsResponse] = await Promise.all([
            fetch(`${baseUrl}/api/forms/${id}`, {
                cache: 'no-store',
            }),
            fetch(`${baseUrl}/api/forms/${id}/submissions`, {
                cache: 'no-store',
            }),
        ]);

        if (!formResponse.ok) {
            return { error: 'Form not found' };
        }

        const schema = await formResponse.json();
        const submissions = submissionsResponse.ok ? await submissionsResponse.json() : [];

        return { schema, submissions };
    } catch {
        return { error: 'Failed to load form data' };
    }
}

function SubmissionCard({ submission, schema }: { submission: FormSubmission; schema: FormSchema }) {
    const formatFieldValue = (fieldKey: string, value: any) => {
        if (value === null || value === undefined) return 'Not provided';

        const field = schema.fields.find(f => f.key === fieldKey);
        if (!field) return String(value);

        switch (field.type) {
            case 'checkbox':
                return value ? 'Yes' : 'No';
            case 'select':
                const option = field.props.options?.find(o => o.value === value);
                return option ? option.label : String(value);
            case 'radio':
                const radioOption = field.props.options?.find(o => o.value === value);
                return radioOption ? radioOption.label : String(value);
            case 'file':
                // Check if we're in browser environment and value is FileList
                if (typeof window !== 'undefined' && typeof FileList !== 'undefined' && value instanceof FileList) {
                    return Array.from(value).map(f => f.name).join(', ');
                }
                // Handle array of file names (likely from form submission)
                if (Array.isArray(value)) {
                    return value.join(', ');
                }
                return String(value);
            default:
                return String(value);
        }
    };

    // Organize fields by sections
    const organizeFieldsBySections = () => {
        const sectionsData: Array<{
            sectionName: string;
            fields: Array<{ field: any; value: any }>;
        }> = [];

        // Check if this is a 100% layout with sections
        const mainColumn = schema.layout.columns.find(col => col.width === 100);
        if (mainColumn && mainColumn.sections && mainColumn.sections.length > 0) {
            // Organize by sections for 100% layout
            mainColumn.sections.forEach(section => {
                const sectionFields = getSectionFields(mainColumn.id, section.id, schema.fields, schema.positions);
                const fieldsWithValues = sectionFields.map(field => ({
                    field,
                    value: submission.data[field.key]
                })).filter(item => item.value !== null && item.value !== undefined && item.value !== '');

                if (fieldsWithValues.length > 0) {
                    sectionsData.push({
                        sectionName: section.name,
                        fields: fieldsWithValues
                    });
                }
            });
        } else {
            // For non-100% layouts or layouts without sections, organize by column
            schema.layout.columns.forEach(column => {
                const columnFields = schema.fields.filter(field => {
                    const position = schema.positions[field.id];
                    return position && position.columnId === column.id;
                });

                const fieldsWithValues = columnFields.map(field => ({
                    field,
                    value: submission.data[field.key]
                })).filter(item => item.value !== null && item.value !== undefined && item.value !== '');

                if (fieldsWithValues.length > 0) {
                    const sectionName = column.sectionName || `Section ${column.id}`;
                    sectionsData.push({
                        sectionName,
                        fields: fieldsWithValues
                    });
                }
            });
        }

        return sectionsData;
    };

    const sectionsData = organizeFieldsBySections();

    return (
        <Card sx={{ height: '100%' }}>
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" component="h3">
                        Submission #{submission.id.slice(-8)}
                    </Typography>
                    <Chip
                        label={new Date(submission.submittedAt).toLocaleDateString()}
                        size="small"
                        variant="outlined"
                    />
                </Box>

                <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                    Submitted: {new Date(submission.submittedAt).toLocaleString()}
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                    {sectionsData.map((section, sectionIndex) => (
                        <Box key={sectionIndex} sx={{ mb: 3 }}>
                            <Typography
                                variant="subtitle1"
                                color="primary"
                                sx={{
                                    fontWeight: 600,
                                    mb: 1.5,
                                    borderBottom: '1px solid',
                                    borderColor: 'divider',
                                    pb: 0.5
                                }}
                            >
                                {section.sectionName}
                            </Typography>

                            {section.fields.map(({ field, value }) => (
                                <Box key={field.id} sx={{ mb: 1.5, pl: 1 }}>
                                    <Typography variant="subtitle2" color="text.primary" sx={{ fontWeight: 500 }}>
                                        {field.props.label}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {formatFieldValue(field.key, value)}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                    ))}
                </Box>
            </CardContent>
        </Card>
    );
}

export default async function FormSubmissionsPage({ params }: FormSubmissionsPageProps) {
    const { id } = await params;
    const { schema, submissions, error } = await getFormAndSubmissionsData(id);

    if (error || !schema) {
        return (
            <Container maxWidth="md" sx={{ py: 4 }}>
                <Box sx={{ textAlign: 'center' }}>
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error || 'Form not found'}
                    </Alert>
                    <Link href="/" style={{ textDecoration: 'none' }}>
                        <Button startIcon={<ArrowBack />}>Back to Home</Button>
                    </Link>
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Link href={`/forms/${id}`} style={{ textDecoration: 'none' }}>
                        <Button startIcon={<ArrowBack />} size="small">
                            Back to Form
                        </Button>
                    </Link>
                    <Typography variant="h4" component="h1">
                        {schema.metadata.name} - Submissions
                    </Typography>
                </Box>

                {schema.metadata.description && (
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                        {schema.metadata.description}
                    </Typography>
                )}

                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Chip
                        label={`${submissions?.length || 0} submissions`}
                        color="primary"
                        variant="outlined"
                    />
                    <Link href={`/forms/${id}`} style={{ textDecoration: 'none' }}>
                        <Button variant="outlined" startIcon={<Visibility />}>
                            Fill Form
                        </Button>
                    </Link>
                </Box>
            </Box>

            {/* Submissions Content */}
            {!submissions || submissions.length === 0 ? (
                <Paper sx={{ p: 6, textAlign: 'center' }}>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                        No submissions yet
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        This form hasn&apos;t been submitted yet. Share the form link to start collecting responses.
                    </Typography>
                    <Link href={`/forms/${id}`} style={{ textDecoration: 'none' }}>
                        <Button variant="contained" size="large" startIcon={<Visibility />}>
                            Fill Form
                        </Button>
                    </Link>
                </Paper>
            ) : (
                <Grid container spacing={3}>
                    {submissions.map((submission) => (
                        <Grid size={{ xs: 12, md: 6, lg: 4 }} key={submission.id}>
                            <SubmissionCard submission={submission} schema={schema} />
                        </Grid>
                    ))}
                </Grid>
            )}
        </Container>
    );
}

// Optional: Generate metadata for the page
export async function generateMetadata({ params }: FormSubmissionsPageProps) {
    const { id } = await params;
    const { schema } = await getFormAndSubmissionsData(id);

    return {
        title: schema
            ? `${schema.metadata.name} - Submissions | Custom Forms`
            : 'Form Not Found | Custom Forms',
        description:
            schema?.metadata.description || 'View form submissions',
    };
}

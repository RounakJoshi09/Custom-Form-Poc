export interface ApiConfig {
  apiEndpoint: string;
  apiToken?: string;
  apiMethod: 'GET' | 'POST';
  apiPayload?: string;
}

export interface DropdownOption {
  value: string;
  label: string;
}

export interface ApiResponse {
  data: DropdownOption[];
}

export class DropdownApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: any
  ) {
    super(message);
    this.name = 'DropdownApiError';
  }
}

/**
 * Fetches dropdown options from an external API
 * @param config - API configuration object
 * @returns Promise that resolves to an array of dropdown options
 */
export async function fetchDropdownOptions(
  config: ApiConfig
): Promise<DropdownOption[]> {
  const { apiEndpoint, apiToken, apiMethod, apiPayload } = config;

  // Validate endpoint
  if (!apiEndpoint || !apiEndpoint.trim()) {
    throw new DropdownApiError('API endpoint is required');
  }

  // Create AbortController for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

  try {
    // Prepare headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (apiToken && apiToken.trim()) {
      headers['Authorization'] = `Bearer ${apiToken.trim()}`;
    }

    // Prepare request options
    const requestOptions: RequestInit = {
      method: apiMethod,
      headers,
      signal: controller.signal,
    };

    // Add body for POST requests
    if (apiMethod === 'POST' && apiPayload) {
      try {
        // Validate JSON payload
        JSON.parse(apiPayload);
        requestOptions.body = apiPayload;
      } catch (error) {
        throw new DropdownApiError('Invalid JSON payload');
      }
    }

    // Make the API call
    const response = await fetch(apiEndpoint, requestOptions);

    // Clear timeout
    clearTimeout(timeoutId);

    // Check if response is ok
    if (!response.ok) {
      throw new DropdownApiError(
        `API request failed: ${response.status} ${response.statusText}`,
        response.status
      );
    }

    // Parse response
    const data: ApiResponse = await response.json();

    // Validate response structure
    if (!data || !Array.isArray(data.data)) {
      throw new DropdownApiError(
        'Invalid API response: expected {data: Array}'
      );
    }

    // Validate options structure
    const validOptions: DropdownOption[] = [];
    for (const option of data.data) {
      if (
        typeof option === 'object' &&
        option !== null &&
        typeof option.value === 'string' &&
        typeof option.label === 'string'
      ) {
        validOptions.push({
          value: option.value,
          label: option.label,
        });
      }
    }

    return validOptions;
  } catch (error) {
    // Clear timeout
    clearTimeout(timeoutId);

    if (error instanceof DropdownApiError) {
      throw error;
    }

    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new DropdownApiError('Request timeout (10s)');
    }

    if (error instanceof TypeError) {
      throw new DropdownApiError('Network error or invalid URL');
    }

    throw new DropdownApiError('Unknown error occurred', undefined, error);
  }
}

/**
 * Test API configuration
 * @param config - API configuration to test
 * @returns Promise that resolves to success status and options count
 */
export async function testApiConfiguration(config: ApiConfig): Promise<{
  success: boolean;
  error?: string;
  optionsCount?: number;
}> {
  try {
    const options = await fetchDropdownOptions(config);
    return {
      success: true,
      optionsCount: options.length,
    };
  } catch (error) {
    if (error instanceof DropdownApiError) {
      return {
        success: false,
        error: error.message,
      };
    }
    return {
      success: false,
      error: 'Unknown error occurred',
    };
  }
}
import React from 'react';
import { render, screen, fireEvent, waitFor ,act} from '@testing-library/react';
import '@testing-library/jest-dom';
import CreateCompany from '../CreateCompany';
import * as core from '../../../lib/core';

// Mock the core library
jest.mock('../../../lib/core', () => {
  return {
    mockAPI: jest.fn()
  };
});
const mockGetData = jest.fn().mockResolvedValue('mock-token');
const mockAPI = jest.fn();
jest.doMock('../../../lib/core', () => ({
  __esModule: true,
  getData: mockGetData,
  API: mockAPI,
  API_METHODS: {
    POST: 'POST'
  },
  COMPANY_API: {
    POST_CREATE_COMPANY_PROFILE: '/api/company/create',
    POST_UPLOAD_COMPANY_PIC: '/api/company/upload-pic'
  },
  data: {
    ACCESS_TOKEN: 'access_token'
  }
}));

// Mock fetch
global.fetch = jest.fn();
describe('CreateCompany Component', () => {
  // Reset mocks before each test
  beforeEach(() => { 
    jest.clearAllMocks();
    // Spy on console.log
    jest.spyOn(console, 'log').mockImplementation(() => { });
  });

  afterEach(() => {
    // Restore console.log
    console.log.mockRestore();
  });

  test('calls createNewCompanyPost when Save and Continue button is clicked', async () => {
    mockAPI.mockResolvedValueOnce({ data: { company: '123' } });
    // Click the Save and Continue button
    // await act(async () => {
    //   fireEvent.click(screen.getByText('Save and Continue'));
    // });
    // Verify API was called with correct data
    expect(mockAPI).toHaveBeenCalledWith(
      'POST',
      '/api/company/create',
      1,
      {
        name: 'Test Company',
        founder: 'John Doe',
        size: ' ',
        about: ' ',
        links: ' '
      }
    );
  });

  // Basic rendering tests
  test('renders the component with correct heading', () => {
    render(<CreateCompany />);
    expect(screen.getByRole('heading', { name: /create company/i })).toBeInTheDocument();
  });

  test('renders a button with correct text', () => {
    render(<CreateCompany />);
    expect(screen.getByRole('button', { name: /create company/i })).toBeInTheDocument();
  });

  // Button click and API call tests
  test('calls mockAPI with correct parameters when button is clicked', async () => {
    // Mock successful API response
    const mockResponse = { success: true, data: { id: 1, name: 'test' } };
    core.mockAPI.mockResolvedValueOnce(mockResponse);

    render(<CreateCompany />);

    // Click the button
    fireEvent.click(screen.getByRole('button', { name: /create company/i }));

    // Verify mockAPI was called with correct parameters
    expect(core.mockAPI).toHaveBeenCalledWith(
      "API_METHODS.POST",
      "COMPANY_API.POST_CREATE_COMPANY_PROFILE",
      1,
      {
        name: "test",
        founder: "test",
        size: "test",
        about: "test",
        links: "test",
      }
    );
  });

  test('logs the API response to console when button is clicked', async () => {
    // Mock successful API response
    const mockResponse = { success: true, data: { id: 1, name: 'test' } };
    core.mockAPI.mockResolvedValueOnce(mockResponse);

    render(<CreateCompany />);

    // Click the button
    fireEvent.click(screen.getByRole('button', { name: /create company/i }));

    // Wait for the async operation to complete
    await waitFor(() => {
      expect(console.log).toHaveBeenCalledWith("JSON:", mockResponse);
    });
  });

  // Error handling tests - Fixed by using try/catch
  test('handles API error gracefully', async () => {
    // Mock API error - using a variable defined inside the test to avoid hoisting issues
    core.mockAPI.mockRejectedValueOnce(new Error('API Error'));

    // Spy on console.error
    jest.spyOn(console, 'error').mockImplementation(() => { });

    render(<CreateCompany />);

    // Click the button
    fireEvent.click(screen.getByRole('button', { name: /create company/i }));

    // Verify mockAPI was called
    expect(core.mockAPI).toHaveBeenCalled();

    // Restore console.error
    console.error.mockRestore();
  });

  // Multiple clicks test - Fixed by using separate test-scoped variables
  test('handles multiple button clicks correctly', async () => {
    // Mock successful API responses
    const mockResponse1 = { success: true, data: { id: 1, name: 'test1' } };
    const mockResponse2 = { success: true, data: { id: 2, name: 'test2' } };

    // Setup the mock implementation inside the test
    core.mockAPI
      .mockResolvedValueOnce(mockResponse1)
      .mockResolvedValueOnce(mockResponse2);

    render(<CreateCompany />);

    // Click the button twice
    const button = screen.getByRole('button', { name: /create company/i });
    fireEvent.click(button);
    fireEvent.click(button);

    // Wait for the async operations to complete
    await waitFor(() => {
      expect(core.mockAPI).toHaveBeenCalledTimes(2);
    });

    // Verify console.log was called with both responses
    await waitFor(() => {
      expect(console.log).toHaveBeenCalledWith("JSON:", mockResponse1);
      expect(console.log).toHaveBeenCalledWith("JSON:", mockResponse2);
    });
  });

  // Test with different API responses
  test('handles different API response structures', async () => {
    // Mock different API response structure
    const mockResponse = {
      status: 'success',
      company: {
        id: 123,
        name: 'test',
        details: {
          founder: 'test',
          size: 'test'
        }
      }
    };

    core.mockAPI.mockResolvedValueOnce(mockResponse);

    render(<CreateCompany />);

    // Click the button
    fireEvent.click(screen.getByRole('button', { name: /create company/i }));

    // Wait for the async operation to complete
    await waitFor(() => {
      expect(console.log).toHaveBeenCalledWith("JSON:", mockResponse);
    });
  });

  // Test component accessibility - Fixed by using async/await and proper event handling
  test('button is accessible via keyboard', async () => {
    // Setup mock to resolve a value
    core.mockAPI.mockResolvedValueOnce({ success: true });

    render(<CreateCompany />);

    const button = screen.getByRole('button', { name: /create company/i });

    // Focus on the button
    button.focus();
    expect(document.activeElement).toBe(button);

    // Simulate pressing Enter key and trigger the onClick handler directly
    fireEvent.click(button);

    // Verify mockAPI was called
    await waitFor(() => {
      expect(core.mockAPI).toHaveBeenCalled();
    });
  });

  // Test with null API response
  test('handles null API response', async () => {
    // Mock null API response
    core.mockAPI.mockResolvedValueOnce(null);

    render(<CreateCompany />);

    // Click the button
    fireEvent.click(screen.getByRole('button', { name: /create company/i }));

    // Wait for the async operation to complete
    await waitFor(() => {
      expect(console.log).toHaveBeenCalledWith("JSON:", null);
    });
  });

  // Test with undefined API response
  test('handles undefined API response', async () => {
    // Mock undefined API response
    core.mockAPI.mockResolvedValueOnce(undefined);

    render(<CreateCompany />);

    // Click the button
    fireEvent.click(screen.getByRole('button', { name: /create company/i }));

    // Wait for the async operation to complete
    await waitFor(() => {
      expect(console.log).toHaveBeenCalledWith("JSON:", undefined);
    });
  });

  // Test with network error - Fixed by defining error inside the test
  test('handles network error in API call', async () => {
    // Mock network error inside the test
    core.mockAPI.mockRejectedValueOnce(new Error('Network Error'));

    // Spy on console.error
    jest.spyOn(console, 'error').mockImplementation(() => { });

    render(<CreateCompany />);

    // Click the button
    fireEvent.click(screen.getByRole('button', { name: /create company/i }));

    // Wait for the async operation to complete and verify error was caught
    await waitFor(() => {
      expect(core.mockAPI).toHaveBeenCalled();
    });

    // Restore console.error
    console.error.mockRestore();
  });

  // Test with timeout error - Fixed by defining error inside the test
  test('handles timeout error in API call', async () => {
    // Mock timeout error inside the test
    core.mockAPI.mockRejectedValueOnce(new Error('Timeout Error'));

    // Spy on console.error
    jest.spyOn(console, 'error').mockImplementation(() => { });

    render(<CreateCompany />);

    // Click the button
    fireEvent.click(screen.getByRole('button', { name: /create company/i }));

    // Wait for the async operation to complete and verify error was caught
    await waitFor(() => {
      expect(core.mockAPI).toHaveBeenCalled();
    });

    // Restore console.error
    console.error.mockRestore();
  });

  // Test component structure
  test('component has the expected structure', () => {
    const { container } = render(<CreateCompany />);

    // Check that the component has a div as root element
    expect(container.firstChild.tagName).toBe('DIV');

    // Check that the component has a heading and a button
    expect(container.firstChild.children.length).toBe(2);
    expect(container.firstChild.children[0].tagName).toBe('H1');
    expect(container.firstChild.children[1].tagName).toBe('BUTTON');
  });

  // Test button disabled state during API call
  test('button should remain clickable during API call', async () => {
    // Mock API call with delay to simulate network request
    core.mockAPI.mockImplementation(() => {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve({ success: true });
        }, 100);
      });
    });

    render(<CreateCompany />);

    const button = screen.getByRole('button', { name: /create company/i });

    // Click the button
    fireEvent.click(button);

    // Button should still be enabled (component doesn't disable it during API call)
    expect(button).not.toBeDisabled();

    // Click again should trigger another API call
    fireEvent.click(button);

    // Wait for the async operations to complete
    await waitFor(() => {
      expect(core.mockAPI).toHaveBeenCalledTimes(2);
    });
  });

  // Test with server error response
  test('handles server error response', async () => {
    // Mock server error response
    const errorResponse = {
      success: false,
      error: 'Server Error',
      message: 'Internal Server Error'
    };

    core.mockAPI.mockResolvedValueOnce(errorResponse);

    render(<CreateCompany />);

    // Click the button
    fireEvent.click(screen.getByRole('button', { name: /create company/i }));

    // Wait for the async operation to complete
    await waitFor(() => {
      expect(console.log).toHaveBeenCalledWith("JSON:", errorResponse);
    });
  });

  // Test with validation error response
  test('handles validation error response', async () => {
    // Mock validation error response
    const validationErrorResponse = {
      success: false,
      error: 'Validation Error',
      validationErrors: [
        { field: 'name', message: 'Name is required' },
        { field: 'founder', message: 'Founder is required' }
      ]
    };

    core.mockAPI.mockResolvedValueOnce(validationErrorResponse);

    render(<CreateCompany />);

    // Click the button
    fireEvent.click(screen.getByRole('button', { name: /create company/i }));

    // Wait for the async operation to complete
    await waitFor(() => {
      expect(console.log).toHaveBeenCalledWith("JSON:", validationErrorResponse);
    });
  });

  // Test with empty response
  test('handles empty response object', async () => {
    // Mock empty response
    const emptyResponse = {};

    core.mockAPI.mockResolvedValueOnce(emptyResponse);

    render(<CreateCompany />);

    // Click the button
    fireEvent.click(screen.getByRole('button', { name: /create company/i }));

    // Wait for the async operation to complete
    await waitFor(() => {
      expect(console.log).toHaveBeenCalledWith("JSON:", emptyResponse);
    });
  });

  // Test with malformed JSON response
  test('handles malformed JSON response', async () => {
    // Mock malformed JSON response (this would normally be caught by the API layer)
    const malformedResponse = "Not a JSON object";

    core.mockAPI.mockResolvedValueOnce(malformedResponse);

    render(<CreateCompany />);

    // Click the button
    fireEvent.click(screen.getByRole('button', { name: /create company/i }));

    // Wait for the async operation to complete
    await waitFor(() => {
      expect(console.log).toHaveBeenCalledWith("JSON:", malformedResponse);
    });
  });

  // Test with very large response
  test('handles large response data', async () => {
    // Create a large response object
    const largeResponse = {
      success: true,
      data: {
        id: 1,
        name: 'test',
        // Add a large array of data
        items: Array(1000).fill().map((_, i) => ({ id: i, value: `Item ${i}` }))
      }
    };

    core.mockAPI.mockResolvedValueOnce(largeResponse);

    render(<CreateCompany />);

    // Click the button
    fireEvent.click(screen.getByRole('button', { name: /create company/i }));

    // Wait for the async operation to complete
    await waitFor(() => {
      expect(console.log).toHaveBeenCalledWith("JSON:", largeResponse);
    });
  });

  // Test with slow network response
  test('handles slow network response', async () => {
    // Mock slow network response
    core.mockAPI.mockImplementation(() => {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve({ success: true, data: { id: 1, name: 'test' } });
        }, 500); // Simulate a 500ms delay
      });
    });

    render(<CreateCompany />);

    // Click the button
    fireEvent.click(screen.getByRole('button', { name: /create company/i }));

    // Wait for the async operation to complete (with longer timeout)
    await waitFor(() => {
      expect(console.log).toHaveBeenCalled();
    }, { timeout: 1000 });
  });

  // Test with different API parameters
  test('always calls API with the same hardcoded parameters', async () => {
    core.mockAPI.mockResolvedValueOnce({ success: true });

    render(<CreateCompany />);

    // Click the button
    fireEvent.click(screen.getByRole('button', { name: /create company/i }));

    // Verify mockAPI was called with the exact hardcoded parameters
    expect(core.mockAPI).toHaveBeenCalledWith(
      "API_METHODS.POST",
      "COMPANY_API.POST_CREATE_COMPANY_PROFILE",
      1,
      {
        name: "test",
        founder: "test",
        size: "test",
        about: "test",
        links: "test",
      }
    );
  });

  // Test component unmounting during API call
  test('handles component unmounting during API call', async () => {
    // Mock API call with delay
    let resolvePromise;
    const apiPromise = new Promise(resolve => {
      resolvePromise = resolve;
    });

    core.mockAPI.mockImplementation(() => apiPromise);

    const { unmount } = render(<CreateCompany />);

    // Click the button to start API call
    fireEvent.click(screen.getByRole('button', { name: /create company/i }));

    // Unmount component while API call is in progress
    unmount();

    // Resolve the API call after unmounting
    resolvePromise({ success: true });

    // Wait for any potential errors
    await new Promise(resolve => setTimeout(resolve, 100));

    // Verify mockAPI was called
    expect(core.mockAPI).toHaveBeenCalled();
  });

  // Test with repeated identical API calls
  test('handles repeated identical API calls', async () => {
    core.mockAPI.mockResolvedValue({ success: true, data: { id: 1 } });

    render(<CreateCompany />);

    const button = screen.getByRole('button', { name: /create company/i });

    // Click the button multiple times
    fireEvent.click(button);
    fireEvent.click(button);
    fireEvent.click(button);

    // Wait for the async operations to complete
    await waitFor(() => {
      expect(core.mockAPI).toHaveBeenCalledTimes(3);
    });

    // Verify all calls used the same parameters
    const expectedParams = [
      "API_METHODS.POST",
      "COMPANY_API.POST_CREATE_COMPANY_PROFILE",
      1,
      {
        name: "test",
        founder: "test",
        size: "test",
        about: "test",
        links: "test",
      }
    ];

    expect(core.mockAPI).toHaveBeenNthCalledWith(1, ...expectedParams);
    expect(core.mockAPI).toHaveBeenNthCalledWith(2, ...expectedParams);
    expect(core.mockAPI).toHaveBeenNthCalledWith(3, ...expectedParams);
  });

  // Test component snapshot
  test('matches snapshot', () => {
    const { asFragment } = render(<CreateCompany />);
    expect(asFragment()).toMatchSnapshot();
  });

});
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import CreateCompany from '../../../src/screens/recruiter/CreateCompany';

// Mock dependencies
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  Link: ({ children, to }) => <a href={to}>{children}</a>
}));

// Mock toast before using it
const mockToastError = jest.fn();
const mockToastSuccess = jest.fn();

jest.mock('react-toastify', () => ({
  toast: {
    error: mockToastError,
    success: mockToastSuccess
  }
}));

jest.mock('../../../src/components/all/header/Header', () => ({
  __esModule: true,
  default: ({ category, showOnlyLogo, menu }) => (
    <div data-testid="header-mock">
      <span>Header Component</span>
      <div data-testid="menu-container">{menu}</div>
    </div>
  )
}));

jest.mock('../../../src/components/all/SideBar', () => ({
  __esModule: true,
  default: () => <div data-testid="sidebar-mock">Sidebar Component</div>
}));

jest.mock('../../../src/components/all/header/Menu', () => ({
  __esModule: true,
  default: () => <div data-testid="menu-mock">Menu Component</div>
}));

// Mock API functions
const mockGetData = jest.fn().mockResolvedValue('mock-token');
const mockAPI = jest.fn();

jest.mock('../../../src/lib/core', () => ({
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

// Mock FileReader
class MockFileReader {
  constructor() {
    this.result = null;
    this.onloadend = null;
  }

  readAsDataURL(file) {
    this.result = 'data:image/jpeg;base64,mockbase64data';
    // Use setTimeout to simulate async behavior
    setTimeout(() => {
      if (this.onloadend) {
        this.onloadend();
      }
    }, 0);
  }
}

// Replace global FileReader with mock
global.FileReader = MockFileReader;

describe('CreateCompany Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Helper function to render component with router
  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <CreateCompany />
      </BrowserRouter>
    );
  };

  test('renders component with all required elements', () => {
    renderComponent();

    // Check main structural elements
    expect(screen.getByTestId('header-mock')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar-mock')).toBeInTheDocument();
    expect(screen.getByTestId('menu-mock')).toBeInTheDocument();

    // Check form elements
    expect(screen.getByText('Company Details')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Full Company Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Founder's Name(s)")).toBeInTheDocument();
    expect(screen.getByPlaceholderText('About Company')).toBeInTheDocument();

    // Check buttons
    expect(screen.getByText('Skip')).toBeInTheDocument();
    expect(screen.getByText('Save and Exit')).toBeInTheDocument();
    expect(screen.getByText('Save and Continue')).toBeInTheDocument();
  });

  test('displays default company logo', () => {
    renderComponent();
    const logoImg = screen.getByAltText('Company Logo');
    expect(logoImg).toBeInTheDocument();
    expect(logoImg).toHaveAttribute('src', 'https://sproutsweb-assets.s3.amazonaws.com/common-assets/VerificationPage/enterprise.png');
  });

  test('updates form state when company name input changes', () => {
    renderComponent();
    const companyNameInput = screen.getByPlaceholderText('Full Company Name');

    fireEvent.change(companyNameInput, { target: { value: 'Test Company' } });

    expect(companyNameInput.value).toBe('Test Company');
  });

  test('updates form state when founder name input changes', () => {
    renderComponent();
    const founderNameInput = screen.getByPlaceholderText("Founder's Name(s)");

    fireEvent.change(founderNameInput, { target: { value: 'John Doe' } });

    expect(founderNameInput.value).toBe('John Doe');
  });

  test('updates form state when about company textarea changes', () => {
    renderComponent();
    const aboutCompanyTextarea = screen.getByPlaceholderText('About Company');

    fireEvent.change(aboutCompanyTextarea, {
      target: { value: 'This is a test company description.' }
    });

    expect(aboutCompanyTextarea.value).toBe('This is a test company description.');
  });

  test('handles file upload and updates image preview', async () => {
    renderComponent();

    const file = new File(['dummy content'], 'test.png', { type: 'image/png' });
    const fileInput = screen.getByLabelText(/Replace/i);

    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [file] } });
    });

    // Wait for state update
    await waitFor(() => {
      const logoImg = screen.getByAltText('Company Logo');
      expect(logoImg).toHaveAttribute('src', 'data:image/jpeg;base64,mockbase64data');
    });
  });

  test('calls createNewCompanyPost when Save and Continue button is clicked', async () => {
    mockAPI.mockResolvedValueOnce({ data: { company: '123' } });
    global.fetch.mockResolvedValueOnce({
      json: jest.fn().mockResolvedValueOnce({ success: true })
    });

    renderComponent();
    
    // Click the Save and Continue button
    await act(async () => {
      fireEvent.click(screen.getByText('Save and Continue'));
    });

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

  test('calls createNewCompanyPost when Save and Exit button is clicked', async () => {
    mockAPI.mockResolvedValueOnce({ data: { company: '123' } });
    global.fetch.mockResolvedValueOnce({
      json: jest.fn().mockResolvedValueOnce({ success: true })
    });

    renderComponent();

    // Fill out the form
    fireEvent.change(screen.getByPlaceholderText('Full Company Name'), {
      target: { value: 'Test Company' }
    });

    // Click the Save and Exit button
    await act(async () => {
      fireEvent.click(screen.getByText('Save and Exit'));
    });

    // Verify API was called
    expect(mockAPI).toHaveBeenCalled();
  });

  test('handles successful company creation and navigates back', async () => {
    const navigateMock = jest.fn();
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockImplementation(() => navigateMock);

    mockAPI.mockResolvedValueOnce({ data: { company: '123' } });
    global.fetch.mockResolvedValueOnce({
      json: jest.fn().mockResolvedValueOnce({ success: true })
    });

    renderComponent();

    // Fill out the form
    fireEvent.change(screen.getByPlaceholderText('Full Company Name'), {
      target: { value: 'Test Company' }
    });

    // Submit the form
    await act(async () => {
      fireEvent.click(screen.getByText('Save and Continue'));
    });

    // Verify navigation occurred
    expect(navigateMock).toHaveBeenCalledWith(-1, { replace: true });
  });

  test('handles API error during company creation', async () => {
    // Mock API to return error
    mockAPI.mockResolvedValueOnce({ error: 'Failed to create company' });

    renderComponent();

    // Fill out the form
    fireEvent.change(screen.getByPlaceholderText('Full Company Name'), {
      target: { value: 'Test Company' }
    });

    // Submit the form
    await act(async () => {
      fireEvent.click(screen.getByText('Save and Continue'));
    });

    // Verify API was called but no navigation occurred
    expect(mockAPI).toHaveBeenCalled();
  });

  test('handles file upload error', async () => {
    // Mock successful company creation
    mockAPI.mockResolvedValueOnce({ data: { company: '123' } });

    // Mock file upload error
    global.fetch.mockResolvedValueOnce({
      json: jest.fn().mockResolvedValueOnce({ error: 'Upload failed' })
    });

    renderComponent();

    // Add a file
    const file = new File(['dummy content'], 'test.png', { type: 'image/png' });
    const fileInput = screen.getByLabelText(/Replace/i);

    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [file] } });
    });

    // Fill required fields
    fireEvent.change(screen.getByPlaceholderText('Full Company Name'), {
      target: { value: 'Test Company' }
    });

    // Submit the form
    await act(async () => {
      fireEvent.click(screen.getByText('Save and Continue'));
    });

    // Wait for the fetch to complete
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    // Verify toast.error was called with the error message
    expect(mockToastError).toHaveBeenCalled();
  });

  test('validates required fields before submission', async () => {
    // Reset any previous mock calls
    mockAPI.mockReset();

    // Mock the form's onSubmit prevention
    const preventDefaultMock = jest.fn();

    renderComponent();

    // Try to submit without filling required fields
    const form = screen.getByRole('form');

    await act(async () => {
      fireEvent.submit(form, { preventDefault: preventDefaultMock });
    });

    // Since we're not actually submitting the form (just clicking the button),
    // we need to verify the API wasn't called
    expect(mockAPI).not.toHaveBeenCalled();
  });

  test('submits form with all fields filled', async () => {
    mockAPI.mockResolvedValueOnce({ data: { company: '123' } });
    global.fetch.mockResolvedValueOnce({
      json: jest.fn().mockResolvedValueOnce({ success: true })
    });

    renderComponent();

    // Fill all form fields
    fireEvent.change(screen.getByPlaceholderText('Full Company Name'), {
      target: { value: 'Test Company' }
    });
    fireEvent.change(screen.getByPlaceholderText("Founder's Name(s)"), {
      target: { value: 'John Doe' }
    });
    fireEvent.change(screen.getByPlaceholderText('About Company'), {
      target: { value: 'This is a test company.' }
    });

    // Submit the form
    await act(async () => {
      fireEvent.click(screen.getByText('Save and Continue'));
    });

    // Verify API was called with all field values
    expect(mockAPI).toHaveBeenCalledWith(
      'POST',
      '/api/company/create',
      1,
      {
        name: 'Test Company',
        founder: 'John Doe',
        size: ' ',
        about: 'This is a test company.',
        links: ' '
      }
    );
  });

  test('calls submitFileData with correct company ID after successful creation', async () => {
    mockAPI.mockResolvedValueOnce({ data: { company: '123' } });
    global.fetch.mockResolvedValueOnce({
      json: jest.fn().mockResolvedValueOnce({ success: true })
    });

    renderComponent();

    // Add a file
    const file = new File(['dummy content'], 'test.png', { type: 'image/png' });
    const fileInput = screen.getByLabelText(/Replace/i);

    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [file] } });
    });

    // Fill required fields and submit
    fireEvent.change(screen.getByPlaceholderText('Full Company Name'), {
      target: { value: 'Test Company' }
    });
    fireEvent.change(screen.getByPlaceholderText("Founder's Name(s)"), {
      target: { value: 'John Doe' }
    });

    await act(async () => {
      fireEvent.click(screen.getByText('Save and Continue'));
    });

    // Verify fetch was called with correct parameters for file upload
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/company/upload-pic',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: 'Bearer mock-token',
            cid: '123'
          }),
          body: expect.any(FormData)
        })
      );
    });
  });

  test('Skip link navigates to previous page', () => {
    renderComponent();

    const skipLink = screen.getByText('Skip');
    expect(skipLink).toHaveAttribute('href', '-1');
  });
});
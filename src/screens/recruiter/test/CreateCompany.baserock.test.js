import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CreateCompany from '../CreateCompany';
import * as core from '../../../lib/core';
import { BrowserRouter } from 'react-router-dom';
// Mock the core module with the correct path
jest.mock('../../../lib/core', () => ({
  mockAPI: jest.fn(),
}));

describe('CreateCompany Component', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

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

  it('calls mockAPI with correct parameters when button is clicked', async () => {
    // Mock successful API response
    const mockResponse = { success: true, data: { id: 1, name: 'test' } };
    core.mockAPI.mockResolvedValueOnce(mockResponse);
    
    render(<CreateCompany />);
    
    // Click the button
    fireEvent.click(screen.getByRole('button', { name: /create company/i }));
    
    // Check if mockAPI was called with the correct parameters
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
    
    // Wait for the async function to complete
    await waitFor(() => {
      expect(console.log).toHaveBeenCalledWith("JSON:", mockResponse);
    });
  });
});
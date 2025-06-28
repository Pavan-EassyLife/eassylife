import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import DynamicAttributeSelector from '../DynamicAttributeSelector';
import { validateAttributeStructure } from '../attributeUtils';

// Mock data for testing
const mockAttributes = {
  'Brand': {
    dropdown: [{
      id: 'brand-attr',
      name: 'Brand',
      options: {
        'premium': [
          { id: 'honda', value: 'Honda', weight: 1 },
          { id: 'toyota', value: 'Toyota', weight: 2 }
        ]
      }
    }]
  },
  'Service Type': {
    list: [{
      id: 'service-type-attr',
      name: 'Service Type',
      options: {
        'basic': [
          { id: 'basic-service', value: 'Basic Service', weight: 1 },
          { id: 'premium-service', value: 'Premium Service', weight: 2 }
        ]
      }
    }]
  },
  'Location': {
    search: [{
      id: 'location-attr',
      name: 'Location',
      options: {
        'cities': [
          { id: 'mumbai', value: 'Mumbai', weight: 1 },
          { id: 'delhi', value: 'Delhi', weight: 2 }
        ]
      }
    }]
  }
};

const mockSelectedAttributes = {
  'Brand': { id: 'honda', value: 'Honda' },
  'Service Type': { id: 'basic-service', value: 'Basic Service' }
};

describe('DynamicAttributeSelector', () => {
  const mockOnAttributeSelect = jest.fn();

  beforeEach(() => {
    mockOnAttributeSelect.mockClear();
  });

  test('renders without crashing with empty attributes', () => {
    render(
      <DynamicAttributeSelector
        attributes={{}}
        selectedAttributes={{}}
        onAttributeSelect={mockOnAttributeSelect}
      />
    );
    // Should not render anything for empty attributes
    expect(screen.queryByText('Brand')).not.toBeInTheDocument();
  });

  test('renders dropdown attributes correctly', () => {
    render(
      <DynamicAttributeSelector
        attributes={{ 'Brand': mockAttributes['Brand'] }}
        selectedAttributes={mockSelectedAttributes}
        onAttributeSelect={mockOnAttributeSelect}
      />
    );

    expect(screen.getByText('Brand')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Honda')).toBeInTheDocument();
    expect(screen.getByText('Toyota')).toBeInTheDocument();
  });

  test('renders list attributes correctly', () => {
    render(
      <DynamicAttributeSelector
        attributes={{ 'Service Type': mockAttributes['Service Type'] }}
        selectedAttributes={mockSelectedAttributes}
        onAttributeSelect={mockOnAttributeSelect}
      />
    );

    expect(screen.getByText('Service Type')).toBeInTheDocument();
    expect(screen.getByText('Basic Service')).toBeInTheDocument();
    expect(screen.getByText('Premium Service')).toBeInTheDocument();
    
    // Check if selected button has correct styling
    const selectedButton = screen.getByText('Basic Service');
    expect(selectedButton).toHaveClass('bg-orange-500');
  });

  test('renders search attributes correctly', () => {
    render(
      <DynamicAttributeSelector
        attributes={{ 'Location': mockAttributes['Location'] }}
        selectedAttributes={{}}
        onAttributeSelect={mockOnAttributeSelect}
      />
    );

    expect(screen.getByText('Location')).toBeInTheDocument();
    expect(screen.getByText('Search Location')).toBeInTheDocument();
    expect(screen.getByText('Mumbai')).toBeInTheDocument();
    expect(screen.getByText('Delhi')).toBeInTheDocument();
  });

  test('handles dropdown selection correctly', async () => {
    render(
      <DynamicAttributeSelector
        attributes={{ 'Brand': mockAttributes['Brand'] }}
        selectedAttributes={{}}
        onAttributeSelect={mockOnAttributeSelect}
      />
    );

    const dropdown = screen.getByRole('combobox');
    fireEvent.change(dropdown, { target: { value: 'toyota' } });

    await waitFor(() => {
      expect(mockOnAttributeSelect).toHaveBeenCalledWith(
        'Brand',
        'toyota',
        'Toyota',
        expect.objectContaining({ id: 'toyota', value: 'Toyota' })
      );
    });
  });

  test('handles list button selection correctly', async () => {
    render(
      <DynamicAttributeSelector
        attributes={{ 'Service Type': mockAttributes['Service Type'] }}
        selectedAttributes={{}}
        onAttributeSelect={mockOnAttributeSelect}
      />
    );

    const premiumButton = screen.getByText('Premium Service');
    fireEvent.click(premiumButton);

    await waitFor(() => {
      expect(mockOnAttributeSelect).toHaveBeenCalledWith(
        'Service Type',
        'premium-service',
        'Premium Service',
        expect.objectContaining({ id: 'premium-service', value: 'Premium Service' })
      );
    });
  });

  test('shows validation errors for required attributes', () => {
    render(
      <DynamicAttributeSelector
        attributes={mockAttributes}
        selectedAttributes={{}}
        onAttributeSelect={mockOnAttributeSelect}
        showValidationErrors={true}
        requiredAttributes={['Brand', 'Service Type']}
      />
    );

    expect(screen.getByText('Please select Brand')).toBeInTheDocument();
    expect(screen.getByText('Please select Service Type')).toBeInTheDocument();
  });

  test('handles disabled state correctly', () => {
    render(
      <DynamicAttributeSelector
        attributes={mockAttributes}
        selectedAttributes={{}}
        onAttributeSelect={mockOnAttributeSelect}
        disabled={true}
      />
    );

    const dropdown = screen.getByRole('combobox');
    const button = screen.getByText('Basic Service');

    expect(dropdown).toBeDisabled();
    expect(button).toHaveClass('opacity-50', 'cursor-not-allowed');
  });

  test('renders all attribute types together', () => {
    render(
      <DynamicAttributeSelector
        attributes={mockAttributes}
        selectedAttributes={mockSelectedAttributes}
        onAttributeSelect={mockOnAttributeSelect}
      />
    );

    // Check all attribute types are rendered
    expect(screen.getByText('Brand')).toBeInTheDocument(); // Dropdown
    expect(screen.getByText('Service Type')).toBeInTheDocument(); // List
    expect(screen.getByText('Location')).toBeInTheDocument(); // Search
  });

  test('handles malformed attribute data gracefully', () => {
    const malformedAttributes = {
      'Invalid': {
        dropdown: [{ /* missing options */ }]
      },
      'Empty': {
        list: []
      }
    };

    render(
      <DynamicAttributeSelector
        attributes={malformedAttributes}
        selectedAttributes={{}}
        onAttributeSelect={mockOnAttributeSelect}
      />
    );

    // Should not crash and should not render invalid attributes
    expect(screen.queryByText('Invalid')).not.toBeInTheDocument();
    expect(screen.queryByText('Empty')).not.toBeInTheDocument();
  });
});

describe('attributeUtils', () => {
  test('validateAttributeStructure works correctly', () => {
    const validation = validateAttributeStructure(mockAttributes);
    
    expect(validation.isValid).toBe(true);
    expect(validation.attributeCount).toBe(3);
    expect(validation.supportedCount).toBe(3);
    expect(validation.unsupportedCount).toBe(0);
    expect(validation.errors).toHaveLength(0);
  });

  test('validateAttributeStructure handles invalid data', () => {
    const validation = validateAttributeStructure(null);
    
    expect(validation.isValid).toBe(false);
    expect(validation.errors).toContain('Attributes must be an object');
  });

  test('validateAttributeStructure detects unsupported attributes', () => {
    const invalidAttributes = {
      'Unsupported': {
        // No dropdown, list, or search arrays
        someOtherField: 'value'
      }
    };

    const validation = validateAttributeStructure(invalidAttributes);
    
    expect(validation.supportedCount).toBe(0);
    expect(validation.unsupportedCount).toBe(1);
    expect(validation.warnings).toContain('No supported attribute types found for "Unsupported"');
  });
});

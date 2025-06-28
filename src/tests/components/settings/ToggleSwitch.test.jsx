import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../../utils/test-utils';
import ToggleSwitch, { ToggleWithLabel, ToggleGroup } from '../../../components/settings/ToggleSwitch';

describe('ToggleSwitch', () => {
  it('renders correctly', () => {
    render(<ToggleSwitch checked={false} onChange={vi.fn()} />);
    
    const toggle = screen.getByRole('switch');
    expect(toggle).toBeInTheDocument();
    expect(toggle).toHaveAttribute('aria-checked', 'false');
  });

  it('shows checked state correctly', () => {
    render(<ToggleSwitch checked={true} onChange={vi.fn()} />);
    
    const toggle = screen.getByRole('switch');
    expect(toggle).toHaveAttribute('aria-checked', 'true');
  });

  it('calls onChange when clicked', () => {
    const handleChange = vi.fn();
    render(<ToggleSwitch checked={false} onChange={handleChange} />);
    
    const toggle = screen.getByRole('switch');
    fireEvent.click(toggle);
    
    expect(handleChange).toHaveBeenCalledWith(true);
  });

  it('calls onChange when space key is pressed', () => {
    const handleChange = vi.fn();
    render(<ToggleSwitch checked={false} onChange={handleChange} />);
    
    const toggle = screen.getByRole('switch');
    fireEvent.keyDown(toggle, { key: ' ' });
    
    expect(handleChange).toHaveBeenCalledWith(true);
  });

  it('calls onChange when enter key is pressed', () => {
    const handleChange = vi.fn();
    render(<ToggleSwitch checked={false} onChange={handleChange} />);
    
    const toggle = screen.getByRole('switch');
    fireEvent.keyDown(toggle, { key: 'Enter' });
    
    expect(handleChange).toHaveBeenCalledWith(true);
  });

  it('does not call onChange when disabled', () => {
    const handleChange = vi.fn();
    render(<ToggleSwitch checked={false} onChange={handleChange} disabled={true} />);
    
    const toggle = screen.getByRole('switch');
    fireEvent.click(toggle);
    
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('applies correct accessibility attributes', () => {
    render(
      <ToggleSwitch 
        checked={true} 
        onChange={vi.fn()} 
        id="test-toggle"
        aria-label="Test toggle"
        aria-describedby="test-description"
      />
    );
    
    const toggle = screen.getByRole('switch');
    expect(toggle).toHaveAttribute('id', 'test-toggle');
    expect(toggle).toHaveAttribute('aria-label', 'Test toggle');
    expect(toggle).toHaveAttribute('aria-describedby', 'test-description');
  });

  it('renders different sizes correctly', () => {
    const { rerender } = render(<ToggleSwitch checked={false} onChange={vi.fn()} size="small" />);
    expect(screen.getByRole('switch')).toHaveClass('w-10', 'h-5');
    
    rerender(<ToggleSwitch checked={false} onChange={vi.fn()} size="large" />);
    expect(screen.getByRole('switch')).toHaveClass('w-16', 'h-8');
  });
});

describe('ToggleWithLabel', () => {
  it('renders with label and description', () => {
    render(
      <ToggleWithLabel
        checked={false}
        onChange={vi.fn()}
        label="Test Setting"
        description="This is a test setting"
      />
    );
    
    expect(screen.getByText('Test Setting')).toBeInTheDocument();
    expect(screen.getByText('This is a test setting')).toBeInTheDocument();
    expect(screen.getByRole('switch')).toBeInTheDocument();
  });

  it('associates label with toggle correctly', () => {
    render(
      <ToggleWithLabel
        checked={false}
        onChange={vi.fn()}
        label="Test Setting"
      />
    );
    
    const label = screen.getByText('Test Setting');
    const toggle = screen.getByRole('switch');
    
    expect(label).toHaveAttribute('for', toggle.id);
  });

  it('clicking label toggles the switch', () => {
    const handleChange = vi.fn();
    render(
      <ToggleWithLabel
        checked={false}
        onChange={handleChange}
        label="Test Setting"
      />
    );
    
    const label = screen.getByText('Test Setting');
    fireEvent.click(label);
    
    expect(handleChange).toHaveBeenCalledWith(true);
  });

  it('shows disabled state correctly', () => {
    render(
      <ToggleWithLabel
        checked={false}
        onChange={vi.fn()}
        label="Test Setting"
        description="This is disabled"
        disabled={true}
      />
    );
    
    const label = screen.getByText('Test Setting');
    const description = screen.getByText('This is disabled');
    const toggle = screen.getByRole('switch');
    
    expect(label).toHaveClass('text-gray-500');
    expect(description).toHaveClass('text-gray-400');
    expect(toggle).toBeDisabled();
  });
});

describe('ToggleGroup', () => {
  it('renders with title and description', () => {
    render(
      <ToggleGroup
        title="Settings Group"
        description="Group of related settings"
      >
        <ToggleWithLabel
          checked={false}
          onChange={vi.fn()}
          label="Setting 1"
        />
      </ToggleGroup>
    );
    
    expect(screen.getByText('Settings Group')).toBeInTheDocument();
    expect(screen.getByText('Group of related settings')).toBeInTheDocument();
    expect(screen.getByText('Setting 1')).toBeInTheDocument();
  });

  it('renders without title and description', () => {
    render(
      <ToggleGroup>
        <ToggleWithLabel
          checked={false}
          onChange={vi.fn()}
          label="Setting 1"
        />
      </ToggleGroup>
    );
    
    expect(screen.getByText('Setting 1')).toBeInTheDocument();
  });

  it('renders multiple children correctly', () => {
    render(
      <ToggleGroup title="Settings Group">
        <ToggleWithLabel
          checked={false}
          onChange={vi.fn()}
          label="Setting 1"
        />
        <ToggleWithLabel
          checked={true}
          onChange={vi.fn()}
          label="Setting 2"
        />
      </ToggleGroup>
    );
    
    expect(screen.getByText('Setting 1')).toBeInTheDocument();
    expect(screen.getByText('Setting 2')).toBeInTheDocument();
    expect(screen.getAllByRole('switch')).toHaveLength(2);
  });
});

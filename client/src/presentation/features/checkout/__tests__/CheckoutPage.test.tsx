/**
 * Tests for CheckoutPage component covering:
 * - Rendering with cart items
 * - Field validation (name, address, phone)
 * - Form submission success and API error handling
 * - Progress bar and field count
 * - Button disabled states
 */
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import CheckoutPage from '../CheckoutPage';
import type { CartItem, DeliveryDetails } from '@/domain/models/types';

// ── Mocks ────────────────────────────────────────────────────────────────────

jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn(),
}));

jest.mock('framer-motion', () => ({
  motion: {
    div:  ({ children, ...p }: React.HTMLAttributes<HTMLDivElement>)  => <div {...p}>{children}</div>,
    span: ({ children, ...p }: React.HTMLAttributes<HTMLSpanElement>) => <span {...p}>{children}</span>,
    p:    ({ children, ...p }: React.HTMLAttributes<HTMLParagraphElement>) => <p {...p}>{children}</p>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('@/components/ui/food-image', () => ({
  FoodImage: ({ alt }: { alt: string }) => <img alt={alt} />,
}));

jest.mock('@/components/ui/separator', () => ({
  Separator: () => <hr />,
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, disabled, type, ...p }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button type={type} disabled={disabled} {...p}>{children}</button>
  ),
}));

jest.mock('@/components/ui/input', () => ({
  Input: (props: React.InputHTMLAttributes<HTMLInputElement>) => <input {...props} />,
}));

jest.mock('@/components/ui/label', () => ({
  Label: ({ children, ...p }: React.LabelHTMLAttributes<HTMLLabelElement>) => <label {...p}>{children}</label>,
}));

// ── Fixtures ─────────────────────────────────────────────────────────────────

const cart: CartItem[] = [
  { menuItem: { id: 'm1', name: 'Caesar Salad', description: '', price: 8.49, imageUrl: '' }, quantity: 2 },
  { menuItem: { id: 'm2', name: 'Burger',       description: '', price: 12.00, imageUrl: '' }, quantity: 1 },
];
const cartTotal = 28.98;

function makeProps(overrides: Partial<React.ComponentProps<typeof CheckoutPage>> = {}) {
  return {
    cart,
    cartTotal,
    onPlaceOrder: jest.fn().mockResolvedValue({ id: 'order-99' }),
    onClearCart:  jest.fn(),
    ...overrides,
  };
}

function fillForm(name = 'Jane Smith', address = '123 Main St', phone = '9876543210') {
  fireEvent.change(screen.getByPlaceholderText('Jane Smith'),        { target: { value: name } });
  fireEvent.change(screen.getByPlaceholderText('123 Main St, City, State'), { target: { value: address } });
  fireEvent.change(screen.getByPlaceholderText('9876543210'),        { target: { value: phone } });
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('CheckoutPage', () => {
  describe('Rendering', () => {
    it('renders the page heading', () => {
      render(<CheckoutPage {...makeProps()} />);
      expect(screen.getByText('Checkout')).toBeInTheDocument();
    });

    it('renders all three input fields', () => {
      render(<CheckoutPage {...makeProps()} />);
      expect(screen.getByPlaceholderText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('123 Main St, City, State')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('9876543210')).toBeInTheDocument();
    });

    it('renders order summary with cart items', () => {
      render(<CheckoutPage {...makeProps()} />);
      expect(screen.getByText('Caesar Salad')).toBeInTheDocument();
      expect(screen.getByText('Burger')).toBeInTheDocument();
    });

    it('renders correct cart total', () => {
      render(<CheckoutPage {...makeProps()} />);
      expect(screen.getByText('$28.98')).toBeInTheDocument();
    });

    it('Place Order button is disabled when form is empty', () => {
      render(<CheckoutPage {...makeProps()} />);
      expect(screen.getByRole('button', { name: /place order/i })).toBeDisabled();
    });

    it('shows 0/3 fields initially', () => {
      render(<CheckoutPage {...makeProps()} />);
      expect(screen.getByText('0/3 fields')).toBeInTheDocument();
    });
  });

  describe('Field validation — Name', () => {
    it('shows error when name is blurred empty', () => {
      render(<CheckoutPage {...makeProps()} />);
      fireEvent.blur(screen.getByPlaceholderText('Jane Smith'));
      expect(screen.getByText('Full name is required')).toBeInTheDocument();
    });

    it('clears name error when value is entered', () => {
      render(<CheckoutPage {...makeProps()} />);
      const input = screen.getByPlaceholderText('Jane Smith');
      fireEvent.blur(input);
      fireEvent.change(input, { target: { value: 'Jane' } });
      expect(screen.queryByText('Full name is required')).not.toBeInTheDocument();
    });
  });

  describe('Field validation — Address', () => {
    it('shows error when address is blurred empty', () => {
      render(<CheckoutPage {...makeProps()} />);
      fireEvent.blur(screen.getByPlaceholderText('123 Main St, City, State'));
      expect(screen.getByText('Delivery address is required')).toBeInTheDocument();
    });

    it('clears address error when value is entered', () => {
      render(<CheckoutPage {...makeProps()} />);
      const input = screen.getByPlaceholderText('123 Main St, City, State');
      fireEvent.blur(input);
      fireEvent.change(input, { target: { value: '456 Elm St' } });
      expect(screen.queryByText('Delivery address is required')).not.toBeInTheDocument();
    });
  });

  describe('Field validation — Phone', () => {
    it('shows error when phone is blurred empty', () => {
      render(<CheckoutPage {...makeProps()} />);
      fireEvent.blur(screen.getByPlaceholderText('9876543210'));
      expect(screen.getByText('Phone number is required')).toBeInTheDocument();
    });

    it('shows error for phone shorter than 10 digits', () => {
      render(<CheckoutPage {...makeProps()} />);
      const input = screen.getByPlaceholderText('9876543210');
      fireEvent.change(input, { target: { value: '12345' } });
      fireEvent.blur(input);
      expect(screen.getByText('Phone number must be exactly 10 digits')).toBeInTheDocument();
    });

    it('strips non-digit characters from phone input', () => {
      render(<CheckoutPage {...makeProps()} />);
      const input = screen.getByPlaceholderText('9876543210') as HTMLInputElement;
      // 10 digits with dashes — dashes stripped, 10 digits remain
      fireEvent.change(input, { target: { value: '98-7654-3210' } });
      expect(input.value).toBe('9876543210');
    });

    it('clears phone error when 10 digits entered', () => {
      render(<CheckoutPage {...makeProps()} />);
      const input = screen.getByPlaceholderText('9876543210');
      fireEvent.blur(input);
      fireEvent.change(input, { target: { value: '9876543210' } });
      expect(screen.queryByText('Phone number is required')).not.toBeInTheDocument();
      expect(screen.queryByText('Phone number must be exactly 10 digits')).not.toBeInTheDocument();
    });
  });

  describe('Progress counter', () => {
    it('increments field count as valid fields are filled', () => {
      render(<CheckoutPage {...makeProps()} />);
      fireEvent.change(screen.getByPlaceholderText('Jane Smith'), { target: { value: 'Jane' } });
      expect(screen.getByText('1/3 fields')).toBeInTheDocument();

      fireEvent.change(screen.getByPlaceholderText('123 Main St, City, State'), { target: { value: '123 St' } });
      expect(screen.getByText('2/3 fields')).toBeInTheDocument();

      fireEvent.change(screen.getByPlaceholderText('9876543210'), { target: { value: '9876543210' } });
      expect(screen.getByText('3/3 fields')).toBeInTheDocument();
    });
  });

  describe('Submit button state', () => {
    it('enables Place Order button when all fields are valid', () => {
      render(<CheckoutPage {...makeProps()} />);
      fillForm();
      expect(screen.getByRole('button', { name: /place order/i })).not.toBeDisabled();
    });

    it('remains disabled when only name and address are filled', () => {
      render(<CheckoutPage {...makeProps()} />);
      fireEvent.change(screen.getByPlaceholderText('Jane Smith'), { target: { value: 'Jane' } });
      fireEvent.change(screen.getByPlaceholderText('123 Main St, City, State'), { target: { value: '123 St' } });
      expect(screen.getByRole('button', { name: /place order/i })).toBeDisabled();
    });

    it('is disabled when cart is empty even if form is valid', () => {
      render(<CheckoutPage {...makeProps({ cart: [], cartTotal: 0 })} />);
      fillForm();
      expect(screen.getByRole('button', { name: /place order/i })).toBeDisabled();
    });
  });

  describe('Form submission — success', () => {
    it('calls onPlaceOrder with correct items and delivery details', async () => {
      const onPlaceOrder = jest.fn().mockResolvedValue({ id: 'order-99' });
      const onClearCart  = jest.fn();
      render(<CheckoutPage {...makeProps({ onPlaceOrder, onClearCart })} />);
      fillForm('Jane Smith', '123 Main St', '9876543210');

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /place order/i }));
      });

      expect(onPlaceOrder).toHaveBeenCalledWith(
        [
          { menuItemId: 'm1', quantity: 2 },
          { menuItemId: 'm2', quantity: 1 },
        ],
        { name: 'Jane Smith', address: '123 Main St', phone: '9876543210' } satisfies DeliveryDetails
      );
    });

    it('calls onClearCart after successful order', async () => {
      const onClearCart = jest.fn();
      render(<CheckoutPage {...makeProps({ onClearCart })} />);
      fillForm();

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /place order/i }));
      });

      expect(onClearCart).toHaveBeenCalledTimes(1);
    });

    it('does not call onPlaceOrder when form is invalid', () => {
      const onPlaceOrder = jest.fn();
      render(<CheckoutPage {...makeProps({ onPlaceOrder })} />);
      // only fill name — form still invalid
      fireEvent.change(screen.getByPlaceholderText('Jane Smith'), { target: { value: 'Jane' } });
      fireEvent.click(screen.getByRole('button', { name: /place order/i }));
      expect(onPlaceOrder).not.toHaveBeenCalled();
    });
  });

  describe('Form submission — API error', () => {
    it('shows API error message when onPlaceOrder rejects', async () => {
      const onPlaceOrder = jest.fn().mockRejectedValue(new Error('Server unavailable'));
      render(<CheckoutPage {...makeProps({ onPlaceOrder })} />);
      fillForm();

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /place order/i }));
      });

      await waitFor(() => {
        expect(screen.getByText('Server unavailable')).toBeInTheDocument();
      });
    });

    it('does not call onClearCart when order fails', async () => {
      const onClearCart  = jest.fn();
      const onPlaceOrder = jest.fn().mockRejectedValue(new Error('fail'));
      render(<CheckoutPage {...makeProps({ onPlaceOrder, onClearCart })} />);
      fillForm();

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /place order/i }));
      });

      expect(onClearCart).not.toHaveBeenCalled();
    });

    it('clears API error when user edits a field after failure', async () => {
      const onPlaceOrder = jest.fn().mockRejectedValue(new Error('Network error'));
      render(<CheckoutPage {...makeProps({ onPlaceOrder })} />);
      fillForm();

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /place order/i }));
      });

      await waitFor(() => expect(screen.getByText('Network error')).toBeInTheDocument());

      fireEvent.change(screen.getByPlaceholderText('Jane Smith'), { target: { value: 'John' } });
      expect(screen.queryByText('Network error')).not.toBeInTheDocument();
    });
  });
});

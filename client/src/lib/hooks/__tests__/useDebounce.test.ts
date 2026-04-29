import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '../useDebounce';

jest.useFakeTimers();

describe('useDebounce', () => {
  it('returns initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 300));
    expect(result.current).toBe('initial');
  });

  it('debounces value changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'first', delay: 300 } }
    );

    expect(result.current).toBe('first');

    // Change value
    rerender({ value: 'second', delay: 300 });
    expect(result.current).toBe('first'); // Still old value

    // Fast forward time but not enough
    act(() => jest.advanceTimersByTime(200));
    expect(result.current).toBe('first'); // Still old value

    // Fast forward past delay
    act(() => jest.advanceTimersByTime(100));
    expect(result.current).toBe('second'); // Now updated
  });

  it('resets timer on rapid changes', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'first' } }
    );

    rerender({ value: 'second' });
    act(() => jest.advanceTimersByTime(200));

    rerender({ value: 'third' }); // Reset timer
    act(() => jest.advanceTimersByTime(200));
    expect(result.current).toBe('first'); // Still old

    act(() => jest.advanceTimersByTime(100));
    expect(result.current).toBe('third'); // Now updated to latest
  });

  it('uses custom delay', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: 'first' } }
    );

    rerender({ value: 'second' });
    act(() => jest.advanceTimersByTime(300));
    expect(result.current).toBe('first');

    act(() => jest.advanceTimersByTime(200));
    expect(result.current).toBe('second');
  });

  it('cleans up timer on unmount', () => {
    const { unmount, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'first' } }
    );

    rerender({ value: 'second' });
    unmount();

    // Should not throw or cause issues
    act(() => jest.advanceTimersByTime(300));
  });
});

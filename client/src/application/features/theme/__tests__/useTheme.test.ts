import { renderHook, act } from '@testing-library/react';
import { useThemeState } from '../useTheme';

describe('useThemeState', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  it('defaults to light when no stored preference', () => {
    window.matchMedia = jest.fn().mockReturnValue({ matches: false });
    const { result } = renderHook(() => useThemeState());
    expect(result.current.theme).toBe('light');
  });

  it('defaults to dark when system prefers dark', () => {
    window.matchMedia = jest.fn().mockReturnValue({ matches: true });
    const { result } = renderHook(() => useThemeState());
    expect(result.current.theme).toBe('dark');
  });

  it('restores theme from localStorage', () => {
    localStorage.setItem('fd-theme', 'dark');
    const { result } = renderHook(() => useThemeState());
    expect(result.current.theme).toBe('dark');
  });

  it('toggle switches light → dark', () => {
    window.matchMedia = jest.fn().mockReturnValue({ matches: false });
    const { result } = renderHook(() => useThemeState());
    act(() => result.current.toggle());
    expect(result.current.theme).toBe('dark');
  });

  it('toggle switches dark → light', () => {
    localStorage.setItem('fd-theme', 'dark');
    const { result } = renderHook(() => useThemeState());
    act(() => result.current.toggle());
    expect(result.current.theme).toBe('light');
  });

  it('applies dark class to documentElement when dark', () => {
    localStorage.setItem('fd-theme', 'dark');
    renderHook(() => useThemeState());
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('removes dark class when light', () => {
    document.documentElement.classList.add('dark');
    window.matchMedia = jest.fn().mockReturnValue({ matches: false });
    renderHook(() => useThemeState());
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('persists theme to localStorage on toggle', () => {
    window.matchMedia = jest.fn().mockReturnValue({ matches: false });
    const { result } = renderHook(() => useThemeState());
    act(() => result.current.toggle());
    expect(localStorage.getItem('fd-theme')).toBe('dark');
  });
});

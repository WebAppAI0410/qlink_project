import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@/test-utils/render'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { useTheme } from 'next-themes'

// next-themesのモック
vi.mock('next-themes', () => ({
  useTheme: vi.fn()
}))

describe('ThemeSwitcher Component', () => {
  beforeEach(() => {
    vi.mocked(useTheme).mockReturnValue({
      theme: 'light',
      setTheme: vi.fn(),
      themes: ['light', 'dark', 'system'],
      systemTheme: 'light',
      resolvedTheme: 'light'
    } as any)
  })

  it('should render theme switcher button', () => {
    render(<ThemeSwitcher />)
    expect(screen.getByRole('button', { name: /テーマを切り替える/i })).toBeInTheDocument()
  })

  it('should show dropdown menu when clicked', () => {
    render(<ThemeSwitcher />)
    const button = screen.getByRole('button', { name: /テーマを切り替える/i })
    
    fireEvent.click(button)
    
    expect(screen.getByRole('menuitem', { name: /ライト/i })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: /ダーク/i })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: /システム/i })).toBeInTheDocument()
  })

  it('should call setTheme when theme option is selected', () => {
    const setTheme = vi.fn()
    vi.mocked(useTheme).mockReturnValue({
      theme: 'light',
      setTheme,
      themes: ['light', 'dark', 'system'],
      systemTheme: 'light',
      resolvedTheme: 'light'
    } as any)

    render(<ThemeSwitcher />)
    
    fireEvent.click(screen.getByRole('button', { name: /テーマを切り替える/i }))
    fireEvent.click(screen.getByRole('menuitem', { name: /ダーク/i }))
    
    expect(setTheme).toHaveBeenCalledWith('dark')
  })

  it('should display correct icon based on current theme', () => {
    const { rerender } = render(<ThemeSwitcher />)
    expect(screen.getByTestId('sun-icon')).toBeInTheDocument()

    vi.mocked(useTheme).mockReturnValue({
      theme: 'dark',
      setTheme: vi.fn(),
      themes: ['light', 'dark', 'system'],
      systemTheme: 'dark',
      resolvedTheme: 'dark'
    } as any)

    rerender(<ThemeSwitcher />)
    expect(screen.getByTestId('moon-icon')).toBeInTheDocument()
  })
})
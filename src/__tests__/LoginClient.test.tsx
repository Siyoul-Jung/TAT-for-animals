import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LoginClient from '@/app/login/LoginClient'

// Mock Next.js navigation
const mockPush = jest.fn()
const mockRefresh = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
  useSearchParams: () => ({ get: () => null }),
}))

// Mock Next.js Image (not relevant to logic)
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt }: { alt: string }) => <img alt={alt} />,
}))

// Mock Supabase client
const mockSignInWithPassword = jest.fn()
const mockSignInWithOtp = jest.fn()
jest.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      signInWithPassword: mockSignInWithPassword,
      signInWithOtp: mockSignInWithOtp,
    },
  }),
}))

beforeEach(() => {
  jest.clearAllMocks()
})

describe('LoginClient — default (password mode)', () => {
  it('renders email and password fields', () => {
    render(<LoginClient />)
    expect(screen.getByLabelText('Email address')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument()
  })

  it('shows "Welcome back" heading', () => {
    render(<LoginClient />)
    expect(screen.getByText('Welcome back')).toBeInTheDocument()
  })

  it('shows forgot password link', () => {
    render(<LoginClient />)
    expect(screen.getByText('Forgot your password?')).toBeInTheDocument()
  })

  it('shows link to create account', () => {
    render(<LoginClient />)
    expect(screen.getByText('Create an account')).toBeInTheDocument()
  })
})

describe('LoginClient — mode toggle', () => {
  it('switches to magic link mode when toggle clicked', async () => {
    render(<LoginClient />)
    await userEvent.click(screen.getByText('Sign in without a password →'))
    expect(screen.getByText('Sign in without a password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Send me a sign-in link' })).toBeInTheDocument()
    expect(screen.queryByLabelText('Password')).not.toBeInTheDocument()
  })

  it('switches back to password mode', async () => {
    render(<LoginClient />)
    await userEvent.click(screen.getByText('Sign in without a password →'))
    await userEvent.click(screen.getByText('Sign in with password →'))
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument()
  })

  it('clears error when switching modes', async () => {
    mockSignInWithPassword.mockResolvedValueOnce({ error: { message: 'Invalid' } })
    render(<LoginClient />)

    await userEvent.type(screen.getByLabelText('Email address'), 'test@test.com')
    await userEvent.type(screen.getByLabelText('Password'), 'wrongpass')
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }))

    await waitFor(() => {
      expect(screen.getByText(/doesn't match our records/)).toBeInTheDocument()
    })

    await userEvent.click(screen.getByText('Sign in without a password →'))
    expect(screen.queryByText(/doesn't match our records/)).not.toBeInTheDocument()
  })
})

describe('LoginClient — password visibility toggle', () => {
  it('toggles password visibility', async () => {
    render(<LoginClient />)
    const passwordInput = screen.getByLabelText('Password')
    expect(passwordInput).toHaveAttribute('type', 'password')

    await userEvent.click(screen.getByRole('button', { name: 'Show password' }))
    expect(passwordInput).toHaveAttribute('type', 'text')

    await userEvent.click(screen.getByRole('button', { name: 'Hide password' }))
    expect(passwordInput).toHaveAttribute('type', 'password')
  })
})

describe('LoginClient — login error', () => {
  it('shows error message on failed login', async () => {
    mockSignInWithPassword.mockResolvedValueOnce({ error: { message: 'Invalid credentials' } })
    render(<LoginClient />)

    await userEvent.type(screen.getByLabelText('Email address'), 'wrong@email.com')
    await userEvent.type(screen.getByLabelText('Password'), 'wrongpass')
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }))

    await waitFor(() => {
      expect(screen.getByText(/doesn't match our records/)).toBeInTheDocument()
    })
  })

  it('shows error box with red styling', async () => {
    mockSignInWithPassword.mockResolvedValueOnce({ error: { message: 'Invalid' } })
    render(<LoginClient />)

    await userEvent.type(screen.getByLabelText('Email address'), 'test@test.com')
    await userEvent.type(screen.getByLabelText('Password'), 'wrongpass')
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }))

    await waitFor(() => {
      const errorBox = screen.getByText(/doesn't match our records/).closest('div')
      expect(errorBox).toHaveClass('bg-red-50')
    })
  })
})

describe('LoginClient — successful login', () => {
  it('redirects to dashboard on success', async () => {
    mockSignInWithPassword.mockResolvedValueOnce({ error: null })
    render(<LoginClient />)

    await userEvent.type(screen.getByLabelText('Email address'), 'user@email.com')
    await userEvent.type(screen.getByLabelText('Password'), 'correctpass')
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }))

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard')
    })
  })
})

describe('LoginClient — magic link error', () => {
  it('shows error when magic link send fails', async () => {
    mockSignInWithOtp.mockResolvedValueOnce({ error: { message: 'Rate limit exceeded' } })
    render(<LoginClient />)

    await userEvent.click(screen.getByText('Sign in without a password →'))
    await userEvent.type(screen.getByLabelText('Email address'), 'user@email.com')
    await userEvent.click(screen.getByRole('button', { name: 'Send me a sign-in link' }))

    await waitFor(() => {
      expect(screen.getByText(/Something went wrong/)).toBeInTheDocument()
    })
    expect(screen.queryByText('Check your inbox')).not.toBeInTheDocument()
  })
})

describe('LoginClient — magic link sent screen', () => {
  it('shows confirmation screen after magic link sent', async () => {
    mockSignInWithOtp.mockResolvedValueOnce({ error: null })
    render(<LoginClient />)

    await userEvent.click(screen.getByText('Sign in without a password →'))
    await userEvent.type(screen.getByLabelText('Email address'), 'user@email.com')
    await userEvent.click(screen.getByRole('button', { name: 'Send me a sign-in link' }))

    await waitFor(() => {
      expect(screen.getByText('Check your inbox')).toBeInTheDocument()
      expect(screen.getByText('user@email.com')).toBeInTheDocument()
    })
  })

  it('can go back to try again', async () => {
    mockSignInWithOtp.mockResolvedValueOnce({ error: null })
    render(<LoginClient />)

    await userEvent.click(screen.getByText('Sign in without a password →'))
    await userEvent.type(screen.getByLabelText('Email address'), 'user@email.com')
    await userEvent.click(screen.getByRole('button', { name: 'Send me a sign-in link' }))

    await waitFor(() => screen.getByText('Check your inbox'))
    await userEvent.click(screen.getByText('Try again'))

    expect(screen.getByRole('button', { name: 'Send me a sign-in link' })).toBeInTheDocument()
  })
})

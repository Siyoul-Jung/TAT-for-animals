import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LoginClient from '@/app/login/LoginClient'

// Mock Next.js navigation
const mockPush = jest.fn()
const mockRefresh = jest.fn()
const mockReplace = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh, replace: mockReplace }),
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
const mockGetUser = jest.fn().mockResolvedValue({ data: { user: null } })
jest.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      signInWithPassword: mockSignInWithPassword,
      signInWithOtp: mockSignInWithOtp,
      getUser: mockGetUser,
    },
  }),
}))

beforeEach(() => {
  jest.clearAllMocks()
  mockGetUser.mockResolvedValue({ data: { user: null } })
})

describe('LoginClient — default render', () => {
  it('renders email and password fields', () => {
    render(<LoginClient />)
    expect(screen.getByLabelText('Email address')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument()
  })

  it('shows the "Sign in to your account" heading', () => {
    render(<LoginClient />)
    expect(screen.getByText('Sign in to your account')).toBeInTheDocument()
  })

  it('shows forgot password link', () => {
    render(<LoginClient />)
    expect(screen.getByText('Forgot your password?')).toBeInTheDocument()
  })

  it('shows link to create account', () => {
    render(<LoginClient />)
    expect(screen.getByText('Create an account')).toBeInTheDocument()
  })

  it('offers a passwordless sign-in link as an alternative', () => {
    render(<LoginClient />)
    expect(
      screen.getByRole('button', { name: 'Email me a sign-in link instead' })
    ).toBeInTheDocument()
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
  it('shows a friendly message on incorrect credentials', async () => {
    mockSignInWithPassword.mockResolvedValueOnce({ error: { message: 'Invalid credentials' } })
    render(<LoginClient />)

    await userEvent.type(screen.getByLabelText('Email address'), 'wrong@email.com')
    await userEvent.type(screen.getByLabelText('Password'), 'wrongpass')
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }))

    await waitFor(() => {
      expect(screen.getByText(/Incorrect email or password/)).toBeInTheDocument()
    })
  })

  it('shows a specific message when the email is not yet confirmed', async () => {
    mockSignInWithPassword.mockResolvedValueOnce({
      error: { code: 'email_not_confirmed', message: 'Email not confirmed' },
    })
    render(<LoginClient />)

    await userEvent.type(screen.getByLabelText('Email address'), 'user@email.com')
    await userEvent.type(screen.getByLabelText('Password'), 'somepass')
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }))

    await waitFor(() => {
      expect(screen.getByText(/confirm your email first/)).toBeInTheDocument()
    })
  })

  it('shows the error inside a red error box', async () => {
    mockSignInWithPassword.mockResolvedValueOnce({ error: { message: 'Invalid' } })
    render(<LoginClient />)

    await userEvent.type(screen.getByLabelText('Email address'), 'test@test.com')
    await userEvent.type(screen.getByLabelText('Password'), 'wrongpass')
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }))

    await waitFor(() => {
      const errorBox = screen.getByText(/Incorrect email or password/).closest('div')
      expect(errorBox).toHaveClass('bg-red-50')
    })
  })
})

describe('LoginClient — successful login', () => {
  it('redirects to the dashboard on success', async () => {
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

describe('LoginClient — passwordless sign-in link', () => {
  it('asks for an email first when the field is empty', async () => {
    render(<LoginClient />)

    await userEvent.click(
      screen.getByRole('button', { name: 'Email me a sign-in link instead' })
    )

    expect(await screen.findByText(/Enter your email address first/)).toBeInTheDocument()
    expect(mockSignInWithOtp).not.toHaveBeenCalled()
  })

  it('shows the "Check your inbox" screen after the link is sent', async () => {
    mockSignInWithOtp.mockResolvedValueOnce({ error: null })
    render(<LoginClient />)

    await userEvent.type(screen.getByLabelText('Email address'), 'user@email.com')
    await userEvent.click(
      screen.getByRole('button', { name: 'Email me a sign-in link instead' })
    )

    await waitFor(() => {
      expect(screen.getByText('Check your inbox')).toBeInTheDocument()
      expect(screen.getByText('user@email.com')).toBeInTheDocument()
    })
  })

  it('shows an error when sending the link fails', async () => {
    mockSignInWithOtp.mockResolvedValueOnce({ error: { message: 'Rate limit exceeded' } })
    render(<LoginClient />)

    await userEvent.type(screen.getByLabelText('Email address'), 'user@email.com')
    await userEvent.click(
      screen.getByRole('button', { name: 'Email me a sign-in link instead' })
    )

    await waitFor(() => {
      expect(screen.getByText(/Something went wrong/)).toBeInTheDocument()
    })
    expect(screen.queryByText('Check your inbox')).not.toBeInTheDocument()
  })

  it('can return to the form from the "Check your inbox" screen', async () => {
    mockSignInWithOtp.mockResolvedValueOnce({ error: null })
    render(<LoginClient />)

    await userEvent.type(screen.getByLabelText('Email address'), 'user@email.com')
    await userEvent.click(
      screen.getByRole('button', { name: 'Email me a sign-in link instead' })
    )

    await waitFor(() => screen.getByText('Check your inbox'))
    await userEvent.click(screen.getByText('Try again'))

    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument()
  })
})

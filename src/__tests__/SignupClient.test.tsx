import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SignupClient from '@/app/signup/SignupClient'

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), refresh: jest.fn() }),
  useSearchParams: () => ({ get: () => null }),
}))

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt }: { alt: string }) => <img alt={alt} />,
}))

const mockSignUp = jest.fn()
const mockResend = jest.fn()
jest.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: { signUp: mockSignUp, resend: mockResend },
  }),
}))

beforeEach(() => jest.clearAllMocks())

// Helper: fill out the form
async function fillForm(email: string, password: string, confirm: string) {
  await userEvent.type(screen.getByLabelText('Email address'), email)
  await userEvent.type(screen.getByLabelText('Password'), password)
  await userEvent.type(screen.getByLabelText('Confirm password'), confirm)
  await userEvent.click(screen.getByRole('button', { name: 'Create account' }))
}

describe('SignupClient — default render', () => {
  it('renders all form fields', () => {
    render(<SignupClient />)
    expect(screen.getByLabelText('Email address')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByLabelText('Confirm password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Create account' })).toBeInTheDocument()
  })

  it('shows "Create your account" heading', () => {
    render(<SignupClient />)
    expect(screen.getByText('Create your account')).toBeInTheDocument()
  })

  it('shows sign in link for existing users', () => {
    render(<SignupClient />)
    expect(screen.getByRole('link', { name: 'Sign in' })).toBeInTheDocument()
  })
})

describe('SignupClient — client-side validation', () => {
  it('shows error and does NOT call Supabase when passwords do not match', async () => {
    render(<SignupClient />)
    await fillForm('user@test.com', 'password123', 'different123')

    expect(screen.getByText(/don't match/)).toBeInTheDocument()
    expect(mockSignUp).not.toHaveBeenCalled()
  })

  it('shows error and does NOT call Supabase when password is too short', async () => {
    render(<SignupClient />)
    await fillForm('user@test.com', 'short', 'short')

    expect(screen.getByText(/at least 8 characters/)).toBeInTheDocument()
    expect(mockSignUp).not.toHaveBeenCalled()
  })

  it('accepts password of exactly 8 characters', async () => {
    mockSignUp.mockResolvedValueOnce({ data: { user: { identities: [{ id: '1' }] }, session: null }, error: null })
    render(<SignupClient />)
    await fillForm('user@test.com', 'exactly8', 'exactly8')

    expect(screen.queryByText(/at least 8 characters/)).not.toBeInTheDocument()
    expect(mockSignUp).toHaveBeenCalled()
  })

  it('rejects password of 7 characters', async () => {
    render(<SignupClient />)
    await fillForm('user@test.com', 'seven77', 'seven77')

    expect(screen.getByText(/at least 8 characters/)).toBeInTheDocument()
    expect(mockSignUp).not.toHaveBeenCalled()
  })

  it('clears previous error on new submission attempt', async () => {
    render(<SignupClient />)
    await fillForm('user@test.com', 'short', 'short')
    expect(screen.getByText(/at least 8 characters/)).toBeInTheDocument()

    // Fix the password — should clear error and proceed to Supabase
    mockSignUp.mockResolvedValueOnce({ data: { user: { identities: [{ id: '1' }] }, session: null }, error: null })
    const passwordInput = screen.getByLabelText('Password')
    const confirmInput = screen.getByLabelText('Confirm password')
    await userEvent.clear(passwordInput)
    await userEvent.clear(confirmInput)
    await userEvent.type(passwordInput, 'validpassword123')
    await userEvent.type(confirmInput, 'validpassword123')
    await userEvent.click(screen.getByRole('button', { name: 'Create account' }))

    await waitFor(() => {
      expect(screen.queryByText(/at least 8 characters/)).not.toBeInTheDocument()
    })
  })
})

describe('SignupClient — Supabase errors', () => {
  it('shows "already exists" message when email is already registered', async () => {
    mockSignUp.mockResolvedValueOnce({
      error: { message: 'User already registered' },
    })
    render(<SignupClient />)
    await fillForm('existing@test.com', 'password123', 'password123')

    await waitFor(() => {
      expect(screen.getByText(/already exists/)).toBeInTheDocument()
    })
  })

  it('shows generic error for unexpected Supabase failures', async () => {
    mockSignUp.mockResolvedValueOnce({
      error: { message: 'Internal server error' },
    })
    render(<SignupClient />)
    await fillForm('user@test.com', 'password123', 'password123')

    await waitFor(() => {
      expect(screen.getByText(/Something went wrong/)).toBeInTheDocument()
    })
  })
})

describe('SignupClient — success screen', () => {
  it('shows confirmation screen after successful signup', async () => {
    mockSignUp.mockResolvedValueOnce({ data: { user: { identities: [{ id: '1' }] }, session: null }, error: null })
    render(<SignupClient />)
    await fillForm('newuser@test.com', 'password123', 'password123')

    await waitFor(() => {
      expect(screen.getByText("You're almost in")).toBeInTheDocument()
      expect(screen.getByText('newuser@test.com')).toBeInTheDocument()
    })
  })

  it('shows sign in link on confirmation screen', async () => {
    mockSignUp.mockResolvedValueOnce({ data: { user: { identities: [{ id: '1' }] }, session: null }, error: null })
    render(<SignupClient />)
    await fillForm('newuser@test.com', 'password123', 'password123')

    await waitFor(() => {
      expect(screen.getByRole('link', { name: 'Sign in to continue' })).toBeInTheDocument()
    })
  })
})

describe('SignupClient — resend confirmation email', () => {
  async function reachSuccessScreen() {
    mockSignUp.mockResolvedValueOnce({ data: { user: { identities: [{ id: '1' }] }, session: null }, error: null })
    render(<SignupClient />)
    await fillForm('newuser@test.com', 'password123', 'password123')
    await waitFor(() => expect(screen.getByText("You're almost in")).toBeInTheDocument())
  }

  it('confirms "sent it again" when the resend succeeds', async () => {
    mockResend.mockResolvedValueOnce({ error: null })
    await reachSuccessScreen()
    await userEvent.click(screen.getByRole('button', { name: 'Send the email again' }))
    await waitFor(() => expect(screen.getByText(/sent it again/i)).toBeInTheDocument())
  })

  it('shows an error box — NOT a false "sent it again" — when the resend fails', async () => {
    mockResend.mockResolvedValueOnce({ error: { message: 'Internal server error' } })
    await reachSuccessScreen()
    await userEvent.click(screen.getByRole('button', { name: 'Send the email again' }))
    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument())
    expect(screen.queryByText(/sent it again/i)).not.toBeInTheDocument()
  })

  it('gives a wait-a-minute message when the resend is rate limited', async () => {
    mockResend.mockResolvedValueOnce({ error: { message: 'you can only request this after 60 seconds' } })
    await reachSuccessScreen()
    await userEvent.click(screen.getByRole('button', { name: 'Send the email again' }))
    await waitFor(() => expect(screen.getByText(/wait a minute/i)).toBeInTheDocument())
  })
})

describe('SignupClient — password visibility', () => {
  it('toggles both password fields simultaneously', async () => {
    render(<SignupClient />)
    const passwordInput = screen.getByLabelText('Password')
    const confirmInput = screen.getByLabelText('Confirm password')

    expect(passwordInput).toHaveAttribute('type', 'password')
    expect(confirmInput).toHaveAttribute('type', 'password')

    await userEvent.click(screen.getByRole('button', { name: 'Show password' }))

    expect(passwordInput).toHaveAttribute('type', 'text')
    expect(confirmInput).toHaveAttribute('type', 'text')
  })
})

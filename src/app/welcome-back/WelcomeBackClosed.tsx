export default function WelcomeBackClosed() {
  return (
    <div className="w-full max-w-sm text-center">
      <p className="text-[13px] tracking-[0.2em] uppercase font-medium mb-3" style={{ color: '#38601E' }}>
        Welcome back
      </p>
      <h1 className="font-serif text-3xl text-charcoal font-medium mb-4">
        This page is no longer available.
      </h1>
      <p className="text-charcoal/65 leading-relaxed">
        The founding-member window has closed. If you still need help with your
        membership, please reach out at{' '}
        <a href="mailto:hello@tatforanimals.com" className="underline underline-offset-2 hover:text-charcoal transition-colors">
          hello@tatforanimals.com
        </a>.
      </p>
    </div>
  )
}

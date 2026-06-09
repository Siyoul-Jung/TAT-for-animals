'use client';

import { useEffect } from 'react';

/**
 * Renders a Termageddon-hosted legal policy (Privacy / Terms / Disclaimer).
 *
 * Termageddon's embed script finds the <div> by its `policyId` and injects the
 * policy HTML into it. We append the script in a `useEffect` (rather than via
 * <Script>) so it re-runs on every mount — `next/script` dedupes by `src` and
 * would leave the div empty after a client-side navigation back to the page.
 *
 * The policy text (including its own "last updated" date) is managed entirely
 * in the Termageddon dashboard, so it stays compliant without code changes.
 */
export default function TermageddonPolicy({ policyId }: { policyId: string }) {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = `https://policies.termageddon.com/api/embed/${policyId}.js`;
    script.async = true;

    // Termageddon's embed script defers all of its work to the window `load`
    // event. On a client-side navigation that event has already fired and never
    // fires again, so the policy would never populate. Once our script is ready,
    // re-dispatch `load` if the page is already complete to kick off its fetch.
    const handleScriptLoad = () => {
      if (document.readyState === 'complete') {
        window.dispatchEvent(new Event('load'));
      }
    };
    script.addEventListener('load', handleScriptLoad);
    document.body.appendChild(script);

    return () => {
      script.removeEventListener('load', handleScriptLoad);
      script.remove();
    };
  }, [policyId]);

  return (
    <div
      id={policyId}
      className="policy_embed_div text-base leading-relaxed"
      style={{ color: 'rgba(28,16,7,0.78)' }}
      aria-live="polite"
      aria-busy="true"
    >
      Please wait while the policy is loaded. If it does not load, please{' '}
      <a
        rel="nofollow noopener noreferrer"
        aria-label="click here to view the policy"
        href={`https://policies.termageddon.com/api/policy/${policyId}`}
        target="_blank"
        style={{ color: '#7B4A2D', textDecoration: 'underline' }}
      >
        click here to view the policy
      </a>
      .
    </div>
  );
}

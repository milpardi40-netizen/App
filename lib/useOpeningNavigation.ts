import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Pushes a route one frame after the tap, and reports that something is opening.
 *
 * On a phone the next screen's module is evaluated while the navigation is being handled, so pushing in
 * the same frame leaves the tap visually unanswered until everything is ready — which is what makes the
 * cards feel dead. Marking the tap first, and pushing on the next frame, lets the press state and the
 * progress overlay paint before that work starts.
 */
export function useOpeningNavigation() {
  const router = useRouter();
  const [opening, setOpening] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reset = useRef<ReturnType<typeof setTimeout> | null>(null);

  const open = useCallback((href: string) => {
    setOpening(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => { router.push(href as never); }, 16);
    // Coming back to this screen must never leave the overlay behind if navigation did not happen.
    if (reset.current) clearTimeout(reset.current);
    reset.current = setTimeout(() => setOpening(false), 2500);
  }, [router]);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
    if (reset.current) clearTimeout(reset.current);
  }, []);

  return { opening, open };
}

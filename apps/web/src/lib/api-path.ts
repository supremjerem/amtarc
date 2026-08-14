// Route params arrive decoded, so a single segment can still carry characters
// that change a path's meaning once fetch() normalizes the URL: traversal
// (`..`), a current-directory hop (`.`), an injected query or fragment, or a
// smuggled separator. Every segment interpolated into an API URL is checked
// here first, so the guarantee holds by construction rather than by accident.
const SAFE_SEGMENT = /^[A-Za-z0-9._-]+$/;
const DOTS_ONLY = /^\.+$/;

export function isSafeApiSegment(segment: string): boolean {
  return SAFE_SEGMENT.test(segment) && !DOTS_ONLY.test(segment);
}

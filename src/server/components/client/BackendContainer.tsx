'use client';

export default function BackendContainer() {
  /*
    This container needs to be present in the DOM on page load for the Neos UI to work.
    To prevent hydration errors, we're using dangerouslySetInnerHTML in combination with suppressHydrationWarning for now.
  */
  return (
    <div dangerouslySetInnerHTML={{ __html: '<div id="neos-backend-container"></div>' }} suppressHydrationWarning />
  );
}

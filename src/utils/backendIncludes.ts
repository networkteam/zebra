import { BackendInclude, BackendProps } from '../types';

// Sets expected metadata for the Neos UI and dispatches the Neos.Neos.Ui.ContentReady event
export const injectNeosBackendMetadata = (backend: BackendProps | undefined) => {
  (window as any)['@Neos.Neos.Ui:DocumentInformation'] = backend?.documentInformation;

  if (backend?.guestFrameApplication) {
    createBackendIncludes(backend.guestFrameApplication);
  }

  const event = new CustomEvent('Neos.Neos.Ui.ContentReady');
  window.parent.document.dispatchEvent(event);

  // TODO Check if we can do it differently
  document.body.classList.add('neos-backend');
};

// We add the includes explicitly and do not use next/head to have more control over the initialization order.
const createBackendIncludes = (includes: BackendInclude[]) => {
  for (let include of includes) {
    const elId = `_neos-ui-${include.key}`;
    // We perform a very simple check by id to sync the expected and actual presence of the head elements
    if (!document.getElementById(elId)) {
      const el = document.createElement(include.type);
      el.id = elId;
      if (el instanceof HTMLLinkElement && include.rel) {
        el.rel = include.rel;
      }
      if (el instanceof HTMLLinkElement && include.href) {
        el.href = include.href;
      }
      if (el instanceof HTMLScriptElement && include.src) {
        el.src = include.src;
      }
      if (include.content) {
        el.innerHTML = include.content;
      }
      document.head.appendChild(el);
    }
  }
};

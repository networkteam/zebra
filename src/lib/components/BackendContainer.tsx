export default function BackendContainer() {
  /*
    This container needs to be present in the DOM on page load for the Neos UI to work.
    Adding it via useEffect only for preview didn't show it correctly until changing the UI.
  */
  return <div id="neos-backend-container"></div>;
}

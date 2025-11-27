import { PACKAGE_NAME, VERSION } from '@hummbl/core';

function App() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui' }}>
      <h1>HUMMBL Dashboard</h1>
      <p>
        Using {PACKAGE_NAME} v{VERSION}
      </p>
      <p>🚧 Under construction - migrating from hummbl-io</p>
    </div>
  );
}

export default App;

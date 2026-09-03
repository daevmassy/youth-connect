const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { once } = require('node:events');
const { spawn } = require('node:child_process');
const net = require('node:net');
const test = require('node:test');

const BUILD_SCRIPT = path.resolve(__dirname, '..', 'scripts', 'build.js');
const SERVER_SCRIPT = path.resolve(__dirname, '..', 'server', 'serve.js');

function listenOnPort(port) {
  return new Promise((resolve, reject) => {
    const listener = net.createServer();
    listener.once('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        resolve(null);
      } else {
        reject(error);
      }
    });
    listener.listen(port, '127.0.0.1', () => resolve(listener));
  });
}

function getFreePort() {
  return new Promise((resolve, reject) => {
    const listener = net.createServer();
    listener.once('error', reject);
    listener.listen(0, '127.0.0.1', () => {
      const address = listener.address();
      const port = address && typeof address === 'object' ? address.port : null;
      listener.close((error) => (error ? reject(error) : resolve(port)));
    });
  });
}

async function waitForServer(url, child) {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    if (child.exitCode !== null) {
      throw new Error(`Production server exited with code ${child.exitCode}`);
    }

    try {
      const response = await fetch(url);
      if (response.status === 200) return;
    } catch {
      // The server may still be binding its port.
    }

    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  throw new Error(`Production server did not become ready at ${url}`);
}

test('build tooling selects another Metro port when 8081 is occupied', async () => {
  const occupiedPort = await listenOnPort(8081);
  const previousMetroPort = process.env.EXPO_METRO_PORT;
  process.env.EXPO_METRO_PORT = '8081';

  try {
    delete require.cache[require.resolve(BUILD_SCRIPT)];
    const { findAvailableMetroPort } = require(BUILD_SCRIPT);
    const selectedPort = await findAvailableMetroPort();

    assert.notEqual(selectedPort, 8081);
    assert.ok(selectedPort > 8081);
  } finally {
    if (occupiedPort) {
      await new Promise((resolve, reject) =>
        occupiedPort.close((error) => (error ? reject(error) : resolve())),
      );
    }

    if (previousMetroPort === undefined) {
      delete process.env.EXPO_METRO_PORT;
    } else {
      process.env.EXPO_METRO_PORT = previousMetroPort;
    }
  }
});

test('production server serves health checks, a platform manifest, and its bundle', async () => {
  const staticRoot = fs.mkdtempSync(
    path.join(os.tmpdir(), 'pekuti-mobile-static-build-'),
  );
  const timestamp = 'test-build';
  const bundleRelativePath = path.join(
    timestamp,
    '_expo',
    'static',
    'js',
    'ios',
    'bundle.js',
  );
  const bundleContents = 'console.log("generated iOS bundle");';
  const bundlePath = path.join(staticRoot, bundleRelativePath);
  const androidBundleRelativePath = path.join(
    timestamp,
    '_expo',
    'static',
    'js',
    'android',
    'bundle.js',
  );
  const androidBundleContents = 'console.log("generated Android bundle");';
  const androidBundlePath = path.join(
    staticRoot,
    androidBundleRelativePath,
  );
  const manifest = {
    launchAsset: {
      key: 'bundle-test-build',
      contentType: 'application/javascript',
      url: `/mobile/${bundleRelativePath}`,
    },
    extra: {
      expoClient: {},
    },
  };
  const androidManifest = {
    ...manifest,
    launchAsset: {
      ...manifest.launchAsset,
      url: `/mobile/${androidBundleRelativePath}`,
    },
  };

  fs.mkdirSync(path.dirname(bundlePath), { recursive: true });
  fs.writeFileSync(bundlePath, bundleContents);
  fs.mkdirSync(path.dirname(androidBundlePath), { recursive: true });
  fs.writeFileSync(androidBundlePath, androidBundleContents);
  fs.mkdirSync(path.join(staticRoot, 'ios'), { recursive: true });
  fs.writeFileSync(
    path.join(staticRoot, 'ios', 'manifest.json'),
    JSON.stringify(manifest),
  );
  fs.mkdirSync(path.join(staticRoot, 'android'), { recursive: true });
  fs.writeFileSync(
    path.join(staticRoot, 'android', 'manifest.json'),
    JSON.stringify(androidManifest),
  );

  const port = await getFreePort();
  const child = spawn(process.execPath, [SERVER_SCRIPT], {
    cwd: path.resolve(__dirname, '..'),
    env: {
      ...process.env,
      BASE_PATH: '/mobile',
      PORT: String(port),
      STATIC_BUILD_ROOT: staticRoot,
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  try {
    await waitForServer(`http://127.0.0.1:${port}/status`, child);

    const healthResponse = await fetch(`http://127.0.0.1:${port}/status`);
    assert.equal(healthResponse.status, 200);

    const prefixedHealthResponse = await fetch(
      `http://127.0.0.1:${port}/mobile/status`,
    );
    assert.equal(prefixedHealthResponse.status, 200);

    const manifestResponse = await fetch(
      `http://127.0.0.1:${port}/mobile/manifest`,
      { headers: { 'expo-platform': 'ios' } },
    );
    assert.equal(manifestResponse.status, 200);
    assert.deepEqual(await manifestResponse.json(), manifest);

    const bundleResponse = await fetch(
      `http://127.0.0.1:${port}/mobile/${bundleRelativePath}`,
    );
    assert.equal(bundleResponse.status, 200);
    assert.equal(await bundleResponse.text(), bundleContents);

    const androidManifestResponse = await fetch(
      `http://127.0.0.1:${port}/mobile/manifest`,
      { headers: { 'expo-platform': 'android' } },
    );
    assert.equal(androidManifestResponse.status, 200);
    assert.deepEqual(await androidManifestResponse.json(), androidManifest);

    const androidBundleResponse = await fetch(
      `http://127.0.0.1:${port}/mobile/${androidBundleRelativePath}`,
    );
    assert.equal(androidBundleResponse.status, 200);
    assert.equal(await androidBundleResponse.text(), androidBundleContents);
  } finally {
    child.kill('SIGTERM');
    await once(child, 'exit');
    fs.rmSync(staticRoot, { recursive: true, force: true });
  }
});
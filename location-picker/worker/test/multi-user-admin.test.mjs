import assert from "node:assert/strict";
import test from "node:test";
import worker from "../src/index.js";

function createMockKV() {
  const store = new Map();
  return {
    async get(key) {
      return store.has(key) ? store.get(key) : null;
    },
    async put(key, value) {
      store.set(key, String(value));
    },
    async delete(key) {
      store.delete(key);
    },
    _raw: store,
  };
}

function createEnv(options = {}) {
  return {
    KV_BINDING: createMockKV(),
    ADMIN_TOKEN: options.adminToken || "secret_admin_token_123",
    TOKEN: options.legacyToken || "legacy_user_token_abc",
  };
}

test("Admin endpoint rejects unauthenticated or bad tokens", async () => {
  const env = createEnv();

  // No token
  const res1 = await worker.fetch(new Request("https://worker.test/api/admin/info"), env);
  assert.equal(res1.status, 401);

  // Bad token
  const res2 = await worker.fetch(
    new Request("https://worker.test/api/admin/info", {
      headers: { "X-Admin-Token": "wrong_token" },
    }),
    env
  );
  assert.equal(res2.status, 401);

  // Valid token via header
  const res3 = await worker.fetch(
    new Request("https://worker.test/api/admin/info", {
      headers: { "X-Admin-Token": "secret_admin_token_123" },
    }),
    env
  );
  assert.equal(res3.status, 200);
  const data = await res3.json();
  assert.equal(data.ok, true);
  assert.equal(data.hasAdminToken, true);
});

test("Admin page (/admin) serves admin dashboard HTML", async () => {
  const env = createEnv();
  const res = await worker.fetch(new Request("https://worker.test/admin"), env);
  assert.equal(res.status, 200);
  assert.equal(res.headers.get("Content-Type"), "text/html; charset=utf-8");
  const html = await res.text();
  assert.match(html, /Location Spoofer.*Admin/);
  assert.match(html, /id="usersListContainer"/);
  assert.match(html, /id="openAddUserBtn"/);
});

test("Multi-user creation and location data isolation", async () => {
  const env = createEnv();
  const adminHeaders = {
    "Content-Type": "application/json",
    "X-Admin-Token": "secret_admin_token_123",
  };

  // 1. Create Alice
  const aliceCreateRes = await worker.fetch(
    new Request("https://worker.test/api/admin/users", {
      method: "POST",
      headers: adminHeaders,
      body: JSON.stringify({
        name: "Alice Phone",
        token: "alice_tok_111",
        note: "Tokyo trip",
        location: {
          enabled: true,
          latitude: 35.68124,
          longitude: 139.76712,
          altitude: 40,
        },
      }),
    }),
    env
  );
  assert.equal(aliceCreateRes.status, 200);
  const aliceCreated = await aliceCreateRes.json();
  assert.equal(aliceCreated.ok, true);
  assert.equal(aliceCreated.user.name, "Alice Phone");

  // 2. Create Bob
  const bobCreateRes = await worker.fetch(
    new Request("https://worker.test/api/admin/users", {
      method: "POST",
      headers: adminHeaders,
      body: JSON.stringify({
        name: "Bob iPad",
        token: "bob_tok_222",
        location: {
          enabled: true,
          latitude: 40.75889,
          longitude: -73.98513,
          altitude: 10,
        },
      }),
    }),
    env
  );
  assert.equal(bobCreateRes.status, 200);

  // 3. Verify Alice's location from /loc.json
  const aliceLocRes = await worker.fetch(
    new Request("https://worker.test/loc.json?token=alice_tok_111"),
    env
  );
  assert.equal(aliceLocRes.status, 200);
  const aliceLoc = await aliceLocRes.json();
  assert.equal(aliceLoc.latitude, 35.68124);
  assert.equal(aliceLoc.longitude, 139.76712);
  assert.equal(aliceLoc.userName, "Alice Phone");

  // 4. Verify Bob's location is independent
  const bobLocRes = await worker.fetch(
    new Request("https://worker.test/loc.json?token=bob_tok_222"),
    env
  );
  assert.equal(bobLocRes.status, 200);
  const bobLoc = await bobLocRes.json();
  assert.equal(bobLoc.latitude, 40.75889);
  assert.equal(bobLoc.longitude, -73.98513);
  assert.equal(bobLoc.userName, "Bob iPad");

  // 5. Alice updates her location via /set
  const aliceSetRes = await worker.fetch(
    new Request("https://worker.test/set?token=alice_tok_111", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lat: 34.05223,
        lng: -118.24368,
        altitude: 100,
      }),
    }),
    env
  );
  assert.equal(aliceSetRes.status, 200);

  // Alice's new location is Los Angeles
  const aliceUpdatedLoc = await (
    await worker.fetch(new Request("https://worker.test/loc.json?token=alice_tok_111"), env)
  ).json();
  assert.equal(aliceUpdatedLoc.latitude, 34.05223);
  assert.equal(aliceUpdatedLoc.longitude, -118.24368);

  // Bob's location remains unchanged (New York)
  const bobStillNY = await (
    await worker.fetch(new Request("https://worker.test/loc.json?token=bob_tok_222"), env)
  ).json();
  assert.equal(bobStillNY.latitude, 40.75889);
  assert.equal(bobStillNY.longitude, -73.98513);
});

test("Disabling a user blocks access to /loc.json and /set with 403", async () => {
  const env = createEnv();
  const adminHeaders = {
    "Content-Type": "application/json",
    "X-Admin-Token": "secret_admin_token_123",
  };

  // Create user
  const createRes = await worker.fetch(
    new Request("https://worker.test/api/admin/users", {
      method: "POST",
      headers: adminHeaders,
      body: JSON.stringify({ name: "Charlie", token: "charlie_tok" }),
    }),
    env
  );
  const user = (await createRes.json()).user;

  // Verify works initially
  const res1 = await worker.fetch(
    new Request("https://worker.test/loc.json?token=charlie_tok"),
    env
  );
  assert.equal(res1.status, 200);

  // Disable user
  const updateRes = await worker.fetch(
    new Request("https://worker.test/api/admin/users/update", {
      method: "POST",
      headers: adminHeaders,
      body: JSON.stringify({ id: user.id, active: false }),
    }),
    env
  );
  assert.equal(updateRes.status, 200);

  // Now blocked
  const res2 = await worker.fetch(
    new Request("https://worker.test/loc.json?token=charlie_tok"),
    env
  );
  assert.equal(res2.status, 403);
  const err = await res2.json();
  assert.equal(err.error, "user disabled");

  // Re-enable user
  await worker.fetch(
    new Request("https://worker.test/api/admin/users/update", {
      method: "POST",
      headers: adminHeaders,
      body: JSON.stringify({ id: user.id, active: true }),
    }),
    env
  );

  const res3 = await worker.fetch(
    new Request("https://worker.test/loc.json?token=charlie_tok"),
    env
  );
  assert.equal(res3.status, 200);
});

test("Resetting token revokes old token and preserves existing location", async () => {
  const env = createEnv();
  const adminHeaders = {
    "Content-Type": "application/json",
    "X-Admin-Token": "secret_admin_token_123",
  };

  const createRes = await worker.fetch(
    new Request("https://worker.test/api/admin/users", {
      method: "POST",
      headers: adminHeaders,
      body: JSON.stringify({
        name: "David",
        token: "david_old_tok",
        location: { latitude: 21.02851, longitude: 105.85444 },
      }),
    }),
    env
  );
  const user = (await createRes.json()).user;

  // Reset token
  const resetRes = await worker.fetch(
    new Request("https://worker.test/api/admin/users/reset-token", {
      method: "POST",
      headers: adminHeaders,
      body: JSON.stringify({ id: user.id, newToken: "david_new_tok" }),
    }),
    env
  );
  assert.equal(resetRes.status, 200);

  // Old token is rejected
  const oldRes = await worker.fetch(
    new Request("https://worker.test/loc.json?token=david_old_tok"),
    env
  );
  assert.equal(oldRes.status, 403);

  // New token works and has same coordinates
  const newRes = await worker.fetch(
    new Request("https://worker.test/loc.json?token=david_new_tok"),
    env
  );
  assert.equal(newRes.status, 200);
  const data = await newRes.json();
  assert.equal(data.latitude, 21.02851);
  assert.equal(data.longitude, 105.85444);
});

test("Deleting user removes token and data", async () => {
  const env = createEnv();
  const adminHeaders = {
    "Content-Type": "application/json",
    "X-Admin-Token": "secret_admin_token_123",
  };

  const createRes = await worker.fetch(
    new Request("https://worker.test/api/admin/users", {
      method: "POST",
      headers: adminHeaders,
      body: JSON.stringify({ name: "Eve", token: "eve_tok" }),
    }),
    env
  );
  const user = (await createRes.json()).user;

  // Delete
  const delRes = await worker.fetch(
    new Request("https://worker.test/api/admin/users/delete", {
      method: "POST",
      headers: adminHeaders,
      body: JSON.stringify({ id: user.id }),
    }),
    env
  );
  assert.equal(delRes.status, 200);

  // Token now returns 403
  const locRes = await worker.fetch(
    new Request("https://worker.test/loc.json?token=eve_tok"),
    env
  );
  assert.equal(locRes.status, 403);
});

test("Backward compatibility with legacy env.TOKEN", async () => {
  const env = createEnv({ legacyToken: "legacy_single_user_secret" });

  // Prior to creating any users, fetching with legacyToken succeeds
  const res = await worker.fetch(
    new Request("https://worker.test/loc.json?token=legacy_single_user_secret"),
    env
  );
  assert.equal(res.status, 200);
  const loc = await res.json();
  assert.equal(typeof loc.latitude, "number");
  assert.equal(typeof loc.longitude, "number");
});

test("Map page renders currentUserName and responses include userName", async () => {
  const env = createEnv();
  const adminHeaders = {
    "Content-Type": "application/json",
    "X-Admin-Token": "secret_admin_token_123",
  };

  // Create user
  await worker.fetch(
    new Request("https://worker.test/api/admin/users", {
      method: "POST",
      headers: adminHeaders,
      body: JSON.stringify({ name: "Frank Sinatra", token: "frank_tok" }),
    }),
    env
  );

  // 1. /loc.json returns userName
  const locRes = await worker.fetch(
    new Request("https://worker.test/loc.json?token=frank_tok"),
    env
  );
  const locData = await locRes.json();
  assert.equal(locData.userName, "Frank Sinatra");

  // 2. /set returns userName
  const setRes = await worker.fetch(
    new Request("https://worker.test/set?token=frank_tok", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lat: 10, lng: 20 }),
    }),
    env
  );
  const setData = await setRes.json();
  assert.equal(setData.userName, "Frank Sinatra");

  // 3. / with Accept: application/json returns userName
  const jsonRootRes = await worker.fetch(
    new Request("https://worker.test/?token=frank_tok", {
      headers: { Accept: "application/json" },
    }),
    env
  );
  const jsonRootData = await jsonRootRes.json();
  assert.equal(jsonRootData.userName, "Frank Sinatra");

  // 4. GET / returns HTML with user display logic
  const htmlRes = await worker.fetch(
    new Request("https://worker.test/?token=frank_tok"),
    env
  );
  assert.equal(htmlRes.status, 200);
  const html = await htmlRes.text();
  assert.match(html, /currentUserName/);
  assert.match(html, /escapeHtml\(currentUserName\)/);
});


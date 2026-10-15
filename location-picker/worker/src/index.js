/**
 * iOS Location Picker — Cloudflare Worker
 *
 * Multi-user API:
 *   GET  /loc.json?token=      → 读取指定用户的坐标 JSON（Loon / Shadowrocket / Surge）
 *   POST /set?token=           → 保存指定用户的坐标
 *   POST /enable?token=        → 一键开启/关闭指定用户的伪造定位
 *   GET  /?token=              → 指定用户的地图选点网页
 *   GET  /admin                → 管理后台网页（管理用户与 Token）
 *   ALL  /api/admin/*          → 管理后台 API 接口
 *   GET  /health               → 服务健康检测
 */

import { PAGE } from "./page.js";
import { ADMIN_PAGE } from "./admin-page.js";

const KV_USERS_LIST = "lp_users_v1";
const KV_USER_DATA_PREFIX = "lp_user:";
const KV_LEGACY_LOC = "loc";

const DEFAULT = {
  enabled: true, // false = 脚本放行原始响应（恢复真实定位）
  latitude: 37.3349,
  longitude: -122.00902,
  altitude: 530,
  horizontalAccuracy: 39,
  verticalAccuracy: 1000,
};

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Admin-Token",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Content-Type-Options": "nosniff",
};

const PAGE_CSP = [
  "default-src 'none'",
  "script-src https://unpkg.com 'unsafe-inline'",
  "style-src https://unpkg.com 'unsafe-inline'",
  "img-src 'self' https: data:",
  "connect-src 'self' https://unpkg.com https://api.open-meteo.com https://nominatim.openstreetmap.org",
  "base-uri 'none'",
  "form-action 'none'",
  "frame-ancestors 'none'",
].join("; ");

const ADMIN_CSP = [
  "default-src 'none'",
  "script-src 'unsafe-inline'",
  "style-src 'unsafe-inline'",
  "img-src 'self' data:",
  "connect-src 'self'",
  "base-uri 'none'",
  "form-action 'none'",
  "frame-ancestors 'none'",
].join("; ");

function jsonResponse(body, status = 200) {
  return new Response(typeof body === "string" ? body : JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      ...CORS,
    },
  });
}

function textResponse(body, contentType, status = 200) {
  return new Response(body, {
    status,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "no-store",
      ...CORS,
    },
  });
}

function unauthorized(message = "bad token", status = 403) {
  return jsonResponse({ error: message }, status);
}

// 常量时间比较，避免通过响应时延逐字节爆破 token
function safeEqual(a, b) {
  if (a == null || b == null) return false;
  const enc = new TextEncoder();
  const ab = enc.encode(String(a));
  const bb = enc.encode(String(b));
  if (ab.length !== bb.length) {
    return false;
  }
  let diff = 0;
  for (let i = 0; i < ab.length; i += 1) {
    diff |= ab[i] ^ bb[i];
  }
  return diff === 0;
}

function getKV(env) {
  return env.KV_BINDING || null;
}

function getAdminToken(env) {
  return env.ADMIN_TOKEN || env.TOKEN || "";
}

function extractAdminToken(request) {
  const url = new URL(request.url);
  const qToken = url.searchParams.get("admin_token") || url.searchParams.get("token");
  const authHeader = request.headers.get("Authorization") || "";
  const hToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
  const customHeaderToken = request.headers.get("X-Admin-Token") || "";
  return customHeaderToken || hToken || qToken || "";
}

function checkAdminToken(request, env) {
  const configured = getAdminToken(env);
  if (!configured) {
    return { ok: false, error: "Server misconfigured: ADMIN_TOKEN secret not set" };
  }
  const token = extractAdminToken(request);
  if (!token) {
    return { ok: false, error: "Missing admin token" };
  }
  if (!safeEqual(token, configured)) {
    return { ok: false, error: "Bad admin token" };
  }
  return { ok: true };
}

function extractUserToken(request) {
  const url = new URL(request.url);
  const qToken = url.searchParams.get("token");
  if (qToken) return qToken;
  const authHeader = request.headers.get("Authorization") || "";
  if (authHeader.startsWith("Bearer ")) return authHeader.slice(7).trim();
  return "";
}

async function readLegacyLoc(env) {
  const kv = getKV(env);
  if (!kv) return { ...DEFAULT };
  try {
    const raw = await kv.get(KV_LEGACY_LOC);
    if (!raw) return { ...DEFAULT };
    return { ...DEFAULT, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT };
  }
}

async function getUsersList(env) {
  const kv = getKV(env);
  if (!kv) return [];
  try {
    const raw = await kv.get(KV_USERS_LIST);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {}

  // 自动迁移 / 兜底初始单用户
  if (env.TOKEN) {
    const defaultUser = {
      id: "usr_default",
      name: "Default User",
      token: env.TOKEN,
      active: true,
      note: "Primary user (migrated from env.TOKEN)",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    try {
      await kv.put(KV_USERS_LIST, JSON.stringify([defaultUser]));
      const loc = await readLegacyLoc(env);
      await kv.put(KV_USER_DATA_PREFIX + env.TOKEN, JSON.stringify({
        ...defaultUser,
        location: loc,
      }));
    } catch {}
    return [defaultUser];
  }

  return [];
}

async function saveUsersList(env, list) {
  const kv = getKV(env);
  if (!kv) throw new Error("KV binding missing (expected KV_BINDING)");
  await kv.put(KV_USERS_LIST, JSON.stringify(list));
}

async function getUserDataByToken(env, token) {
  if (!token) return null;
  const kv = getKV(env);
  if (!kv) return null;

  try {
    const raw = await kv.get(KV_USER_DATA_PREFIX + token);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {}

  // 兼容逻辑：如果传的是 env.TOKEN
  if (env.TOKEN && safeEqual(token, env.TOKEN)) {
    const loc = await readLegacyLoc(env);
    const legacyUser = {
      id: "usr_default",
      name: "Default User",
      token: env.TOKEN,
      active: true,
      note: "Primary user (migrated from env.TOKEN)",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      location: loc,
    };
    try {
      await kv.put(KV_USER_DATA_PREFIX + token, JSON.stringify(legacyUser));
      const list = await getUsersList(env);
      if (!list.some(u => u.token === token)) {
        list.unshift({
          id: legacyUser.id,
          name: legacyUser.name,
          token: legacyUser.token,
          active: legacyUser.active,
          note: legacyUser.note,
          createdAt: legacyUser.createdAt,
          updatedAt: legacyUser.updatedAt,
        });
        await saveUsersList(env, list);
      }
    } catch {}
    return legacyUser;
  }

  return null;
}

async function saveUserData(env, token, userData) {
  const kv = getKV(env);
  if (!kv) throw new Error("KV binding missing (expected KV_BINDING)");
  await kv.put(KV_USER_DATA_PREFIX + token, JSON.stringify(userData));

  // 如果此 token 为 legacy env.TOKEN，同步更新原有的 loc 键
  if (env.TOKEN && safeEqual(token, env.TOKEN) && userData.location) {
    try {
      await kv.put(KV_LEGACY_LOC, JSON.stringify(userData.location));
    } catch {}
  }
}

async function deleteUserData(env, token) {
  const kv = getKV(env);
  if (!kv) return;
  await kv.delete(KV_USER_DATA_PREFIX + token);
}

function setInt(target, key, value) {
  if (
    value !== undefined &&
    value !== null &&
    value !== "" &&
    Number.isFinite(Number(value))
  ) {
    target[key] = Math.round(Number(value));
  }
}

function wrapLng(lng) {
  const n = Number(lng);
  if (n >= -180 && n <= 180) return n;
  return ((((n + 180) % 360) + 360) % 360) - 180;
}

function generateRandomHex(bytesCount = 24) {
  const bytes = new Uint8Array(bytesCount);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS });
    }

    const url = new URL(request.url);

    // ==========================================
    // 1. 管理后台页面与 API (/admin & /api/admin/*)
    // ==========================================

    if (url.pathname === "/admin" && request.method === "GET") {
      return new Response(ADMIN_PAGE, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "no-store",
          "Content-Security-Policy": ADMIN_CSP,
          ...CORS,
        },
      });
    }

    if (url.pathname.startsWith("/api/admin/")) {
      const adminAuth = checkAdminToken(request, env);
      if (!adminAuth.ok) {
        return unauthorized(adminAuth.error || "bad admin token", 401);
      }

      // 获取系统概览与统计
      if (url.pathname === "/api/admin/info" && request.method === "GET") {
        const users = await getUsersList(env);
        return jsonResponse({
          ok: true,
          totalUsers: users.length,
          activeUsers: users.filter(u => u.active !== false).length,
          kvConnected: !!getKV(env),
          hasAdminToken: !!getAdminToken(env),
          hasLegacyToken: !!env.TOKEN,
        });
      }

      // 获取所有用户完整列表（包含坐标与状态）
      if (url.pathname === "/api/admin/users" && request.method === "GET") {
        const list = await getUsersList(env);
        const fullUsers = await Promise.all(
          list.map(async (u) => {
            const data = await getUserDataByToken(env, u.token);
            return {
              id: u.id,
              name: u.name,
              token: u.token,
              active: u.active !== false,
              note: u.note || "",
              createdAt: u.createdAt || 0,
              updatedAt: u.updatedAt || 0,
              location: data && data.location ? data.location : { ...DEFAULT },
            };
          })
        );
        return jsonResponse({ ok: true, users: fullUsers });
      }

      // 创建新用户
      if (url.pathname === "/api/admin/users" && request.method === "POST") {
        let body;
        try {
          body = await request.json();
        } catch {
          return jsonResponse({ error: "bad json" }, 400);
        }

        const name = String(body.name || "").trim();
        if (!name) {
          return jsonResponse({ error: "User name is required" }, 400);
        }

        let token = String(body.token || "").trim();
        if (!token) {
          token = generateRandomHex(24);
        }

        // 避免 token 冲突
        const list = await getUsersList(env);
        if (list.some(u => safeEqual(u.token, token))) {
          return jsonResponse({ error: "Token already in use by another user" }, 400);
        }
        if (safeEqual(token, getAdminToken(env))) {
          return jsonResponse({ error: "Token cannot be the same as ADMIN_TOKEN" }, 400);
        }

        const now = Date.now();
        const userId = "usr_" + now.toString(36) + "_" + Math.random().toString(36).slice(2, 7);
        const newUserSummary = {
          id: userId,
          name: name,
          token: token,
          active: true,
          note: String(body.note || "").trim(),
          createdAt: now,
          updatedAt: now,
        };

        const initialLoc = body.location ? { ...DEFAULT, ...body.location } : { ...DEFAULT };
        const newUserData = {
          ...newUserSummary,
          location: initialLoc,
        };

        await saveUserData(env, token, newUserData);
        list.unshift(newUserSummary);
        await saveUsersList(env, list);

        return jsonResponse({ ok: true, user: newUserData });
      }

      // 更新用户（名称、备注、启用状态）
      if (url.pathname === "/api/admin/users/update" && request.method === "POST") {
        let body;
        try {
          body = await request.json();
        } catch {
          return jsonResponse({ error: "bad json" }, 400);
        }

        const id = String(body.id || "").trim();
        const list = await getUsersList(env);
        const userSummary = list.find(u => u.id === id);
        if (!userSummary) {
          return jsonResponse({ error: "User not found" }, 404);
        }

        const data = await getUserDataByToken(env, userSummary.token);
        if (!data) {
          return jsonResponse({ error: "User data missing" }, 404);
        }

        if (body.name !== undefined) {
          const name = String(body.name).trim();
          if (name) {
            userSummary.name = name;
            data.name = name;
          }
        }
        if (body.note !== undefined) {
          userSummary.note = String(body.note).trim();
          data.note = userSummary.note;
        }
        if (body.active !== undefined) {
          userSummary.active = body.active === true;
          data.active = userSummary.active;
        }

        userSummary.updatedAt = Date.now();
        data.updatedAt = userSummary.updatedAt;

        await saveUserData(env, userSummary.token, data);
        await saveUsersList(env, list);

        return jsonResponse({ ok: true, user: data });
      }

      // 重置 / 更换用户 Token
      if (url.pathname === "/api/admin/users/reset-token" && request.method === "POST") {
        let body;
        try {
          body = await request.json();
        } catch {
          return jsonResponse({ error: "bad json" }, 400);
        }

        const id = String(body.id || "").trim();
        const list = await getUsersList(env);
        const userSummary = list.find(u => u.id === id);
        if (!userSummary) {
          return jsonResponse({ error: "User not found" }, 404);
        }

        const oldToken = userSummary.token;
        const oldData = await getUserDataByToken(env, oldToken);
        const newToken = String(body.newToken || "").trim() || generateRandomHex(24);

        if (list.some(u => u.id !== id && safeEqual(u.token, newToken))) {
          return jsonResponse({ error: "New token already in use" }, 400);
        }
        if (safeEqual(newToken, getAdminToken(env))) {
          return jsonResponse({ error: "Token cannot be the same as ADMIN_TOKEN" }, 400);
        }

        await deleteUserData(env, oldToken);

        const updatedData = {
          ...(oldData || {}),
          id: userSummary.id,
          name: userSummary.name,
          token: newToken,
          active: userSummary.active !== false,
          note: userSummary.note || "",
          updatedAt: Date.now(),
          location: oldData && oldData.location ? oldData.location : { ...DEFAULT },
        };

        userSummary.token = newToken;
        userSummary.updatedAt = updatedData.updatedAt;

        await saveUserData(env, newToken, updatedData);
        await saveUsersList(env, list);

        return jsonResponse({ ok: true, user: updatedData });
      }

      // 删除用户
      if (url.pathname === "/api/admin/users/delete" && request.method === "POST") {
        let body;
        try {
          body = await request.json();
        } catch {
          return jsonResponse({ error: "bad json" }, 400);
        }

        const id = String(body.id || "").trim();
        const list = await getUsersList(env);
        const idx = list.findIndex(u => u.id === id);
        if (idx === -1) {
          return jsonResponse({ error: "User not found" }, 404);
        }

        const userToDelete = list[idx];
        await deleteUserData(env, userToDelete.token);
        list.splice(idx, 1);
        await saveUsersList(env, list);

        return jsonResponse({ ok: true });
      }

      // 后台直接调整用户坐标
      if (url.pathname === "/api/admin/users/set-location" && request.method === "POST") {
        let body;
        try {
          body = await request.json();
        } catch {
          return jsonResponse({ error: "bad json" }, 400);
        }

        const id = String(body.id || "").trim();
        const list = await getUsersList(env);
        const userSummary = list.find(u => u.id === id);
        if (!userSummary) {
          return jsonResponse({ error: "User not found" }, 404);
        }

        const data = await getUserDataByToken(env, userSummary.token);
        if (!data) {
          return jsonResponse({ error: "User data missing" }, 404);
        }

        data.location = data.location || { ...DEFAULT };
        if (body.lat !== undefined && body.lng !== undefined) {
          const la = Number(body.lat);
          const lo = Number(body.lng);
          if (Number.isFinite(la) && Number.isFinite(lo) && la >= -90 && la <= 90) {
            data.location.latitude = la;
            data.location.longitude = wrapLng(lo);
          }
        }
        setInt(data.location, "altitude", body.altitude);
        setInt(data.location, "horizontalAccuracy", body.horizontalAccuracy);
        setInt(data.location, "verticalAccuracy", body.verticalAccuracy);
        if (body.enabled !== undefined) {
          data.location.enabled = body.enabled === true;
        }
        data.location.updatedAt = Date.now();
        data.updatedAt = Date.now();

        await saveUserData(env, userSummary.token, data);
        return jsonResponse({ ok: true, location: data.location });
      }

      return jsonResponse({ error: "admin endpoint not found" }, 404);
    }

    // ==========================================
    // 2. 多用户定位交互 API (/loc.json, /set, /enable)
    // ==========================================

    const token = extractUserToken(request);

    // Shadowrocket / Loon / Surge 读取指定用户的坐标配置
    if (url.pathname === "/loc.json" && request.method === "GET") {
      if (!token) {
        return unauthorized("missing token", 401);
      }
      const userData = await getUserDataByToken(env, token);
      if (!userData) {
        return unauthorized("bad token", 403);
      }
      if (userData.active === false) {
        return unauthorized("user disabled", 403);
      }
      const loc = userData.location || { ...DEFAULT };
      return jsonResponse({
        ...loc,
        userName: userData.name,
      });
    }

    // 保存选点位置
    if (url.pathname === "/set" && request.method === "POST") {
      if (!token) {
        return unauthorized("missing token", 401);
      }
      const userData = await getUserDataByToken(env, token);
      if (!userData) {
        return unauthorized("bad token", 403);
      }
      if (userData.active === false) {
        return unauthorized("user disabled", 403);
      }

      let j;
      try {
        const bodyText = await request.text();
        if (bodyText.length > 10000) {
          return jsonResponse({ error: "payload too large" }, 413);
        }
        j = JSON.parse(bodyText);
      } catch {
        return jsonResponse({ error: "bad json" }, 400);
      }

      const la = Number(j.lat);
      const loRaw = Number(j.lng);
      if (
        !Number.isFinite(la) ||
        !Number.isFinite(loRaw) ||
        la < -90 ||
        la > 90
      ) {
        return jsonResponse({ error: "bad coords" }, 400);
      }

      try {
        const lo = wrapLng(loRaw);
        userData.location = userData.location || { ...DEFAULT };
        userData.location.enabled = true; // 保存新位置即开启伪造
        userData.location.latitude = la;
        userData.location.longitude = lo;
        setInt(userData.location, "altitude", j.altitude);
        setInt(userData.location, "horizontalAccuracy", j.horizontalAccuracy);
        setInt(userData.location, "verticalAccuracy", j.verticalAccuracy);
        userData.location.updatedAt = Date.now();
        userData.updatedAt = Date.now();

        await saveUserData(env, token, userData);
        return jsonResponse({
          ...userData.location,
          userName: userData.name,
        });
      } catch (err) {
        return jsonResponse({ error: err.message || "failed to save" }, 500);
      }
    }

    // 一键切换：伪造 / 恢复真实定位
    if (url.pathname === "/enable" && request.method === "POST") {
      if (!token) {
        return unauthorized("missing token", 401);
      }
      const userData = await getUserDataByToken(env, token);
      if (!userData) {
        return unauthorized("bad token", 403);
      }
      if (userData.active === false) {
        return unauthorized("user disabled", 403);
      }

      let j;
      try {
        const bodyText = await request.text();
        if (bodyText.length > 10000) {
          return jsonResponse({ error: "payload too large" }, 413);
        }
        j = JSON.parse(bodyText);
      } catch {
        return jsonResponse({ error: "bad json" }, 400);
      }

      try {
        userData.location = userData.location || { ...DEFAULT };
        userData.location.enabled = j.enabled !== false;
        userData.location.updatedAt = Date.now();
        userData.updatedAt = Date.now();

        await saveUserData(env, token, userData);
        return jsonResponse({
          ...userData.location,
          userName: userData.name,
        });
      } catch (err) {
        return jsonResponse({ error: err.message || "failed to update" }, 500);
      }
    }

    // 地图选点前端页面 (/)
    if (
      (url.pathname === "/" || url.pathname === "") &&
      request.method === "GET"
    ) {
      if (!token) {
        return unauthorized("missing token: add ?token=<TOKEN> to URL", 401);
      }

      // 如果传的是管理员口令且没有对应的普通用户，直接重定向到管理页面
      const adminTok = getAdminToken(env);
      if (adminTok && safeEqual(token, adminTok)) {
        const directUser = await getUserDataByToken(env, token);
        if (!directUser) {
          return Response.redirect(`${url.origin}/admin?token=${encodeURIComponent(token)}`, 302);
        }
      }

      const userData = await getUserDataByToken(env, token);
      if (!userData) {
        return unauthorized("bad token", 403);
      }
      if (userData.active === false) {
        return unauthorized("user disabled: contact administrator", 403);
      }

      // 如果客户端请求 JSON（例如在 Loon/Shadowrocket 中误填了 / 而非 /loc.json）
      const acceptHeader = request.headers.get("Accept") || "";
      if (acceptHeader.includes("application/json") && !acceptHeader.includes("text/html")) {
        const loc = userData.location || { ...DEFAULT };
        return jsonResponse({
          ...loc,
          userName: userData.name,
        });
      }

      return new Response(PAGE, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "no-store",
          "Content-Security-Policy": PAGE_CSP,
          ...CORS,
        },
      });
    }

    // 健康检测
    if (url.pathname === "/health") {
      return jsonResponse({
        ok: true,
        kv: !!getKV(env),
        tokenConfigured: !!env.TOKEN,
        adminTokenConfigured: !!getAdminToken(env),
        multiUser: true,
      });
    }

    if (url.pathname === "/favicon.ico") {
      return new Response(null, { status: 204, headers: CORS });
    }

    return textResponse("not found", "text/plain", 404);
  },
};

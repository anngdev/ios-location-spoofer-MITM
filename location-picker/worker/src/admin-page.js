export const ADMIN_PAGE = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
<meta name="referrer" content="strict-origin-when-cross-origin">
<title>Admin Dashboard — iOS Location Spoofer</title>
<style>
  :root {
    --bg-main: #090d16;
    --bg-card: #111827;
    --bg-card-hover: #172033;
    --bg-glass: rgba(17, 24, 39, 0.75);
    --border: rgba(255, 255, 255, 0.08);
    --border-hover: rgba(99, 102, 241, 0.4);
    --text-main: #f8fafc;
    --text-muted: #94a3b8;
    --primary: #6366f1;
    --primary-hover: #4f46e5;
    --accent: #06b6d4;
    --success: #10b981;
    --success-bg: rgba(16, 185, 129, 0.12);
    --danger: #ef4444;
    --danger-bg: rgba(239, 68, 68, 0.12);
    --warning: #f59e0b;
    --font: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, Helvetica, Arial, sans-serif;
    --radius-sm: 8px;
    --radius-md: 12px;
    --radius-lg: 18px;
    --shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5);
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    background-color: var(--bg-main);
    color: var(--text-main);
    font-family: var(--font);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    overflow-x: hidden;
    position: relative;
  }

  /* Ambient glowing backgrounds */
  body::before {
    content: "";
    position: fixed;
    top: -150px;
    left: -100px;
    width: 450px;
    height: 450px;
    background: radial-gradient(circle, rgba(99, 102, 241, 0.15), transparent 70%);
    pointer-events: none;
    z-index: 0;
  }
  body::after {
    content: "";
    position: fixed;
    bottom: -150px;
    right: -100px;
    width: 500px;
    height: 500px;
    background: radial-gradient(circle, rgba(6, 182, 212, 0.12), transparent 70%);
    pointer-events: none;
    z-index: 0;
  }

  .container {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 24px 20px 60px;
    position: relative;
    z-index: 1;
  }

  /* Navigation Header */
  header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 24px;
    border-bottom: 1px solid var(--border);
    margin-bottom: 28px;
    flex-wrap: wrap;
    gap: 16px;
  }
  .brand {
    display: flex;
    align-items: center;
    gap: 14px;
  }
  .brand-logo {
    width: 44px;
    height: 44px;
    border-radius: var(--radius-md);
    background: linear-gradient(135deg, #6366f1, #06b6d4);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 0 20px rgba(99, 102, 241, 0.4);
    flex-shrink: 0;
  }
  .brand-logo svg {
    width: 24px;
    height: 24px;
    fill: none;
    stroke: #fff;
    stroke-width: 2.2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  .brand-text h1 {
    font-size: 20px;
    font-weight: 700;
    letter-spacing: -0.02em;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .brand-badge {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    padding: 2px 8px;
    border-radius: 20px;
    background: rgba(99, 102, 241, 0.2);
    color: #a5b4fc;
    border: 1px solid rgba(99, 102, 241, 0.4);
  }
  .brand-subtitle {
    font-size: 13px;
    color: var(--text-muted);
    margin-top: 2px;
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  /* Stats Grid */
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 16px;
    margin-bottom: 28px;
  }
  .stat-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    padding: 20px;
    position: relative;
    overflow: hidden;
    transition: transform 0.2s, border-color 0.2s;
  }
  .stat-card:hover {
    transform: translateY(-2px);
    border-color: var(--border-hover);
  }
  .stat-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }
  .stat-title {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }
  .stat-icon {
    width: 32px;
    height: 32px;
    border-radius: var(--radius-sm);
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.05);
  }
  .stat-icon svg {
    width: 18px;
    height: 18px;
    stroke: var(--text-muted);
    stroke-width: 2;
    fill: none;
  }
  .stat-value {
    font-size: 32px;
    font-weight: 700;
    letter-spacing: -0.03em;
    color: #fff;
  }
  .stat-desc {
    font-size: 12px;
    color: var(--text-muted);
    margin-top: 4px;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .stat-pill {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    display: inline-block;
  }
  .stat-pill.active { background: var(--success); box-shadow: 0 0 8px var(--success); }

  /* Toolbar */
  .toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    margin-bottom: 20px;
    flex-wrap: wrap;
  }
  .search-wrap {
    flex: 1;
    min-width: 260px;
    position: relative;
  }
  .search-icon {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    width: 18px;
    height: 18px;
    stroke: var(--text-muted);
    stroke-width: 2;
    fill: none;
    pointer-events: none;
  }
  .search-input {
    width: 100%;
    height: 44px;
    padding: 0 16px 0 42px;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    color: var(--text-main);
    font-size: 14px;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .search-input:focus {
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
  }
  .filter-select {
    height: 44px;
    padding: 0 36px 0 14px;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    color: var(--text-main);
    font-size: 14px;
    outline: none;
    cursor: pointer;
    appearance: none;
    background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
    background-repeat: no-repeat;
    background-position: right 12px center;
    background-size: 16px;
  }

  /* Buttons */
  .btn {
    height: 44px;
    padding: 0 18px;
    border-radius: var(--radius-md);
    font-size: 14px;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    border: 1px solid transparent;
    cursor: pointer;
    transition: all 0.2s;
    text-decoration: none;
    color: #fff;
    white-space: nowrap;
  }
  .btn svg {
    width: 18px;
    height: 18px;
    stroke-width: 2;
    stroke: currentColor;
    fill: none;
  }
  .btn-primary {
    background: linear-gradient(135deg, var(--primary), var(--accent));
    box-shadow: 0 4px 15px rgba(99, 102, 241, 0.35);
  }
  .btn-primary:hover {
    background: linear-gradient(135deg, var(--primary-hover), #0891b2);
    box-shadow: 0 6px 20px rgba(99, 102, 241, 0.5);
    transform: translateY(-1px);
  }
  .btn-secondary {
    background: var(--bg-card);
    border-color: var(--border);
    color: var(--text-main);
  }
  .btn-secondary:hover {
    background: var(--bg-card-hover);
    border-color: var(--border-hover);
  }
  .btn-sm {
    height: 34px;
    padding: 0 12px;
    font-size: 13px;
    border-radius: var(--radius-sm);
  }
  .btn-danger {
    background: var(--danger-bg);
    color: var(--danger);
    border-color: rgba(239, 68, 68, 0.3);
  }
  .btn-danger:hover {
    background: var(--danger);
    color: #fff;
  }

  /* User List Grid */
  .users-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
    gap: 18px;
  }
  .user-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 22px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    position: relative;
    transition: all 0.25s ease;
  }
  .user-card:hover {
    border-color: var(--border-hover);
    box-shadow: var(--shadow);
    transform: translateY(-2px);
  }
  .user-card.disabled-user {
    opacity: 0.65;
    border-style: dashed;
  }

  .user-card-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
  }
  .user-identity {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
  }
  .user-avatar {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    font-weight: 700;
    color: #fff;
    flex-shrink: 0;
    text-transform: uppercase;
    box-shadow: 0 4px 10px rgba(0,0,0,0.3);
  }
  .user-info {
    min-width: 0;
  }
  .user-name {
    font-size: 16px;
    font-weight: 700;
    color: #fff;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .user-note {
    font-size: 13px;
    color: var(--text-muted);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-top: 2px;
  }

  .status-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    flex-shrink: 0;
  }
  .status-badge.active {
    background: var(--success-bg);
    color: #34d399;
    border: 1px solid rgba(16, 185, 129, 0.3);
  }
  .status-badge.disabled {
    background: rgba(148, 163, 184, 0.12);
    color: #94a3b8;
    border: 1px solid rgba(148, 163, 184, 0.25);
  }

  /* Token Row inside Card */
  .token-box {
    background: rgba(0, 0, 0, 0.25);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: var(--radius-sm);
    padding: 8px 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }
  .token-label {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    color: var(--text-muted);
  }
  .token-value {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 13px;
    color: #cbd5e1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex: 1;
    text-align: right;
  }
  .token-actions {
    display: flex;
    gap: 4px;
    flex-shrink: 0;
  }
  .icon-btn {
    width: 28px;
    height: 28px;
    border-radius: 6px;
    border: 0;
    background: transparent;
    color: var(--text-muted);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s;
  }
  .icon-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
  }
  .icon-btn svg {
    width: 15px;
    height: 15px;
    stroke: currentColor;
    stroke-width: 2;
    fill: none;
  }

  /* Location Info in Card */
  .loc-panel {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 10px 14px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .loc-status-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 12px;
  }
  .loc-tag {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-weight: 600;
  }
  .loc-coords {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 13px;
    font-weight: 600;
    color: #38bdf8;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .loc-coords svg {
    width: 14px;
    height: 14px;
    stroke: #38bdf8;
    stroke-width: 2;
    fill: none;
  }
  .loc-metrics {
    display: flex;
    gap: 12px;
    font-size: 11px;
    color: var(--text-muted);
    margin-top: 2px;
  }

  /* Card Actions footer */
  .card-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: auto;
    padding-top: 10px;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
    flex-wrap: wrap;
  }

  /* Empty State */
  .empty-state {
    grid-column: 1 / -1;
    text-align: center;
    padding: 60px 20px;
    background: var(--bg-card);
    border: 1px dashed var(--border);
    border-radius: var(--radius-lg);
  }
  .empty-icon {
    width: 56px;
    height: 56px;
    margin: 0 auto 16px;
    border-radius: 50%;
    background: rgba(99, 102, 241, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .empty-icon svg {
    width: 28px;
    height: 28px;
    stroke: var(--primary);
    stroke-width: 2;
    fill: none;
  }
  .empty-title {
    font-size: 18px;
    font-weight: 700;
    margin-bottom: 6px;
  }
  .empty-desc {
    color: var(--text-muted);
    font-size: 14px;
    max-width: 400px;
    margin: 0 auto 20px;
  }

  /* Modal System */
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.75);
    backdrop-filter: blur(6px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 16px;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.2s ease;
  }
  .modal-overlay.show {
    opacity: 1;
    pointer-events: auto;
  }
  .modal {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    width: 100%;
    max-width: 520px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: var(--shadow);
    transform: scale(0.95) translateY(10px);
    transition: transform 0.2s ease;
    display: flex;
    flex-direction: column;
  }
  .modal-overlay.show .modal {
    transform: scale(1) translateY(0);
  }
  .modal-head {
    padding: 20px 24px;
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .modal-title {
    font-size: 18px;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .modal-close {
    background: transparent;
    border: 0;
    color: var(--text-muted);
    cursor: pointer;
    width: 32px;
    height: 32px;
    border-radius: var(--radius-sm);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .modal-close:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
  }
  .modal-close svg {
    width: 18px;
    height: 18px;
    stroke: currentColor;
    stroke-width: 2;
    fill: none;
  }
  .modal-body {
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .modal-foot {
    padding: 18px 24px;
    border-top: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 10px;
    background: rgba(0, 0, 0, 0.15);
  }

  /* Form Controls */
  .form-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .form-label {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-muted);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .form-input, .form-textarea {
    width: 100%;
    padding: 10px 14px;
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    color: #fff;
    font-size: 14px;
    font-family: inherit;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .form-input:focus, .form-textarea:focus {
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
  }
  .input-with-action {
    display: flex;
    gap: 8px;
  }

  /* Preset Pills */
  .preset-row {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 4px;
  }
  .preset-pill {
    padding: 6px 12px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid var(--border);
    border-radius: 20px;
    font-size: 12px;
    color: #cbd5e1;
    cursor: pointer;
    transition: all 0.15s;
  }
  .preset-pill:hover {
    background: rgba(99, 102, 241, 0.2);
    border-color: var(--primary);
    color: #fff;
  }

  /* Code Snippet Block */
  .code-block {
    background: #090d16;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 12px 14px;
    position: relative;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 12px;
    color: #e2e8f0;
    word-break: break-all;
    line-height: 1.5;
  }
  .copy-code-btn {
    position: absolute;
    top: 8px;
    right: 8px;
    padding: 4px 8px;
    font-size: 11px;
    background: rgba(255, 255, 255, 0.1);
    border: 0;
    border-radius: 4px;
    color: #cbd5e1;
    cursor: pointer;
  }
  .copy-code-btn:hover {
    background: var(--primary);
    color: #fff;
  }

  /* Toast Notification */
  .toast {
    position: fixed;
    bottom: 24px;
    right: 24px;
    background: #1e293b;
    border: 1px solid rgba(255, 255, 255, 0.15);
    box-shadow: 0 10px 25px rgba(0,0,0,0.5);
    color: #fff;
    padding: 12px 20px;
    border-radius: var(--radius-md);
    font-size: 14px;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 10px;
    z-index: 2000;
    transform: translateY(100px);
    opacity: 0;
    transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .toast.show {
    transform: translateY(0);
    opacity: 1;
  }

  /* Login Card View */
  .login-view {
    display: none;
    min-height: 80vh;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }
  .login-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow);
    width: 100%;
    max-width: 420px;
    padding: 36px 30px;
    text-align: center;
    position: relative;
    overflow: hidden;
  }
  .login-card::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, var(--primary), var(--accent));
  }
  .login-icon {
    width: 60px;
    height: 60px;
    border-radius: var(--radius-md);
    background: linear-gradient(135deg, #6366f1, #06b6d4);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 20px;
    box-shadow: 0 0 25px rgba(99, 102, 241, 0.45);
  }
  .login-icon svg {
    width: 32px;
    height: 32px;
    stroke: #fff;
    stroke-width: 2.2;
    fill: none;
  }
  .login-title {
    font-size: 22px;
    font-weight: 700;
    margin-bottom: 8px;
  }
  .login-subtitle {
    font-size: 14px;
    color: var(--text-muted);
    margin-bottom: 26px;
    line-height: 1.4;
  }

  /* Responsive tweaks */
  @media (max-width: 640px) {
    .container { padding: 16px 12px 40px; }
    .brand-text h1 { font-size: 18px; }
    .stats-grid { grid-template-columns: 1fr; }
    .users-grid { grid-template-columns: 1fr; }
    .toolbar { flex-direction: column; align-items: stretch; }
    .header-actions { width: 100%; justify-content: flex-end; }
  }
</style>
</head>
<body>

<div class="container" id="appContainer">
  <!-- Top Navigation Header -->
  <header>
    <div class="brand">
      <div class="brand-logo">
        <svg viewBox="0 0 24 24"><path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"></path><circle cx="12" cy="10" r="3"></circle></svg>
      </div>
      <div class="brand-text">
        <h1>Location Spoofer <span class="brand-badge">Admin</span></h1>
        <div class="brand-subtitle" id="serverStatusText">Multi-user Management Console</div>
      </div>
    </div>
    <div class="header-actions">
      <button class="btn btn-secondary btn-sm" id="refreshBtn" title="Refresh Users">
        <svg viewBox="0 0 24 24"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path></svg>
        Refresh
      </button>
      <button class="btn btn-primary" id="openAddUserBtn">
        <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        Add User
      </button>
      <button class="btn btn-secondary btn-sm" id="logoutBtn" title="Sign Out">
        <svg viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
      </button>
    </div>
  </header>

  <!-- Metric Stat Cards -->
  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-top">
        <div class="stat-title">Total Users</div>
        <div class="stat-icon">
          <svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
        </div>
      </div>
      <div class="stat-value" id="statTotalUsers">0</div>
      <div class="stat-desc">Registered proxy devices</div>
    </div>

    <div class="stat-card">
      <div class="stat-top">
        <div class="stat-title">Active Tokens</div>
        <div class="stat-icon">
          <svg viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
        </div>
      </div>
      <div class="stat-value" id="statActiveUsers">0</div>
      <div class="stat-desc"><span class="stat-pill active"></span> Allowed to fetch & spoof</div>
    </div>

    <div class="stat-card">
      <div class="stat-top">
        <div class="stat-title">Spoofing Active</div>
        <div class="stat-icon">
          <svg viewBox="0 0 24 24"><polygon points="3 11 22 2 13 21 11 13 3 11"></polygon></svg>
        </div>
      </div>
      <div class="stat-value" id="statSpoofingActive">0</div>
      <div class="stat-desc">Locations currently intercepted</div>
    </div>

    <div class="stat-card">
      <div class="stat-top">
        <div class="stat-title">Passthrough Mode</div>
        <div class="stat-icon">
          <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 14 14"></polyline></svg>
        </div>
      </div>
      <div class="stat-value" id="statPassthrough">0</div>
      <div class="stat-desc">Restoring real GPS location</div>
    </div>
  </div>

  <!-- Filter & Search Toolbar -->
  <div class="toolbar">
    <div class="search-wrap">
      <svg class="search-icon" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
      <input type="text" class="search-input" id="userSearchInput" placeholder="Filter by user name, token, note, or coordinates...">
    </div>
    <select class="filter-select" id="statusFilterSelect">
      <option value="all">All Users</option>
      <option value="active">Active Only</option>
      <option value="disabled">Disabled Only</option>
      <option value="spoofing">Spoofing Enabled</option>
    </select>
  </div>

  <!-- Users Grid Section -->
  <div class="users-grid" id="usersListContainer">
    <!-- Populated by JavaScript -->
  </div>
</div>

<!-- Login View (When unauthenticated) -->
<div class="login-view" id="loginView">
  <div class="login-card">
    <div class="login-icon">
      <svg viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
    </div>
    <h2 class="login-title">Admin Authentication</h2>
    <p class="login-subtitle">Enter your Admin Secret Token to manage users and proxy endpoints.</p>
    <form id="loginForm">
      <div class="form-group" style="text-align: left; margin-bottom: 20px;">
        <label class="form-label" for="adminTokenInput">Admin Secret Token</label>
        <input type="password" class="form-input" id="adminTokenInput" placeholder="Paste your ADMIN_TOKEN here..." required autocomplete="current-password">
      </div>
      <button type="submit" class="btn btn-primary" style="width: 100%; height: 46px;" id="loginSubmitBtn">
        Authenticate & Enter
      </button>
    </form>
  </div>
</div>

<!-- Modal: Add User -->
<div class="modal-overlay" id="addUserModal">
  <div class="modal">
    <div class="modal-head">
      <div class="modal-title">
        <svg viewBox="0 0 24 24" style="width:20px;height:20px;stroke:var(--primary);stroke-width:2;fill:none;"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
        Create New User Token
      </div>
      <button class="modal-close" data-close="addUserModal">&times;</button>
    </div>
    <form id="addUserForm">
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label">User / Device Name *</label>
          <input type="text" class="form-input" id="newUserName" placeholder="e.g. Alice — iPhone 15 Pro" required>
        </div>
        <div class="form-group">
          <label class="form-label">Description / Note</label>
          <input type="text" class="form-input" id="newUserNote" placeholder="e.g. Personal device, iOS 18">
        </div>
        <div class="form-group">
          <label class="form-label">
            Access Token
            <span style="font-weight: normal; font-size: 11px;">(Auto-generated secure hex)</span>
          </label>
          <div class="input-with-action">
            <input type="text" class="form-input" id="newUserToken" placeholder="Leave blank to auto-generate..." style="font-family: monospace; font-size: 12px;">
            <button type="button" class="btn btn-secondary btn-sm" id="genRandomTokenBtn" title="Generate Random Hex">
              <svg viewBox="0 0 24 24"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path></svg>
              Random
            </button>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Initial Location Preset</label>
          <div class="preset-row">
            <button type="button" class="preset-pill" data-lat="37.3349" data-lng="-122.00902" data-alt="530">Apple Park (CA)</button>
            <button type="button" class="preset-pill" data-lat="35.68124" data-lng="139.76712" data-alt="35">Tokyo Station</button>
            <button type="button" class="preset-pill" data-lat="40.75889" data-lng="-73.98513" data-alt="45">Times Square (NYC)</button>
            <button type="button" class="preset-pill" data-lat="51.50073" data-lng="-0.12462" data-alt="15">Big Ben (London)</button>
            <button type="button" class="preset-pill" data-lat="21.02851" data-lng="105.85444" data-alt="20">Hanoi Old Quarter</button>
          </div>
        </div>
      </div>
      <div class="modal-foot">
        <button type="button" class="btn btn-secondary" data-close="addUserModal">Cancel</button>
        <button type="submit" class="btn btn-primary" id="saveNewUserBtn">Create User</button>
      </div>
    </form>
  </div>
</div>

<!-- Modal: Edit User -->
<div class="modal-overlay" id="editUserModal">
  <div class="modal">
    <div class="modal-head">
      <div class="modal-title">Edit User Details</div>
      <button class="modal-close" data-close="editUserModal">&times;</button>
    </div>
    <form id="editUserForm">
      <input type="hidden" id="editUserId">
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label">User / Device Name</label>
          <input type="text" class="form-input" id="editUserName" required>
        </div>
        <div class="form-group">
          <label class="form-label">Description / Note</label>
          <input type="text" class="form-input" id="editUserNote">
        </div>
        <div class="form-group">
          <label class="form-label">Account Status</label>
          <select class="form-input" id="editUserActive">
            <option value="true">Active (Allowed to spoof)</option>
            <option value="false">Disabled (Blocked / 403)</option>
          </select>
        </div>
      </div>
      <div class="modal-foot">
        <button type="button" class="btn btn-secondary" data-close="editUserModal">Cancel</button>
        <button type="submit" class="btn btn-primary">Save Changes</button>
      </div>
    </form>
  </div>
</div>

<!-- Modal: Setup URLs & Integration Snippets -->
<div class="modal-overlay" id="configModal">
  <div class="modal" style="max-width: 650px;">
    <div class="modal-head">
      <div class="modal-title" id="configModalTitle">User Proxy Setup & URLs</div>
      <button class="modal-close" data-close="configModal">&times;</button>
    </div>
    <div class="modal-body" style="gap: 20px;">
      <!-- Web Picker URL -->
      <div class="form-group">
        <label class="form-label">
          Map Picker Web Page URL
          <span style="font-weight: normal; font-size: 11px;">(Open in Safari to pick & save location)</span>
        </label>
        <div class="code-block" id="cfgMapUrl">
          Loading...
          <button class="copy-code-btn" data-copy-target="cfgMapUrl">Copy</button>
        </div>
      </div>

      <!-- Config JSON URL -->
      <div class="form-group">
        <label class="form-label">
          Proxy Config URL (loc.json)
          <span style="font-weight: normal; font-size: 11px;">(Read by Shadowrocket / Loon / Surge)</span>
        </label>
        <div class="code-block" id="cfgJsonUrl">
          Loading...
          <button class="copy-code-btn" data-copy-target="cfgJsonUrl">Copy</button>
        </div>
      </div>

      <!-- Loon & Shadowrocket Argument Snippet -->
      <div class="form-group">
        <label class="form-label">
          Shadowrocket / Loon Module Argument
          <span style="font-weight: normal; font-size: 11px;">(Append to module argument=)</span>
        </label>
        <div class="code-block" id="cfgArgSnippet">
          Loading...
          <button class="copy-code-btn" data-copy-target="cfgArgSnippet">Copy</button>
        </div>
      </div>
    </div>
    <div class="modal-foot">
      <a href="#" target="_blank" class="btn btn-secondary btn-sm" id="cfgOpenMapBtn">Open Map Picker</a>
      <button type="button" class="btn btn-primary btn-sm" data-close="configModal">Done</button>
    </div>
  </div>
</div>

<!-- Modal: Delete Confirmation -->
<div class="modal-overlay" id="deleteModal">
  <div class="modal" style="max-width: 440px;">
    <div class="modal-head">
      <div class="modal-title" style="color: var(--danger);">Confirm Delete User</div>
      <button class="modal-close" data-close="deleteModal">&times;</button>
    </div>
    <div class="modal-body">
      <p style="font-size: 14px; line-height: 1.5; color: #cbd5e1;">
        Are you sure you want to delete user <strong id="deleteUserNameText" style="color:#fff;"></strong>?
      </p>
      <p style="font-size: 13px; color: var(--text-muted); line-height: 1.4;">
        This action will permanently revoke their access token and erase their saved location coordinates.
      </p>
    </div>
    <div class="modal-foot">
      <button type="button" class="btn btn-secondary" data-close="deleteModal">Cancel</button>
      <button type="button" class="btn btn-danger" id="confirmDeleteBtn">Delete User</button>
    </div>
  </div>
</div>

<!-- Floating Toast -->
<div class="toast" id="toast"></div>

<script>
(function() {
  var ADMIN_TOKEN_KEY = "lp_admin_token";
  var currentAdminToken = "";
  var allUsers = [];
  var userToDelete = null;

  function $(id) { return document.getElementById(id); }

  function showToast(msg) {
    var t = $("toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(t._tm);
    t._tm = setTimeout(function() {
      t.classList.remove("show");
    }, 2800);
  }

  function getAvatarColor(str) {
    var colors = [
      "linear-gradient(135deg, #6366f1, #06b6d4)",
      "linear-gradient(135deg, #ec4899, #8b5cf6)",
      "linear-gradient(135deg, #10b981, #059669)",
      "linear-gradient(135deg, #f59e0b, #d97706)",
      "linear-gradient(135deg, #3b82f6, #1d4ed8)",
      "linear-gradient(135deg, #84cc16, #10b981)"
    ];
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }

  function getInitials(name) {
    if (!name) return "U";
    var parts = name.trim().split(/\\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  }

  function timeAgo(ts) {
    if (!ts) return "Never";
    var diff = Math.floor((Date.now() - Number(ts)) / 1000);
    if (diff < 60) return "Just now";
    if (diff < 3600) return Math.floor(diff / 60) + "m ago";
    if (diff < 86400) return Math.floor(diff / 3600) + "h ago";
    return Math.floor(diff / 86400) + "d ago";
  }

  function generateHexToken(len) {
    var bytes = new Uint8Array(len || 24);
    if (window.crypto && window.crypto.getRandomValues) {
      window.crypto.getRandomValues(bytes);
    } else {
      for (var i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
    }
    return Array.from(bytes).map(function(b) { return b.toString(16).padStart(2, "0"); }).join("");
  }

  function copyText(text, successMsg) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function() {
        showToast(successMsg || "Copied to clipboard!");
      }).catch(function() {
        fallbackCopy(text, successMsg);
      });
    } else {
      fallbackCopy(text, successMsg);
    }
  }

  function fallbackCopy(text, successMsg) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
      showToast(successMsg || "Copied to clipboard!");
    } catch(e) {
      showToast("Failed to copy. Please copy manually.");
    }
    document.body.removeChild(ta);
  }

  // API Call helper
  function adminFetch(path, options) {
    options = options || {};
    options.headers = options.headers || {};
    options.headers["X-Admin-Token"] = currentAdminToken;
    if (options.body && typeof options.body === "object") {
      options.headers["Content-Type"] = "application/json";
      options.body = JSON.stringify(options.body);
    }
    return fetch(path, options).then(function(res) {
      if (res.status === 401 || res.status === 403) {
        showLoginView();
        throw new Error("Authentication failed");
      }
      return res.json();
    });
  }

  function showLoginView() {
    $("appContainer").style.display = "none";
    $("loginView").style.display = "flex";
  }

  function showAppView() {
    $("loginView").style.display = "none";
    $("appContainer").style.display = "block";
  }

  function initAuth() {
    // Check url search params for ?token= or ?admin_token=
    var params = new URLSearchParams(window.location.search);
    var urlToken = params.get("token") || params.get("admin_token");
    if (urlToken) {
      currentAdminToken = urlToken;
      try { localStorage.setItem(ADMIN_TOKEN_KEY, urlToken); } catch(e){}
    } else {
      try { currentAdminToken = localStorage.getItem(ADMIN_TOKEN_KEY) || ""; } catch(e){}
    }

    if (!currentAdminToken) {
      showLoginView();
      return;
    }

    // Verify token with backend
    adminFetch("/api/admin/info").then(function(data) {
      if (data && data.ok) {
        showAppView();
        loadUsers();
      } else {
        showLoginView();
      }
    }).catch(function() {
      showLoginView();
    });
  }

  // Load and render users
  function loadUsers() {
    adminFetch("/api/admin/users").then(function(data) {
      if (data && data.ok) {
        allUsers = data.users || [];
        updateStats();
        renderUsersList();
      }
    }).catch(function(err) {
      showToast("Error loading users: " + err.message);
    });
  }

  function updateStats() {
    var total = allUsers.length;
    var active = 0;
    var spoofing = 0;
    var passthrough = 0;

    allUsers.forEach(function(u) {
      if (u.active !== false) active++;
      var loc = u.location || {};
      if (loc.enabled) spoofing++;
      else passthrough++;
    });

    $("statTotalUsers").textContent = total;
    $("statActiveUsers").textContent = active;
    $("statSpoofingActive").textContent = spoofing;
    $("statPassthrough").textContent = passthrough;
  }

  function renderUsersList() {
    var container = $("usersListContainer");
    container.innerHTML = "";

    var q = ($("userSearchInput").value || "").trim().toLowerCase();
    var filter = $("statusFilterSelect").value;

    var filtered = allUsers.filter(function(u) {
      if (filter === "active" && u.active === false) return false;
      if (filter === "disabled" && u.active !== false) return false;
      if (filter === "spoofing" && (!u.location || !u.location.enabled)) return false;

      if (!q) return true;
      var nameMatch = (u.name || "").toLowerCase().indexOf(q) !== -1;
      var noteMatch = (u.note || "").toLowerCase().indexOf(q) !== -1;
      var tokenMatch = (u.token || "").toLowerCase().indexOf(q) !== -1;
      var coordMatch = u.location ? (u.location.latitude + "," + u.location.longitude).indexOf(q) !== -1 : false;
      return nameMatch || noteMatch || tokenMatch || coordMatch;
    });

    if (filtered.length === 0) {
      container.innerHTML = [
        '<div class="empty-state">',
        '  <div class="empty-icon"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="8" y1="12" x2="16" y2="12"></line></svg></div>',
        '  <h3 class="empty-title">No Users Found</h3>',
        '  <p class="empty-desc">No proxy users match the current filter. Create a new user token to get started!</p>',
        '  <button class="btn btn-primary" onclick="document.getElementById(\\'openAddUserBtn\\').click()">Create First User</button>',
        '</div>'
      ].join("");
      return;
    }

    filtered.forEach(function(u) {
      var card = document.createElement("div");
      card.className = "user-card" + (u.active === false ? " disabled-user" : "");

      var loc = u.location || { enabled: true, latitude: 37.3349, longitude: -122.00902 };
      var isSpoofing = loc.enabled !== false;
      var lastUpdated = loc.updatedAt || u.updatedAt || u.createdAt;

      var tokenShort = u.token ? (u.token.slice(0, 6) + "••••••••" + u.token.slice(-6)) : "";

      card.innerHTML = [
        '<div class="user-card-head">',
        '  <div class="user-identity">',
        '    <div class="user-avatar" style="background: ' + getAvatarColor(u.name || u.id) + '">' + getInitials(u.name) + '</div>',
        '    <div class="user-info">',
        '      <div class="user-name" title="' + escapeHtml(u.name) + '">' + escapeHtml(u.name) + '</div>',
        '      <div class="user-note" title="' + escapeHtml(u.note || "No notes") + '">' + escapeHtml(u.note || "No device notes") + '</div>',
        '    </div>',
        '  </div>',
        '  <div class="status-badge ' + (u.active !== false ? 'active' : 'disabled') + '">',
        '    ' + (u.active !== false ? '● Active' : '✕ Disabled'),
        '  </div>',
        '</div>',

        '<div class="token-box">',
        '  <div class="token-label">Token:</div>',
        '  <div class="token-value" id="tokval_' + u.id + '" data-full="' + u.token + '" data-short="' + tokenShort + '">' + tokenShort + '</div>',
        '  <div class="token-actions">',
        '    <button class="icon-btn" title="Toggle Show/Hide" data-action="toggle-token" data-id="' + u.id + '">',
        '      <svg viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>',
        '    </button>',
        '    <button class="icon-btn" title="Copy Token" data-action="copy-token" data-token="' + u.token + '">',
        '      <svg viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>',
        '    </button>',
        '  </div>',
        '</div>',

        '<div class="loc-panel">',
        '  <div class="loc-status-row">',
        '    <span class="loc-tag" style="color: ' + (isSpoofing ? 'var(--success)' : 'var(--text-muted)') + '">',
        '      <span class="stat-pill ' + (isSpoofing ? 'active' : '') + '"></span>',
        '      ' + (isSpoofing ? 'Spoofing Enabled' : 'Real GPS Passthrough'),
        '    </span>',
        '    <span style="font-size: 11px; color: var(--text-muted);">' + timeAgo(lastUpdated) + '</span>',
        '  </div>',
        '  <div class="loc-coords" title="Click to copy coordinates" data-action="copy-coords" data-coords="' + Number(loc.latitude).toFixed(5) + ',' + Number(loc.longitude).toFixed(5) + '" style="cursor: pointer;">',
        '    <svg viewBox="0 0 24 24"><path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"></path><circle cx="12" cy="10" r="3"></circle></svg>',
        '    ' + Number(loc.latitude).toFixed(5) + ', ' + Number(loc.longitude).toFixed(5),
        '  </div>',
        '  <div class="loc-metrics">',
        '    <span>Alt: ' + (loc.altitude != null ? loc.altitude + 'm' : 'Auto') + '</span>',
        '    <span>H-Acc: ' + (loc.horizontalAccuracy || 39) + 'm</span>',
        '  </div>',
        '</div>',

        '<div class="card-actions">',
        '  <a href="/?token=' + encodeURIComponent(u.token) + '" target="_blank" class="btn btn-secondary btn-sm" title="Open Map Picker in New Tab">',
        '    <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><polygon points="12 8 8 12 12 16 12 8"></polygon></svg>',
        '    Map',
        '  </a>',
        '  <button class="btn btn-secondary btn-sm" data-action="show-config" data-id="' + u.id + '" title="View Integration URLs">',
        '    <svg viewBox="0 0 24 24"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>',
        '    Config',
        '  </button>',
        '  <button class="btn btn-secondary btn-sm" data-action="edit-user" data-id="' + u.id + '" title="Edit Name & Status">',
        '    <svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>',
        '    Edit',
        '  </button>',
        '  <button class="btn btn-secondary btn-sm" data-action="reset-token" data-id="' + u.id + '" title="Regenerate Token">',
        '    <svg viewBox="0 0 24 24"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path></svg>',
        '  </button>',
        '  <button class="btn btn-danger btn-sm" data-action="delete-user" data-id="' + u.id + '" title="Delete User">',
        '    <svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>',
        '  </button>',
        '</div>'
      ].join("");

      container.appendChild(card);
    });
  }

  function escapeHtml(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // Delegated events for cards
  $("usersListContainer").addEventListener("click", function(e) {
    var btn = e.target.closest("[data-action]");
    if (!btn) return;
    var action = btn.dataset.action;

    if (action === "toggle-token") {
      var id = btn.dataset.id;
      var el = $("tokval_" + id);
      if (el) {
        if (el.textContent === el.dataset.short) {
          el.textContent = el.dataset.full;
        } else {
          el.textContent = el.dataset.short;
        }
      }
    } else if (action === "copy-token") {
      copyText(btn.dataset.token, "Token copied!");
    } else if (action === "copy-coords") {
      copyText(btn.dataset.coords, "Coordinates copied: " + btn.dataset.coords);
    } else if (action === "show-config") {
      var u = allUsers.find(function(x) { return x.id === btn.dataset.id; });
      if (u) openConfigModal(u);
    } else if (action === "edit-user") {
      var u = allUsers.find(function(x) { return x.id === btn.dataset.id; });
      if (u) openEditModal(u);
    } else if (action === "reset-token") {
      var u = allUsers.find(function(x) { return x.id === btn.dataset.id; });
      if (u) {
        if (confirm("Regenerate token for " + u.name + "? Existing proxy connections using the old token will be disconnected.")) {
          adminFetch("/api/admin/users/reset-token", {
            method: "POST",
            body: { id: u.id }
          }).then(function(res) {
            if (res.ok) {
              showToast("New token generated for " + u.name);
              loadUsers();
            }
          });
        }
      }
    } else if (action === "delete-user") {
      var u = allUsers.find(function(x) { return x.id === btn.dataset.id; });
      if (u) {
        userToDelete = u;
        $("deleteUserNameText").textContent = u.name;
        openModal("deleteModal");
      }
    }
  });

  // Modal helpers
  function openModal(id) {
    var m = $(id);
    if (m) m.classList.add("show");
  }
  function closeModal(id) {
    var m = $(id);
    if (m) m.classList.remove("show");
  }

  document.querySelectorAll("[data-close]").forEach(function(el) {
    el.addEventListener("click", function() {
      closeModal(el.dataset.close);
    });
  });

  // Config Modal Setup
  function openConfigModal(u) {
    var host = window.location.origin;
    var mapUrl = host + "/?token=" + encodeURIComponent(u.token);
    var jsonUrl = host + "/loc.json?token=" + encodeURIComponent(u.token);
    var argSnippet = "&configUrl=" + jsonUrl;

    $("configModalTitle").textContent = "Integration URLs — " + u.name;
    $("cfgMapUrl").firstChild.textContent = mapUrl + "\\n";
    $("cfgJsonUrl").firstChild.textContent = jsonUrl + "\\n";
    $("cfgArgSnippet").firstChild.textContent = argSnippet + "\\n";
    $("cfgOpenMapBtn").href = mapUrl;

    openModal("configModal");
  }

  // Copy code blocks
  document.querySelectorAll(".copy-code-btn").forEach(function(btn) {
    btn.addEventListener("click", function() {
      var targetId = btn.dataset.copyTarget;
      var el = $(targetId);
      if (el) {
        var text = el.firstChild.textContent.trim();
        copyText(text, "Copied snippet!");
      }
    });
  });

  // Edit Modal Setup
  function openEditModal(u) {
    $("editUserId").value = u.id;
    $("editUserName").value = u.name || "";
    $("editUserNote").value = u.note || "";
    $("editUserActive").value = u.active !== false ? "true" : "false";
    openModal("editUserModal");
  }

  $("editUserForm").addEventListener("submit", function(e) {
    e.preventDefault();
    var id = $("editUserId").value;
    var name = $("editUserName").value.trim();
    var note = $("editUserNote").value.trim();
    var active = $("editUserActive").value === "true";

    adminFetch("/api/admin/users/update", {
      method: "POST",
      body: { id: id, name: name, note: note, active: active }
    }).then(function(res) {
      if (res.ok) {
        showToast("User updated successfully");
        closeModal("editUserModal");
        loadUsers();
      }
    });
  });

  // Add User Setup
  $("openAddUserBtn").addEventListener("click", function() {
    $("addUserForm").reset();
    $("newUserToken").value = generateHexToken(24);
    openModal("addUserModal");
  });

  $("genRandomTokenBtn").addEventListener("click", function() {
    $("newUserToken").value = generateHexToken(24);
  });

  // Location presets
  var selectedPreset = null;
  document.querySelectorAll(".preset-pill").forEach(function(pill) {
    pill.addEventListener("click", function() {
      document.querySelectorAll(".preset-pill").forEach(function(p) { p.style.borderColor = ""; });
      pill.style.borderColor = "var(--primary)";
      selectedPreset = {
        lat: Number(pill.dataset.lat),
        lng: Number(pill.dataset.lng),
        altitude: Number(pill.dataset.alt || 50)
      };
    });
  });

  $("addUserForm").addEventListener("submit", function(e) {
    e.preventDefault();
    var name = $("newUserName").value.trim();
    var note = $("newUserNote").value.trim();
    var token = $("newUserToken").value.trim() || generateHexToken(24);

    var payload = {
      name: name,
      note: note,
      token: token
    };

    if (selectedPreset) {
      payload.location = {
        enabled: true,
        latitude: selectedPreset.lat,
        longitude: selectedPreset.lng,
        altitude: selectedPreset.altitude,
        horizontalAccuracy: 39,
        verticalAccuracy: 1000
      };
    }

    adminFetch("/api/admin/users", {
      method: "POST",
      body: payload
    }).then(function(res) {
      if (res.ok) {
        showToast("User " + name + " created!");
        closeModal("addUserModal");
        loadUsers();
      } else {
        showToast(res.error || "Failed to create user");
      }
    });
  });

  // Delete User Confirmation
  $("confirmDeleteBtn").addEventListener("click", function() {
    if (!userToDelete) return;
    adminFetch("/api/admin/users/delete", {
      method: "POST",
      body: { id: userToDelete.id }
    }).then(function(res) {
      if (res.ok) {
        showToast("User deleted");
        closeModal("deleteModal");
        loadUsers();
      }
    });
  });

  // Search & Filter change events
  $("userSearchInput").addEventListener("input", renderUsersList);
  $("statusFilterSelect").addEventListener("change", renderUsersList);
  $("refreshBtn").addEventListener("click", function() {
    loadUsers();
    showToast("Refreshed user list");
  });

  // Login Form
  $("loginForm").addEventListener("submit", function(e) {
    e.preventDefault();
    var t = $("adminTokenInput").value.trim();
    if (!t) return;
    currentAdminToken = t;
    adminFetch("/api/admin/info").then(function(data) {
      if (data && data.ok) {
        try { localStorage.setItem(ADMIN_TOKEN_KEY, t); } catch(e){}
        showAppView();
        loadUsers();
        showToast("Signed in successfully");
      } else {
        showToast("Invalid Admin Token");
      }
    }).catch(function() {
      showToast("Authentication rejected");
    });
  });

  // Logout
  $("logoutBtn").addEventListener("click", function() {
    try { localStorage.removeItem(ADMIN_TOKEN_KEY); } catch(e){}
    currentAdminToken = "";
    showLoginView();
    showToast("Signed out");
  });

  // Boot
  initAuth();
})();
</script>
</body>
</html>`;

type TmpMailCreateResp = {
  code: number;
  address?: string;
  token?: string;
  expire?: number;
  err?: string;
};

type TmpMailItem = {
  id: string;
  from: string;
  subject: string;
  received_at: number;
};

type TmpMailListResp = {
  code: number;
  address?: string;
  expire?: number;
  c0?: number;
  c1?: number;
  messages?: TmpMailItem[];
  err?: string;
};

type TmpMailDetailResp = {
  code: number;
  message?: {
    id: string;
    from: string;
    subject: string;
    body: string;
    html: string;
    received_at: number;
  };
  err?: string;
};

type TmpMailReactivateResp = {
  code: number;
  address?: string;
  token?: string;
  expire?: number;
  err?: string;
};

type TmpMailStatsResp = {
  code: number;
  c0?: number;
  c1?: number;
};

(function tmpMailPage() {
  let token = "";
  let expireAt = 0;
  let pollTimer = 0;
  let countdownTimer = 0;
  /** 通过带 `#token` 的书签/分享链接进入（用于区分是否在首次 inbox 时尝试自动 reactivate） */
  let enteredFromSavedHash = false;
  /** 已为「从 hash 进入且需续期」自动执行过一次 reactivate，避免轮询重复触发 */
  let autoReactivateFromHashDone = false;

  const createBtn = document.getElementById("create-mail-btn") as HTMLButtonElement;
  const reactivateBtn = document.getElementById("reactivate-mail-btn") as HTMLButtonElement;
  const addressEl = document.getElementById("mail-address") as HTMLElement;
  const countdownEl = document.getElementById("mail-countdown") as HTMLElement;
  const statusEl = document.getElementById("mail-status") as HTMLElement;
  const listEl = document.getElementById("mail-list") as HTMLUListElement;

  const detailCard = document.getElementById("mail-detail") as HTMLElement;
  const detailFrom = document.getElementById("detail-from") as HTMLElement;
  const detailSubject = document.getElementById("detail-subject") as HTMLElement;
  const detailTime = document.getElementById("detail-time") as HTMLElement;
  const detailBody = document.getElementById("detail-body") as HTMLElement;
  const detailHtml = document.getElementById("detail-html") as HTMLElement;
  const detailPlaceholder = document.getElementById("mail-detail-placeholder") as HTMLElement | null;
  const statsEl = document.getElementById("tm-stats") as HTMLElement | null;

  createBtn.onclick = createTmpMail;
  reactivateBtn.onclick = reactivateTmpMail;
  restoreFromHash();
  void loadStats();
  updateReactivateButton();

  function setStatus(txt: string) {
    statusEl.innerText = txt;
  }

  function setListEmpty(txt: string) {
    listEl.innerHTML = `<li class="tm-muted">${escapeHtml(txt)}</li>`;
  }

  const MAIL_ADDRESS_PLACEHOLDERS = ["Not created", "Recovered from URL hash (polling only)"];

  /** 若页面上尚未展示真实邮箱（占位文案或不含 @），poll 返回的 address 应写入 */
  function needsAddressFromInboxPoll(): boolean {
    const t = (addressEl.textContent || "").trim();
    if (!t) {
      return true;
    }
    if (MAIL_ADDRESS_PLACEHOLDERS.includes(t)) {
      return true;
    }
    return !t.includes("@");
  }

  function stopPolling() {
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = 0;
    }
    if (countdownTimer) {
      clearInterval(countdownTimer);
      countdownTimer = 0;
    }
  }

  function updateReactivateButton() {
    reactivateBtn.disabled = !token;
  }

  function showDetailEmpty() {
    detailCard.style.display = "none";
    if (detailPlaceholder) {
      detailPlaceholder.style.display = "block";
    }
  }

  function showDetailPanel() {
    detailCard.style.display = "block";
    if (detailPlaceholder) {
      detailPlaceholder.style.display = "none";
    }
  }

  function startCountdown() {
    if (!expireAt) {
      countdownEl.innerText = "00:00:00";
      return;
    }
    if (countdownTimer) {
      clearInterval(countdownTimer);
    }
    const tick = () => {
      const left = expireAt - Math.floor(Date.now() / 1000);
      if (left <= 0) {
        countdownEl.innerText = "00:00:00";
        setStatus("Mailbox expired, polling stopped. You can reactivate to extend.");
        stopPolling();
        return;
      }
      countdownEl.innerText = formatCountdown(left);
    };
    tick();
    countdownTimer = window.setInterval(tick, 1000);
  }

  function formatCountdown(totalSec: number) {
    const hour = Math.floor(totalSec / 3600);
    const min = Math.floor((totalSec % 3600) / 60);
    const sec = totalSec % 60;
    return `${String(hour).padStart(2, "0")}:${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  }

  function startPolling() {
    if (pollTimer) {
      clearInterval(pollTimer);
    }
    pollTimer = window.setInterval(() => {
      void loadInbox();
    }, 8000);
  }

  async function reqJson<T>(url: string, method: "GET" | "POST", body?: string): Promise<T> {
    return new Promise((resolve, reject) => {
      const request = new XMLHttpRequest();
      request.open(method, url);
      request.responseType = "json";
      if (method === "POST") {
        request.setRequestHeader("Content-type", "application/json");
      }
      request.onload = function () {
        if (request.status < 200 || request.status >= 300) {
          reject(new Error(`HTTP ${request.status}`));
          return;
        }
        resolve(request.response as T);
      };
      request.onerror = function () {
        reject(new Error("network error"));
      };
      request.send(body);
    });
  }

  const STATS_PREV_STORAGE_KEY = "tm-mail-stats-prev";

  function hasStatsPair(data: { c0?: unknown; c1?: unknown }): data is { c0: number; c1: number } {
    return typeof data.c0 === "number" && typeof data.c1 === "number";
  }

  /** 仅当本地曾成功保存过上一次 c0/c1 时返回；无缓存或格式无效视为「没有上一次」 */
  function readStatsPrev(): { c0: number; c1: number } | null {
    try {
      const raw = localStorage.getItem(STATS_PREV_STORAGE_KEY);
      if (!raw) {
        return null;
      }
      const parsed = JSON.parse(raw) as { c0?: unknown; c1?: unknown; hasPrev?: unknown };
      if (parsed.hasPrev !== true) {
        return null;
      }
      if (!hasStatsPair(parsed)) {
        return null;
      }
      if (!Number.isFinite(parsed.c0) || !Number.isFinite(parsed.c1)) {
        return null;
      }
      return { c0: parsed.c0, c1: parsed.c1 };
    } catch (_e) {
      return null;
    }
  }

  function writeStatsPrev(c0: number, c1: number) {
    try {
      localStorage.setItem(
        STATS_PREV_STORAGE_KEY,
        JSON.stringify({ c0, c1, hasPrev: true })
      );
    } catch (_e) {
      // ignore quota / private browsing
    }
  }

  async function loadStats() {
    if (!statsEl) {
      return;
    }
    try {
      const data = await reqJson<TmpMailStatsResp>("/tmpmail/stats", "GET");
      if (typeof data.code === "number" && data.code !== 0) {
        return;
      }
      if (!hasStatsPair(data)) {
        return;
      }
      renderStats(data.c0, data.c1);
    } catch (_e) {
      // ignore stats errors; this should not affect mailbox features
    }
  }

  function renderStats(c0?: number, c1?: number) {
    if (!statsEl) {
      return;
    }
    if (typeof c0 !== "number" || typeof c1 !== "number") {
      return;
    }
    const prev = readStatsPrev();
    let text = ` · ${c0}/${c1}`;
    // 无本地「上一次」记录时不计算增量，避免把缺失基线当成 0 再与当前值相减
    if (prev !== null) {
      const d0 = c0 > prev.c0 ? c0 - prev.c0 : 0;
      const d1 = c1 > prev.c1 ? c1 - prev.c1 : 0;
      if (d0 > 0 || d1 > 0) {
        text += ` +${d0} +${d1}`;
      }
    }
    statsEl.innerText = text;
    writeStatsPrev(c0, c1);
  }

  async function reactivateTmpMail() {
    if (!token) {
      return;
    }
    const startedAt = Date.now();
    try {
      reactivateBtn.disabled = true;
      setStatus("Reactivating mailbox (calculating PoW)...");
      const s = await genSign("reActivate" + token, MINZER0_CreateEmail);
      const body = JSON.stringify({ time: s.time, sign: s.sign, token });
      const data = await reqJson<TmpMailReactivateResp>("/tmpmail/reactivate", "POST", body);
      if (data.code !== 0 || !data.expire) {
        throw new Error(data.err || "reactivate failed");
      }
      expireAt = data.expire;
      if (data.address) {
        addressEl.innerText = data.address;
      }
      const costMs = Date.now() - startedAt;
      setStatus(`Mailbox reactivated (cost: ${costMs}ms), polling inbox...`);
      startCountdown();
      if (!pollTimer) {
        startPolling();
      }
      await loadInbox();
    } catch (e) {
      setStatus("Failed to reactivate mailbox");
      alert((e as Error).message || "Failed to reactivate mailbox");
    } finally {
      updateReactivateButton();
    }
  }

  async function createTmpMail() {
    const startedAt = Date.now();
    try {
      createBtn.disabled = true;
      setStatus("Creating mailbox (calculating PoW)...");
      showDetailEmpty();
      setListEmpty("Loading...");
      const s = await genSign("newMail", MINZER0_CreateEmail);
      const body = JSON.stringify({ time: s.time, sign: s.sign });
      const data = await reqJson<TmpMailCreateResp>("/tmpmail/new", "POST", body);
      if (data.code !== 0 || !data.token || !data.address || !data.expire) {
        throw new Error(data.err || "create mail failed");
      }

      token = data.token;
      expireAt = data.expire;
      location.hash = encodeURIComponent(token);
      addressEl.innerText = data.address;
      const costMs = Date.now() - startedAt;
      setStatus(`Mailbox created (createTmpMail cost: ${costMs}ms), polling inbox...`);
      startCountdown();
      startPolling();
      updateReactivateButton();
      await loadInbox();
    } catch (e) {
      setStatus("Failed to create mailbox");
      setListEmpty("Create failed, please retry");
      alert((e as Error).message || "Failed to create mailbox");
    } finally {
      createBtn.disabled = false;
    }
  }

  function restoreFromHash() {
    const hash = location.hash;
    if (!hash || hash.length < 2) {
      return;
    }
    token = decodeURIComponent(hash.substring(1));
    if (!token) {
      return;
    }
    enteredFromSavedHash = true;
    addressEl.innerText = "Recovered from URL hash (polling only)";
    countdownEl.innerText = "00:00:00";
    setStatus("Hash token detected, polling restored automatically");
    updateReactivateButton();
    startPolling();
    void loadInbox();
  }

  /**
   * 从保存的链接进入时：若收件箱已过期或接口明确表示未激活，则自动 reactivate 一次。
   * @returns 若已触发 reactivate 则为 true，调用方应跳过后续对本次 `data` 的处理。
   */
  async function maybeAutoReactivateFromSavedHashLink(data: TmpMailListResp): Promise<boolean> {
    if (!enteredFromSavedHash || autoReactivateFromHashDone || !token) {
      return false;
    }
    const nowSec = Math.floor(Date.now() / 1000);
    const ex =
      typeof data.expire === "number" && data.expire > 0
        ? data.expire
        : expireAt > 0
          ? expireAt
          : 0;
    const expiredByTime = ex > 0 && ex <= nowSec;
    const err = (data.err || "").toLowerCase();
    const errSuggestsNeedReactivate =
      data.code !== 0 &&
      /mailbox expired|mailbox inactive|expir|inactive|deactiv|not active|过期|未激活|失效/.test(err);
    if (!expiredByTime && !errSuggestsNeedReactivate) {
      return false;
    }
    if (data.code === 0 && !expiredByTime) {
      return false;
    }
    autoReactivateFromHashDone = true;
    setStatus("Mailbox inactive or expired, reactivating automatically...");
    await reactivateTmpMail();
    return true;
  }

  function renderInbox(items: TmpMailItem[]) {
    if (!items.length) {
      setListEmpty("No messages yet, polling...");
      return;
    }
    listEl.innerHTML = "";
    items.forEach((m) => {
      const li = document.createElement("li");
      const dt = new Date(m.received_at * 1000).toLocaleString();
      li.innerHTML = `<div class="tm-subject">${escapeHtml(m.subject || "(No Subject)")}</div>
        <div class="tm-small tm-muted">${escapeHtml(m.from)} • ${escapeHtml(dt)}</div>`;
      li.onclick = () => {
        void loadMessage(m.id);
      };
      listEl.appendChild(li);
    });
  }

  async function loadInbox() {
    if (!token) {
      return;
    }
    try {
      const s = await genSign("maillist" + token, MINZER0);
      const url = `/tmpmail/inbox?token=${encodeURIComponent(token)}&time=${encodeURIComponent(
        s.time
      )}&sign=${encodeURIComponent(s.sign)}`;
      const data = await reqJson<TmpMailListResp>(url, "GET");
      if (hasStatsPair(data)) {
        renderStats(data.c0, data.c1);
      }

      if (data.address && needsAddressFromInboxPoll()) {
        addressEl.innerText = data.address;
      }
      if (data.expire && data.expire !== expireAt) {
        expireAt = data.expire;
        startCountdown();
      }

      if (await maybeAutoReactivateFromSavedHashLink(data)) {
        return;
      }

      if (data.code !== 0) {
        const errMsg = data.err || "inbox load failed";
        setStatus(errMsg);
        if (data.messages && data.messages.length > 0) {
          renderInbox(data.messages);
        } else {
          setListEmpty(errMsg);
        }
        return;
      }

      renderInbox(data.messages || []);
    } catch (e) {
      setStatus("Inbox polling failed, retrying...");
      console.log(e);
    }
  }

  async function loadMessage(id: string) {
    if (!token) {
      return;
    }
    try {
      setStatus("Loading message details...");
      const s = await genSign("mailmsg" + token + id, MINZER0);
      const url = `/tmpmail/message?token=${encodeURIComponent(token)}&id=${encodeURIComponent(
        id
      )}&time=${encodeURIComponent(s.time)}&sign=${encodeURIComponent(s.sign)}`;
      const data = await reqJson<TmpMailDetailResp>(url, "GET");
      if (data.code !== 0 || !data.message) {
        throw new Error(data.err || "message load failed");
      }
      showDetailPanel();
      detailFrom.innerText = data.message.from || "";
      detailSubject.innerText = data.message.subject || "";
      detailTime.innerText = new Date(data.message.received_at * 1000).toLocaleString();
      detailBody.innerText = data.message.body || "";
      detailHtml.innerHTML = data.message.html || "";
      setStatus("Message details loaded");
    } catch (e) {
      alert((e as Error).message || "Failed to load message details");
      setStatus("Message details load failed");
    }
  }

  function escapeHtml(txt: string) {
    return txt
      .split("&")
      .join("&amp;")
      .split("<")
      .join("&lt;")
      .split(">")
      .join("&gt;")
      .split('"')
      .join("&quot;")
      .split("'")
      .join("&#39;");
  }
})();

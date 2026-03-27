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

(function tmpMailPage() {
  let token = "";
  let expireAt = 0;
  let pollTimer = 0;
  let countdownTimer = 0;

  const createBtn = document.getElementById("create-mail-btn") as HTMLButtonElement;
  const stopBtn = document.getElementById("stop-poll-btn") as HTMLButtonElement;
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

  createBtn.onclick = createTmpMail;
  stopBtn.onclick = stopPolling;
  restoreFromHash();

  function setStatus(txt: string) {
    statusEl.innerText = txt;
  }

  function setListEmpty(txt: string) {
    listEl.innerHTML = `<li class="tm-muted">${txt}</li>`;
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
    stopBtn.disabled = true;
  }

  function startCountdown() {
    if (!expireAt) {
      countdownEl.innerText = "--";
      return;
    }
    if (countdownTimer) {
      clearInterval(countdownTimer);
    }
    countdownTimer = window.setInterval(() => {
      const left = expireAt - Math.floor(Date.now() / 1000);
      if (left <= 0) {
        countdownEl.innerText = "已过期";
        setStatus("邮箱已过期，轮询已停止");
        stopPolling();
        token = "";
        return;
      }
      const min = Math.floor(left / 60);
      const sec = left % 60;
      countdownEl.innerText = `${min}m ${sec}s`;
    }, 1000);
  }

  function startPolling() {
    if (pollTimer) {
      clearInterval(pollTimer);
    }
    pollTimer = window.setInterval(() => {
      void loadInbox();
    }, 8000);
    stopBtn.disabled = false;
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

  async function createTmpMail() {
    const startedAt = Date.now();
    try {
      createBtn.disabled = true;
      setStatus("正在创建邮箱（PoW 计算中）...");
      detailCard.style.display = "none";
      setListEmpty("加载中...");
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
      setStatus(`邮箱创建成功（createTmpMail 耗时: ${costMs}ms），正在轮询收件箱...`);
      startCountdown();
      startPolling();
      await loadInbox();
    } catch (e) {
      setStatus("创建邮箱失败");
      setListEmpty("创建失败，请重试");
      alert((e as Error).message || "创建邮箱失败");
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
    addressEl.innerText = "来自链接 hash（仅恢复轮询）";
    countdownEl.innerText = "--";
    setStatus("检测到 hash token，已自动恢复轮询");
    startPolling();
    void loadInbox();
  }

  function renderInbox(items: TmpMailItem[]) {
    if (!items.length) {
      setListEmpty("暂无邮件，轮询中...");
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
      if (data.code !== 0) {
        throw new Error(data.err || "inbox load failed");
      }
      if (data.address) {
        addressEl.innerText = data.address;
      }
      renderInbox(data.messages || []);
    } catch (e) {
      setStatus("收件箱轮询失败，将继续重试");
      console.log(e);
    }
  }

  async function loadMessage(id: string) {
    if (!token) {
      return;
    }
    try {
      setStatus("正在加载邮件详情...");
      const s = await genSign("mailmsg" + token + id, MINZER0);
      const url = `/tmpmail/message?token=${encodeURIComponent(token)}&id=${encodeURIComponent(
        id
      )}&time=${encodeURIComponent(s.time)}&sign=${encodeURIComponent(s.sign)}`;
      const data = await reqJson<TmpMailDetailResp>(url, "GET");
      if (data.code !== 0 || !data.message) {
        throw new Error(data.err || "message load failed");
      }
      detailCard.style.display = "block";
      detailFrom.innerText = data.message.from || "";
      detailSubject.innerText = data.message.subject || "";
      detailTime.innerText = new Date(data.message.received_at * 1000).toLocaleString();
      detailBody.innerText = data.message.body || "";
      detailHtml.innerHTML = data.message.html || "";
      setStatus("邮件详情加载完成");
    } catch (e) {
      alert((e as Error).message || "获取详情失败");
      setStatus("邮件详情加载失败");
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

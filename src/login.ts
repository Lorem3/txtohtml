(function a() {
  async function genSign(content: string) {
    // var MINZER0 = 15;
    var t1 = Date.now();
    var time = ("" + t1).substring(0, 10);

    var pre = time + content;
    var te = new TextEncoder();

    var rnd = new Uint8Array(32);
    while (true) {
      await crypto.getRandomValues(rnd);
      var uuid = btoa(rnd as unknown as string).substring(0, 32);
      let d = await crypto.subtle.digest("SHA-256", te.encode(pre + uuid));
      d = await crypto.subtle.digest("SHA-256", d);
      let ui8 = new Uint8Array(d);
      // 计算开头bit0数量
      var Cnt = 0;
      for (let index = 0; index < 32; index++) {
        const n = ui8[index];
        if ((n & 128) == 0) {
          Cnt += 1;
        } else {
          break;
        }
        if ((n & 64) == 0) {
          Cnt += 1;
        } else {
          break;
        }
        if ((n & 32) == 0) {
          Cnt += 1;
        } else {
          break;
        }
        if ((n & 16) == 0) {
          Cnt += 1;
        } else {
          break;
        }
        if ((n & 8) == 0) {
          Cnt += 1;
        } else {
          break;
        }
        if ((n & 4) == 0) {
          Cnt += 1;
        } else {
          break;
        }

        if ((n & 2) == 0) {
          Cnt += 1;
        } else {
          break;
        }

        if ((n & 1) == 0) {
          Cnt += 1;
        } else {
          break;
        }

        if (Cnt >= MINZER0) {
          break;
        }
      }

      if (Cnt >= MINZER0) {
        console.log(MINZER0, time + uuid, Date.now() - t1);

        return { time, sign: uuid };
      }
    }
  }
  function closeLoading() {
    showLoading(false);
  }
  (document.querySelector(".close-btn") as HTMLElement)!.onclick = closeLoading;
  var btn = document.getElementById("submit") as HTMLLIElement;
  btn.onclick = login;

  var btnCreateAcc = document.getElementById("createacc") as HTMLLIElement;
  btnCreateAcc.onclick = createacc;

  function showLoading(show: boolean) {
    const loadingMask = document.querySelector(".overlay") as HTMLElement;
    loadingMask.style.display = show ? "flex" : "none";
  }

  async function login() {
    var acc = (document.getElementById("accountname") as HTMLInputElement)
      .value as string;
    var p1 = (document.getElementById("password1") as HTMLInputElement)
      .value as string;

    if (!acc || !p1) return;

    submit(acc, p1, false);
  }

  var flag = 0;
  async function createacc() {
    if (flag == 0) {
      flag = 1;
      document.getElementById("password2-filed")!.style.display = "block";

      return;
    }

    var acc = (document.getElementById("accountname") as HTMLInputElement)
      .value;

    var p1 = (document.getElementById("password1") as HTMLInputElement).value;
    var p2 = (document.getElementById("password2") as HTMLInputElement).value;
    if (!acc || !p1 || p1 != p2) {
      alert("input the field correctly");
      return;
    }

    submit(acc, p1, true);
  }

  async function hmac(keyStr: string, messageStr: string) {
    var te = new TextEncoder();
    var key = te.encode("Txto_password" + keyStr);
    var message = te.encode("Txto_account" + messageStr);
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      key,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const signature = await crypto.subtle.sign("HMAC", cryptoKey, message);
    var arr = new Uint8Array(signature);
    var result = "";
    for (let index = 0; index < arr.length; index++) {
      const element = arr[index];
      var e = element.toString(16);
      if (e.length == 1) {
        e = "0" + e;
      }
      result += e;
    }
    return result;
  }

  async function submit(acc: string, psw0: string, isCreate: boolean) {
    showLoading(true);

    var psw = await hmac(psw0, acc);

    const request = new XMLHttpRequest();
    request.open("POST", "/login");
    request.setRequestHeader("Content-type", "application/json");
    request.responseType = "json";

    request.onload = function () {
      if (request.status !== 200) {
        alert("Error fetching data.");
      } else {
        var data = request.response;
        if (data && data.code == 0) {
          setTimeout(() => {
            location.href = "/";
          }, 100);
        } else {
          alert(data.err || "error occurred");
        }
      }
      return;
    };

    request.onloadend = function () {
      showLoading(false);
    };

    var sign = await genSign("login" + acc + psw)
    request.send(
      JSON.stringify({
        accountname: acc,
        password: psw,
        type: isCreate ? "0" : "1",
        ...sign
      })
    );
  }
})();

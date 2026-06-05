(function a() {




  async function getAllCount() {
		
	 let signObj = await genSign("count", MINZER0)

		var body = JSON.stringify({
			time:signObj.time,
			sign:signObj.sign
		})

		const request = new XMLHttpRequest();
		request.open("POST", "/count");
		request.setRequestHeader("Content-type", "application/json");
		request.responseType = "json";

		request.onload = function () {
			if (request.status !== 200) {
				alert("Error fetching data.");
			} else {
				var data = request.response;
        var cclog = console.log;
        cclog(data)
				if (data.code == 0) {
          document.getElementById('statuslink')!.innerHTML = data.count
				} else {
 
				}
			}
			return;
		};

		request.onloadend = function () {
			showLoading(false);
		};
		request.send(body);
	}

  getAllCount()
  

    
  function closeLoading() {
    showLoading(false);
  }
  (document.querySelector(".close-btn") as HTMLElement)!.onclick = closeLoading;

  function getCookie(name: string) {
    const cookies = document.cookie.split(";");
    let cookieValue = "";
    for (let i = 0; i < cookies.length; i++) {
      const cookiePair = cookies[i].split("=");
      const cookieName = cookiePair[0].trim();
      if (cookieName === name) {
        cookieValue = cookiePair[1];
        break;
      }
    }
    return cookieValue;
  }

  const LOGIN_PROMPT_KEY = "login_prompt_dismissed_until";
  const TEN_DAYS_MS = 10 * 24 * 60 * 60 * 1000;

  function maybePromptLogin(): boolean {
    var accname = decodeURIComponent(getCookie("accname") || "");
    if (accname) return true;

    var dismissedUntil = localStorage.getItem(LOGIN_PROMPT_KEY);
    if (dismissedUntil && Date.now() < Number(dismissedUntil)) return true;

    if (Math.random() >= 0.5) return true;

    if (confirm("Would you like to log in? After logging in, you can view and manage your posts.")) {
      window.open("/login", "_blank");
      return false;
    } else {
      localStorage.setItem(LOGIN_PROMPT_KEY, String(Date.now() + TEN_DAYS_MS));
      return true;
    }
  }

  (function () {
    var t = decodeURIComponent(getCookie("accname"));
    if (t) {
      document.getElementById(
        "currentdomain"
      )!.innerHTML = `<a href="/my">${decodeURIComponent(
        t
      )}</a> | <a href="#" id='logout'>logout</a>`;

      setTimeout(() => {
        (document.querySelector("#logout")! as HTMLElement).onclick = () => {
          logout();
          location.href = "/";
        };
      }, 300);
    } else {
      document.getElementById(
        "currentdomain"
      )!.innerHTML = `  <a href="/login">Login</a>`;
    }
  })();

  var btn = document.getElementById("submit") as HTMLInputElement;
  btn.onclick = submit;

  var btnMore = document.getElementById("showmore") as HTMLInputElement;
  btnMore.onclick = showmore;

  var flag = 0;
  function showmore() {
    if (flag == 0) {
      flag++;
      document.getElementById("adv-field")!.style.display = "block";
    } else if (flag == 1) {
      flag++;
      document.getElementById("meta-field")!.style.display = "block";
      document.getElementById("showmore")!.style.display = "none";
    }
  }

  function showMsg(msg: string) {
    alert(msg);
  }

  function showLoading(show: boolean) {
    const loadingMask = document.querySelector(".overlay") as HTMLElement;
    loadingMask.style.display = show ? "flex" : "none";
  }

  function getValue(id: string) {
    return (document.getElementById(id) as HTMLInputElement).value;
  }

  async function submit(){
    var content = getValue("content-input");
    if (!content) {
      showMsg("please input content");
      return;
    }
    if (!maybePromptLogin()) {
      return;
    }
    showLoading(true);
    let c = await getCount()
    if(c > 10){
      let wt = Math.pow(1.5,c- 10 );
      wt = wt > 180 ? 180 : wt
      await wait(wt)
    }
    setTimeout(() => {
       _submit()
    }, 0);
  }

  async function wait(t:number){
    return new Promise(r=>{
      setTimeout(() => {
        r(1);
      }, t * 1000);
    })
  }

  async function sha256(txt:string){
    var te = new TextEncoder;
    let bf = await crypto.subtle.digest("SHA-256",te.encode('txto' + txt))  
    const hashArray = Array.from(new Uint8Array(bf));
    const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
    return hashHex
  }

  async function getCount(){
    var key = new Date().toISOString().substring(0,10);
    var s = localStorage.getItem(await sha256(key))
    if(s){
      return Number(s)
    }
    return 0
  }

  async function increaseCount(){
    let t = await getCount()
    t += 1;
    var key = new Date().toISOString().substring(0,10);
    localStorage.setItem(await sha256(key),'' + t )
  }

  async function _submit() {
    var content = getValue("content-input");
    if (!content) {
      showMsg("please input content");
      return;
    }

    /// expire
    var expire = "";
    var radios = document.getElementsByClassName("radio");
    for (let i = 0; i < radios.length; i++) {
      const element = radios[i] as HTMLInputElement;
      if (element.checked) {
        expire = element.value;
      }
    }
    
    let s = await genSign(content, MINZER0_Add)
    var bodyObj = { content: content, expire: expire ,...s} as any;
    let c = await getCount()
    bodyObj.C = c ;
    console.log(bodyObj)

    if (flag > 0) {
      var urlstr = getValue("custom-url-input");
      var editcode = getValue("custom-edit-code");
      bodyObj.url = urlstr;
      bodyObj.editcode = editcode;
    }

    if (flag > 1) {
      var title = getValue("title-input");
      var author = getValue("author-input");
      var desc = getValue("description-input");

      bodyObj.title = title;
      bodyObj.author = author;
      bodyObj.desc = desc;
    }

    var body = JSON.stringify(bodyObj);

    const request = new XMLHttpRequest();

    request.open("POST", "/addPost");
    request.setRequestHeader(
      "Content-type",
      "application/x-www-form-urlencoded"
    );
    request.responseType = "json";
    request.onload = function () {
      // if (request.status !== 200) {
      //   alert("Error fetching data.");
      // } else 
      {
        var data = request.response;
        if (data && data.code == 0) {
          increaseCount()
          var jsonhash = encodeURIComponent(JSON.stringify(data));
          setTimeout(() => {
            location.href = "/succ#" + jsonhash;
          }, 100);
        } else {
          showMsg( (data && data.err) || "error happened");
        }
      }
      return;
    };

    request.onloadend = function () {
      showLoading(false);
    };
    request.send(body);
  }

  function logout() {
    // 获取所有的cookie
    let cookies = document.cookie.split(";");
    // 遍历所有的cookie并将它们设置为过期。
    for (let i = 0; i < cookies.length; i++) {
      let cookie = cookies[i];
      let eqPos = cookie.indexOf("=");
      let name = eqPos > -1 ? cookie.substring(0, eqPos) : cookie;
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
    }
  }

  var lgout = document.querySelector("#logout") as HTMLElement
  if(lgout){
    lgout.onclick = () => {
      logout();
      location.href = "/";
    }
  }
})();

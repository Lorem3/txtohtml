(function a() {
  async function genSign(content :string){
    // var MINZER0 = 15
    var t1 = Date.now()
    var time = ('' + t1).substring(0,10)

    var pre = time + content;
    var te = new TextEncoder

    var rnd = new Uint8Array(32)
    while (true) {
      await crypto.getRandomValues(rnd)
      var uuid = btoa(rnd as unknown as  string).substring(0,32)
      let d = await crypto.subtle.digest("SHA-256",te.encode(pre + uuid))  
      d = await crypto.subtle.digest("SHA-256",d)  
      let ui8 = new Uint8Array(d) ;
      // 计算开头bit0数量
      var Cnt = 0
      for (let index = 0; index < 32; index++) {
        const n = ui8[index];
        if ((n & 128) == 0){
          Cnt += 1
        }else{
          break
        }
        if ((n & 64) == 0){
          Cnt += 1
        }else{
          break
        }
        if ((n & 32) == 0){
          Cnt += 1
        }else{
          break
        }
        if ((n & 16) == 0){
          Cnt += 1
        }else{
          break
        }
        if ((n & 8) == 0){
          Cnt += 1
        }else{
          break
        }
        if ((n & 4) == 0){
          Cnt += 1
        }else{
          break
        }

        if ((n & 2) == 0){
          Cnt += 1
        }else{
          break
        }

        if ((n & 1) == 0){
          Cnt += 1
        }else{
          break
        }

        if(Cnt>= MINZER0_Add){
          break
        }
      }

      if(Cnt >= MINZER0_Add){
        console.log(MINZER0_Add,time + uuid, Date.now() -t1,)

        return {time,sign:uuid}
        
      } 
    }
  }

    
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
      )!.innerHTML = `<a href="/rand">Random</a> | <a href="/login">Login</a>`;
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

  function submit(){
    var content = getValue("content-input");
    if (!content) {
      showMsg("please input content");
      return;
    }
    showLoading(true);
    setTimeout(() => {
       _submit()
    }, 0);
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
    
    let s = await genSign(content)
    var bodyObj = { content: content, expire: expire ,...s} as any;
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

    request.open("POST", "/");
    request.setRequestHeader(
      "Content-type",
      "application/x-www-form-urlencoded"
    );
    request.responseType = "json";

    request.onload = function () {
      if (request.status !== 200) {
        alert("Error fetching data.");
      } else {
        var data = request.response;
        if (data.code == 0) {
          var jsonhash = encodeURIComponent(JSON.stringify(data));
          setTimeout(() => {
            location.href = "/succ#" + jsonhash;
          }, 100);
        } else {
          showMsg(data.err);
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

  (document.querySelector("#logout")! as HTMLElement).onclick = () => {
    logout();

    location.href = "/";
  };
})();

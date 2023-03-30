(function a() {
  var posttoken = "";
  (function(){
    // getValue("contentdesc")
    var hash = location.hash
    
    if(!hash || hash.length < 2 ){
      return
    }
    posttoken = decodeURIComponent(hash.substring(1))
  })()



  function closeLoading() {
    showLoading(false);
  }
  (document.querySelector(".close-btn") as HTMLElement)!.onclick = closeLoading;
 
 

  var btn = document.getElementById("submit") as HTMLInputElement;
  btn.onclick = submit;
 

  var flag = 0; 

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

  function submit() {
    var content = getValue("content-input");
    if (!content) {
      showMsg("please input content");
      return;
    }

    showLoading(true);
    var bodyObj = { content: content ,token:posttoken} as any;
 

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

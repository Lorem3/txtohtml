(function a() {
  var posttoken = "";
  var initcontent = "";
  (function(){
    var hash = location.hash
    if(!hash || hash.length < 2 ){
      return
    }
    let jsonStr = decodeURIComponent(hash.substring(1))
    let json = JSON.parse(jsonStr)
    posttoken = json.token

    document.getElementById("contentdesc")!.innerText = json.tip
    document.getElementById("title")!.innerText = json.title
    var txta = document.getElementById("content-input") as HTMLTextAreaElement
    txta.value = json.content
    initcontent = json.content
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
    if (!content || content == initcontent) {
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
 
})();

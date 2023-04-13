(function a() {
 

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
    var pubkey = getValue("pubkey");
    if (!pubkey ) {
      showMsg("请输入公钥");
      return;
    }

    var day = getValue("day");
    if (!day || isNaN(parseInt(day))) {
      showMsg("输入过期时间");
      return;
    }


    showLoading(true);
    var bodyObj = { pubkey: pubkey ,day :parseInt(day)} as any;
 

    var body = JSON.stringify(bodyObj);

    const request = new XMLHttpRequest();

    request.open("POST", "/sign");
    request.setRequestHeader(
      "Content-type",
      "application/json"
    );
    request.responseType = "json";
    request.onload = function () {
      if (request.status !== 200) {
        alert("Error fetching data.");
      } else {
        var data = request.response;
        if (data.code == 0 ){
          let str = data.data as string
         
          document.getElementById('signresult')!.innerText =  str //JSON.stringify(data,null,"\t")
        }else{
          document.getElementById('signresult')!.innerText = data.err
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

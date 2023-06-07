declare var _CURRENT_: string;
(function a() {
  try {
    document.getElementById("currentbuildtime")!.innerText = _CURRENT_;  
  } catch (error) {
    
  }
  
  function closeLoading() {
    showLoading(false);
  }
  (document.querySelector(".close-btn") as HTMLElement)!.onclick = closeLoading;

  function showLoading(show: boolean) {
    const loadingMask = document.querySelector(".overlay") as HTMLElement;
    loadingMask.style.display = show ? "flex" : "none";
  }

  document.getElementById("submit")!.onclick = submit;
  document.getElementById("delete2")!.onclick = delete2;
  document.getElementById("clean")!.onclick = clean;
  document.getElementById("clearCache")!.onclick = clean;

  async function clearCache(){
    sendReq('removeAllCache',{})
  }

  function sendReq(url: string , body  :any){
    const request = new XMLHttpRequest();

    request.open("POST", url);
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
          alert("succ")
        } else {
          alert(data.err);
        }
      }
      return;
    };

    request.onloadend = function () {
      showLoading(false);
    };
    request.send(body);
  }

  function submit() {
    var fileInput = document.getElementById("file") as HTMLInputElement;
    var file = fileInput.files![0];
    if (!file) {
      return;
    }
    showLoading(true);
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/updatehtml", true);
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.responseType = "json";

    var reader = new FileReader();
    reader.onload = function () {
      xhr.send(reader.result);
      xhr.onloadend = () => {
        closeLoading();
      };
      xhr.onload = function () {
        closeLoading();
        if (xhr.status !== 200) {
          alert("Error fetching data.");
        } else {
          var data = xhr.response;
          if (data.code == 0) {
            alert("succ");
          } else {
            alert(data.err);
          }
        }
        return;
      };
    };
    reader.readAsArrayBuffer(file);
  }

  function delete2(){
    var prefix = (document.getElementById("prefix") as HTMLInputElement).value
    if(!prefix || /^0-9a-zA-z$/.test(prefix)){
      alert("prefix error")
      return
    }

    sendReq("/delete2",JSON.stringify({prefix}))
  }

  function clean(){
    sendReq("/clean","")
  }
})();

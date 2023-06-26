/// 通过token上传

(function a() {
  async function genSign(content :string){
    var MINZER0 = 15
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

        if(Cnt>= MINZER0){
          break
        }
      }

      if(Cnt >= MINZER0){
        console.log(MINZER0,time + uuid, Date.now() -t1,)

        return {time,sign:uuid}
        
      } 
    }
  }

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

    document.getElementById("contentdesc")!.innerText = json.tip || ""
    document.getElementById("title")!.innerText = json.title || ""
    var txta = document.getElementById("content-input") as HTMLTextAreaElement
    txta.value = json.content || ""
    initcontent = json.content || ""
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

  async function submit() {
    var content = getValue("content-input");
    if (!content || content == initcontent) {
      showMsg("please input content");
      return;
    }

    showLoading(true);
    let s = await genSign(content)
    var bodyObj = { content: content ,token:posttoken,...s} as any;
 

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

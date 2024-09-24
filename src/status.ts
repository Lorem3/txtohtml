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

  async function getAllCount() {
		
	 let signObj = await genSign("count")

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
          document.getElementById('count')!.innerHTML = data.count
				} else {
 
				}
			}
			return;
		};

		request.onloadend = function () {
 
		};
		request.send(body);
	}

  getAllCount()
  

})();

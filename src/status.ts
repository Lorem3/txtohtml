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
          document.getElementById('count')!.innerHTML = data.count
          let date = new Date(new Date(data.msg).getTime() + 3600000 * 8)
          
          document.getElementById('msg')!.innerHTML = date.toISOString().replace(/T|Z/g,' ')
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

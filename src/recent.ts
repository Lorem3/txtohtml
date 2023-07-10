(function a(){
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
	function closeLoading(){
		showLoading(false)
	 }
	 (document.querySelector('.close-btn') as HTMLElement)!.onclick =  closeLoading;

	
	function  showLoading(show: boolean){
		const loadingMask = document.querySelector('.overlay') as  HTMLElement;
		loadingMask.style.display = show ? "flex" :"none"
    }
 
 
 
	 getList();

	function showMsg(msg :string){
		alert(msg)
	}

	var page = 0
	async function getList(){
		showLoading(true)

		var signObj = await genSign("recent")
		var bodyObj = {
			page:page,
			path:location.pathname,
			time:signObj.time,
			sign:signObj.sign
		}
		var body = JSON.stringify(bodyObj)
		
		const request = new XMLHttpRequest();
		request.open("POST", "/recent");
		request.setRequestHeader("Content-type", "application/json");
		request.responseType = "json";
		
		request.onload = function() {
			if (request.status !== 200) {
				alert("Error fetching data.")
			}
			else{
				var data = request.response
				if(data.code == 0){
					if(data.list && data.list.length > 0){
						page ++;
						var ul =  document.getElementById('postlist')
						for (let index = 0; index < data.list.length; index++) {
							const element = data.list[index];

							const newItem = document.createElement('li');
							newItem.id = element.pageid
							newItem.innerHTML = ` 
							 <a class='post' href = "/${element.url}"> 
							 ${element.title || (element.url)} &nbsp;   
							 <text class=createtime>${new Date(element.create * 1000).toLocaleString()} 
							 </text>  
							 <br> <br> 
							 <a class='post' href = "/${element.url}">   ${element.desc }</a>`
							ul?.append(newItem)
							
							
						}
					

					}

					if(data.list && data.list.length < data.pagesize){
						document.getElementById('showmore')!.style.display = 'none';
					}
				}
				else{
					if(data && data.code == 4){
						document.getElementById('showmore')!.style.display = 'none';
					}
					showMsg(data.err)
				}
			} 
			return;
		}


		request.onloadend = function(){
			showLoading(false)
		}
		request.send(body);
	}



	function logout(){
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



	function setLogoutActioon() {
			var logoutElement = document.querySelector("#logout") as HTMLElement
		if(logoutElement){
			logoutElement.onclick = ()=>{
				logout();
		
				location.href = '/'
			}
		}
	}

	setLogoutActioon()
	
 
	
  })();



  
(function a(){
  
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
	function getList(){
		showLoading(true)

		var bodyObj = {
			page:page,
			path:location.pathname
		}
		var body = JSON.stringify(bodyObj)
		
		const request = new XMLHttpRequest();
		request.open("POST", "/recentlist");
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



  
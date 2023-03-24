(function a(){
	(function(){
		var t =  decodeURIComponent(getCookie('accname') )  
		if(t){
		  document.getElementById('currentdomain')!.innerHTML = `<a href="/my">${decodeURIComponent(t)}</a> | <a href="#" id='logout'>logout</a>`;
		  
		  setTimeout(() => {
			setLogoutActioon()
		  }, 300);
		  
		}else{
		  document.getElementById('currentdomain')!.innerHTML = `<a href="/my">public</a> | <a href="/login">login</a>`;
		}
		
   })()


	function closeLoading(){
		showLoading(false)
	 }
	 (document.querySelector('.close-btn') as HTMLElement)!.onclick =  closeLoading;

	
	function  showLoading(show: boolean){
		const loadingMask = document.querySelector('.overlay') as  HTMLElement;
		loadingMask.style.display = show ? "flex" :"none"
    }

     function getCookie(name:string) {
          const cookies = document.cookie.split(';');
          let cookieValue = '';
          for (let i = 0; i < cookies.length; i++) {
            const cookiePair = cookies[i].split('=');
            const cookieName = cookiePair[0].trim();
            if (cookieName === name) {
              cookieValue = cookiePair[1];
              break;
            }
          }
          return cookieValue;
        }


     
	 var btnMore = document.getElementById("showmore") as HTMLInputElement;
	 btnMore.onclick = showmore;

	 
	 
	 function showmore() {
		getList()
	 }
	 getList();

 

	function showMsg(msg :string){
		alert(msg)
	}
	
	var page = 0
	function getList(){
		showLoading(true)

		var bodyObj = {
			page:page
		}
		var body = JSON.stringify(bodyObj)
		
		const request = new XMLHttpRequest();
		request.open("POST", "/list");
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
							newItem.innerHTML = ` <a href = "/${element.url}"> ${element.title || (element.url)}</a>`
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



  
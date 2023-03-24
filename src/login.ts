(function a(){
     function closeLoading(){
          showLoading(false)
       }
       (document.querySelector('.close-btn') as HTMLElement)!.onclick =  closeLoading;
    var btn = document.getElementById("submit") as HTMLLIElement
    btn.onclick = login;
  
   var btnCreateAcc = document.getElementById("createacc") as HTMLLIElement
   btnCreateAcc.onclick = createacc;
  

  function  showLoading(show: boolean){
     const loadingMask = document.querySelector('.overlay') as  HTMLElement;
     loadingMask.style.display = show ? "flex" :"none"
  }

  
  
   async function login(){
        var acc = (document.getElementById("accountname") as HTMLInputElement).value as string
        var p1 = (document.getElementById("password1") as HTMLInputElement).value as string

        if(!acc || !p1) return

        submit(acc,p1,false)
  
   }
  
   var flag = 0
   async function createacc(){
     if(flag == 0){
          flag = 1;
          document.getElementById('password2-filed')!.style.display = 'block'

          return
     }


        var acc = (document.getElementById("accountname") as HTMLInputElement).value
              
        var p1 = (document.getElementById("password1") as HTMLInputElement).value
        var p2 = (document.getElementById("password2") as HTMLInputElement).value
        if(!acc || !p1 || p1 != p2) {
          alert('input the field correctly' )
          return
        }

        submit(acc,p1,true)
   }
  
  
   async function hmac(keyStr :string, messageStr:string) {
    var te = new TextEncoder
    var key = te.encode('Txto_password' + keyStr)
    var message = te.encode('Txto_account' + messageStr)
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      key,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
  
    const signature = await crypto.subtle.sign("HMAC", cryptoKey, message);
    var arr =  new Uint8Array(signature);
    var result = ""
    for (let index = 0; index < arr.length; index++) {
      const element = arr[index];
      var e = element.toString(16);
      if( e.length == 1){
        e = '0' + e;
      }
      result += e    
    }
    return result
  }



  async function submit(acc :string,psw0:string ,isCreate :boolean){
     showLoading(true);
      
        var psw = await(hmac(psw0,acc))

		const request = new XMLHttpRequest();
		request.open("POST", "/login");
		request.setRequestHeader("Content-type", "application/json");
		request.responseType = "json";
		
		request.onload = function() {
			if (request.status !== 200) {
				alert("Error fetching data.")
			}
			else{
				var data = request.response
				if(data && data.code == 0){
                         setTimeout(() => {
                              location.href = '/'
                         }, 100);
				}
				else{
                    alert(data.err || "error occurred")
				}
			} 
			return;
		}

		request.onloadend = function(){
               showLoading(false);
		}
		request.send(JSON.stringify({
            accountname:acc,
            password:psw,
            type:isCreate  ? '0' : '1'
        }));
  }
  
  
  })();
  
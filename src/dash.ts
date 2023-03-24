(function a(){
     function closeLoading(){
          showLoading(false)
       }
       (document.querySelector('.close-btn') as HTMLElement)!.onclick =  closeLoading;
 
 
  

  function  showLoading(show: boolean){
     const loadingMask = document.querySelector('.overlay') as  HTMLElement;
     loadingMask.style.display = show ? "flex" :"none"
  }
 
   
  })();
  
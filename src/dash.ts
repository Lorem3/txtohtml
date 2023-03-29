declare var _CURRENT_: string;
(function a() {
  document.getElementById("currentbuildtime")!.innerText = _CURRENT_;
  function closeLoading() {
    showLoading(false);
  }
  (document.querySelector(".close-btn") as HTMLElement)!.onclick = closeLoading;

  function showLoading(show: boolean) {
    const loadingMask = document.querySelector(".overlay") as HTMLElement;
    loadingMask.style.display = show ? "flex" : "none";
  }

  document.getElementById("submit")!.onclick = submit;

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
})();

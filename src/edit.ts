(async function () {
	function closeLoading() {
		showLoading(false);
	}
	(document.querySelector(".close-btn") as HTMLElement)!.onclick = closeLoading;

	const pageid = "__PAGEID__";
	(function () {
		// set old data
		const title = "__TITLE__";
		const desc = "__DESCRIPTION__";
		const author = "__AUTHOR__";
		const markdown = "__MARKDOWN__";
		// const ishidden = "__TYPE__";

		(document.getElementById("content-input") as HTMLInputElement).value =
			decodeURIComponent(markdown);
		(document.getElementById("title-input") as HTMLInputElement).value =
			decodeURIComponent(title);
		(document.getElementById("author-input") as HTMLInputElement).value =
			decodeURIComponent(author);
		(document.getElementById("description-input") as HTMLInputElement).value =
			decodeURIComponent(desc);

		var hash = location.hash
		if(hash?.length > 1){
			var data = hash.substring(1);
			(document.getElementById("ori-edit-code") as HTMLInputElement).value =
			decodeURIComponent(data);
		}
	})();

	function showLoading(show: boolean) {
		const loadingMask = document.querySelector(".overlay") as HTMLElement;
		loadingMask.style.display = show ? "flex" : "none";
	}

	var btn = document.getElementById("submit")!;
	btn.onclick = submit;

	var btnMore = document.getElementById("delete")!;
	btnMore.onclick = deletepost;
	function deletepost() {
		
		if (!confirm("do you want to delete this post ?")) {
			return
		}
		showLoading(true)
		var oriEditCode = getValueById("ori-edit-code");

		var body = JSON.stringify({
			pageId:pageid,
			editCode: oriEditCode 
		})

		const request = new XMLHttpRequest();
		request.open("POST", "/delete");
		request.setRequestHeader("Content-type", "application/json");
		request.responseType = "json";

		request.onload = function () {
			if (request.status !== 200) {
				alert("Error fetching data.");
			} else {
				var data = request.response;
				if (data.code == 0) {
					
					setTimeout(() => {
						location.href = "/#" ;
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

	function showMsg(msg: string) {
		alert(msg);
	}

	function getValueById(id: string) {
		return (document.getElementById(id) as HTMLInputElement).value;
	}

	function submit() {
		

		var content = getValueById("content-input");
		if (!content) {
			showMsg("please input content");
			return;
		}

		var oriEditCode = getValueById("ori-edit-code");
		if (!oriEditCode) {
			showMsg("please input origin edit code");
			return;
		}

		showLoading(true);
		var neweditcode = getValueById("custom-edit-code");

		var title = getValueById("title-input");
		var author = getValueById("author-input");
		var desc = getValueById("description-input");

		var bodyobj = {
			content: content,
			oriEditCode: oriEditCode,
			newEditCode: neweditcode,
			title: title,
			author: author,
			desc: desc,
			pageId: pageid,
			private: 0,
		};

		var body = JSON.stringify(bodyobj);

		const request = new XMLHttpRequest();
		request.open("POST", "/edit");
		request.setRequestHeader("Content-type", "application/json");
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

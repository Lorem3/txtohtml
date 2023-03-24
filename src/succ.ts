(function (){

	var hash = location.hash;
	if(!(hash && hash.length > 2)){
		return
	}

	var jsonStr = hash.substring(1);
	jsonStr = decodeURIComponent(jsonStr);
	var json = JSON.parse(jsonStr) as any


	document.getElementById('editcode') !.innerText = json.editcode
	document.getElementById('posturl')!.innerText = location.host + '/' + json.url;
	(document.getElementById('posturl') as HTMLLinkElement).href =  '/' + json.url;

	var path0 = `/${json.url}/edit#${encodeURIComponent(json.editcode)}` ;
	document.getElementById('editurl')!.innerText = location.host + path0;
	(document.getElementById('editurl' ) as HTMLLinkElement).href =  path0
  })();
  
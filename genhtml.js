console.log("please run tsc in terminal before you generate html");
const fs = require("fs");
const { minify } = require("terser");

const minifyConfig = {
  compress: {
    drop_console: true,
    pure_funcs: ["console.log"],
    global_defs:{
      "_CURRENT_":(new Date).toISOString()
  }
    
  },
  format: {
    max_line_len: 350,
  },
};

(async function () {
    const htmldis = 'htmldis'
  fs.rmSync(htmldis, { recursive: true, force: true });
  fs.mkdirSync(htmldis )
   
  var arr = fs.readdirSync("./html");
  console.log(arr)
  
  const suffix = "-template.html";

  arr.forEach(async (filename) => {
    if (
      filename.length > suffix.length &&
      filename.substring(filename.length - suffix.length) == suffix
    ) {
      var jsname = filename.substring(0, filename.length - suffix.length);

      var tmp = fs.readFileSync("./html/" + filename).toString();
      var js = fs.readFileSync(`./dis/${jsname}.js`).toString();

      console.log(jsname);

      js = (await minify(js, minifyConfig)).code;

      var html2 = tmp.replace("__JS__", js);

      fs.writeFileSync(`./${htmldis}/${jsname}.html`, html2);
    }else if(filename.length > '5' && filename.substring(filename.length - 5,filename.length) == '.html'){
      fs.cpSync("./html/" + filename,'./htmldis/'+filename)
    }
  });
})();

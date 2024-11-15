console.log("please run tsc in terminal before you generate html");
const fs = require("fs");
const { minify } = require("terser");
const htmlterser= require('html-minifier-terser');
const htmlminify = htmlterser.minify

const htmlconfig = {
  removeComments:true,
  minifyCSS:true
}
const minifyConfig = {
  compress: {
    drop_console: true,
    pure_funcs: ["console.log"],
    global_defs:{
      "_CURRENT_":(new Date).toISOString(),
      "MINZER0":parseInt(fs.readFileSync('html/cfg-pow.html').toString()),
      "MINZER0_Add":parseInt(fs.readFileSync('html/cfg-pow-add.html').toString())
      
  }
    
  },
  format: {
    max_line_len: 150,
  },
};

(async function () {
    const htmldis = 'dis/html'
  fs.rmSync(htmldis, { recursive: true, force: true });
  fs.mkdirSync(htmldis )
   
  var arr = fs.readdirSync("./html");
  console.log(arr)
  
  const suffix = "-template.html";
 

  let innerCss  = fs.readFileSync('./html/innercss.css').toString()
  innerCss = `
  <style>
  ${innerCss}
  </style>`
  arr.forEach(async (filename) => {
    if (
      filename.length > suffix.length &&
      filename.substring(filename.length - suffix.length) == suffix
    ) {
      var jsname = filename.substring(0, filename.length - suffix.length);
      console.log(jsname);
      var tmp = fs.readFileSync("./html/" + filename).toString();

      tmp = tmp.replace("</head>",`${innerCss}\n</head>`)

      tmp = await htmlminify(tmp, htmlconfig);

      var js
      if(fs.existsSync(`./dis/${jsname}.js`)){
         js = fs.readFileSync(`./dis/${jsname}.js`).toString();
      }else{
        js = ''
      }
      

      if(process.argv[2] == 'DEBUG'){

      }else{
        js = (await minify(js, minifyConfig)).code;
      }
      
      var html2 = tmp.replace("__JS__", js);
      fs.writeFileSync(`./${htmldis}/${jsname}.html`, html2);
    }else if(filename.length > '5' && filename.substring(filename.length - 5,filename.length) == '.html'){
      fs.cpSync("./html/" + filename,'./dis/html/'+filename)
    }
  });
})();


安装  terser typescript 
```
npm i terser -g

```

生成文件，
```
tsc && node genhtml.js
```

> 注意 需要设置 TXTOSIGNKEY 签名公钥到环境变量，用于打包 html.tar.gz.enc
>
> TXTOSIGNKEY="base64:xxxxxxxxxxxx"
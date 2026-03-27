# Mail API 调用文档

本文档用于前端/网页调用 `mail` 相关接口。

## 基础说明

- 临时邮箱有效期：10 分钟
- 接口返回：JSON
- 新建邮箱 PoW 难度：固定 `20`
- 收件箱列表/详情 PoW 难度：`global.MinZeroBitPrefix`（通常为 16，取决于服务端配置）
- 邮箱域名来源：`config.yml` 中的 `emailDomain`

---

## 1. 创建临时邮箱

- 方法：`POST`
- 路径：`/tmpmail/new`
- 请求体：

```json
{
  "time": "1710000000",
  "sign": "xxxx"
}
```

- PoW 校验输入：`"newMail"`
- 校验等价计算：`sha256(sha256(time + "newMail" + sign))`
- 要求：前 20 bit 为 0

- 成功响应示例：

```json
{
  "code": 0,
  "address": "AbCdEf1234@txto.eu.org",
  "token": "xxxxxxxxxxxxxxxxxxxxxxxx",
  "expire": 1710000600
}
```

---

## 2. 轮询收件箱列表

- 方法：`GET`
- 路径：`/tmpmail/inbox`
- Query 参数：
  - `token`：邮箱 token
  - `time`：Unix 秒级时间戳（字符串）
  - `sign`：PoW 结果

- 请求示例：

```text
/tmpmail/inbox?token=xxx&time=1710000001&sign=yyy
```

- PoW 校验输入：`"maillist" + token`
- 校验等价计算：`sha256(sha256(time + "maillist" + token + sign))`
- 要求：前 `MinZeroBitPrefix` bit 为 0

- 成功响应示例：

```json
{
  "code": 0,
  "address": "AbCdEf1234@txto.eu.org",
  "messages": [
    {
      "id": "msgid1",
      "from": "alice@example.com",
      "subject": "hello",
      "received_at": 1710000123
    }
  ]
}
```

---

## 3. 获取单封邮件详情

- 方法：`GET`
- 路径：`/tmpmail/message`
- Query 参数：
  - `token`：邮箱 token
  - `id`：邮件 ID
  - `time`：Unix 秒级时间戳（字符串）
  - `sign`：PoW 结果

- 请求示例：

```text
/tmpmail/message?token=xxx&id=msgid1&time=1710000002&sign=zzz
```

- PoW 校验输入：`"mailmsg" + token + id`
- 校验等价计算：`sha256(sha256(time + "mailmsg" + token + id + sign))`
- 要求：前 `MinZeroBitPrefix` bit 为 0

- 成功响应示例：

```json
{
  "code": 0,
  "message": {
    "id": "msgid1",
    "from": "alice@example.com",
    "subject": "hello",
    "body": "plain text",
    "html": "<p>plain text</p>",
    "received_at": 1710000123
  }
}
```

---

## 4. HTTP 投递邮件（调试/内部）

- 方法：`POST`
- 路径：`/tmpmail/deliver`
- 请求体：

```json
{
  "to": "AbCdEf1234@txto.eu.org",
  "from": "sender@example.com",
  "subject": "test",
  "body": "hello",
  "html": "<p>hello</p>"
}
```

- 成功响应：

```json
{
  "code": 0
}
```

说明：真实互联网邮件接收走 SMTP 监听（MX + 25 端口），`/tmpmail/deliver` 主要用于内部调试或桥接。

---

## 前端 PoW 生成约定

前端需实现：

`genSign(time, input, difficulty)`

满足：

- `hash = sha256(sha256(time + input + sign))`
- `hash` 的前导 0 bit 数 >= `difficulty`

不同接口的 `input`：

- 新建邮箱：`"newMail"`
- 邮件列表：`"maillist" + token`
- 邮件详情：`"mailmsg" + token + id`


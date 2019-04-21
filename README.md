# connpass_bot
connpassのイベントを検索するSlack Botです。
## 使い方
キーワード,開催日は順不同,複数可,スペース区切り
```
@bot <キーワード> <開催日>
```
```
// 04/21のJavaScriptのイベントを検索
@bot JavaScript 0421 
```
```
// 04/21と04/22のJavaScriptとPythonのイベントを検索
@bot JavaScript 0421 0422 Python
```
* 東京に限定しての検索になります
* 最大で10件表示します
## 導入
enable
* Incoming Webhooks
* Event Subscription
  * Subscribe to Bot Events
    * app_mention
* Bots
* Permissions
  * Scopes
    * channels:history
    * channels:read
    * channels:write
    * chat:write:bot
    

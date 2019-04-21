// Incoming WebhooksのURL
var INCOMING_URL = '';
var BOT_ID = '';

var CONNPASS_URL = 'https://connpass.com/api/v1/event/';

function doPost(e) {
  var postData = JSON.parse(e.postData.getDataAsString());

  // Event Subscriptionsでの検証
  if(postData.type == 'url_verification') {
    return ContentService.createTextOutput(postData.challenge);
  } 
  
  if　(postData.type == 'event_callback'){
    // 複数回叩かれる対策
    var cache = CacheService.getScriptCache();
    var cacheKey = postData.event.ts; // タイムスタンプをキーに
    var cached = cache.get(cacheKey); // {cacheKey:}
    if (cached != null) {
      return;
    }
    cache.put(cacheKey, true, 600); // {cacheKey:true} 10min保持

    var obj = toObj(postData.event.text);
    var res = getConnpass(obj);
    var msgs = createMessage(res);
    msgs.forEach(function(msg){
      reply(msg);
    });
    return;
  }
  return;
}

// テキストをキーワードと開催日に分けたオブジェクトにして返す
function toObj(text){
  var re = new RegExp('<@' + BOT_ID + '>','g');
  var words = text.replace(re,'').trim().split(' ');
  var keyword = '';
  var date = '';
  words.forEach(function(word){
    if (/\d{4}/.test(word)){
      var year = new Date().getFullYear();
      var month = word.charAt(0)+word.charAt(1);
      var day = word.charAt(2)+word.charAt(3);
      if(new Date() - new Date(year,month-1,day) < 0){
        date += (year + 1) + word + ',';
      }else{
        date += year + word + ',';
      }
    }else{
      keyword += word + ',';
    }
  });

  return {
    "keyword":keyword.slice(0,-1),
    "ymd":date.slice(0,-1)
  }
}

function getConnpass(arg){
  var requestUrl = CONNPASS_URL+'?';

  var query = {
    "keyword_or":"東京都,Tokyo",
    "count":"10",
    "order":"2",
    "ymd":arg.ymd,
    "keyword":arg.keyword
  }
  Object.keys(query).forEach(function(key){
    requestUrl += key + '=' + query[key] + '&';
  });
  requestUrl = requestUrl.slice(0,-1)

  var response = UrlFetchApp.fetch(requestUrl);

  return JSON.parse(response.getContentText());
}

function createMessage(res){
  var msgs = [];
  res.events.forEach(function(event){
    var date = new Date(event.started_at);
    var dateStr = date.getFullYear()+'/'+(date.getMonth()+1)+'/'+date.getDate();

    var msg = '[' + dateStr + ']' + event.title + '\n' + event.event_url;
    msgs.push(msg);
  });
  return msgs;
}

function reply(msg){
  var messageData = {
    'text': msg
  };
  
  var options = {
    'method'  : 'POST',
    'headers' : {'Content-type': 'application/json'},
    'payload' : JSON.stringify(messageData)
  };

  return UrlFetchApp.fetch(INCOMING_URL, options); 
}

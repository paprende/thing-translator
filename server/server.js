const express = require('express');
const app = express();

const request = require('request');
const streamBuffers = require("stream-buffers");

const translate = (languageLocale, word, callback) => {
  const url = `http://translate.google.com/translate_tts?ie=UTF-8&total=1&idx=0&textlen=3&client=tw-ob&q=${encodeURIComponent(word)}&tl=${languageLocale}`;

  console.log(url);

  const myWritableStreamBuffer = new streamBuffers.WritableStreamBuffer({
    initialSize: (100 * 1024),      // start as 100 kilobytes.
    incrementAmount: (10 * 1024)    // grow by 10 kilobytes each time buffer overflows.
  });

  const r = request(url, function (error, response, buffer) {
    if (!error && response.statusCode == 200) {
      var data = myWritableStreamBuffer.getContents().toString('base64');
      var result = {'audio' : data, 'success' : true };
      callback(result);
    } else {
      var result = {'success' : false, 'error' : error, 'responseCode' : response.statusCode };
      callback(result);
    }
  }).pipe(myWritableStreamBuffer);
}

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.get('/translate/:text/:lang', (req, res) => {
  translate(req.params.lang, req.params.text, (result) => {
    if (result.success) {
      res.send(result.audio);
    } else {
      res.send(404);
    }
  });
})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
})

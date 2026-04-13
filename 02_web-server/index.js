const http = require('http');

const myServer = http.createServer((req, res) => {
    res.end("response is served")
});


myServer.listen(4000, 'localhost', ()=>{
    console.log("Server is started");
})
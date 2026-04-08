const http = require('http');
const fs = require('fs');
const { json } = require('stream/consumers');
const { error } = require('console');


function writeNote(req, res) {
    let data = ""
    req.on("data", (chunk) => {
        data += chunk.toString();
    });
    req.on('end', () => {
        try {
            const note = JSON.parse(data)
            fs.readFile('notes.json', 'utf-8', (err, fileData) => {
                let notes = []
                if (!err && fileData) {
                    notes = JSON.parse(fileData);
                }
                notes.push(note);
                fs.writeFile('notes.json', JSON.stringify(notes, null, 2), (err) => {
                    if (err) {
                        res.writeHead(400, { 'Content-Type': 'application/json' });
                        return res.end(JSON.stringify({ message: "File is not Created", error: err.message }))
                    }
                    res.writeHead(201, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: "File written successfully", data: note }))
                })
            })

        } catch (err) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: `Invalid JSON : ${err.message}` }))
        }
    });
}

function getNote(req, res) {
    fs.readFile('notes.json', (err, data) => {
        if (err) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: `Error Reading File : ${err.message}` }))
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            message: "File Get successfully", data: JSON.parse(data)
        }));
        console.log(data.toString());

    })
}

function editNote(req, res) {
    let reqData = "";
    req.on('data', (chunk) => {
        reqData = reqData + chunk.toString();
        console.log("reqData data : ", reqData);
    });

    req.on('end', () => {
        fs.readFile('notes.json', 'utf8', (err, data) => {
            if (err) {
                return res.end(JSON.stringify({ message: `Error Reading File : ${err.message}`, error: err.message }))
            }
            let parsedFileData = JSON.parse(data);
            let parsedReqData = JSON.parse(reqData);

            console.log("parsedFileData : ", parsedFileData);
            console.log("parsedReqData : ", parsedReqData);

            for (let i = 0; i < parsedFileData.length; i++) {
                if (parsedFileData[i].id === parsedReqData.id) {
                    parsedFileData.splice(i, 1);
                    parsedFileData.push(parsedReqData)
                    console.log("parsedFileData in if: ", parsedFileData);
                    return;
                } else {
                    parsedFileData.push(parsedReqData);
                }
            }
            console.log("parsedFileData out for: ", parsedFileData);
            fs.writeFile('notes.json', JSON.stringify(parsedFileData, null, 2), (err) => {
                if (err) console.error(err);
            })
        });
    });

    console.log(`${req.method} Called in editNote`);
    console.log("My name is pratik");
}

let route = {
    "/note:POST": writeNote,
    "/note:GET": getNote,
    "/note:PUT": editNote
}

const myServer = http.createServer((req, res) => {
    const routeKey = `${req.url}:${req.method}`;
    const handler = route[routeKey];

    if (handler) {
        handler(req, res);
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end(JSON.stringify({ message: "Route Not Found" }));
    }
})

myServer.listen('1234', () => {
    console.log("Server is running");
})
var express = require( 'express' );
var mysql =  require('mysql');
var qs = require('querystring'); // process post data on request
var fs = require('fs');
var stream = require('stream');
var https = require('https');
var os = require('os');

var helper = require('./server/helper.js');
var userMng = require('./server/user.js');
var authMng = require('./server/auth.js');
var projectMng =  require('./server/projects.js');

var app = express();
production = false;

if (os.hostname() == 'bottrack')
{
    //console.log('production');
    production = true;
}

botTrack = {fileCache:{},trackingCache:{}};
users = [];
serverGlobals = {secret:'33YXSZADN345',port:8080};

connection = mysql.createConnection({
    host     : '104.155.2.95',
    user : 'root',
    password : "EttlingenBaka",
    database:'bottrack_db'
});

connection.connect(function(err)
{
    console.log('DB Connected');
    if (err)
    {
        console.log(err);
    }
});


app.use('/tmp', express.static(__dirname + "/tmp"));
app.use('/routes', express.static(__dirname + "/routes"));
app.use('/templates', express.static(__dirname + "/templates"));
app.use('/scss', express.static(__dirname + "/scss"));
app.use('/helper', express.static(__dirname + "/helper"));
app.use('/views', express.static(__dirname + "/views"));
app.use('/libs', express.static(__dirname + "/libs"));
app.use('/build', express.static(__dirname + "/build"));
app.use('/assets', express.static(__dirname + "/assets"));
app.use('/font', express.static(__dirname + "/font"));
app.use('/app.js', express.static(__dirname + "/app.js"));
app.use('/D27517029A4294C9950D60F0B395B012.txt', express.static(__dirname + "/D27517029A4294C9950D60F0B395B012.txt"));
serverGlobals.port = process.env.PORT || serverGlobals.port;

var useHTTPs = false;
if (useHTTPs)
{
    var options =
    {
        //ca: fs.readFileSync('crt/bot-track_com.ca-bundle'),
        key: fs.readFileSync('crt/server.enc.key'),
        cert: fs.readFileSync('crt/bot-track_com.crt'),
        passphrase:'36X)KMXqie'
    };

    // Server with https
    var server = https.createServer(options, app).listen(serverGlobals.port, function ()
    {
        console.log("Express listening on port " + serverGlobals.port);
    });
}
else
{
    // For server without https
    var server = app.listen(serverGlobals.port ,'0.0.0.0',function ()
    {
        //console.log('server up at',serverGlobals.port);
    });
}

app.get('/', function (req, res)
{
    console.log('Incoming Req');
    res.sendFile(__dirname + '/index.html',function (err)
    {
    });
});

app.get('/home', function (req, res)
{
    res.sendFile(__dirname + '/index.html',function (err)
    {
    });
});

app.get('/register', function (req, res)
{
    res.sendFile(__dirname + '/server/routes/register.html',function (err)
    {
    });
});

app.get('/login', function (req, res)
{
    res.sendFile(__dirname + '/server/routes/login.html',function (err)
    {
    });
});

app.get('/register.html', function (req, res)
{
    res.sendFile(__dirname + '/server/routes/register.html',function (err)
    {
    });
});

app.get('/login.html', function (req, res)
{
    res.sendFile(__dirname + '/server/routes/login.html',function (err)
    {
    });
});

app.post('/receiveVisits', function(req, res)
{
    processRequest(req, function(data)
    {
        //Validate Request
        // Insert into DB
        console.log('Received Visit',data);
        botTrack.validateVisit(data,function (valid,msg)
        {
            if (valid)
            {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({reply:'success'}))
            }
            else
            {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({reply:'fail',msg:msg}))
            }
        })
    })

})

app.get('/generateTracking', function(req, res)
{
    console.log('projectAPIKey',req.query.projectAPIKey);
    var noFile;
    noFile = function ()
    {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({Error:'No file found'}));
    }

    var projectAPIKey = req.query.projectAPIKey;

    if (!projectAPIKey || projectAPIKey == '')
    {
        noFile();
        return;
    }
    var code = botTrack.trackingCache[projectAPIKey];
    if (code)
    {
        res.setHeader('Content-disposition', 'attachment; filename='+projectAPIKey+'.php');
        res.setHeader('Content-type', 'application/php');
        var s = new stream.Readable();
        s.push(code);
        s.push(null);
        s.on('end',function ()
        {
            console.log('Download done');
            delete botTrack.trackingCache[projectAPIKey];
        })
        s.pipe(res);
    }
    else
    {
        noFile();
    }
})

app.get('/export', function(req, res)
{
    console.log(req.query.file);
    var noFile;
    noFile = function ()
    {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({Error:'No file found'}));
    }

    if (!req.query.file || req.query.file == '')
    {
        noFile();
        return;
    }
    if (botTrack.fileCache[req.query.file])
    {
        res.setHeader('Content-disposition', 'attachment; filename='+req.query.file);
        res.setHeader('Content-type', 'text/csv');
        var s = new stream.Readable();
        //s._read = function noop() {}; // redundant? see update below
        s.push(botTrack.fileCache[req.query.file]);
        s.push(null);

        s.on('end',function ()
        {
            //console.log('Download done');
            delete botTrack.fileCache[req.query.file];
        })

        s.pipe(res);
    }
    else
    {
        noFile();
    }
});

app.post('/server.js', function(req, res,next)
{
    processRequest(req, function(data)
    {
        var data = JSON.parse(data.data);
        //console.log(req);
        //console.log(data);


        // <editor-fold desc="NO LOGIN REQUIRED">

        if (data.action === "auth")
        {
            if (data.subAction === "checkEmail")
            {
                authMng.checkMailAvailability(data.emailValue,function (response)
                {
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify(response));
                });
            }
            if (data.subAction === "registerUser")
            {
                authMng.doRegister(data.emailVal,data.pwVal, function(response)
                {
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify(response));
                });
            }
            if (data.subAction === "sendLoginData")
            {
                authMng.doLogin(data.emailVal,data.pwVal, function(response)
                {
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify(response));
                });
            }
        }

        // </editor-fold>


        // <editor-fold desc="LOGIN REQUIRED">

        if (data.token)
        {
            //console.log('Token to validate',data.token);
            var customer_id = authMng.isValidToken(data.token);
            if (customer_id)
            {
                //console.log('Valid Token!');
                if (data.action == 'project')
                {
                    ProjectRouter(data,customer_id,res);
                }
                if (data.action == 'user')
                {
                    UserRouter(data,customer_id,res);
                }
            }
            else
            {
                console.log('Token not valid',customer_id);
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({reply:'UNAUTHORIZED_REQUEST'}));
            }
        }
        else
        {
            if (!res.headersSent && data.action != 'auth')
            {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({reply:'UNAUTHORIZED_REQUEST'}));
            }
        }


        // </editor-fold>

    })
})


botTrack.getUserById = function (id)
{
    for (var s=0;s<global.users.length;s++)
    {
        if (global.users[s].customer_id == id)
        {
            return global.users[s];
        }
    }
    return false;
}

botTrack.validateVisit = function (data,cb)
{
    if (!data.projectAPIKey)
    {
        cb(false,'');
        return;
    }
    if (data.projectAPIKey.length != 20)
    {
        cb(false,'unvalid length of key');
        return;
    }
    connection.query('SELECT * FROM projects WHERE projectAPIKey = ' + connection.escape(data.projectAPIKey) + ' ', function (err, rows, fields)
    {
        //console.log('rows',rows);
        if (rows.length == 1)
        {
            var project = rows[0];
            connection.query('INSERT INTO visits (url,bot_ip,date,project_id) VALUES ('+connection.escape(data.url)+','+connection.escape(data.bot_ip)+',CURRENT_TIMESTAMP,'+connection.escape(project.project_id)+') ', function (err, rows, fields)
            {
                cb(true);
            });
        }
        else
        {
            cb(false,'no project found for key')
        }
    });
}

// Load customers into cache
connection.query('SELECT * FROM customer' , function(err, result)
{
    //console.log(result);
    users = result;
    //console.log(users);
});


var processRequest = function(req, callback) {
    var body = '';
    req.on('data', function (data) {
        body += data;
    });
    req.on('end', function () {
        callback(qs.parse(body));
    });
}



var os = require("os");
//console.log(os.hostname());
//console.log(process);


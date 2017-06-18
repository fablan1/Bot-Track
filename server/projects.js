/**
 * Created by Max on 10/02/16.
 */

ProjectMng = function (customer_id)
{
    this.customer_id = customer_id;
    return this;
};

ProjectRouter = {};
var fs = require('fs');
var request = require('request');
var stream = require('stream');

ProjectMng.prototype.getProjectVisitsByProjectIDAndDate = function (project_id,start,end,cb)
{
    start = helper.date.toMySQLDateFormat(start);
    end = helper.date.toMySQLDateFormat(end);
    console.log('Start',start,'End',end);
    var query = 'SELECT * FROM visits WHERE project_id = ' + connection.escape(project_id) + ' AND DATE(date) >= '+connection.escape(start) +' AND DATE(date) <= '+connection.escape(end);
    //console.log(query);
    connection.query(query, function (err, rows, fields)
    {
        //console.log('visits',rows);
        cb(rows);
    });
}

ProjectMng.prototype.getProjectVisits = function (project_id,cb)
{
    connection.query('SELECT * FROM visits WHERE project_id = ' + connection.escape(project_id) + ' ', function (err, rows, fields)
    {
        //console.log('visits',rows);
        cb(rows);
    });
}

ProjectMng.prototype.getProject = function (project_id,start,end,cb)
{
    console.log('Request for Project with id',project_id);
    connection.query('SELECT * FROM projects WHERE project_id = ' + connection.escape(project_id) + ' ', function (err, rows, fields)
    {
        var project = rows[0];
        project.visits = [];
        project.topVisitURLs = [];
        connection.query('SELECT v.url, COUNT(v.url) AS visits FROM visits v WHERE v.project_id = ' + connection.escape(project_id) + ' GROUP BY v.url ORDER BY visits DESC LIMIT 5', function (err, topVisitURLs, fields)
        {
            //console.log(topVisitURLs);
            project.topVisitURLs = topVisitURLs;
            this.getProjectVisitsByProjectIDAndDate(project_id,start,end,function (visits)
            {
                project.visits = visits;
                cb(project);
            })
        }.bind(this));
    }.bind(this));
}

ProjectMng.prototype.getProjects = function (cb)
{
    //console.log('Request for Projects for Customer',customer_id);
    connection.query('SELECT * FROM projects WHERE customer_id = ' + connection.escape(this.customer_id) + ' ', function (err, rows, fields)
    {
        //console.log(rows);
        cb(rows)
    });
}

ProjectMng.prototype.deleteProject = function (project_id,cb)
{
    //delete First Projects in Table Projects
    connection.query('DELETE FROM projects WHERE project_id = '+connection.escape(project_id)+' ' , function(err, deletedResult)
    {
        console.log("deletedResult" ,deletedResult);
        if (deletedResult.affectedRows == 1)
        {
            connection.query('DELETE FROM visits WHERE project_id = '+connection.escape(project_id)+' ' , function(err, deletedResult)
            {
                cb('success');
            });
        }
        else
        {
            cb('fail');
        }
    });
}

ProjectMng.prototype.createProject = function (project,cb)
{
    console.log('Create Project',project);
    connection.query('INSERT INTO projects (title,customer_id,domain,projectAPIKey) VALUES ('+connection.escape(project.title)+','+connection.escape(this.customer_id)+','+connection.escape(project.domain)+','+connection.escape(project.projectAPIKey)+')' , function(err, res)
    {
        cb(res.insertId);
    });
}

ProjectMng.prototype.exportToCSV = function (project_id,visits)
{
    var randomName = helper.randomString(10);
    var fileName = project_id+'_'+randomName+'.csv';
    var url = "export?file="+fileName;
    var csvString = 'visit_id,url,bot_ip,date,project_id \n';
    for (var s=0;s<visits.length;s++)
    {
        var visit = visits[s];
        csvString += visit.visit_id+','+ visit.url+','+ visit.bot_ip+','+ visit.date+','+ visit.project_id+'\n';
    }
    botTrack.fileCache[fileName] = csvString;
    return url;
}

ProjectMng.prototype.exportToJSON = function (project_id,visits)
{
    var randomName = helper.randomString(10);
    var fileName = project_id+'_'+randomName+'.json';
    var url = "export?file="+fileName;
    botTrack.fileCache[fileName] = JSON.stringify(visits);
    return url;
}

ProjectMng.prototype.testTrackingCode = function (url,projectAPIKey,cb)
{
    var path = url+'/'+projectAPIKey+'.php';
    console.log('Check Tracking code',path);
    request(path, function (error, response, body)
    {
        if (!error && response.statusCode == 200)
        {
            console.log('Tracking code found');
            cb('success');
        }
        else
        {
            console.log('Tracking code not found');
            cb('fail');
        }
    })
}

ProjectMng.prototype.generateTrackingCode = function (cb)
{
    fs.readFile('server/trackingSnippet/tracking.php','utf8',function (err,data)
    {
        if (err)
        {
            console.log(err);
            return;
        }
        // Insert user specific data
        var apiURL = '';
        if (production)
        {
            apiURL = helper.getServerIp()+'/receiveVisits';
        }
        else
        {
            apiURL = 'http://'+helper.getServerIp()+':'+serverGlobals.port+'/receiveVisits';
        }
        var projectAPIKey = helper.randomString(20);
        data = data.replace('/* API URL */',apiURL);
        data = data.replace('/* PROJECT_APIKEY */',projectAPIKey);
        botTrack.trackingCache[projectAPIKey] = data;
        var url = 'generateTracking/?projectAPIKey='+projectAPIKey;
        cb(url,projectAPIKey);
    })
}

/*projectMng.generateTrackingCode(function (code)
{
    console.log('Generated',code);
})*/

ProjectRouter = function (data,customer_id,res)
{
    var projectMng = new ProjectMng(customer_id);

    if (data.subAction == 'getProject')
    {
        var project_ID = data.project_id;
        var start = data.start;
        var end = data.end;

        //console.log('Start',start,'End',end);
        projectMng.getProject(project_ID,start,end,function (project)
        {
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify(project));
        })
    }

    if (data.subAction == 'getProjectVisits')
    {
        var project_ID = data.project_id;
        projectMng.getProjectVisits(project_ID,function (visits)
        {
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify(visits));
        })
    }

    if (data.subAction == 'getProjectVisitsByProjectIDAndDate')
    {
        var project_ID = data.project_id;
        var start = data.start;
        var end = data.end;
        projectMng.getProjectVisitsByProjectIDAndDate(project_ID,start,end,function (visits)
        {
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify(visits));
        })
    }

    if (data.subAction == 'getProjects')
    {
        projectMng.getProjects(function (projects)
        {
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify(projects));
        })
    }

    if (data.subAction === "createProject")
    {
        var project = data.project;
        //console.log("project", project);
        projectMng.createProject(project,function(project_id)
        {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({project_id:project_id}));
        });
    }

    if (data.subAction === "deleteProject")
    {
        var project_id = data.project_id;
        console.log("project_id", project_id);
        projectMng.deleteProject(project_id,function(response)
        {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({reply:response}));
        });
    }

    if (data.subAction == 'exportToCSV')
    {
        var project_ID = data.project_id;
        projectMng.getProjectVisits(project_ID,function (visits)
        {
            var url = projectMng.exportToCSV(project_ID,visits);
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify({url:url}));
        })
    }

    if (data.subAction == 'exportToJSON')
    {
        var project_ID = data.project_id;
        projectMng.getProjectVisits(project_ID,function (visits)
        {
            var url = projectMng.exportToJSON(project_ID,visits);
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify({url:url}));
        })
    }

    if (data.subAction == 'generateTrackingCode')
    {
        console.log('Generate Tracking');
        projectMng.generateTrackingCode(function (url,projectAPIKey)
        {
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify({url:url,projectAPIKey:projectAPIKey}));
        })
    }

    if (data.subAction == 'testTrackingCode')
    {
        var url = data.url;
        var projectAPIKey = data.projectAPIKey;
        //console.log('url',url,'projectAPIKey',projectAPIKey);
        projectMng.testTrackingCode(url,projectAPIKey,function (reply)
        {
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify({reply:reply}));
        })
    }
}

module.exports = ProjectMng;
module.exports = ProjectRouter;
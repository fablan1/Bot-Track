
var crypto = require('crypto');

UserMng = function (customer_id)
{
    this.customer_id = customer_id;
}

UserRouter = {};

UserMng.prototype.deleteAccount = function (pw,cb)
{
    var sha256 = crypto.createHash("sha256");
    sha256.update(pw, "utf8");
    var PW_Hash = sha256.digest("base64");
    console.log('PW_Hash',PW_Hash,'customer_id',this.customer_id);
    connection.query('SELECT password FROM customer WHERE customer_id= '+connection.escape(this.customer_id)+ ' AND password = '+connection.escape(PW_Hash), function(err, result)
    {
        console.log("results" ,result);
        if(result.length === 1 )
        {
            var setDeleted = connection.query('UPDATE customer SET deleted = 1 WHERE customer_id =  '+connection.escape(this.customer_id)+ ' ' , function(err, deletedResult)
            {
                console.log("result" ,deletedResult);
                if (deletedResult.affectedRows ===1)
                {
                    cb('success');
                }
            }.bind(this));
        }
        else
        {
            cb('fail');
        }
    }.bind(this));
};

UserMng.prototype.checkOldPW = function (oldPw,cb)
{
    console.log("altes PW:",oldPw);
    var sha256 = crypto.createHash("sha256");
    sha256.update(oldPw, "utf8");
    var PW_HashOldPW = sha256.digest("base64");
    console.log("old PW HASH:",PW_HashOldPW,'customer_id',this.customer_id);
    connection.query('SELECT password FROM customer WHERE customer_id= '+connection.escape(this.customer_id)+ ' AND password = '+connection.escape(PW_HashOldPW), function(err, result)
    {
        if(result.length === 1 )
        {
            cb({reply: 'success'});
        }
        else
        {
            cb({reply:'fail'});
        }
    }.bind(this));
};

UserMng.prototype.setNewPw = function (newPW,cb)
{
    var sha256 = crypto.createHash("sha256");
    sha256.update(newPW, "utf8");
    var PW_HashNewPw = sha256.digest("base64");
    console.log('PW_HashNewPw',PW_HashNewPw,'customer_id',this.customer_id);
    connection.query('UPDATE customer SET password = '+connection.escape(PW_HashNewPw)+' WHERE customer_id =  '+connection.escape(this.customer_id)+ ' ' , function(err, newPwResult)
    {
        //console.log("new PW:" ,newPwResult);
        if (newPwResult.affectedRows ===1)
        {
            cb({reply: 'success'});
        }
        else
        {
            cb({reply:'fail'});
        }
    }.bind(this));
}


UserRouter = function (data,customer_id,res)
{
    var userMng = new UserMng(customer_id);
    if (data.subAction === "deleteAccount")
    {
        var pw = data.password;
        console.log("pw:",pw);
        userMng.deleteAccount(pw, function(response)
        {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({reply:response}));
        });
    }
    if (data.subAction === "checkOldPW")
    {
        var oldPw = data.oldPw;
        console.log("altes PW angekommen:", oldPw);

        userMng.checkOldPW(oldPw, function(response)
        {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({response:response}));
        });
    }
    if (data.subAction === "setNewPassword")
    {
        var CUSTOMERID = 5;
        var newPw = data.newPassword;
        console.log("altes PW angekommen:", oldPw);

        userMng.setNewPw(newPw, function(response)
        {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({response:response}));
        });
    }
}

module.exports = UserMng;
module.exports = UserRouter;


var crypto = require('crypto');
var jwt = require('jwt-simple');

var authMng = {};

authMng.checkMailAvailability = function (emailValue,cb)
{
     connection.query('SELECT email FROM customer WHERE email = '+connection.escape(emailValue)+' AND deleted != 1', function(err, result) {
        //  console.log(result);
        if (result.length ===0)
        {
            cb({reply:'success'});
        }
        else
        {
            cb({reply:'fail'});
        }
    });
}

authMng.doRegister = function (emailVal,pwVal,cb)
{
    var sha256 = crypto.createHash("sha256");
    sha256.update(pwVal, "utf8");
    var PW_Hash = sha256.digest("base64");

    console.log('Register PW_Hash',PW_Hash);
    connection.query('INSERT INTO customer (email,password) VALUES ('+ connection.escape(emailVal)+','+ connection.escape(PW_Hash)+')',function(err,result)
    {
        console.log('INSERT new customer',result);
        if(result.affectedRows == 1 )
        {
            //NodeMailer?
            botTrack.users.push({customer_id:result.insertId,email:emailVal,deleted:0});
            cb({reply:'success'});
        }
        else
        {
            cb({reply:'fail'});
        }
    });
}

authMng.doLogin = function (email,pwValue,cb)
{
    var sha256 = crypto.createHash("sha256");
    sha256.update(pwValue, "utf8");
    var PW_Hash = sha256.digest("base64");
    //console.log("email:", email);

    console.log('Login PW_Hash',PW_Hash,'email',email);
    connection.query('SELECT customer_id, email, password FROM customer WHERE email =  '+connection.escape(email)+' AND password = '+connection.escape(PW_Hash)+' AND deleted != 1' , function(err, result)
    {
        if(result.length == 1 )
        {
            var customer_id = result[0].customer_id;
            var token = jwt.encode(customer_id, global.serverGlobals.secret);
            console.log('Login successfull',customer_id,token);
            cb({reply: 'success', token:token});
        }
        else
        {
            console.log('User not found');
            cb({reply:'fail'});
        }
    });
};

authMng.isValidToken = function (token)
{
    try {
        var customerID = jwt.decode(token, global.serverGlobals.secret);
        var customerFound = botTrack.getUserById(customerID);
        //console.log("customer_ID:", customerID,'userFound',userFound);
        if (customerFound)
        {
            return customerID;
        }
        console.log('Customer not found',customerFound);
        return false;
    }
    catch(e)
    {
        return false;
    }
    return false;
}


module.exports = authMng;
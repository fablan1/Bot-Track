

helper.ajax = function ()
{


}

/**
 *
 * @param data
 * @param cb
 * @returns {XMLHttpRequest}
 */
helper.ajax.send = function (data,cb)
{
    var r = new XMLHttpRequest();
    r.open("POST", "server.js", true);
    r.onreadystatechange = function () {
        if (r.readyState != 4 || r.status != 200)
        {
            //console.log('ss');
        }
        else
        {
            var res = JSON.parse(r.responseText);

            if (res.reply == 'UNAUTHORIZED_REQUEST')
            {
                //console.log(res.reply,botTrack.token);
                window.location.href = 'login';
            }
            else
            {
                cb(res);
            }

        }
    };
    data.token = botTrack.token;
    r.send("data="+JSON.stringify(data));
    return r;
};

helper.ajax.download = function (url)
{
    var hiddenIFrameID = 'hiddenDownloader';
    var iframe = document.getElementById(hiddenIFrameID);
    if (iframe === null)
    {
        iframe = document.createElement('iframe');
        iframe.id = hiddenIFrameID;
        iframe.style.display = 'none';
        document.body.appendChild(iframe);
    }
    iframe.src = url;
}


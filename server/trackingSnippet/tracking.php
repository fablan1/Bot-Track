<?php
error_reporting(E_ALL);
$GLOBALS['server'] = '/* API URL */'; // bot-track.com/api
$GLOBALS['projectAPIKey'] = '/* PROJECT_APIKEY */';

function detectGoogleBot()
{
    $ip = $_SERVER["REMOTE_ADDR"];
    //$ip = "66.249.66.33";
    //$userAgent = $_SERVER["HTTP_USER_AGENT"];
    $ipFound = strpos($ip, "66.249.");
    //echo $IPfound;
    if ($ipFound !== false)
    {
        sendResponse();
    }
}

function sendResponse()
{
    $data = array('bot_ip' => $_SERVER["REMOTE_ADDR"],'url' => $_SERVER["REQUEST_URI"], 'userAgent' => $_SERVER["HTTP_USER_AGENT"], 'projectAPIKey' => $GLOBALS["projectAPIKey"]);
    // use key 'http' even if you send the request to https://...
    $options = array(
        'http' => array(
            'header'  => "Content-type: application/x-www-form-urlencoded\r\n",
            'method'  => 'POST',
            'content' => http_build_query($data),
        ),
    );
    $context  = stream_context_create($options);
    $result = file_get_contents($GLOBALS['server'], false, $context);
    //var_dump($result);
}
detectGoogleBot();
?>
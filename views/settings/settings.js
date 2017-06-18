botTrack.view.settings = function ()
{
    this.Type = 'settings';
}

botTrack.view.settings.prototype.init = function ()
{
    botTrack.setNavBar(false);

    this.DOM = {};
    console.log(botTrack.templates);
    var settings =  botTrack.templates.settings_view_settings();
    botTrack.DOM.content.innerHTML = settings;
    this.events();
}

botTrack.view.settings.prototype.deleteAccount = function ()
{
    var pwdelete = document.getElementById("deleteAcc").value;
    this.sendPWtoValidate(pwdelete);
}

botTrack.view.settings.prototype.sendPWtoValidate = function (pw)
{
    helper.ajax.send({action:'user',subAction:"deleteAccount",password:pw},function(res)
    {
        console.log(res);
        if (res.reply ==="success")
        {
            botTrack.setToken(false);
            document.getElementById("userFeedback").innerHTML ="Your account has been deleted";
            setTimeout(function()
            {
                window.location.reload();
            }, 1000);
        }
        else
        {
            document.getElementById("userFeedback").innerHTML ="Uups, an error has occurred. Please try Again";
        }
    });
}


botTrack.view.settings.prototype.checkForPW = function ()
{
    var newPwUserFeedback = helper.dom.getElementByClass('newPassword label');
    var newPwInp = helper.dom.getElementByClass('newPassword input');
    var newPwRepeatInp = document.getElementById("repeatNewPW");

    if(newPwInp.value != "" && newPwInp.value == newPwRepeatInp.value)
    {
        if(newPwInp.value.length < 6) {
            newPwInp.classList.add('invalid');
            newPwUserFeedback.setAttribute('data-error',botTrack.templates.settings_passwordValidation_userFeedback({type:'minLength'}));
            newPwInp.focus();
            return false;
        }
        re = /[0-9]/;
        if(!re.test(newPwInp.value)) {
            newPwInp.classList.add('invalid');
            newPwUserFeedback.setAttribute('data-error',botTrack.templates.settings_passwordValidation_userFeedback({type:'number'}));
            newPwInp.focus();
            return false;
        }
        re = /[a-z]/;
        if(!re.test(newPwInp.value)) {
            newPwInp.classList.add('invalid');
            newPwUserFeedback.setAttribute('data-error',botTrack.templates.settings_passwordValidation_userFeedback({type:'lowercase'}));
            newPwInp.focus();
            return false;
        }
        re = /[A-Z]/;
        if(!re.test(newPwInp.value)) {
            newPwInp.classList.add('invalid');
            newPwUserFeedback.setAttribute('data-error',botTrack.templates.settings_passwordValidation_userFeedback({type:'uppercase'}));
            newPwInp.focus();
            return false;
        }
    }
    else if (newPwInp.value != newPwRepeatInp.value)
    {
        newPwInp.classList.add('invalid');
        newPwUserFeedback.setAttribute('data-error',botTrack.templates.settings_passwordValidation_userFeedback({type:'equal'}));
        newPwInp.focus();
        return false;

    }
    else if (newPwInp.value == '')
    {
        newPwInp.classList.add('invalid');
        newPwUserFeedback.setAttribute('data-error',botTrack.templates.settings_passwordValidation_userFeedback({type:'empty'}));
        newPwInp.focus();
        return false;
    }
    return true;
}


botTrack.view.settings.prototype.checkIfOldPasswordIsValid = function (callback)
{
    var oldPassword = document.getElementById("oldPW").value;
    var oldPwUserFeedback = helper.dom.getElementByClass('oldPassword label');
    var oldPwInp = helper.dom.getElementByClass('oldPassword input');

    helper.ajax.send({action:'user',subAction:"checkOldPW",oldPw:oldPassword},function (response)
    {
        var answer = response;
        console.log(answer);

        if (answer.response.reply=== 'success')
        {
            callback(true);
        }
        else
        {
            oldPwInp.classList.add('invalid');
            oldPwUserFeedback.setAttribute('data-error','Wrong');
            callback(false);
        }

    });
}

botTrack.view.settings.prototype.handleUpdatePasswordClick = function()
{
    var newPassword = document.getElementById("newPW").value;
    var isNewPasswordValid = this.checkForPW();

    this.checkIfOldPasswordIsValid(function(isPasswordValid)
    {
        //console.log(isPasswordValid,isNewPasswordValid);
        if(isPasswordValid && isNewPasswordValid)
        {
            helper.ajax.send({action:'user',subAction:"setNewPassword",newPassword:newPassword},function(response)
            {
                    var answer = response;

                    if(answer.response.reply ==="success")
                    {
                        $('#changePWInformation').closeModal();
                        document.getElementById('userFeedback').innerHTML ="password change successfull";
                    }
                }
            );
        }
    });
}

botTrack.view.settings.prototype.events = function ()
{
    $('.modal-trigger').leanModal();
    document.getElementById("deleteAccount").addEventListener("click",this.deleteAccount.bind(this));
    document.getElementById("changePW").addEventListener("click",this.handleUpdatePasswordClick.bind(this));
}




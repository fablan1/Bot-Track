function checkPW(form)
{
    var pwdValElement =  helper.dom.getElementByClass("password-validation");
    var pw = document.getElementById("pwd1");
    var pw2 = document.getElementById("pwd2");
   
    if(pw.value != "" && pw.value == pw2.value)
    {
        if(pw.value.length < 6)
        {
            pwdValElement.innerHTML = "Passwort muss mind. sechs Zeichen beinhalten";
            pw.focus();
            return false;
        }
        re = /[0-9]/;
        if(!re.test(pw.value))
        {
            pwdValElement.innerHTML = "Passwort muss mind. eine Nummer enthalten";
            pw.focus();
            return false;
        }
        re = /[a-z]/;
        if(!re.test(pw.value))
        {
            pwdValElement.innerHTML = "Password muss mind. einen Kleinbuchstaben enthalten (a-z)!";
            pw.focus();
            return false;
        }
        re = /[A-Z]/;
        if(!re.test(pw.value))
        {
            pwdValElement.innerHTML = "Password muss mind. einen Großbuchstaben enthalten (A-Z)!";
            pw.focus();
            return false;
        }
    } else
    {
        pwdValElement.innerHTML = "Bitte prüfe ob du das richtige Password eingegeben hast";
        pw.focus();
        return false;
    }
    return true;
}

function checkIfEMailExists(callback)
{
    var emailEl = document.getElementById("email");
    var eMailMessage =  helper.dom.getElementByClass("email-validation");

    console.log('emailValue',emailEl.value);
    if(emailEl.value == "")
    {
        eMailMessage.innerHTML = "E-Mail Feld darf nicht leer sein";
        return false;
    }

    // johnny@bot-track.com
    var valid = validateEmail(emailEl.value);
    //console.log('valid email',valid);
    if (valid)
    {
        var r = new XMLHttpRequest();
        r.open("POST", "server.js", true);
        r.onreadystatechange = function () {
            if (r.readyState != 4 || r.status != 200) return;

            //console.log("Success: " + r.responseText);

            var eMail = JSON.parse(r.responseText);

            // console.log(eMail);

            if (eMail.reply == 'success')
            {
                eMailMessage.innerHTML = "Alles klar, diese E-Mail wird noch nicht verwendet";
                eMailMessage.style.color ="#26a69a";
            }
            else
            {
                eMailMessage.innerHTML = "E-Mail wird bereits verwendet";
            }
            callback(eMail.reply);
        };
        r.send("data="+JSON.stringify({action:'auth',subAction:"checkEmail",emailValue: emailEl.value}));

    }
    else
    {
        eMailMessage.innerHTML = "E-mail ist nicht gültig";
        return false;
    }
}


function checkForm ()
{
    var emailValid = false;
    var passwordValid = false;
     passwordValid = checkPW();

    checkIfEMailExists(function (reply)
    {
        if (reply == 'success')
        {
            emailValid = true;
        }
        else
        {
            emailValid = false;
        }

        console.log('emailValid',emailValid,'passwordValid',passwordValid);
        if (emailValid && passwordValid)
        {
            var emailVal = document.getElementById("email").value;
            var pwVal = document.getElementById("pwd1").value;
            registerUser(emailVal,pwVal);
        }
        else
        {
            console.log('not valid');
        }
    })
}

function registerUser(emailVal,pwVal)
{
    var r = new XMLHttpRequest();
    r.open("POST", "server.js", true);
    r.onreadystatechange = function ()
    {
        if (r.readyState != 4 || r.status != 200) return;

        //var responseText = "{reply:'success'}));";
        var responseRegister = JSON.parse(r.responseText);

        var userFeedBack =  helper.dom.getElementByClass("password-validation");

        if (responseRegister.reply === "success")
        {
            userFeedBack.innerHTML = "Registrierung erfolgreich";
            userFeedBack.style.color ="#26a69a";
            setTimeout(function ()
            {
                window.location.href = 'login';
            },1000)
        }
        else
        {
            userFeedBack.innerHTML = "Registrierung nicht erfolgreich";
        }
    };

    r.send("data="+JSON.stringify({action:'auth',subAction:"registerUser",emailVal: emailVal, pwVal: pwVal}));
}

function validateEmail(email)
{
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

function initParticles ()
{
    particlesJS("particles-js", {
        "particles": {
            "number": {
                "value": 80,
                "density": {
                    "enable": true,
                    "value_area": 800
                }
            },
            "color": {
                "value": "#ffffff"
            },
            "shape": {
                "type": "circle",
                "stroke": {
                    "width": 0,
                    "color": "#000000"
                },
                "polygon": {
                    "nb_sides": 5
                },
                "image": {
                    "src": "img/github.svg",
                    "width": 100,
                    "height": 100
                }
            },
            "opacity": {
                "value": 0.5,
                "random": false,
                "anim": {
                    "enable": false,
                    "speed": 1,
                    "opacity_min": 0.1,
                    "sync": false
                }
            },
            "size": {
                "value": 3,
                "random": true,
                "anim": {
                    "enable": false,
                    "speed": 40,
                    "size_min": 0.1,
                    "sync": false
                }
            },
            "line_linked": {
                "enable": true,
                "distance": 150,
                "color": "#ffffff",
                "opacity": 0.4,
                "width": 1
            },
            "move": {
                "enable": true,
                "speed": 6,
                "direction": "none",
                "random": false,
                "straight": false,
                "out_mode": "out",
                "bounce": false,
                "attract": {
                    "enable": false,
                    "rotateX": 600,
                    "rotateY": 1200
                }
            }
        },
        "interactivity": {
            "detect_on": "canvas",
            "events": {
                "onhover": {
                    "enable": true,
                    "mode": "grab"
                },
                "onclick": {
                    "enable": true,
                    "mode": "push"
                },
                "resize": true
            },
            "modes": {
                "grab": {
                    "distance": 140,
                    "line_linked": {
                        "opacity": 1
                    }
                },
                "bubble": {
                    "distance": 400,
                    "size": 40,
                    "duration": 2,
                    "opacity": 8,
                    "speed": 3
                },
                "repulse": {
                    "distance": 200,
                    "duration": 0.4
                },
                "push": {
                    "particles_nb": 4
                },
                "remove": {
                    "particles_nb": 2
                }
            }
        },
        "retina_detect": true
    });
}


initParticles();

// SET EventListener register-HTML
document.getElementById("register").addEventListener("click",checkForm);
document.getElementById("email").addEventListener("blur", function(e)
{
    console.log(e);
    var emailValue = document.getElementById("email").value;
    console.log(emailValue);
    checkIfEMailExists(function ()
    {
    });
});



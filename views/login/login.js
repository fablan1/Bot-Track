/**
 * Created by fabian on 10.02.16.
 */
function login() 
{
    var emailValue = document.getElementById("email").value;
    var pwValue = document.getElementById("pw").value;
    //console.log('Email',emailValue,'PW',pwValue);
    validateLogin(emailValue,pwValue);
}

function validateLogin(email,pwValue) 
{
        var r = new XMLHttpRequest();
        r.open("POST", "server.js", true);
        r.onreadystatechange = function () {
            if (r.readyState != 4 || r.status != 200) return;

            //var responseText = "{reply:'success'}));";
            var responseLogin = JSON.parse(r.responseText);
            console.log('responseLogin',responseLogin);
            var userFeedBack =  helper.dom.getElementByClass("login-validation");

            if (responseLogin.reply === "success")
            {
                userFeedBack.innerHTML = "Login erfolgreich";
                //console.log(responseLogin.token);
                saveTokenToLocalStorage(responseLogin.token);
                setTimeout(function ()
                {
                    window.location.href = 'home';
                },1000)
            }
            else
            {
                userFeedBack.innerHTML = "Password oder Email falsch";
            }
        };

        r.send("data="+JSON.stringify({action:'auth',subAction:"sendLoginData",emailVal: email, pwVal: pwValue}));
}

function saveTokenToLocalStorage (token)
{
    // Check browser support
    if (typeof(Storage) !== "undefined") 
    {
        // Store
        localStorage.setItem("Bottrack", token);
    } else {
        //Hier noch den Besucher benachrichtigen
        console.log("Sorry Local Storage wird nicht unterstützt");
    }
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
// SET EventListener Login-HTML

document.getElementById("login").addEventListener("click",login);
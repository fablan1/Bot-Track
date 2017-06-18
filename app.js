/**
 * Created by Max on 09/02/16.
 */


botTrack = function ()
{

}
botTrack.templates = {};

botTrack.view = function ()
{

}

botTrack.ui = function ()
{

}

botTrack.init = function ()
{
    botTrack.token = botTrack.getToken();
    botTrack.curProject = null;
    botTrack.DOM = {};
    botTrack.DOM.viewCont = document.getElementById('viewCont');
    botTrack.DOM.navBar = document.getElementById('navBar');
    botTrack.DOM.header = document.getElementById('header');
    botTrack.DOM.content = document.getElementById('content');
    botTrack.curView = new botTrack.view.projectsOverview();

    botTrack.events();
    //console.log(botTrack.curView);
    botTrack.curView.init();
}

botTrack.getToken = function ()
{
    var token = localStorage.getItem('Bottrack');
    if (token)
    {
        return token;
    }
    return null;

}

botTrack.setToken = function (token)
{
    if (token)
    {
        localStorage.setItem('Bottrack',token);
    }
    else
    {
        localStorage.removeItem('Bottrack')
    }
    return true;
}

botTrack.loadView = function (data)
{
    botTrack.DOM.content.innerHTML = '';

    if (botTrack.curView.Type =='projectsOverview')
    {
        botTrack.curProject = {};
        botTrack.curProject.project_id = data.project_id;
    }

    botTrack.curView = new data.view();

    if (botTrack.curView.Type =='projectsOverview' || botTrack.curView.Type == 'settings')
    {
        var selected = helper.dom.getElementByClass('active',botTrack.DOM.header);
        if (selected)
        {
            selected.classList.remove('active');
        }
        var newSelected = helper.dom.getElementByClass(botTrack.curView.Type,botTrack.DOM.header);
        if (newSelected)
        {
            newSelected.classList.add('active');
        }
    }
    //console.log(botTrack.curView);

    botTrack.curView.init();
}

botTrack.setNavBar = function (show,selected)
{
    if (show)
    {
        botTrack.DOM.navBar.setAttribute('data-active',1);
    }
    else
    {
        botTrack.DOM.navBar.setAttribute('data-active',0);
    }

    if (selected)
    {
        var activeMenu = helper.dom.getElementByClass('menu[data-active="1"]',botTrack.DOM.navBar);
        if (activeMenu)
        {
            activeMenu.removeAttribute('data-active');
        }
        var newActiveMenu = helper.dom.getElementByClass('menu[data-type="'+selected+'"]',botTrack.DOM.navBar);
        //console.log(newActiveMenu);
        if (newActiveMenu)
        {
            newActiveMenu.setAttribute('data-active',1);
        }
    }
}

var templates = ['global','settings'];
helper.templates.loadTemplatesIntoCache(templates,'templates/',function ()
{
    botTrack.init();
});

botTrack.events = function ()
{
    botTrack.DOM.header.addEventListener('click',function (e)
    {
        console.log(e);
        var projectsOverview = helper.dom.getAncestorByClass(e.target,'projectsOverview');
        var settings = helper.dom.getAncestorByClass(e.target,'settings');
        if (projectsOverview)
        {
            botTrack.loadView({view:botTrack.view.projectsOverview});
        }

        if (settings)
        {
            botTrack.loadView({view:botTrack.view.settings});
        }

        if (e.target.classList.contains('logout'))
        {
            botTrack.doLogout();
        }
    });
}

botTrack.doLogout = function ()
{
    console.log('Do Logout');
    botTrack.setToken(false);
    window.location.href = 'login';
}


Handlebars.registerHelper('ifCond', function(v1, v2, options) {
    if(v1 === v2) {
        return options.fn(this);
    }
    return options.inverse(this);
});

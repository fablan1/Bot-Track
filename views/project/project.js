botTrack.view.project = function ()
{

}

botTrack.view.project.init = function ()
{
    botTrack.DOM.navBar.removeEventListener('click',botTrack.view.project.handleNavBarClick);
    botTrack.DOM.navBar.addEventListener('click',botTrack.view.project.handleNavBarClick);
}

botTrack.view.project.handleNavBarClick = function (e)
{
    //console.log(e);
    if (e.target.getAttribute('data-type') == 'dashboard')
    {
        botTrack.loadView({view:botTrack.view.project.dashboard});
    }
    if (e.target.getAttribute('data-type') == 'details')
    {
        botTrack.loadView({view:botTrack.view.project.details});
    }
}
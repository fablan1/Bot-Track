botTrack.view.project.details = function ()
{
    this.Type = 'projectDetails';
    console.log('Project Details !');
}

botTrack.view.project.details.prototype.init = function ()
{
    botTrack.view.project.init();
    botTrack.setNavBar(true,'details');

    this.visitsPerPage = 10;
    this.DOM = {};
    var projectDetails =  botTrack.templates.global_project_details();
    botTrack.DOM.content.innerHTML = projectDetails;

    this.DOM.project = helper.dom.getElementByClass('project',botTrack.DOM.content);
    this.DOM.visitsContWrp = helper.dom.getElementByClass('visitsCont .wrapper',botTrack.DOM.content);
    this.DOM.paginationCont = helper.dom.getElementByClass('paginationCont',botTrack.DOM.content);

    this.getProjectVisits();
    this.events();
}


botTrack.view.project.details.prototype.getProjectVisits = function ()
{
    console.log('project_id',botTrack.curProject.project_id);
    helper.ajax.send({
            action:"project",
            subAction:"getProjectVisits",
            project_id:botTrack.curProject.project_id},
        function (visits)
        {
            //console.log(visits);
            this.visits = visits;
            visits = visits.slice(0,this.visitsPerPage);
            this.renderVisits(visits);

            var numPages = Math.ceil(this.visits.length / this.visitsPerPage);
            var pages = '';
            var active = true;
            for (var s=0;s<numPages;s++)
            {
                var page =  botTrack.templates.global_project_details_paginationPage({active:active,page:s+1});
                pages += page;
                active = false;
            }
            this.DOM.paginationCont.innerHTML = pages;
        }.bind(this))
}


botTrack.view.project.details.prototype.renderVisits = function (visits)
{
    this.DOM.visitsContWrp.innerHTML = '';
    var visitsString = '';
    for (var s=0;s<visits.length;s++)
    {
        var visit = visits[s];
        var date = new Date(visit.date);
        var context = {url: visit.url, date: helper.date.format(date,'dd. MM yyyy') };
        visitsString +=  botTrack.templates.global_project_visit_details(context);
    }
    this.DOM.visitsContWrp.innerHTML = visitsString;
}


botTrack.view.project.details.prototype.events = function ()
{
    this.DOM.project.addEventListener('click',function (e)
    {
        //console.log(e);
        var paginationCont = helper.dom.getAncestorByClass(e.target,'paginationCont');

        if (paginationCont)
        {
            if (e.target.classList.contains('page'))
            {
                var activePage = helper.dom.getElementByClass('active',this.DOM.paginationCont);
                activePage.classList.remove('active');
                activePage.classList.add('waves-effect');

                e.target.classList.remove('waves-effect');
                e.target.classList.add('active');

                var index = helper.dom.getIndexOfElement(e.target);
                //console.log('index',index);
                var visits = this.getVisitsByPage(index);
                this.renderVisits(visits);
            }
        }

        if (e.target.classList.contains('exportCSV'))
        {
            this.doExport('csv');
        }
        if (e.target.classList.contains('exportJSON'))
        {
            this.doExport('json');
        }
    }.bind(this));
}

botTrack.view.project.details.prototype.getVisitsByPage = function (page)
{
    var visits = [];
    var startVisit = this.visitsPerPage * page;
    //console.log(this.visits);
    var endVisit = startVisit+this.visitsPerPage;

    if (endVisit > this.visits.length)
    {
        endVisit = this.visits.length;
    }
    //console.log('startVisit',startVisit,'endVisit',endVisit);
    for (var s=startVisit;s<endVisit;s++)
    {
        visits.push(this.visits[s]);
    }
    return visits;
}

botTrack.view.project.details.prototype.doExport = function (type)
{
   //console.log('Export to csv');
    var action = 'exportToCSV';
    if (type == 'json')
    {
        action = 'exportToJSON';
    }
    helper.ajax.send({
            action:"project",
            subAction:action,
            project_id:botTrack.curProject.project_id},
        function (res)
        {
            console.log(res);
            helper.ajax.download(res.url);
        }.bind(this));
}
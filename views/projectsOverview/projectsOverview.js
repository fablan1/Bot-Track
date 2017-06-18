botTrack.view.projectsOverview = function ()
{
    this.Type = 'projectsOverview';

}

botTrack.view.projectsOverview.prototype.init = function ()
{
    this.DOM = {};
    this.newProject = {};
    botTrack.setNavBar(false);
    //console.log('Projects Overview !');
    this.getProjects(function ()
    {

    }.bind(this));

}

botTrack.view.projectsOverview.prototype.getProjects = function ()
{
    var projectsCont = botTrack.templates.global_view_Projects();
    var createProjects  = botTrack.templates.global_model_createProject();
    botTrack.DOM.content.innerHTML = projectsCont;
    botTrack.DOM.content.innerHTML+= createProjects;
    this.DOM.projectsCont = helper.dom.getElementByClass('projectsCont');
    this.DOM.createProject = document.getElementById('createProject');
    this.DOM.createProject_title = document.getElementById('title');
    this.DOM.createProject_domain = document.getElementById('domain');
    this.DOM.modal_deleteProject = document.getElementById('deleteProject');
    helper.ajax.send({
        action:"project",
        subAction:"getProjects",
    },function (projects)
    {
        console.log('Projects',projects);
        var projectsElements ="";
        for (var i = 0; i< projects.length; i++)
        {
            var project = projects[i];
            var context = {title: project.title, domain: project.domain, project_id: project.project_id };
            projectsElements += botTrack.templates.global_project(context);
        }
        this.DOM.projectsCont.innerHTML = projectsElements;

        this.events();
    }.bind(this))
}

botTrack.view.projectsOverview.prototype.events = function ()
{
    $('.modal-trigger').leanModal();

    this.DOM.projectsCont.addEventListener('click',function (e)
    {
        //console.log(e);
        var project = helper.dom.getAncestorByClass(e.target,'project');
        //console.log(project);
        if (project != null)
        {
            if (e.target.classList.contains('showDetails'))
            {
                botTrack.loadView({view:botTrack.view.project.dashboard,project_id:project.getAttribute('data-id')})
            }
            if (e.target.classList.contains('delete'))
            {
                this.DOM.modal_deleteProject.setAttribute('data-id',project.getAttribute('data-id'));
                $('#deleteProject').openModal();
            }
        }
    }.bind(this));

    this.DOM.createProject.addEventListener('keyup',function (e)
    {
        //console.log(e);
    }.bind(this));

    this.DOM.createProject.addEventListener('click',function (e)
    {
        //console.log(e);
        if (e.target.classList.contains('create'))
        {
            if (this.validateNewProjectForm(e))
            {
                this.createProject();
            }
        }

        if (e.target.classList.contains('generateTracking'))
        {
            this.generateTrackingCode();
        }

        if (e.target.classList.contains('testTracking'))
        {
            this.testTrackingCode();
        }
    }.bind(this));

    this.DOM.modal_deleteProject.addEventListener('click',function (e)
    {
        if (e.target.classList.contains('delete'))
        {
            this.deleteProject(this.DOM.modal_deleteProject.getAttribute('data-id'));
        }
    }.bind(this));
}

botTrack.view.projectsOverview.prototype.createProject = function ()
{
    this.newProject.title = this.DOM.createProject_title.value;
    this.newProject.domain = this.DOM.createProject_domain.value;

    helper.ajax.send({
        action:"project",
        subAction:"createProject",
        project:this.newProject
    },function (res)
    {
        console.log('project_id',res.project_id,this.newProject);
        var projectsElement = botTrack.templates.global_project({title: this.newProject.title, domain: this.newProject.domain, project_id: res.project_id });
        this.newProject = false;
        this.DOM.projectsCont.innerHTML += projectsElement;
        $('#createProject').closeModal();
        this.events();
    }.bind(this))
}

botTrack.view.projectsOverview.prototype.deleteProject = function (project_id)
{
    helper.ajax.send({
        action:"project",
        subAction:"deleteProject",project_id:project_id},function (res)
    {
        //console.log('project_id',project_id);
        if (res.reply == 'success')
        {
            var projectEl = helper.dom.getElementByClass('project[data-id="'+project_id+'"]',this.DOM.projectsCont);
            //console.log(projectEl);
            helper.dom.remove(projectEl);
        }
    }.bind(this))

}

botTrack.view.projectsOverview.prototype.generateTrackingCode = function ()
{
    helper.ajax.send({
        action:"project",
        subAction:"generateTrackingCode"},function (res)
    {
        console.log('res',res);
        this.newProject.projectAPIKey = res.projectAPIKey;
        helper.ajax.download(res.url);
    }.bind(this))
}

botTrack.view.projectsOverview.prototype.testTrackingCode = function ()
{
    //this.newProject.projectAPIKey = 'b8q04kOH9LfdIjL7uePv';
    var url = this.DOM.createProject_domain.value;
    var uiFeedback = helper.dom.getElementByClass('testTrackingFeedback',this.DOM.createProject);
    helper.ajax.send({
        action:"project",
        subAction:"testTrackingCode",
        url:url,
        projectAPIKey:this.newProject.projectAPIKey},function (res)
    {
        console.log('reply',res);
        var feedback = '';
        if (res.reply == 'success')
        {
            this.newProject.trackingTestSuccess = true;
            uiFeedback.removeAttribute('data-error');
            feedback  = botTrack.templates.global_model_createProject_testTrackingFeedback({type:res.reply});
        }
        else
        {
            this.newProject.trackingTestSuccess = false;
            uiFeedback.setAttribute('data-error',1);
            feedback  = botTrack.templates.global_model_createProject_testTrackingFeedback({type:res.reply});
        }
        uiFeedback.innerHTML = feedback;
    }.bind(this))
}

botTrack.view.projectsOverview.prototype.validateNewProjectForm = function ()
{
    var valid = true;
    if (this.DOM.createProject_title.value == '')
    {
        this.DOM.createProject_title.classList.add('invalid');
        valid = false;
    }
    else
    {
        this.DOM.createProject_title.classList.remove('invalid');
    }

    if (this.validateDomain(this.DOM.createProject_domain.value))
    {
        this.DOM.createProject_domain.classList.remove('invalid');
    }
    else
    {
        console.log('invalid domain');
        this.DOM.createProject_domain.classList.add('invalid');
        valid = false;
    }

    if (!this.newProject.trackingTestSuccess)
    {
        helper.dom.getElementByClass('testTrackingFeedback',this.DOM.createProject).setAttribute('data-error',1);
        helper.dom.getElementByClass('testTrackingFeedback',this.DOM.createProject).innerHTML = botTrack.templates.global_model_createProject_testTrackingFeedback({type:'notUsed'});
        valid = false;
    }

    return valid;
}

botTrack.view.projectsOverview.prototype.validateDomain = function (val)
{
    if (val == '')
    {
        return false;
    }
    if (val.match(/^(https?:\/\/)?/))
    {
        return true;
    }
    return false
}
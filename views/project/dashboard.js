botTrack.view.project.dashboard = function ()
{
    this.Type = 'projectDashboard';
    this.DOM = {};
}

botTrack.view.project.dashboard.prototype.init = function ()
{
    botTrack.view.project.init();
    botTrack.setNavBar(true,'dashboard');
    this.getProject(function (){});
}

botTrack.view.project.dashboard.prototype.getProject = function ()
{
    //console.log('project_id',botTrack.curProject.project_id);
    this.start = new Date();
    this.end = helper.date.clone(this.start);
    this.end.setDate(this.end.getDate() + 7);

    helper.ajax.send({
        action:"project",
        subAction:"getProject",
        project_id:botTrack.curProject.project_id,
        start:this.start,
        end:this.end
    },
        function (project)
    {
        botTrack.curProject = project;
        console.log('Project',project);
        var projectsElements ="";
        var context = {title: project.title, domain: project.domain, project_id: project.project_id };
        projectsElements += botTrack.templates.global_project_dashboard(context);
        botTrack.DOM.content.innerHTML = projectsElements;

        this.DOM.chartCont = helper.dom.getElementByClass('chartCont',botTrack.DOM.content);
        this.DOM.chartCont_start = helper.dom.getElementByClass('start',this.DOM.chartCont);
        this.DOM.chartCont_end = helper.dom.getElementByClass('end',this.DOM.chartCont);
        this.DOM.KPICont = helper.dom.getElementByClass('KPICont',botTrack.DOM.content);
        this.DOM.visitsContWrapper = helper.dom.getElementByClass('visitsCont .wrapper',botTrack.DOM.content);

        this.DOM.KPIS = {};
        this.DOM.KPIS.average = helper.dom.getElementByClass('KPI[data-type="average"]',botTrack.DOM.content);
        this.DOM.KPIS.trend = helper.dom.getElementByClass('KPI[data-type="trend"]',botTrack.DOM.content);
        this.DOM.KPIS.yesterday = helper.dom.getElementByClass('KPI[data-type="yesterday"]',botTrack.DOM.content);

        this.setChartStart();
        this.setChartEnd();

        this.renderChart(botTrack.curProject.visits);
        this.renderKPIs();
        this.renderTopUrls();
        this.events();

    }.bind(this));
}




botTrack.view.project.dashboard.prototype.getProjectVisits = function ()
{
    console.log('start',this.start,'end',this.end);

    //console.log(this.start instanceof Date);
    if (!(this.start instanceof Date))
    {
        return;
    }
    if (!(this.end instanceof Date))
    {
        return;
    }

    helper.ajax.send({
            action:"project",
            subAction:"getProjectVisitsByProjectIDAndDate",
            project_id:botTrack.curProject.project_id,
            start:this.start.toISOString(),
            end:this.end.toISOString()},
        function (visits)
        {
            console.log('visits',visits);
            botTrack.curProject.visits = visits;
            //console.log('Render Chart');
            this.renderChart(visits);
            this.renderKPIs();
        }.bind(this))
}


botTrack.view.project.dashboard.prototype.renderChart = function (visits)
{
    this.DOM.chart = helper.dom.getElementByClass('chart',botTrack.DOM.Content);
    this.DOM.chartContext = this.DOM.chart.getContext('2d');

    var currentWeek = {};
    var startDate = helper.date.clone(this.start);
    var diff = this.end.getTime() - this.start.getTime();
    diff = diff/1000/60/60/24;
    //console.log('Diff in days',diff);
    if (diff < 31)
    {
        while(startDate.getTime() <= this.end.getTime())
        {
            currentWeek[helper.date.getIsoDate(startDate)] = {visits:[],date:helper.date.clone(startDate)};
            startDate.setDate(startDate.getDate()+1);
        }
    }
    else if (diff > 31 && diff < 180)
    {
        while(startDate.getTime() <= this.end.getTime())
        {
            currentWeek[helper.date.getIsoDate(startDate)] = {visits:[],date:helper.date.clone(startDate)};
            startDate.setDate(startDate.getDate()+7);
        }
    }
    else if (diff >= 180)
    {
        startDate.setDate(1);
        while(startDate.getTime() <= this.end.getTime())
        {
            currentWeek[helper.date.getIsoDate(startDate)] = {visits:[],date:helper.date.clone(startDate)};
            startDate.setDate(startDate.getDate()+30);
        }
    }


    // Group Visits by Date
    for (var s=0;s<visits.length;s++)
    {
        var visit = visits[s];
        visit.date = new Date(visit.date);
        var isoDate;
        isoDate = helper.date.getIsoDate(visit.date);
        if (currentWeek[isoDate])
        {
            currentWeek[isoDate].visits.push(visit);
        }
    }

    //console.log(currentWeek);
    var data = {
        labels: [],
        datasets: [
            {
                label: "My First dataset",
                fillColor: "rgba(220,220,220,0.2)",
                strokeColor: "rgba(220,220,220,1)",
                pointColor: "rgba(220,220,220,1)",
                pointStrokeColor: "#fff",
                pointHighlightFill: "#fff",
                pointHighlightStroke: "rgba(220,220,220,1)",
                data: []
            }
        ]
    };

    data.labels = [];
    data.datasets[0].data = [];
    for (var s in currentWeek)
    {
        data.labels.push(helper.date.format(currentWeek[s].date,'dd. M'));
        data.datasets[0].data.push(currentWeek[s].visits.length)
    }

    var options = {};
    this.DOM.chart.setAttribute('width',this.DOM.chartCont.getBoundingClientRect().width-60+'px');
    this.DOM.chart.setAttribute('height',this.DOM.chartCont.getBoundingClientRect().height-60+'px');
    if (this.lineChart)
    {
        this.lineChart.destroy();
    }
    this.lineChart = new Chart(this.DOM.chartContext).Line(data, options);
}


botTrack.view.project.dashboard.prototype.renderKPIs = function ()
{
    var diff = this.end.getTime() - this.start.getTime();
    diff = diff/1000/60/60/24;
    //console.log(botTrack.curProject);
    var visits = botTrack.curProject.visits.length;
    //console.log(visits);

    this.DOM.KPIS.average.children[0].innerHTML = (visits/diff).toFixed(2);



    var startDate = helper.date.clone(this.start);
    startDate.setDate(startDate.getDate() + diff/2);
    var visitsInFirstHalf = [];
    var visitsInSecondHalf = [];

    for (var s=0;s<botTrack.curProject.visits.length;s++)
    {
        if (botTrack.curProject.visits[s].date.getTime() >startDate.getTime())
        {
            visitsInFirstHalf.push(botTrack.curProject.visits[s])
        }
        else
        {
            visitsInSecondHalf.push(botTrack.curProject.visits[s])
        }
    }

    //console.log(visitsInSecondHalf,visitsInFirstHalf);

    var trend = (visitsInFirstHalf.length/visitsInSecondHalf.length - 1) * 100;
    //console.log(trend);
    if (isNaN(trend) || visitsInFirstHalf.length == 0 || visitsInSecondHalf.length == 0)
    {
        this.DOM.KPIS.trend.children[0].innerHTML ='-';
    }
    else
    {
        this.DOM.KPIS.trend.children[0].innerHTML = trend.toFixed(2)+'%' ;
    }
    if (trend < 0)
    {
        this.DOM.KPIS.trend.setAttribute('data-negative',1);
    }

    this.DOM.KPIS.yesterday.children[0].innerHTML ="Hallo";

}


botTrack.view.project.dashboard.prototype.renderTopUrls = function (visits)
{
    var visits = botTrack.curProject.topVisitURLs;
    //console.log(visits);
    var visitsString = '';
    for (var s=0;s<visits.length;s++)
    {
        var visit = visits[s];
        var context = {url: visit.url, visits: visit.visits };
        visitsString +=  botTrack.templates.global_project_visit_dashboard(context);
    }
    this.DOM.visitsContWrapper.innerHTML = visitsString;
}

botTrack.view.project.dashboard.prototype.validateDate = function (date)
{

    var match = date.match(/\d{1,2}.\d{1,2}.\d{4}/);
    console.log(match);
    if (match != null)
    {
        date = match[0];
        var date = date.split('.');
        date = {date:parseInt(date[0]),month:parseInt(date[1]),year:parseInt(date[2])};
        return date;
    }
    return false;
}

botTrack.view.project.dashboard.prototype.setChartStart = function ()
{
    var start = helper.date.format(this.start,'dd.mm.yyyy');
    this.DOM.chartCont_start.value = start;
}

botTrack.view.project.dashboard.prototype.setChartEnd = function ()
{
    var end = helper.date.format(this.end,'dd.mm.yyyy');
    this.DOM.chartCont_end.value = end;
}

botTrack.view.project.dashboard.prototype.events = function ()
{
    this.DOM.chartCont.addEventListener('keyup',function (e)
    {
        //console.log(e);
        if (e.target.classList.contains('start'))
        {
            var start = e.target.value;
            var valid = this.validateDate(start);
            //console.log(start,valid);
            if (valid)
            {
                //console.log('Valid');
                e.target.removeAttribute('data-unvalid');
                //this.getProjectVisits();
            }
            else
            {
                e.target.setAttribute('data-unvalid',1);
            }
        }
        if (e.target.classList.contains('end'))
        {
            var end = e.target.value;
            var valid = this.validateDate(end);
            if (valid)
            {
                e.target.removeAttribute('data-unvalid');
                //this.getProjectVisits();
            }
            else
            {
                e.target.setAttribute('data-unvalid',1);
            }
        }
    }.bind(this));


    this.DOM.chartCont.addEventListener('click',function (e)
    {
        if (e.target.classList.contains('apply'))
        {
            var startValid = this.validateDate(this.DOM.chartCont_start.value);
            var endValid = this.validateDate(this.DOM.chartCont_end.value);
            console.log('startValid',startValid,'endValid',endValid)
            if (startValid && endValid)
            {
                this.start = new Date(startValid.year,startValid.month,startValid.date);
                this.end = new Date(endValid.year,endValid.month,endValid.date);
                this.getProjectVisits();
            }
        }
    }.bind(this));
}


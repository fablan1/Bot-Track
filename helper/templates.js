

helper.templates = function ()
{


}


helper.templates.render = function (tmpl_name, tmpl_data)
{

    if (!this.tmpl_cache[tmpl_name])
    {
        console.error('No template found for',tmpl_name);
        return
    }
    return this.tmpl_cache[tmpl_name](tmpl_data);
};

helper.templates.loadTemplatesIntoCache = function (templates,path,cb)
{
    var loadTemplate;
    var loadCount = 0;
    var tmpl_dir = 'templates';

    loadTemplate = function (template)
    {
        var tmpl_url = tmpl_dir + '/' + template + '.html';
        //console.log(tmpl_url);
        var tmpl_string;
        $.ajax({
            url: tmpl_url,
            method: 'GET',
            async: true,
            success: function(data) {
                tmpl_string = data;
                var el = document.createElement('div');
                el.innerHTML = tmpl_string;

                for (var p=0;p<el.children.length;p++)
                {
                    var child = el.children[p];
                    var template_id = template+'_'+child.id;
                    botTrack.templates[template_id] = Handlebars.compile(child.innerHTML);
                }
                loadCount++;
                //console.log(botTrack.templates);

                if (loadCount >= templates.length)
                {
                    cb();
                }

                el = null;
            }.bind(this)
        });
    }

    for (var s=0;s<templates.length;s++)
    {
        loadTemplate(templates[s]);
    }
}

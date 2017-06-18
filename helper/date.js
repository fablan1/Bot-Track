
helper.date = function ()
{

}

helper.date.MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];


helper.date.getIsoDate = function (date) {

    if (!date.toISOString)
    {
        console.error('Not a valid date');
    }
    return date.toISOString().split('T')[0];
};

helper.date.format = function (date,format) {

    //console.log(date,format);
    var formattedString = format;

    var days = helper.date.getIntegerFormatted(date.getDate());
    if (format.indexOf('dd') != -1)
    {
        formattedString = formattedString.replace('dd',days);
    }
    else if (format.indexOf('d') != -1)
    {
        formattedString = formattedString.replace('d', date.getDate());
    }

    var month = helper.date.getIntegerFormatted(date.getMonth()+1);
    if (format.indexOf('mm') != -1)
    {
        formattedString = formattedString.replace('mm', month);
    }
    else if (format.indexOf('m') != -1)
    {
        formattedString = formattedString.replace('m', month);
    }

    if (format.indexOf('MM') != -1)
    {
        formattedString = formattedString.replace('MM', helper.date.MONTHS[date.getMonth()]);
    }
    else if (format.indexOf('M') != -1)
    {
        formattedString = formattedString.replace('M', helper.date.MONTHS[date.getMonth()].substr(0,3));
    }

    if (format.indexOf('yyyy') != -1)
    {
        formattedString = formattedString.replace('yyyy', date.getFullYear());
    }
    else if (format.indexOf('yy') != -1)
    {
        formattedString = formattedString.replace('yy', date.getFullYear());
    }

    return formattedString;
}

helper.date.getIntegerFormatted = function (date)
{
    if (date < 10)
    {
        return '0'+date;
    }
    return date;
}

helper.date.clone = function (date)
{
    return new Date(date);
}

//helper.data.getIsoDate(new Date());
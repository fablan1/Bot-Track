
helper.dom = function ()
{

}

helper.dom.getElementByClass = function (className,parent) {

    var elementArray;
    if (parent)
    {
        elementArray = parent.querySelectorAll('.'+className);
    }
    else
    {
        elementArray = document.querySelectorAll('.'+className);
    }
    if (elementArray.length !== 0) {
        return elementArray[0];
    }
    return null;
};

helper.dom.getIndexOfElement = function (element) {

    var parentElement = element.parentElement;

    if (!parentElement){
        return null;
    }

    for ( var i = 0; parentElement.children.length; i++ ) {
        if (element === parentElement.children[i]) {
            return i;
        }
    }
    return null;
};

helper.dom.getAncestorByClass = function (element, className) {

    var parentElement = element;


    do {
        parentElement =  parentElement.parentElement;

        if (parentElement === null) {
            break;
        }

        if (helper.array.contains(parentElement.className.split(" "), className)) {
            break;
        }

    } while (true);

    return parentElement;
};

helper.dom.remove = function (element)
{
    element.parentElement.removeChild(element);
    return true
}

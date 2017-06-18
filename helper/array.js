

helper.array = function ()
{


}

/**
 *
 * @param array
 * @param string
 * @returns {boolean}
 */
helper.array.contains = function (array,string) {

    for (var i = 0; i < array.length; i ++) {
        if ( string === array[i]) {
            return true;
        }
    }
    return false;
};


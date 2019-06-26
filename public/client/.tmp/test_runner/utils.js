function replaceAll(find, replace, str) {
    return str.replace(new RegExp(find, 'g'), replace);
}

function deepCopy(obj) {
    var ret = {}, key, val;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) {
            val = obj[key];
            if (typeof val === 'object' && val !== null) {
                ret[key] = deepCopy(val);
            } else {
                ret[key] = val;
            }
        }
    }
    return ret;
}
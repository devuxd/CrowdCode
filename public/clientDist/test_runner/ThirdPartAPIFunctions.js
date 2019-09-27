var objTemp = [];

function SaveObject(object) {
    for (var i = 0; i < objTemp.length; i++) {
        if (objTemp[i].id === object.id && objTemp[i].adtType === object.adtType) {
            return false;
        }
    }
    objTemp.push(object);
    return true;
};

function UpdateObject(object) {

    for (var i = 0; i < objTemp.length; i++) {
        if (objTemp[i].id == object.id && objTemp[i].adtType === object.adtType) {
            objTemp[i] = object;
            return true;
        }
    }
    return false;

};

function DeleteObject(id, adtType) {

    for (var i = 0; i < objTemp.length; i++) {
        if (objTemp[i].id == id && objTemp[i].adtType === adtType) {
            objTemp.splice(i, 1);
            return true;
        }
    }
    return false;
};

function FetchObjects(adtType) {

    var resultOFFetchAllObject = [];

    for (var i = 0; i < objTemp.length; i++) {
        if (objTemp[i].adtType == adtType) {
            resultOFFetchAllObject.push(objTemp[i]);
        }
    }
    return resultOFFetchAllObject;
};

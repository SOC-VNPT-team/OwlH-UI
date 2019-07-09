function loadFileIntoTextarea(){
    var fileContent = document.getElementById('inputTextUI');  
    $.getJSON('../conf/ui.conf', function (data) {
        fileContent.value = JSON.stringify(data, null, "\t");
    });
}

function saveFileChanged() {
    var fileContent = document.getElementById('inputTextUI').value;
    var nodeurl = '../ui.php';
    axios({
        method: 'put',
        url: nodeurl,
        timeout: 30000,
        data: fileContent
    })
    .then(function (response) {
        return true;
    })
    .catch(function (error) {
        return false;
    });
}

function checkStatus() {
    var ipmaster = document.getElementById('ip-master').value;
    var portmaster = document.getElementById('port-master').value;
    var nodeurl = 'https://' + ipmaster + ':' + portmaster + '/v1/home';
    document.getElementById('check-status-config').href = nodeurl;
}

function closeFileChanged(){
    window.history.back();
}

function loadJSONdata() {
    $.getJSON('../conf/ui.conf', function (data) {
        var ipLoad = document.getElementById('ip-master');
        ipLoad.value = data.master.ip;
        var portLoad = document.getElementById('port-master');
        portLoad.value = data.master.port;
        loadTitleJSONdata();
        loadFileIntoTextarea();
        checkStatus();
    });
}
loadJSONdata();
function GetAllRulesetDetails(){
    var urlWeb = new URL(window.location.href);
    var sourceName = urlWeb.searchParams.get("sourceName");
    var uuid = urlWeb.searchParams.get("uuid");
    var type = urlWeb.searchParams.get("type");
    var ipmaster = document.getElementById('ip-master').value;
    document.getElementById('ruleset-source-details-title').innerHTML = sourceName;
    var portmaster = document.getElementById('port-master').value;
    var result = document.getElementById('list-ruleset-details');
    var sourceurl = 'https://' + ipmaster + ':' + portmaster + '/v1/rulesetSource/getDetails/'+uuid;

    axios({
        method: 'get',
        url: sourceurl,
        timeout: 30000
    })
    .then(function (response) {
        console.log(response);
        if (response.data.ack){
            result.innerHTML = '<h3 align="center">Error retrieving files</h3>';
        }else{
            result.innerHTML = generateAllRulesetDetailsHTMLOutput(response, sourceName, type);
            // changeIconAttributes(response.data);
        }
    })
    .catch(function (error) {
        result.innerHTML = '<h3 align="center">Error: No connection</h3>';
    });
}

function generateAllRulesetDetailsHTMLOutput(response, sourceName, type){
    if (response.data.ack == "false") {
        return '<div style="text-align:center"><h3 style="color:red;">Error retrieving all ruleset details for ruleset ' + sourceName + '</h3></div>';
    }  
    var isEmpty = true;
    var files = response.data;
    var html = '<table class="table table-hover" style="table-layout: fixed" style="width:1px">' +
        '<thead>                                                      ' +
        '<tr>                                                         ' +
        '<th>File Name</th>                                                  ' +
        '<th>Ruleset</th>                                          ' +
        '<th style="width: 15%">Actions</th>                                ' +
        '</tr>                                                        ' +
        '</thead>                                                     ' +
        '<tbody>                                                      ' 
    for (file in files) {
        isEmpty = false;
        html = html + '<tr><td style="word-wrap: break-word;">'+
            files[file]["file"]+
            '</td><td style="word-wrap: break-word;">'+
            files[file]["name"]+
            '</td><td style="word-wrap: break-word;" class="align-middle">'+
                '<span style="font-size: 20px; color: Dodgerblue;">';
                    if(type == "source"){
                        if(files[file]["exists"] == "true"){
                            html = html + '<i class="fas fa-file-alt" title="Show Rules" onclick="loadDetails(\''+file+'\', \''+files[file]["file"]+'\', \''+type+'\')"></i> ';
                        }else{
                            html = html + '<i class="fas fa-file-alt" style="color: grey;" title="File do not exists"></i>'+
                            ' | <i class="fas fa-times-circle" style="color: red;"></i>';
                        }
                    }else{                        
                        if(files[file]["exists"] == "true"){
                            html = html + '<i class="fas fa-file-alt" title="Show Rules" onclick="loadDetails(\''+file+'\', \''+files[file]["file"]+'\', \''+type+'\')"></i> '+
                            ' | <i class="fas fa-trash-alt" style="color: red;" title="Delete file" data-toggle="modal" data-target="#modal-detail" onclick="modalDeleteRulesetDetail(\''+files[file]["file"]+'\', \''+file+'\')"></i>';
                            if(files[file]["existsSourceFile"] == "false"){
                                html = html + ' | <i class="fas fa-times-circle" style="color: red;" title="Source file don\'t exist"></i>';
                            }else if(files[file]["isUpdated"] == "true"){
                                html = html + ' | <i class="fas fa-recycle" title="Overwrite file" style="color: green;" data-toggle="modal" data-target="#modal-detail" onclick="modalOverwriteRuleFile(\''+file+'\',\''+files[file]["file"]+'\')"></i> '+
                                '  <i class="far fa-plus-square" title="Add only new SIDs" style="color: LimeGreen;" data-toggle="modal" data-target="#modal-detail" onclick="modalAddNewLines(\''+file+'\', \''+files[file]["file"]+'\')"></i>'+
                                '  <i class="fas fa-info-circle" title="View differences" onclick="viewDifferences(\''+file+'\', \''+files[file]["file"]+'\')"></i>';
                            }
                        }else{
                            html = html + '<i class="fas fa-file-alt" style="color: grey;" title="File do not exists"></i> '+
                            ' | <i class="fas fa-times-circle" style="color: red;"></i>';
                        }
                    }
                    html = html + '</span>'+
            '</td></tr>';
    }
    html = html + '</tbody></table>';
    if (isEmpty){
        return '<h3 style="text-align:center">No files created</h3>';
    }else{
        return html;
    }
}

function modalAddNewLines(uuid, name){
    var modalWindowDelete = document.getElementById('modal-detail');
    var html = '<div class="modal-dialog">'+
        '<div class="modal-content">'+
    
            '<div class="modal-header">'+
                '<h4 class="modal-title">Add new rules</h4>'+
                '<button type="button" class="close" data-dismiss="modal">&times;</button>'+
            '</div>'+
    
            '<div class="modal-body">'+ 
                '<p>Do you want to add the new rules to file <b>'+name+'</b>?</p>'+
            '</div>'+
    
            '<div class="modal-footer" id="delete-ruleset-footer-btn">'+
                '<button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>'+
                '<button type="submit" class="btn btn-primary" data-dismiss="modal" onclick="addNewLines(\''+uuid+'\')">Add</button>'+
            '</div>'+
    
        '</div>'+
    '</div>';
    modalWindowDelete.innerHTML = html;
}

function addNewLines(uuid){
    var ipmaster = document.getElementById('ip-master').value;
    var portmaster = document.getElementById('port-master').value;
    var nodeurl = 'https://' + ipmaster + ':' + portmaster + '/v1/rulesetSource/AddNewLinesToRuleset/' + uuid;
    axios({
        method: 'put',
        url: nodeurl,
        timeout: 30000
    })
        .then(function (response) {
            GetAllRulesetDetails();
        })
        .catch(function error() {
        });
}

function viewDifferences(uuid, ruleFile){
    var ipmaster = document.getElementById('ip-master').value;
    document.location.href = 'https://' + ipmaster + '/compare-files.html?uuid='+uuid+'&file='+ruleFile;
}

function loadDetails(uuid, ruleFile, type){
    var ipmaster = document.getElementById('ip-master').value;
    document.location.href = 'https://' + ipmaster + '/ruleset.html?uuid='+uuid+'&rule='+ruleFile+'&type='+type;
}

function modalDeleteRulesetDetail(name, uuid){
    var modalWindowDelete = document.getElementById('modal-detail');
    var html = '<div class="modal-dialog">'+
        '<div class="modal-content">'+
    
            '<div class="modal-header">'+
                '<h4 class="modal-title">Ruleset</h4>'+
                '<button type="button" class="close" data-dismiss="modal">&times;</button>'+
            '</div>'+
    
            '<div class="modal-body">'+ 
                '<p>Do you want to delete <b>'+name+'</b> file?</p>'+
            '</div>'+
    
            '<div class="modal-footer" id="delete-ruleset-footer-btn">'+
                '<button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>'+
                '<button type="submit" class="btn btn-danger" data-dismiss="modal" onclick="deleteRulesetDetails(\''+uuid+'\')">Delete</button>'+
            '</div>'+
    
        '</div>'+
    '</div>';
    modalWindowDelete.innerHTML = html;
}

function modalOverwriteRuleFile(uuid, name){
    var modalWindowDelete = document.getElementById('modal-detail');
    var html = '<div class="modal-dialog">'+
        '<div class="modal-content">'+
    
            '<div class="modal-header">'+
                '<h4 class="modal-title">Overwrite rule file</h4>'+
                '<button type="button" class="close" data-dismiss="modal">&times;</button>'+
            '</div>'+
    
            '<div class="modal-body">'+ 
                '<p>Do you want to overwrite the file <b>'+name+'</b>?</p>'+
            '</div>'+
    
            '<div class="modal-footer" id="delete-ruleset-footer-btn">'+
                '<button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>'+
                '<button type="submit" class="btn btn-danger" data-dismiss="modal" onclick="overwriteRuleFile(\''+uuid+'\')">Overwrite</button>'+
            '</div>'+
    
        '</div>'+
    '</div>';
    modalWindowDelete.innerHTML = html;
}

function overwriteRuleFile(uuid){
    var ipmaster = document.getElementById('ip-master').value;
    var portmaster = document.getElementById('port-master').value;
    var nodeurl = 'https://' + ipmaster + ':' + portmaster + '/v1/rulesetSource/OverwriteRuleFile/' + uuid;
    axios({
        method: 'put',
        url: nodeurl,
        timeout: 30000
    })
        .then(function (response) {
            GetAllRulesetDetails();
        })
        .catch(function error() {
        });
}

function deleteRulesetDetails(uuid){
    var ipmaster = document.getElementById('ip-master').value;
    var portmaster = document.getElementById('port-master').value;
    var nodeurl = 'https://' + ipmaster + ':' + portmaster + '/v1/rulesetSource/DeleteRulesetFile/' + uuid;
    axios({
        method: 'delete',
        url: nodeurl,
        timeout: 30000
    })
        .then(function (response) {
            GetAllRulesetDetails();
        })
        .catch(function error() {
        });
}

function loadJSONdata(){
    $.getJSON('../conf/ui.conf', function(data) {
      var ipLoad = document.getElementById('ip-master'); 
      ipLoad.value = data.master.ip;
      var portLoad = document.getElementById('port-master');
      portLoad.value = data.master.port;
      loadTitleJSONdata();
      GetAllRulesetDetails();
    });
  }
  loadJSONdata();
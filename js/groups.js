function formAddGroup(){
    document.getElementById('edit-group').style.display = "none";
    var addGroupId = document.getElementById('add-group');
    var textGroup = document.getElementById('group-text');

    if (addGroupId.style.display == "none") {
        addGroupId.style.display = "block";
        textGroup.innerHTML = "Close add new group";
    } else {
        addGroupId.style.display = "none";
        textGroup.innerHTML = "Add new group";
    }
}

function addGroup() {
    var groupname = document.getElementById('groupname').value;
    var groupdesc = document.getElementById('groupdesc').value;
    var ipmaster = document.getElementById('ip-master').value;
    var portmaster = document.getElementById('port-master').value;
    var groupurl = 'https://'+ipmaster+':'+portmaster+'/v1/group/';
    
    formAddGroup();//close add group form
    var nodejson = {}
    nodejson["name"] = groupname;
    nodejson["desc"] = groupdesc;
    nodejson["type"] = "Nodes";
    var nodeJSON = JSON.stringify(nodejson);

    axios({
        method: 'post',
        url: groupurl,
        timeout: 30000,
        data: nodeJSON
    })
    .then(function (response) {
        GetAllGroups();
        return true;
    })
    .catch(function (error) {
        return false;
    });   
    GetAllGroups(); 
}

function GetAllGroups(){
    var ipmaster = document.getElementById('ip-master').value;
    var portmaster = document.getElementById('port-master').value;
    var result = document.getElementById('list-groups');
    var groupurl = 'https://' + ipmaster + ':' + portmaster + '/v1/group/';
    document.getElementById('group-text').style.display ="none";

    // formAddGroup();
    axios({
        method: 'get',
        url: groupurl,
        timeout: 30000
    })
    .then(function (response) {
        document.getElementById('group-text').style.display ="block";
        result.innerHTML = generateAllGroupsHTMLOutput(response);
    })
    .catch(function (error) {
        result.innerHTML = '<h3 align="center">No connection</h3>';
    });
}

function generateAllGroupsHTMLOutput(response) {
    if (response.data.ack == "false") {
        return '<div style="text-align:center"><h3 style="color:red;">Error retrieving groups data</h3></div>';
    }
    var isEmpty = true;
    var groups = response.data;
    var html = '<table class="table table-hover" style="table-layout: fixed" style="width:1px">' +
        '<thead>                                                      ' +
        '<tr>                                                         ' +
        '<th style="width: 20%">Name</th>                           ' +
        '<th>Description</th>                              ' +
        '<th style="width: 20%">Actions</th>                                             ' +
        '</tr>                                                        ' +
        '</thead>                                                     ' +
        '<tbody>                                                      ' 
    for (group in groups) {
        isEmpty = false;
        html = html + '<tr><td style="word-wrap: break-word;" style="width: 20%">'+
        groups[group]['name']+
        '</td><td style="word-wrap: break-word;">'+
        groups[group]['desc']+
        '</td><td style="word-wrap: break-word;">'+
            // '<span style="font-size: 20px; color: Dodgerblue;" >                            ' +
            '<i class="fas fa-sticky-note low-blue" style="color: Dodgerblue; font-size: 20px" title="Edit group" onclick="showEditGroup(\''+groups[group]['name']+'\',\''+groups[group]['desc']+'\',\''+group+'\')"></i> &nbsp;'+
            '<i class="fas fa-trash-alt low-blue" style="color: Dodgerblue; font-size: 20px" title="Delete group" data-toggle="modal" data-target="#modal-groups" onclick="modalDeleteGroup(\''+groups[group]['name']+'\',\''+group+'\')"></i>'+
            // '</span>'+ 
        '</td></tr>'
    }
    html = html + '</tbody></table>';
    if (isEmpty){
        return '<h3 style="text-align:center">No groups created</h3>';
    }else{
        return html;
    }
}

function modalDeleteGroup(name, groupID){
    var modalWindowDelete = document.getElementById('modal-groups');
    modalWindowDelete.innerHTML = 
    '<div class="modal-dialog">'+
        '<div class="modal-content">'+
    
            '<div class="modal-header">'+
                '<h4 class="modal-title">Groups</h4>'+
                '<button type="button" class="close" data-dismiss="modal">&times;</button>'+
            '</div>'+
    
            '<div class="modal-body">'+ 
                '<p>Do you want to delete group <b>'+name+'</b>?</p>'+
            '</div>'+
    
            '<div class="modal-footer" id="delete-ruleset-footer-btn">'+
                '<button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>'+
                '<button type="submit" class="btn btn-danger" data-dismiss="modal" onclick="deleteGroup(\''+groupID+'\')">Delete</button>'+
            '</div>'+
    
        '</div>'+
    '</div>';
}

function showEditGroup(name, desc, groupID){
    document.getElementById('add-group').style.display = "none";
    document.getElementById('group-text').innerHTML = "Add new group";
    document.getElementById('edit-group').style.display = "block";
    document.getElementById('groupnameedit').style.display = "block";
    document.getElementById('groupdescedit').style.display = "block";
    document.getElementById('groupEditButtons').style.display = "block";
}
function modifyGroupClose(){
    document.getElementById('groupnameedit').style.display = "none";
    document.getElementById('groupdescedit').style.display = "none";
    document.getElementById('groupEditButtons').style.display = "none";
}

function editGroupData(){
    modifyGroupClose()
    // formAddGroup();
    var ipmaster = document.getElementById('ip-master').value;
    var portmaster = document.getElementById('port-master').value;
    var name = document.getElementById('groupnameedit').value;
    var desc = document.getElementById('groupdescedit').value;
    var groupID = document.getElementById('groupuuid').value;
    var nodeurl = 'https://'+ipmaster+':'+portmaster+'/v1/group/EditGroup';
    var nodejson = {}
    nodejson["name"] = name;
    nodejson["groupid"] = groupID;
    nodejson["desc"] = desc;
    var nodeJSON = JSON.stringify(nodejson);
    axios({
        method: 'put',
        url: nodeurl,
        timeout: 30000,
        data: nodeJSON
        })
        .then(function (response) {
            GetAllGroups();
        })
        .catch(function (error) {
        });   
        document.getElementById('edit-group').style.display = "none";
}

function deleteGroup(groupID){
    var ipmaster = document.getElementById('ip-master').value;
    var portmaster = document.getElementById('port-master').value;
    var nodeurl = 'https://' + ipmaster + ':' + portmaster + '/v1/group/DeleteGroup/' + groupID;
    axios({
        method: 'put',
        url: nodeurl,
        timeout: 30000,
    })
        .then(function (response) {
            GetAllGroups();
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
      GetAllGroups();
    });
  }
  loadJSONdata();
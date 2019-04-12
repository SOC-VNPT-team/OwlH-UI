function showConfig(oip, oname, oport, onid){
    var cfgform = document.getElementById('divconfigform');
    cfgform.style.display = "block";
    var name = document.getElementById('cfgnodename');
    var ip = document.getElementById('cfgnodeip');
    var port = document.getElementById('cfgnodeport');
    var nid = document.getElementById('cfgnodeid');
    port.value = oport;
    name.value = oname;
    ip.value = oip;
    nid.value = onid;
}

function PingNode(nid) {
  var ipmaster = document.getElementById('ip-master').value;
  var portmaster = document.getElementById('port-master').value;
  var nodeurl = 'https://'+ ipmaster + ':' + portmaster + '/v1/node/ping/' + nid;
  
  axios({
        method: 'get',
        url: nodeurl,
        timeout: 30000
    })
        .then(function (response) {
            if (response.data.ping=='pong') {
                document.getElementById(nid+'-online').className = "badge bg-success align-text-bottom text-white";
                document.getElementById(nid+'-online').innerHTML = "ON LINE";
                PingSuricata(nid);
                PingZeek(nid);
                PingWazuh(nid);
                PingStap(nid);
                return "true";
            } else {
                document.getElementById(nid+'-online').className = "badge bg-danger align-text-bottom text-white";
                document.getElementById(nid+'-online').innerHTML = "OFF LINE";
            }      
        })
            .catch(function (error) {
            return "false";
        });   
    return "false";
}

function GetAllNodes() {
    var ipmaster = document.getElementById('ip-master').value;
    var portmaster = document.getElementById('port-master').value;
    var resultElement = document.getElementById('nodes-table');
    document.getElementById('addnids').style.display = "none";
    axios.get('https://' + ipmaster + ':' + portmaster + '/v1/node')
        .then(function (response) {
            document.getElementById('addnids').style.display = "block";
            resultElement.innerHTML = generateAllNodesHTMLOutput(response);
        })
        .catch(function (error) {
            // document.getElementById('spinner').style.display="none";
            resultElement.innerHTML = '<h3 align="center">No connection</h3>';
        });
}

// function clearLogField() {
//     var logAll = document.getElementById('logAll');
// }

function deleteNode(node) {
    var ipmaster = document.getElementById('ip-master').value;
    var portmaster = document.getElementById('port-master').value;
    var nodeurl = 'https://'+ipmaster+':'+portmaster+'/v1/node/'+node;
    axios({
        method: 'delete',
        url: nodeurl,
        timeout: 30000
    })
        .then(function (response) {
            GetAllNodes();
            return true;
        })
        .catch(function (error) {
            return false;
        });   
}

function addNids(){
    var addnids = document.getElementById('addnids');
    var nform = document.getElementById('nidsform');

    if (nform.style.display == "none") {
        nform.style.display = "block";
        addnids.innerHTML = "Close Add NIDS";
    } else {
        nform.style.display = "none";
        addnids.innerHTML = "Add NIDS";
    }
}

function generateAllNodesHTMLOutput(response) {
    var isEmpty = true;
    var nodes = response.data;
    var html =  '<table class="table table-hover">                            ' +
                '<thead>                                                      ' +
                '<tr>                                                         ' +
                '<th scope="col"></th>                                        ' +
                '<th scope="col">Name</th>                                    ' +
                '<th scope="col">Status</th>                                  ' +
                '<th scope="col">Tags <span style="font-size: 10px;"></span></th>            ' +
                '<th scope="col">Services</th>                                ' +
                '<th scope="col">Actions</th>                                 ' +
                '</tr>                                                        ' +
                '</thead>                                                     ' +
                '<tbody >'
    for (node in nodes) {
        isEmpty = false;
        if (nodes[node]['port'] != undefined) {
            port = nodes[node]['port'];
        } else {
            port = "10443";
        }
        var nid = node;
        PingNode(nid);
        getRulesetUID(nid);

        html = html + '<tr>                                                                     '+
            '<th class="align-middle" scope="row"><img data-src="holder.js/16x16?theme=thumb&bg=007bff&fg=007bff&size=1" alt="" class="mr-2 rounded"></th>' +
            ' <td class="align-middle"> <strong>' + nodes[node]['name'] + '</strong>'           +
            ' <p class="text-muted">' + nodes[node]['ip'] + '</p>'                        +
            ' <i class="fas fa-code" title="Ruleset Management"></i> <span id="'+nid+'-ruleset" class="text-muted small"></span>'                        +
            '</td>'                                                                             +
            '<td class="align-middle">                                                        ';
        html = html + '<span id="'+nid+'-online" class="badge bg-dark align-text-bottom text-white">N/A</span></td>';
            html = html + ' <td class="align-middle" id="'+nid+'-tag"></td><td class="align-middle">';
            html = html +'<p><img src="img/suricata.png" alt="" width="30"> '      +
            '  <span id="'+nid+'-suricata" class="badge badge-pill bg-dark align-text-bottom text-white">N/A</span> |' + 
            '  <span style="font-size: 15px; color: grey;" >                                   ' +
            '    <i class="fas fa-stop-circle" id="'+nid+'-suricata-icon" title="Stop Suricata" onclick="StopSuricata(\''+nid+'\')"></i>                     ' +
            '    <i class="fas fa-sync-alt" title="Deploy ruleset" onclick="sendRulesetToNode('+"'"+nid+"'"+')"></i>                                 ' +
            '    <a title="Configuration" style="cursor: default;" data-toggle="modal" data-target="#modal-change-bpf" onclick="loadBPF(\''+nid+'\',\''+nodes[node]['name']+'\')">BPF</a>'+
            '    <i class="fas fa-code" title="Ruleset Management" data-toggle="modal" data-target="#modal-ruleset-management" onclick="loadRuleset(\''+nid+'\')"></i>                        ' +
            '  </span>                                                                        ' +
            '  </p>                                                                           ' +
            '  <p><img  src="img/bro.png" alt="" width="30">'+
            '  <span id="'+nid+'-zeek" class="badge badge-pill bg-dark align-text-bottom text-white">N/A</span> |                                       ' +
            '  <span style="font-size: 15px; color: grey;" >                                   ' +
            '    <i class="fas fa-stop-circle" id="'+nid+'-zeek-icon"></i>                         ' +
            '    <i class="fab fa-wpforms" title="Zeek policy management"></i>                  ' +
            '  </span>                                                                        ' +
            '  </p>                                                                           ' +
            '  <p><img src="img/wazuh.png" alt="" width="30"> '+
            '  <span id="'+nid+'-wazuh" class="badge badge-pill bg-dark align-text-bottom text-white">N/A</span> |                                        ' +
            '  <span style="font-size: 15px; color: grey;" >                                  ' +
            '    <i class="fas fa-stop-circle" id="'+nid+'-wazuh-icon"></i>                         ' +
            '  </span></p> '+
            '  <p><i class="fas fa-plug fa-lg"></i>'+
            '  <span id="'+nid+'-stap" class="badge badge-pill bg-dark align-text-bottom text-white">N/A</span> |                                         ' +
            '  <span style="font-size: 15px; color: grey;">                                   ' +
            '    <i class="fas fa-stop-circle" id="'+nid+'-stap-icon"></i>                         ' +
            '    <a href="stap.html?uuid='+nid+'&node='+nodes[node]['name']+'"><i class="fas fa-cog" title="Configuration" style="color: grey;"></i><a>                             ' +
            '  </span></p> ';                      
            html = html +   '</td>                                                              ' +
            '<td class="align-middle">                                                        ' +
            '  <span style="font-size: 20px; color: Dodgerblue;" >                            ' +
            '    <a href="files.html?uuid='+node+'&node='+nodes[node]['name']+'"><i class="fas fa-arrow-alt-circle-down" title="See node files"></i></a>             ' +
            '    <i class="fas fa-cogs" title="Modify node details" onclick="showConfig('+"'"+nodes[node]['ip']+"','"+nodes[node]['name']+"','"+nodes[node]['port']+"','"+nid+"'"+');"></i>                            ' +
            '    <a href="edit.html?uuid='+node+'&file=main.conf&node='+nodes[node]['name']+'" style="font-size: 20px; color: Dodgerblue;"><i class="fas fa-cog" title="Edit node configuration"></i></a>           ' +
            '    <a style="font-size: 20px; color: Dodgerblue;" onclick="deleteNodeModal('+"'"+node+"'"+', '+"'"+nodes[node]['name']+"'"+');"> ' +
            '      <i class="fas fa-trash-alt" title="Delete Node" data-toggle="modal" data-target="#modal-delete-nodes"></i>                         ' +
            '    </a>                                                                            ' +
            '  </span>                                                                           ' +
            '</td>                                                                               ' +
            '</tr>';

    }
    html = html + '</tbody></table>';
    if (isEmpty){
        return '<div style="text-align:center"><h3>No nodes created. You can create a node now!</h3></div>';
    }else{
        return  html;
    }
}

function sendRulesetToNode(nid){
    var ipmaster = document.getElementById('ip-master').value;
    var portmaster = document.getElementById('port-master').value;
    var nodeurl = 'https://'+ ipmaster + ':' + portmaster + '/v1/node/ruleset/set/' + nid;
    axios({
        method: 'get',
        url: nodeurl,
        timeout: 30000
    })
    .then(function (response) {
        return true;
    })
    .catch(function (error) {
        return false;
    });
}

//Run suricata system
function RunSuricata(nid) {
    var ipmaster = document.getElementById('ip-master').value;
    var portmaster = document.getElementById('port-master').value;
    var nodeurl = 'https://' + ipmaster + ':' + portmaster + '/v1/node/RunSuricata/' + nid;
    axios({
        method: 'put',
        url: nodeurl,
        //httpsAgent: agent,
        timeout: 30000
    })
        .then(function (response) {

            console.log("DATA RETRIEVED FROM RUNsURICATA"+response);
            // GetAllNodes();
        })
        .catch(function error() {
        });

    GetAllNodes();
}

//Stop suricata system
function StopSuricata(nid) {
    var ipmaster = document.getElementById('ip-master').value;
    var portmaster = document.getElementById('port-master').value;
    var nodeurl = 'https://' + ipmaster + ':' + portmaster + '/v1/node/StopSuricata/' + nid;
    axios({
        method: 'put',
        url: nodeurl,
        timeout: 30000,
    })
        .then(function (response) {
            // GetAllNodes();
        })
        .catch(function error() {
        });

    GetAllNodes();
}

function PingSuricata(nid) {
    var ipmaster = document.getElementById('ip-master').value;
    var portmaster = document.getElementById('port-master').value;
    var nodeurl = 'https://' + ipmaster + ':' + portmaster + '/v1/node/suricata/' + nid;
    axios({
        method: 'get',
        url: nodeurl,
        timeout: 30000
    })
        .then(function (response) {
            if (!response.data.path && !response.data.bin) {
                document.getElementById(nid + '-suricata').className = "badge bg-dark align-text-bottom text-white";
                document.getElementById(nid + '-suricata').innerHTML = "N/A";
                document.getElementById(nid + '-suricata-icon').className = "fas fa-play-circle";
                document.getElementById(nid + '-suricata-icon').onclick = function () { RunSuricata(nid); };
                document.getElementById(nid + '-suricata-icon').title = "Run Suricata";
            } else if (response.data.path || response.data.bin) {
                if (response.data.running) {
                    document.getElementById(nid + '-suricata').className = "badge bg-success align-text-bottom text-white";
                    document.getElementById(nid + '-suricata').innerHTML = "ON";
                    document.getElementById(nid + '-suricata-icon').className = "fas fa-stop-circle";
                    document.getElementById(nid + '-suricata-icon').onclick = function () { StopSuricata(nid); };
                    document.getElementById(nid + '-suricata-icon').title = "Stop Suricata";
                } else {
                    document.getElementById(nid + '-suricata').className = "badge bg-danger align-text-bottom text-white";
                    document.getElementById(nid + '-suricata').innerHTML = "OFF";
                    document.getElementById(nid + '-suricata-icon').className = "fas fa-play-circle";
                    document.getElementById(nid + '-suricata-icon').onclick = function () { RunSuricata(nid); };
                    document.getElementById(nid + '-suricata-icon').title = "Run Suricata";
                }
            }
            return true;
        })
        .catch(function (error) {
            document.getElementById(nid + '-suricata').className = "badge bg-dark align-text-bottom text-white";
            document.getElementById(nid + '-suricata').innerHTML = "N/A";
            return false;
        });
    return false;
}


//Run Zeek system
function RunZeek(nid) {
    var ipmaster = document.getElementById('ip-master').value;
    var portmaster = document.getElementById('port-master').value;
    var nodeurl = 'https://' + ipmaster + ':' + portmaster + '/v1/node/RunZeek/' + nid;
    axios({
        method: 'put',
        url: nodeurl,
        timeout: 30000
    })
        .then(function (response) {
        })
        .catch(function error() {
        });

    GetAllNodes();
}

//Stop Zeek system
function StopZeek(nid) {
    var ipmaster = document.getElementById('ip-master').value;
    var portmaster = document.getElementById('port-master').value;
    var nodeurl = 'https://' + ipmaster + ':' + portmaster + '/v1/node/StopZeek/' + nid;
    axios({
        method: 'put',
        url: nodeurl,
        timeout: 30000,
    })
        .then(function (response) {
        })
        .catch(function error() {
        });

    GetAllNodes();
}

function PingZeek(nid) {
    var ipmaster = document.getElementById('ip-master').value;
    var portmaster = document.getElementById('port-master').value;
    var nodeurl = 'https://' + ipmaster + ':' + portmaster + '/v1/node/zeek/' + nid;
    axios({
        method: 'get',
        url: nodeurl,
        timeout: 30000
    })
        .then(function (response) {
            if (!response.data.path && !response.data.bin) {
                console.log("!path && !bin");
                document.getElementById(nid + '-zeek').className = "badge bg-dark align-text-bottom text-white";
                document.getElementById(nid + '-zeek').innerHTML = "N/A";
                document.getElementById(nid + '-zeek-icon').className = "fas fa-play-circle";
                document.getElementById(nid + '-zeek-icon').onclick = function () { RunZeek(nid); };
                document.getElementById(nid + '-zeek-icon').title = "Run zeek";
            } else if (response.data.path || response.data.bin) {
                if (response.data.running) {
                    document.getElementById(nid + '-zeek').className = "badge bg-success align-text-bottom text-white";
                    document.getElementById(nid + '-zeek').innerHTML = "ON";
                    document.getElementById(nid + '-zeek-icon').className = "fas fa-stop-circle";
                    document.getElementById(nid + '-zeek-icon').onclick = function () { StopZeek(nid); };
                    document.getElementById(nid + '-zeek-icon').title = "Stop Zeek";
                } else {
                    document.getElementById(nid + '-zeek').className = "badge bg-danger align-text-bottom text-white";
                    document.getElementById(nid + '-zeek').innerHTML = "OFF";
                    document.getElementById(nid + '-zeek-icon').className = "fas fa-play-circle";
                    document.getElementById(nid + '-zeek-icon').onclick = function () { RunZeek(nid); };
                    document.getElementById(nid + '-zeek-icon').title = "Run Zeek";
                }
            }
            return true;
        })
        .catch(function (error) {
            document.getElementById(nid + '-zeek').className = "badge bg-dark align-text-bottom text-white";
            document.getElementById(nid + '-zeek').innerHTML = "N/A";

            return false;
        });
    return false;
}

//Run Zeek system
function RunWazuh(nid) {
    var ipmaster = document.getElementById('ip-master').value;
    var portmaster = document.getElementById('port-master').value;
    var nodeurl = 'https://' + ipmaster + ':' + portmaster + '/v1/node/RunWazuh/' + nid;
    axios({
        method: 'put',
        url: nodeurl,
        timeout: 30000
    })
        .then(function (response) {
        })
        .catch(function error() {
            console.log(error);
        });

    GetAllNodes();
}

//Stop Wazuh system
function StopWazuh(nid) {
    var ipmaster = document.getElementById('ip-master').value;
    var portmaster = document.getElementById('port-master').value;
    var nodeurl = 'https://' + ipmaster + ':' + portmaster + '/v1/node/StopWazuh/' + nid;
    axios({
        method: 'put',
        url: nodeurl,
        timeout: 30000,
    })
        .then(function (response) {
        })
        .catch(function error() {
            console.log(error);
        });

    GetAllNodes();
}

function PingWazuh(nid) {
    var ipmaster = document.getElementById('ip-master').value;
    var portmaster = document.getElementById('port-master').value;
    var nodeurl = 'https://' + ipmaster + ':' + portmaster + '/v1/node/wazuh/' + nid;
    axios({
        method: 'get',
        url: nodeurl,
        timeout: 30000
    })
        .then(function (response) {
            if (!response.data.path && !response.data.bin) {
                document.getElementById(nid + '-wazuh').className = "badge bg-dark align-text-bottom text-white";
                document.getElementById(nid + '-wazuh').innerHTML = "N/A";
                document.getElementById(nid + '-wazuh-icon').className = "fas fa-play-circle";
                document.getElementById(nid + '-wazuh-icon').onclick = function () { RunWazuh(nid); };
                document.getElementById(nid + '-wazuh-icon').title = "Run Wazuh";
            } else if (response.data.path || response.data.bin) {
                if (response.data.running) {
                    document.getElementById(nid + '-wazuh').className = "badge bg-success align-text-bottom text-white";
                    document.getElementById(nid + '-wazuh').innerHTML = "ON";
                    document.getElementById(nid + '-wazuh-icon').className = "fas fa-stop-circle";
                    document.getElementById(nid + '-wazuh-icon').onclick = function () { StopWazuh(nid); };
                    document.getElementById(nid + '-wazuh-icon').title = "Stop Wazuh";
                } else {
                    document.getElementById(nid + '-wazuh').className = "badge bg-danger align-text-bottom text-white";
                    document.getElementById(nid + '-wazuh').innerHTML = "OFF";
                    document.getElementById(nid + '-wazuh-icon').className = "fas fa-play-circle";
                    document.getElementById(nid + '-wazuh-icon').onclick = function () { RunWazuh(nid); };
                    document.getElementById(nid + '-wazuh-icon').title = "Run Wazuh";
                }
            }
            return true;
        })
        .catch(function (error) {
            document.getElementById(nid + '-wazuh').className = "badge bg-dark align-text-bottom text-white";
            document.getElementById(nid + '-wazuh').innerHTML = "N/A";
            return false;
        });
    return false;
}

//Run stap system
function RunStap(nid) {
    var ipmaster = document.getElementById('ip-master').value;
    var portmaster = document.getElementById('port-master').value;
    var nodeurl = 'https://' + ipmaster + ':' + portmaster + '/v1/stap/RunStap/' + nid;
    axios({
        method: 'put',
        url: nodeurl,
        timeout: 30000
    })
        .then(function (response) {
        })
        .catch(function error() {
        });
    GetAllNodes();
}

//Stop stap system
function StopStap(nid) {
    var ipmaster = document.getElementById('ip-master').value;
    var portmaster = document.getElementById('port-master').value;
    var nodeurl = 'https://' + ipmaster + ':' + portmaster + '/v1/stap/StopStap/' + nid;
    axios({
        method: 'put',
        url: nodeurl,
        timeout: 30000,
    })
        .then(function (response) {
        })
        .catch(function error() {
        });
    GetAllNodes();
}

function PingStap(nid) {
    var ipmaster = document.getElementById('ip-master').value;
    var portmaster = document.getElementById('port-master').value;
    var nodeurl = 'https://' + ipmaster + ':' + portmaster + '/v1/stap/stap/' + nid;
    axios({
        method: 'get',
        url: nodeurl,
        timeout: 30000
    })
        .then(function (response) {
            if (!response.data.stapStatus) {
                document.getElementById(nid + '-stap').className = "badge bg-danger align-text-bottom text-white";
                document.getElementById(nid + '-stap').innerHTML = "OFF";
                document.getElementById(nid + '-stap-icon').className = "fas fa-play-circle";
                document.getElementById(nid + '-stap-icon').onclick = function () { RunStap(nid); };
                document.getElementById(nid + '-stap-icon').title = "Run stap";
            } else {
                document.getElementById(nid + '-stap').className = "badge bg-success align-text-bottom text-white";
                document.getElementById(nid + '-stap').innerHTML = "ON";
                document.getElementById(nid + '-stap-icon').className = "fas fa-stop-circle";
                document.getElementById(nid + '-stap-icon').onclick = function () { StopStap(nid); };
                document.getElementById(nid + '-stap-icon').title = "Stop stap";
            }
        })
        .catch(function (error) {
            document.getElementById(nid + '-stap').className = "badge bg-dark align-text-bottom text-white";
            document.getElementById(nid + '-stap').innerHTML = "N/A";
            return false;
        });
    return false;
}




function getRulesetUID(nid) {
    var ipmaster = document.getElementById('ip-master').value;
    var portmaster = document.getElementById('port-master').value;
    var nodeurl = 'https://' + ipmaster + ':' + portmaster + '/v1/ruleset/get/' + nid;
    axios({
        method: 'get',
        url: nodeurl,
        timeout: 30000
    })
        .then(function (response) {
            getRuleName(response.data, nid);
            return true;
        })
        .catch(function (error) {
            return false;
        });
}

function getRuleName(uuid, nid) {
    var ipmaster = document.getElementById('ip-master').value;
    var portmaster = document.getElementById('port-master').value;
    var nodeurl = 'https://' + ipmaster + ':' + portmaster + '/v1/ruleset/get/name/' + uuid;
    axios({
        method: 'get',
        url: nodeurl,
        timeout: 30000
    })
        .then(function (response) {
            if (typeof response.data.error != "undefined") {
                document.getElementById(nid + '-ruleset').innerHTML = "No ruleset selected...";
                document.getElementById(nid + '-ruleset').className = "text-danger";
            } else {
                document.getElementById(nid + '-ruleset').innerHTML = response.data;
                document.getElementById(nid + '-ruleset').className = "text-muted-small";
            }
            return response.data;
        })
        .catch(function (error) {
            return false;
        });
}

//load json data from local file
function loadJSONdata() {
    $.getJSON('../conf/ui.conf', function (data) {
        var ipLoad = document.getElementById('ip-master');
        ipLoad.value = data.master.ip;
        var portLoad = document.getElementById('port-master');
        portLoad.value = data.master.port;
        loadTitleJSONdata();
        GetAllNodes();
    });
}
loadJSONdata();
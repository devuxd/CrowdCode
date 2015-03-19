<!doctype html> <html class="no-js"> <head><script>var prod=true;console.log("prod 1",prod); var projectId    = '<%=(String) request.getAttribute("project") %>';</script> <meta charset="utf-8"> <title></title> <meta name="description" content=""> <meta name="viewport" content="width=device-width"> <!-- Place favicon.ico and apple-touch-icon.png in the root directory --> <link rel="stylesheet" href="/dist/styles/vendor.412e7e63.css"> <link rel="stylesheet" href="/dist/styles/main.7ee12ab3.css">  <body ng-app="crowdAdminApp"> <a id="top"></a> <!--[if lt IE 7]>
      <p class="browsehappy">You are using an <strong>outdated</strong> browser. Please <a href="http://browsehappy.com/">upgrade your browser</a> to improve your experience.</p>
    <![endif]--> <!-- Add your site or application content here --> <div class="navbar navbar-inverse" role="navigation" bs-navbar> <div class="navbar-header"> <a class="navbar-brand" href="#">CrowdCoding Admin</a> </div> <ul class="nav navbar-nav"> <li data-match-route="/dashboard"><a href="#/dashboard">Dashboard</a></li> <li data-match-route="/microtasks"><a href="#/microtasks">Microtasks</a></li> <li data-match-route="/functions"><a href="#/functions">Functions</a></li> <li data-match-route="/tests"><a href="#/tests">Tests</a></li> <li data-match-route="/code"><a href="#/code">Code</a></li> <li data-match-route="/users"><a href="#/users">Workers</a></li> <li data-match-route="/chat"><a href="#/chat">Chat</a></li> <li data-match-route="/feedback"><a href="#/feedback">Feedback</a></li> </ul> </div> <div class="container-fluid"> <div ng-view=""></div> <div class="footer">{{time}} </div> </div> <script>if(projectId===undefined){
        var projectId = 'drawTry';
    }
    console.log('PAGE LOADED');</script> <!--[if lt IE 9]>
    <script charset="utf-8" src="/dist/scripts/oldieshim.76f279db.js"></script>
    <![endif]--> <script charset="utf-8" src="/dist/scripts/vendor.f4eb07d9.js"></script> <script charset="utf-8" src="/dist/scripts/scripts.b7ecbdf4.js"></script> <script type="text/javascript">var prod = prod || false;
            var ace = window.ace = window.ace || { };
            ace.initialize = function(editor) {
                if( prod ){
                    ace.require("ace/config").set("workerPath","/dist/scripts/ace");
                    ace.require("ace/config").set("themePath", "/dist/scripts/ace");
                    ace.require("ace/config").set("modePath", "/dist/scripts/ace");
                }
                
                ace.require("ace/ext/language_tools");

                editor.setTheme("ace/theme/xcode");
                // editor.getSession().setMode("ace/mode/javascript");
            };</script>  
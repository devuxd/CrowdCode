<!doctype html>
<html class="no-js">
  <head>
    <meta charset="utf-8">
    <title></title>
    <meta name="description" content="">
    <meta name="viewport" content="width=device-width">

    <link rel="stylesheet" href="/include/bootstrap/css/bootstrap.min.css" type="text/css" />
    <link rel="stylesheet" href="/include/bootstrap-toggle/css/bootstrap-toggle.min.css" type="text/css" />

    <link rel="stylesheet" href="/adminDist/styles/main.css">

  </head>
  <body ng-app="crowdAdminApp">
    <a id="top"></a>
    <!--[if lt IE 7]>
      <p class="browsehappy">You are using an <strong>outdated</strong> browser. Please <a href="http://browsehappy.com/">upgrade your browser</a> to improve your experience.</p>
    <![endif]-->

    <!-- Add your site or application content here -->
    <div class="navbar navbar-inverse" role="navigation" bs-navbar>
      <div class="navbar-header">
        <a class="navbar-brand" href="#">CrowdCoding Admin</a>
      </div>
      <ul class="nav navbar-nav">
        <li data-match-route="/dashboard"><a ui-sref="dashboard">Dashboard</a></li>
        <li data-match-route="/microtasks"><a ui-sref="microtasks">Microtasks</a></li>
        <li data-match-route="/functions"><a href="#/functions">Functions</a></li>
        <li data-match-route="/tests"><a href="#/tests">Tests</a></li>
        <li data-match-route="/code"><a href="#/code">Code</a></li>
        <li data-match-route="/questions"><a href="#/questions">Questions</a></li>
        <li data-match-route="/feedback"><a href="#/feedback">Feedback</a></li>
        <li data-match-route="/users"><a href="#/users">Workers</a></li>
        <!--<li data-match-route="/chat"><a href="#/chat">Chat</a></li>-->
      </ul>
    </div>
    
    <div class="container-fluid">
      

      <div ui-view=""></div>

      <div class="footer">{{time}}
        
      </div>
    </div>
    <%
    String projectID    = (String) request.getAttribute("project");
    %>

    <script>
    var projectId = '<%=projectID%>';
    </script>

    <script src="/include/jquery-2.1.0.min.js"></script>
    <script src="/include/bootstrap/js/bootstrap.min.js"> </script>
    <script src="/include/angular/angular.min.js"></script> <!-- AngularJS -->
    <script src="/include/angular/angular-animate.min.js"></script><!-- Angular animate -->
    <script src="/include/angular/angular-sanitize.min.js"></script><!-- Angular sanitize -->
    <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.2.7/angular-resource.min.js"></script>
    <script src="/include/angular-strap/dist/angular-strap.min.js"></script>
    <script src="/include/angular-strap/dist/angular-strap.tpl.min.js"></script>
    <script src="/include/angular-messages/angular-messages.min.js"></script> <!-- AngularJS -->
   
    <script src="/include/timeAgo.js"></script>
    <script src="/include/ui-ace-editor/src/ui-ace.js"> </script> <!-- UI Ace Editor-->
    <script src="/include/ace-editor/src-min-noconflict/ace.js"> </script> <!-- Ace Editor-->
    <script src="/include/angular-ui-router/release/angular-ui-router.js"></script>
    <script src="https://cdn.firebase.com/js/client/2.2.4/firebase.js"></script> <!-- firebase -->
    <script src="https://cdn.firebase.com/libs/angularfire/0.9.0/angularfire.min.js"></script> <!-- angularfire -->
    <script src="/include/jsdiff-master/diff.js"></script>


    <script src="/adminDist/admin.js"></script> 

    <script type="text/javascript">

            var prod = prod || false;
            var ace = window.ace = window.ace || { };
            ace.initialize = function(editor) {
                if( prod ){
                    ace.require("ace/config").set("workerPath","/admin/scripts/ace");
                    ace.require("ace/config").set("themePath", "/admin/scripts/ace");
                    ace.require("ace/config").set("modePath", "/admin/scripts/ace");
                }
                
                ace.require("ace/ext/language_tools");

                editor.setTheme("ace/theme/xcode");
                // editor.getSession().setMode("ace/mode/javascript");
            }; 
        
    </script>

</body>
</html>
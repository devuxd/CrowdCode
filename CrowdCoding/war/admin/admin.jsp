<!doctype html>
<html class="no-js">
  <head>
    <meta charset="utf-8">
    <title></title>
    <meta name="description" content="">
    <meta name="viewport" content="width=device-width">
    <!-- Place favicon.ico and apple-touch-icon.png in the root directory -->

    <!-- build:css(.) styles/vendor.css -->
    <!-- bower:css -->
    <link rel="stylesheet" href="../bower_components/bootstrap/dist/css/bootstrap.css" />
    <link rel="stylesheet" href="../bower_components/angular-motion/dist/angular-motion.css" />
    <link rel="stylesheet" href="../bower_components/nvd3/src/nv.d3.css" />
    <link rel="stylesheet" href="../bower_components/bootstrap-toggle/css/bootstrap-toggle.min.css" />
    <!-- endbower -->
    <!-- endbuild -->

    <!-- build:css(.tmp) styles/main.css -->
    <link rel="stylesheet" href="/admin/styles/main.css">
    <!-- endbuild -->

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
        <li data-match-route="/users"><a href="#/users">Workers</a></li>
        <li data-match-route="/chat"><a href="#/chat">Chat</a></li>
        <li data-match-route="/feedback"><a href="#/feedback">Feedback</a></li>
      </ul>
    </div>
    
    <div class="container-fluid">
      

      <div ui-view=""></div>

      <div class="footer">{{time}}
        
      </div>
    </div>


    <script>
    if(projectId===undefined){
        var projectId = 'drawTry';
    }
    console.log('PAGE LOADED');
    </script>

    <!-- build:js(.) scripts/oldieshim.js -->
    <!--[if lt IE 9]>
    <script src="../bower_components/es5-shim/es5-shim.js"></script>
    <script src="../bower_components/json3/lib/json3.js"></script>
    <![endif]-->
    <!-- endbuild -->

    <!-- build:js(.) scripts/vendor.js -->
    <!-- bower:js -->
    <script src="../bower_components/jquery/dist/jquery.js"></script>
    <script src="../bower_components/angular/angular.js"></script>
    <script src="../bower_components/angular-animate/angular-animate.js"></script>
    <script src="../bower_components/angular-cookies/angular-cookies.js"></script>
    <script src="../bower_components/angular-resource/angular-resource.js"></script>
    <script src="../bower_components/angular-route/angular-route.js"></script>
    <script src="../bower_components/angular-sanitize/angular-sanitize.js"></script>
    <script src="../bower_components/bootstrap/dist/js/bootstrap.js"></script>
    <script src="../bower_components/angular-strap/dist/angular-strap.js"></script>
    <script src="../bower_components/angular-strap/dist/angular-strap.tpl.js"></script>
    <script src="../bower_components/firebase/firebase.js"></script>
    <script src="../bower_components/angularfire/dist/angularfire.js"></script>
    <script src="../bower_components/d3/d3.js"></script>
    <script src="../bower_components/nvd3/nv.d3.js"></script>
    <script src="../bower_components/angular-nvd3/dist/angular-nvd3.min.js"></script>
    <script src="../bower_components/ace-builds/src-min-noconflict/ace.js"></script>
    <script src="../bower_components/ace-builds/src-min-noconflict/ext-language_tools.js"></script>
    <script src="../bower_components/ace-builds/src-min-noconflict/mode-javascript.js"></script>
    <script src="../bower_components/ace-builds/src-min-noconflict/theme-chrome.js"></script>
    <script src="../bower_components/angular-ui-ace/ui-ace.js"></script>
    <script src="../bower_components/bootstrap-toggle/js/bootstrap-toggle.min.js"></script>
    <script src="../bower_components/jsdiff/diff.js"></script>
    <script src="../bower_components/angular-ui-router/release/angular-ui-router.js"></script>
    <!-- endbower -->
    <!-- endbuild -->

    <!-- build:js({.tmp,app}) scripts/scripts.js -->
    <script src="/admin/admin.js"></script>
    <!-- directives -->

    <!-- endbuild -->

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

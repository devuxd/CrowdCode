<!doctype html> <html class="no-js"> <head><script>var projectId    = '<%=(String) request.getAttribute("project") %>';</script> <meta charset="utf-8"> <title></title> <meta name="description" content=""> <meta name="viewport" content="width=device-width"> <!-- Place favicon.ico and apple-touch-icon.png in the root directory --> <link rel="stylesheet" href="/dist/styles/vendor.24e1f3e3.css"> <link rel="stylesheet" href="/dist/styles/main.42361140.css">  <body ng-app="crowdAdminApp"> <!--[if lt IE 7]>
      <p class="browsehappy">You are using an <strong>outdated</strong> browser. Please <a href="http://browsehappy.com/">upgrade your browser</a> to improve your experience.</p>
    <![endif]--> <!-- Add your site or application content here --> <div class="navbar navbar-inverse" role="navigation" bs-navbar> <div class="navbar-header"> <a class="navbar-brand" href="#">CrowdCoding Admin</a> </div> <ul class="nav navbar-nav"> <li data-match-route="/dashboard"><a href="#/dashboard">Dashboard</a></li> <li data-match-route="/microtasks"><a href="#/microtasks">Microtasks</a></li> <li data-match-route="/feedback"><a href="#/feedback">Feedback</a></li> <li data-match-route="/chat"><a href="#/chat">Chat</a></li> <li data-match-route="/code"><a href="#/code">Code</a></li> </ul> </div> <div class="container-fluid"> <div ng-view=""></div> <div class="footer">{{time}} </div> </div> <script>if(projectId===undefined){
        var projectId = 'calculatorTRY';
    }
    console.log('PAGE LOADED');</script> <!--[if lt IE 9]>
    <script src="/dist/scripts/oldieshim.76f279db.js"></script>
    <![endif]--> <script src="/dist/scripts/vendor.228d0024.js"></script> <script src="/dist/scripts/scripts.a629dd52.js"></script>  
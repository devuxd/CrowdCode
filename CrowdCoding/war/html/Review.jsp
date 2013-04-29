<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="com.google.appengine.api.users.User" %>
<%@ page import="com.google.appengine.api.users.UserService" %>
<%@ page import="com.google.appengine.api.users.UserServiceFactory" %>
<%@ page import="com.crowdcoding.Project" %>
<%@ page import="com.crowdcoding.Worker" %>
<%@ page import="com.crowdcoding.microtasks.WriteUserStory" %>
<%@ page import="com.crowdcoding.util.FunctionHeaderUtil" %>
<%@ page import="com.fasterxml.jackson.databind.ObjectMapper" %>
<%@ page import="java.io.StringWriter" %>
<%@ page import="java.io.Writer" %>

<%
	String projectID = (String) request.getAttribute("project");
	Project project = Project.Create(projectID);
    Worker crowdUser = Worker.Create(UserServiceFactory.getUserService().getCurrentUser(), project);
    WriteUserStory microtask = (WriteUserStory) crowdUser.getMicrotask();
%>
<script src="/include/stars/example.js"></script>
<script src="/include/codemirror/codemirror.js"></script>
<script src="/include/codemirror/javascript.js"></script>
<script src="/include/diff/diff_match_patch.js" type="text/javascript"></script>
<script src="/include/diff/jquery.pretty-text-diff.js" type="text/javascript"></script>
 <link type="text/css" rel="stylesheet" href="/include/diff.css" />

<div id="microtask">

	
	<h4>
		Review TASK <br> A review has been generated for the following
		piece of work: <br> </h4>
		 <h4 style = 'float:left; margin-right: 32%;margin-left: 13%;'> Original Work </h4> <h4 style='float:left'> Worked Completed </h4> 
		   <table style = 'float:left' width="50%">
				<tr>
					<td><textarea id="originalWork"><br/>
    orignal:
                </textarea></td>
					<td width="10"></td>
				</tr>
			</table>
			
			
			
			<table style = 'float:left' width="50%">
				<tr>
					<td width="10"></td>
					<td><textarea id="newWork"></textarea></td>
				</tr>
			</table>



<div id="wrapper">
	<div > 
<form>
<div style = 'display:none'>
    <span class="original"></span> <br/>
                <span class="changed"></span>
                </div>
                <h4 style = 'float:left'><br/> DIFF 
              <span style = 'margin-left:15%; font-size: 15px; float:left' class="diff"></span>   
              </h4>
              </br>       

        <label style='display:none' class="checkbox">
            <input id="cleanup" type="checkbox" value="true" checked="checked" />
        </label>
<div style = 'display:none'>
        <input id = 'diffButton' type='button' class='btn btn-primary' value='Diff'></input>
        </div>
    </form>
    </div>
    </div>
<div style = 'float:left; width:100%;'> <br> <br>
		<div id='instructions' class='down'></div>
		<div id='helpText'>show Instructions </div>
		<form id="testForm" action="">
			<div>Please rate the quality of this work:</div>
			<div id="quality"></div>
			<div style = 'display:none'><br /> Your Rating For Quality: <span id="quality-rating">not
				set</span> </div> <br />
			<br /><br /> How much of a contribution was made here?
			<div id="contrib"></div>
			<div style = 'display:none'> <br /> Your Rating For Contribution: <span id="contrib-rating">not
				set</span></br>
			</br>
			</div>
			<h4>
				Additional Feedback: <br>
			</h4>

			<table width="100%">
				<tr>
					<td width="20"></td>
					<td><textarea id="userInput"></textarea></td>
				</tr>
			</table>
			</br>
			<%@include file="/html/elements/submitFooter.jsp" %>

		</form>
		</div>
</div>


<script>
	var microtaskType = 'reviewTask';
	var microtaskID = <%= microtask.getID() %>;

	$(document).ready(function() 
	{
	  	$('#skip').click(function() { skip(); });	
		
		var flip = 0;
	  	$('#testForm').submit(function() {
	  		debugger;
	  		console.log(doStarCalculation());
	  		return false;
			submit({ 
				text: $("#userInput").val(),
				quality: $("#contrib-rating"),
				quantity:$("#quality-rating"),
			});
		  	return false; 	// disable default submit behavior
	});
      
       
 
	function doStarCalculation()
	{
		var total = 0; 
		if($("#quality-rating").html().match(/^\d+$/) != null)
		{ 
	 	   total = total + ($("#quality-rating").html().match(/^\d+$/)[0] - 0); 
		}
		if($("#contrib-rating").html().match(/^\d+$/) != null)
	 	{ 
	 	   var temp = $("#contrib-rating").html().match(/^\d+$/)[0] - 0; 
	 	   total = temp + total;
		}
		return total;
	}
 	$('#instructions').click(function () 
 	{
 		flip++;
 		$("#helpText").toggle("slow");
 		if(flip%2 == 0)
 		{
 		   $('#instructions').removeClass('side');
 		   $('#instructions').addClass('down');
 		}
 		else
 		{
 		   $('#instructions').addClass('side');
 		   $('#instructions').removeClass('down');
 		}
 	});
 	
 	
	
	$("#contrib").children("#dotted").css('display','none');
	$("#contrib").children("#borderTextAccept").css('display','none');
	$("#contrib").children("#borderTextReject").css('display','none');
	
	});
	$("input[type=button]").click(function () {
    		$("#wrapper div").prettyTextDiff({
       		 	cleanup: $("#cleanup").is(":checked")
    		});
		});
	function createDiffContent(originalString, newString)
	{
		$(".original").text(originalString);
		$(".changed").text(newString);
		
		$("#diffButton").trigger('click');
		var userComments = CodeMirror.fromTextArea(userInput);
		userComments.setOption("theme", "vibrant-ink");
	
		var original2 = CodeMirror.fromTextArea(originalWork);
		original2.setOption("theme", "vibrant-ink");
		original2.setValue(originalString);
		original2.setOption("lineWrapping","true");
		original2.setOption("readOnly",true);

		
	
		var newWork2 = CodeMirror.fromTextArea(newWork);
		newWork2.setOption("theme", "vibrant-ink");
		newWork2.setValue(newString);
		newWork2.setOption("lineWrapping","true");
		newWork2.setOption("readOnly", "true");

		
		$("#actualDiff").text($('.diff').text());
	 }
	createDiffContent("Hello There this is it", "Helllo There");	
	</script>

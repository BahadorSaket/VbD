(function(argument) {
  var sc = new Scatterplot();
	uiHandler = {};

 	// this is for adding/removing blue color from icons on the right side panels
	$(".barchart").click(function(){
	   $("#rightPanel img").removeClass("chartIconActive");
	   $(".barchart" ).addClass("chartIconActive");
	});

	$(".scatterplot").click(function(){
	   $("#rightPanel img").removeClass("chartIconActive");
		 $(".scatterplot" ).addClass("chartIconActive");
	});

	$(".linechart").click(function(){
		 $("#rightPanel img").removeClass("chartIconActive");
		 $(".linechart" ).addClass("chartIconActive");
	});

	$(".colorIcon").click(function(){
	   sc.Scatter_ColorActivation();
		 $(".RightMenueSubIcon i").removeClass("md-Active");
		 $(".colorIcon" ).addClass("md-Active");
	});
	$(".resizeIcon").click(function(){
		 sc.Scatter_ResizeActivation();
 		 $(".RightMenueSubIcon i").removeClass("md-Active");
 		 $(".resizeIcon" ).addClass("md-Active");
 	});
	$(".dragIcon").click(function(){
		 sc.Scatter_DragActivation();
 		 $(".RightMenueSubIcon i").removeClass("md-Active");
 		 $(".dragIcon" ).addClass("md-Active");
 	});


	$("#leftPanelToggleButton").click(function(ev){
		toggleLeftPanel();
	});

	function toggleLeftPanel(){
		if(global.leftPanelStatus==1){ // left panel open
	    	$("#leftPanel").animate({width:'toggle'},350);
				$("#slidingPanelIcon").removeClass('fa-caret-left');
				$("#slidingPanelIcon").addClass('fa-caret-right');
			global.leftPanelStatus = 0;
		}else{ // left panel closed
	    	$("#leftPanel").animate({width:'toggle'},350);
				$("#slidingPanelIcon").removeClass('fa-caret-right');
				$("#slidingPanelIcon").addClass('fa-caret-left');
			global.leftPanelStatus = 1;
		}
		resizeMainContainer();
	}


	function resizeMainContainer(){
		$("#mainContainer").removeClass();
		if(global.rightPanelStatus==1 && global.leftPanelStatus==1){
			$("#mainContainer").addClass('col-md-8');
		}else if(global.rightPanelStatus==0 && global.leftPanelStatus==0){
			$("#mainContainer").addClass('col-md-12');
		}else if(global.rightPanelStatus==0 && global.leftPanelStatus==1){
			$("#mainContainer").addClass('col-md-10');
		}else if(global.rightPanelStatus==1 && global.leftPanelStatus==0){
			$("#mainContainer").addClass('col-md-10');
		}
	}

})()

function detailPanelCalled()
{
	$("#controlPanel").hide();
	$("#suggestionPanel").hide();
	$("#actionPanel").hide();
	$("#detailPanel").show();
}
function actionPanelCalled()
{
	$("#panelTitle").prepend('');
	$("#controlPanel").hide();
	$("#suggestionPanel").hide();
	$("#detailPanel").hide();
	$("#actionPanel").show();
}
function suggestionPanelCalled()
{
	$("#controlPanel").hide();
	$("#actionPanel").hide();
	$("#detailPanel").hide();
  $("#suggestionPanel").show();
}
function controlPanelCalled()
{
	$("#suggestionPanel").hide();
	$("#actionPanel").hide();
	$("#detailPanel").hide();
	$("#controlPanel").show();
}


function ShowDetail(circle_id){

  var numberOfAddedAttributes = 4
	$("#detailPanel > p" ).remove();
  dataAttributeNames = Object.keys(dataset[0]);
	for(j=dataAttributeNames.length-numberOfAddedAttributes-1;j>=1;	j=j-1)
  {
			$("#detailPanel").prepend('<p class="attributes_container attributes_font" id="attrID_'+j+'"> <b>'+dataAttributeNames[j]+':</b> '+dataset[circle_id][dataAttributeNames[j]]+'</p>');
	}
	$("#detailPanel").prepend('<p class="dataset-meta attributes_font" style="padding: 7px 0px 0px 7px;"> <i class="fa fa-list"></i> ' +(dataAttributeNames.length-2)+' data attributes<p>');
	$("#detailPanel").prepend('<p class="dataset-meta attributes_font" style="padding: 7px 0px 0px 7px;"> <i class="fa fa-circle"></i> ' + dataset.length +' data points <p>');
	$("#detailPanel").prepend('<p class="dataset-meta attributes_font" style="padding: 7px 0px 0px 7px;"> <i class="fa fa-table"></i> Cars.csv <p>');
}

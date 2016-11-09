
function cal_Recom_weight(recom)
{
	var Min_ConfidenceLevel =0;
	var sortedRecommendationsByValue= [];
	var maxWeight=recom[0].weight;

    var sortedArray = recom.slice();

	sortedArray = sortedArray.sort(function(a,b){return b.weight - a.weight});
	removeAllDynRecom("x");
	removeAllDynRecom("y");
	removeAllDynRecom("sorting");
    removeAllRecommendations_bar() ;
    removeAllRecommendations_scatter();


	for (var i = 0; i < recom.length; i++)
	{
		//console.log(recom[i].id+ "--" + recom[i].weight);
	    if(sortedArray[i].weight > Min_ConfidenceLevel || sortedArray[i].id ==1)
		{
			ShowRecommendation(recom, sortedArray[i].id)
		}
	}
}



function demo_bar(recomID, data_temp)
{
	var radius2=5;
   // demo_width= 350;

    recom_height= $(".inner-div4").height()*0.75;
	demo_padding=10;
	demo_svg = d3.select("body").select(".inner-div4").select('#recom_' + recomID).insert("svg").attr("height",recom_height).attr("width",recom_height*1.6);

	demo_width = $('#recom_' + recomID + " > svg").width();
	demo_height = $('#recom_' + recomID + " > svg").height();
	console.log(demo_width,  demo_height);
	var barData = {};
		var ValueExtent=[];

		for(var index in data_temp){
			var curObj = data_temp[index].toString();
			if(Object.keys(barData).indexOf(curObj)==-1){
				barData[curObj] = 1;
			}else{
				barData[curObj]++;
			}
		}
        for(var index in barData){
             ValueExtent.push(barData[index]);
		}


	    XExtentValue = Object.keys(barData);
		var YExtentValue = [0,d3.max(ValueExtent)];
		val=1;
		constant_dividor =4;
		//console.log(XExtentValue)

		var xScale = XScaleGenerator("Ordinal",1, (demo_width-demo_padding), XExtentValue,demo_padding,0);
		var yScale = YScaleGenerator("linear",0,(demo_height-demo_padding), YExtentValue,demo_padding,0);

        demodata = transformed_data.slice(0);

		demo_svg.selectAll("rect")
		             .data(XExtentValue)
					 .enter()
				     .append("g")
				     .call(drag)
				     .attr("id",function(d,i) { return "bar_"+i;})
				     .append("rect")
					 .attr("class", "bar")
					 .attr("class","RectBar")
					 .attr("id",function(d,i) { return "rectBar_"+i;})
					 .attr("x",function(d,i) {
					            return xScale(XExtentValue[i])-(radius/constant_dividor)- ((radius/constant_dividor)/2);
					        })
					 .attr("y",function(d,i) {
					           return (demo_height-(radius/constant_dividor)*2) - barData[XExtentValue[i]]*(radius/constant_dividor)*2 - demo_padding;
					        })
					 .attr("width",(radius/constant_dividor)*2+(radius/constant_dividor))
			         .attr("height", function(d,i) {
					           return (barData[XExtentValue[i]]*(radius/constant_dividor)*2);
						   })



	 	demo_svg.selectAll('circle')
				  	 .data(demodata)
					 .enter()
					 .append("circle")
					 .attr("fill",function(d,i){
					 	//id = d3.select(this).attr("id").split("_")[1];
                        selection_id = "id_"+i;
					    return (transformed_data[getIndexBasedOnId(selection_id)].Color);
					 	//return demodata[i]['Color'];
					  })
					 .attr("stroke","black")
					 .attr("id", function(d,i){
					 	 selection_id = "id_"+i;
					    return (transformed_data[getIndexBasedOnId(selection_id)].Color);
					  })
					 .attr("r",function(){return (radius/constant_dividor);})
		             .attr("cx", function(d,i){
						         return xScale(data_temp[i]);
								})
		             .attr("cy", function(d,i) {
								 barData[data_temp[i].toString()] --;
								 return (demo_height-(radius/constant_dividor)*2) - barData[data_temp[i].toString()]*(radius/constant_dividor)*2 - demo_padding-(radius/3);
		                        })
				     .on('mouseenter', function(d,i) {
					        d3.select(".div1").selectAll("#"+transformed_data[i]['dataId']).classed("recomSelect",true);
 			          })
					  .on('mouseleave', function(d,i) {
					        d3.select(".div1").selectAll("#"+transformed_data[i]['dataId']).classed("recomSelect",false);

 			          })


}

function recom_urgency(recom, id)
{
     var urgency;
     if(recom[id].weight <=0.8)
     {

         urgency="normal";
     }
     else if(recom[id].weight >0.8 && recom[id].weight <=1.6 )
     {

         urgency="middle";
     }
     else
     {

         urgency="important";
     }
     return urgency;

}

function length_innerDiv()
{
	var count = $(".inner-div4 > span").length;
	span_width = $('.inner-div4 > span').width();

	return count*span_width;
}


var SCROLL_OFFSET = 100;
$( document ).ready(function() {
	$(".scroll-left").attr('style', function() { return 'line-height: '+$('.div4').height()+'px !important;' });
	$(".scroll-right").attr('style', function() { return 'line-height: '+$('.div4').height()+'px !important;' });


     $(".scroll-right").click(function() {
         inner_width=length_innerDiv();
         parent_width = $('.div4').width();

         if (inner_width<=parent_width){
         	$(".inner-div4").css("left", 15 + "px")
         	return;
         }


     	 if($(".inner-div4").css("left").split("px")[0] != "auto")
	   	 {
             current_margin = $(".inner-div4").css("left").split("px")[0];
	         $(".inner-div4").css("left", Number(current_margin)-SCROLL_OFFSET + "px")
	   	 }
	   	 else
	   	 {
	   	 	$(".inner-div4").css("position","absolute");
	   	 	$(".inner-div4").css("left", "0px")
	   	 	$(".inner-div4").css("height", $('.div4').height())
	   	 }


	 });

     $(".scroll-right").hover(function(d) {

     	 d3.select(this).style('cursor','hand');

	 }, function(d){
         d3.select(this).style('cursor','auto');
	 });

	   $(".scroll-left").click(function() {
	   	 inner_width=length_innerDiv();
	   	 parent_width = $('.div4').width();

         if (inner_width<=parent_width){
         	$(".inner-div4").css("left", 15 + "px")
         	return;
         }

     	 if($(".inner-div4").css("left").split("px")[0] != "auto")
	   	 {
             current_margin = $(".inner-div4").css("left").split("px")[0];
	         $(".inner-div4").css("left", Number(current_margin)+SCROLL_OFFSET + "px")
	   	 }
	   	 else
	   	 {
	   	 	$(".inner-div4").css("position","absolute");
	   	 	$(".inner-div4").css("left", "0px")
	   	 	$(".inner-div4").css("height", $('.div4').height())
	   	 }
	 });
     $(".scroll-left").hover(function(d) {

     	 d3.select(this).style('cursor','hand');

	 }, function(d){
         d3.select(this).style('cursor','auto');
	 });

});


function addRecom_bar(recom, id, recomID,data_temp,mainText, recomText,VisState ,AddrecomFunction,RemoverecomFunction)
{

	recomUrgency=recom_urgency(recom, id);
  	jQuery('<span/>', {
   		id: 'recom_'+ recomID,
   		class: 'recommendationBar hidden ' + recomUrgency,
   		html: "<br />"+mainText + "<strong>"+recomText+"</strong><br />",
   	}).appendTo('.inner-div4');

   demo_bar(recomID, data_temp);

	$('#recom_' + recomID).fadeIn("slow");
	// Reject button
	$('#recom_' + recomID).prepend('<a id="reject" class="btn" href="#"><i class="fa fa-times-circle"></i></a>');
	$('#recom_' + recomID).find("#reject").click(function() {
		removeRecommendation_bar(recomID); // remove the recom container
		RemoverecomFunction();
	});

	// Accept button
	$('#recom_' + recomID).prepend('<a id="accept" class="btn" href="#"><i class="fa fa-check-circle">&nbsp;</i></a>');
	$('#recom_' + recomID).find("#accept").click(function() {
		removeRecommendation_bar(recomID); // remove the recom container
		AddrecomFunction(); // run the function that is passed as parameter
	});

}

// Removes the recommendation div
function removeRecommendation_bar(recomID){
	$('#recom_' + recomID).slideUp( "slow", function() { $('#recom_' + recomID).remove(); });
}


function removeAllRecommendations_bar()
{
	$('.inner-div4').empty();

}


function demo_scatter(recomID, data_temp)
{

    //demo_width= 350;
	//demo_height="70%";
	demo_padding=10;
	recom_height= $(".inner-div4").height()*0.75;
	demo_svg = d3.select("body").select(".inner-div4").select('#recom_' + recomID).insert("svg").attr("height",recom_height).attr("width",recom_height*1.6);;

	demo_width = $('#recom_' + recomID + " > svg").width();
	demo_height = $('#recom_' + recomID + " > svg").height();
	//.attr("height",demo_height)

	demo_pca_x_coordination=[];
    demo_pca_y_coordination=[];
    for (var i=0; i<transformed_data.length; ++i) {
            demo_pca_x_coordination.push(data_temp[i].x);
			demo_pca_y_coordination.push(data_temp[i].y);
    }

	X = [Math.min.apply(Math,demo_pca_x_coordination),Math.max.apply(Math,demo_pca_x_coordination)];
	xScale = XScaleGenerator("linear",0,demo_width, X,demo_padding,demo_padding);

	Y = [Math.min.apply(Math,demo_pca_y_coordination),Math.max.apply(Math,demo_pca_y_coordination)];
	yScale = YScaleGenerator("linear",0,demo_height, Y,demo_padding,demo_padding);



	demo_svg.selectAll('circle')
		    .data(transformed_data)
	    	.enter()
			.append("circle")
			.attr("class","recomState")
			.attr("fill",function(d,i){return transformed_data[i]['Color'];})
			.attr("id", function(d,i){return "id_" + i.toString();})
			.attr("r",function(d,i){return (Number(transformed_data[i]['Radius'])/constant_dividor);})
		    .attr("cx", function(d,i){
			         return xScale(data_temp[i].x);
			})
		    .attr("cy", function(d,i) {
			         return yScale(data_temp[i].y);
			})
			.on('mouseenter', function(d,i) {

				d3.select(".div1").selectAll("#"+transformed_data[i]['dataId']).classed("recomSelect",true);
 			})
			.on('mouseleave', function(d,i) {
			    d3.select(".div1").selectAll("#"+transformed_data[i]['dataId']).classed("recomSelect",false);
 			})

}


function addRecom_scatter(recom, id, recomID,data_temp, mainText, recomText_X, recomText_Y,VisState ,AddScatterFunction,RemoveScatterFunction)
{
	recomUrgency=recom_urgency(recom, id);
  	jQuery('<span/>', {
   		id: 'recom_'+ recomID,
   		class: 'recommendationBar hidden '+recomUrgency,
   		html: "<br />"+mainText +"<strong>"+recomText_X +"</strong>"+" and "+"<strong>"+recomText_Y+"</strong><br />",
   	}).appendTo('.inner-div4');


    demo_scatter(recomID, data_temp);

    //console.log(data_temp);

	$('#recom_' + recomID).fadeIn("slow");
	// Reject button
	$('#recom_' + recomID).prepend('<a id="reject" class="btn" href="#"><i class="fa fa-times-circle"></i></a>');
	$('#recom_' + recomID).find("#reject").click(function() {
		removeRecommendation_scatter(recomID); // remove the recom container
		RemoveScatterFunction();
	});

	// Accept button
	$('#recom_' + recomID).prepend('<a id="accept" class="btn" href="#"><i class="fa fa-check-circle">&nbsp;</i></a>');
	$('#recom_' + recomID).find("#accept").click(function() {
		removeRecommendation_scatter(recomID); // remove the recom container
		AddScatterFunction(); // run the function that is passed as parameter
	});

}

// Removes the recommendation div
function removeRecommendation_scatter(recomID){
	$('#recom_' + recomID).slideUp( "slow", function() { $('#recom_' + recomID).remove(); });
}


function removeAllRecommendations_scatter()
{
	$('.inner-div4').empty();

}






function addDynRecom(recomID, recomText, recomCoord, addRecomFunc,removeRecomFunc)
{
	d3.select("svg").append("svg:foreignObject")
			.attr("id",'recom_'+ recomID)
			.attr("class", recomCoord.type)
			.attr("width", recomCoord.width)
			.attr("height",recomCoord.height)
			.attr("y", recomCoord.y)
			.attr("x", recomCoord.x)
		    .append("xhtml:span")
			.attr("class", "recommendation")
			.text(" "+recomText);

	$('#recom_' + recomID).fadeIn("slow");

	// Reject button
	$('#recom_' + recomID).prepend('<a id="reject" class="btn" href="#"><i class="fa fa-times-circle"></i></a>');
	$('#recom_' + recomID).find("#reject").click(function() {
		removeDynRecom(recomID); // remove the recom container
		removeRecomFunc();
	});
	// Accept button
	$('#recom_' + recomID).prepend('<a id="accept" class="btn" href="#"><i class="fa fa-check-circle">&nbsp;</i></a>');
	$('#recom_' + recomID).find("#accept").click(function() {
		removeDynRecom(recomID); // remove the recom container
		addRecomFunc(); // run the function that is passed as parameter
	});
}




function removeDynRecom(recomID){
	$('#recom_' + recomID).slideUp( "slow", function() { $('#recom_' + recomID).remove(); });
}




function removeAllDynRecom(val)
{
    if(val=="x")
    {
       recomCounter.x=0;
       $(".recomX").empty();
    }
    else if(val =="y")
    {
	   recomCounter.y=0;
	   $(".recomY").empty();
    }
    else if(val =="sorting")
    {
       $(".sorting").empty();
    }


}

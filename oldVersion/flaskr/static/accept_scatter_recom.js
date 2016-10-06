
function accept_scatter_recom(recom, id)
{
   drag_Status =true;
   if(VisState=="bar")
		RemoveGrouping();
   VisState="Scatter";
   removeAllDynRecom("x");
   removeAllDynRecom("y");
   removeAllDynRecom("sorting");
   removeAllRecommendations_bar() ;
   switch_case = id.split(',');
   id = get_recom_index(recom, id);
   if(switch_case[2]=="sorting")
      bar_order = switch_case[3];		
   xAxis_value = data_set_attributes[Number(switch_case[0])];
   yAxis_value = data_set_attributes[Number(switch_case[1])];
   console.log("x", xAxis_value,switch_case[0] );
   console.log("y", yAxis_value,switch_case[1]);	
   console.log(transformed_data)   
   for(var i=0; i<data[0].length; i++) {
	  transformed_data[i].x = data[Number(switch_case[0])][i];
	  console.log( transformed_data[i].x);
	  transformed_data[i].y = data[Number(switch_case[1])][i];
	  console.log( transformed_data[i].y);
   }
   turn_on_axis("x",xAxis_value);
   turn_on_axis("y",yAxis_value);
   
   console.log(transformed_data)
   Update_ScatterPlot_xy(transformed_data); 
   //setTimeout(function() { Update_ScatterPlot_y(transformed_data);  }, 1000);
  
      

} 


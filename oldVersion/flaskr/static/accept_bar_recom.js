function accept_bar_recom(id)
 {
   // console.log("here");
   d3.selectAll("circle").classed("notGrouped",false)
   removeAllDynRecom("x");
   removeAllDynRecom("y");
   removeAllDynRecom("sorting");
   removeAllRecommendations_bar(); 
   switch_case = id.split(',');
    

   xAxis_value = data_set_attributes[Number(switch_case[0])];
   turn_on_axis("x",xAxis_value);
   yAxis_value="Count";
   turn_on_axis("y",yAxis_value); 
                            
   bardata2=[];
   for(var i=0; i<data[0].length; i++) 
      {
         bardata2.push(data[Number(switch_case[0])][i]);
      }
   draw_bar(bardata2,xAxis_value, yAxis_value, "vertical",radius,bar_order); 
 }

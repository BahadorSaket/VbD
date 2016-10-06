type= " ";
      
        x1=0;
        y1=0;
        drag = d3.behavior.drag().on('dragstart',function(d,i){ 
          
             if(d3.select(this).classed("handler"))
             {
              
               axisStat = false;
               x2=d3.select("#id_"+i).attr("cx"); /* get current X postion of the main circle*/
               y2=d3.select(this).attr("cy");
             }
             d3.event.sourceEvent.stopPropagation();
        }).on("drag", function(d,i) { 

                       /* This makes sure that while dragging a circle all the axes are invisible *************/
                  if(axisStat==true)
                  {
                    console.log("bingo")
                     turn_off_axis("x");
                     turn_off_axis("y");

                       turn_on_notick("x");
                       turn_on_notick("y");
                  } 
        
                  

                        type= " ";
                        if(this.tagName=='circle'){
                            
                            

                            /* This event is for dragging handler of each circle ******************************/
                           if(d3.select(this).classed("handler"))
                           {
                              axisStat = false;
                              ray =  d3.event.x -x2;
                              d3.select("#id_"+i).attr("r",ray); /* change radius of the main circle by dragging the handler*/
                              transformed_data[i]['Radius'] = ray;
                              d3.select(this).attr('cx', d3.event.x).attr('cy', y2)
                           }
                          else{ /* This event is for dragging a single circle ******************************/
                              type="circle";
                                axisStat = true;
                                CircleID = d3.select(this).attr("id");   
                                /* Change the strok's style for the circle which was dragged recently  *************/
                                if(drag_Status == true)
                                {
                                     d3.selectAll("circle").classed("notDragged",true);
                                     d3.selectAll("circle").classed("lastDragged",false);
                                     drag_Status =false;
                                }
                                else
                                {
                                     
                                     d3.select("#"+CircleID).classed("lastDragged", true);
                                     d3.select("#"+CircleID).classed("notDragged",false);
                                     drag_Status =false;
                                                      
                                }
                                                        
                                 /* set X and Y position of the main circle*/
                                x1 = d3.event.x;
                                y1 = d3.event.y;
                                transformed_data[i]['x'] = x1;
                                transformed_data[i]['y'] = y1;
                                d3.select(this).attr("cx",x1).attr("cy",y1);
                            
                                 /* set X and Y position of the handler based on the current position of the main circle*/
                                var rad = d3.select(this).attr("r");
                                d3.select("#handler_"+i).attr("cx", function(){ return (Number(rad) + x1);});
                                d3.select("#handler_"+i).attr("cy", function(){ return (y1);});
                            }
                        }
                        else{ /* If the user is dragging a GROUP of circles ****************************************/
                          // console.log(this.tagName)
                             axisStat = true;
                           if(drag_Status == true)
                            {
                                
                              //  d3.selectAll("circle").classed("lastDragged",false);
                                d3.selectAll("circle").classed("notDragged",false);
                                d3.select(this).selectAll("circle").classed("notDragged",true);
                                d3.select(this).selectAll("circle").classed("lastDragged",false);
                                drag_Status =false;
                            }
                            else
                            {
                                d3.select(this).selectAll("circle").classed("lastDragged",true);
                                d3.select(this).selectAll("circle").classed("notDragged",false);
                                drag_Status =false;
                            }
                            d3.select(this).attr("transform", function(d,i){
                                 type="group";
                                 x +=  d3.event.dx;
                                 y +=  d3.event.dy;
                    
                                 return "translate(" + [ x, y ] + ")";
                             })
                        } 
                })
                .on("dragend",function(d,i){
                  
                  if(d3.select(this).classed("handler"))
                  {
                      for (var j=0; j<transformed_data.length; ++j) {
                          datapoint_size[i]=transformed_data[i].Radius;
                      }
                       size_clusters=[];
                      thresHold=0.06;
                      k_counter=0;
                      rec_size = size_recomm(data, datapoint_size); 
                    
                      size_recoms = sortWithIndeces(rec_size.Score);
                      size_recoms_before = size_recoms.sortIndices.join(",");
                      size_recoms=size_recoms_before.split(",") ;
                      for(k=0;k<size_recoms.length;k++)
                      { 
                          if(rec_size.Score[Number(size_recoms[k])] >= thresHold)
                          {
                            size_clusters[k_counter] = Number(size_recoms[k]);
                            k_counter ++;

                          }
                      }
                    
                    //  original_data = transformed_data.slice(0);  
                      show_car_details(i,clusters,size_clusters,output);  
                     //console.log(size_clusters)

                      //d3.select(this).style("fill","red");
                      //transformed_data[i]['Color']="red"; 
                  }
                  if(axisStat==true)
                  {
                      pca_data_transformation(transformed_data);

                      define_vis_status_afterDragg();

                      rec_X = dist_recomm(data, pca_x_coordination);
            
                      rec_Y = dist_recomm(data, pca_y_coordination);
                    

                      sorting = bar_sorting();
                      


                      bar_orientation = check_collison(i);
                      
                      /* This function returns an array of all recommendations */ 
                       Recommendation= generateRecom(bar_orientation, rec_X, rec_Y, Recommendation,xAxis_value,sorting,clusters);
                      
                     // console.log(Recommendation)

                      /* This fucntion shows all the recoomendations */
                      cal_Recom_weight(Recommendation);
                }
                
            });

       

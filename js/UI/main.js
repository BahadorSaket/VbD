(function(){
  var dataCallBack = function(){
        startVis(dataset);
        for(i=0;i<dataset.length;i++)
        {
          $('<div/>', {
            id:dataset[i].ID,
            class:"name",
            html:dataset[i].Name,
          }).appendTo('.table');
        }
  };

  d3.csv("data/fake.csv", function(csv) {
       dataset= csv.slice(0);
       ial.init(dataset);
       loadAttributSelectors(dataset);
       dataCallBack();
  });
})();

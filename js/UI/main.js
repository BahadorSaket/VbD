(function(){

/*

  */


  var dataCallBack = function(){
        startVis(dataset);
  };

  d3.csv("data/fake.csv", function(csv) {
       dataset= csv.slice(0);
       loadAttributSelectors(dataset);
       dataCallBack();
  });


})();

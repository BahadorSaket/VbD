

var excludedAttributes=["ID","Type","Name","x","y","color","r"];

/************************************************************************************/
// This function returns a list of attributes that have numerical values and will be counted in our calculations.
function getAttributes(dataset)
{
  var Attr= Object.keys(dataset[0]);
  var attrTemp =[];
  for (var i=0; i<Attr.length; i++)
  {
    if(excludedAttributes.indexOf(Attr[i]) == -1) // this check if all data attributes are numerical
    {
      attrTemp.push(Attr[i]);
    }
  }
  return attrTemp;
}

/************************************************************************************/
//This function returns the X or Y position of all data points as a single array.
function getSingleAxisValues(Axis,newData){
  var X =[];
  for(i=0;i<newData.length;i++)
  {
    if(Axis=="xAxis")
    {
       X.push(newData[i].x);
    }
    else{
       X.push(newData[i].y);
    }
  }
  return X;
}
/************************************************************************************/
//This function returns an array which contains normalized value of all data attributes.
function getNormalizedData(data, Attr, X){
  var data_norm = [];

  for (var i=0; i<Attr.length; i++) {
    var min = d3.min(data, function(d,j){ return +data[j][Attr[i]];})
    var max = d3.max(data, function(d,j){ return +data[j][Attr[i]];})
    var tmpAttr = [];
  	for (var k=0; k<data.length; k++) {
  		tmpAttr[k] = (data[k][Attr[i]]-min)/(max-min);
    }
    data_norm.push({[Attr[i]]:tmpAttr});
  }
  return data_norm;
}
/************************************************************************************/
// Calculate differences in distances
function scatterAxesRecomCalculation(Axis, data, newData) {
  var X_norm = [];

  var X = getSingleAxisValues(Axis, newData);
  var Attr = getAttributes(dataset);
  var data_norm = getNormalizedData(data, Attr, X);
  var min = d3.min(X), max = d3.max(X);

  for (var i=0; i<X.length; i++) {
    X_norm[i] = (X[i]-min)/(max-min);
  }

  var distScore = [];
  for (var i=0; i<Attr.length; i++) {
    var distSum = 0;
    for (var j=0; j<data.length; j++) {
      distSum += (X_norm[j]-data_norm[i][Attr[i]][j])*(X_norm[j]-data_norm[i][Attr[i]][j]);
    }
    if(isNaN(distSum))
      distScore.push({[Attr[i]]:1000});
    else
      distScore.push({"key":Attr[i], "val":distSum});
  }
//  console.log(distScore);
  return distScore;
}

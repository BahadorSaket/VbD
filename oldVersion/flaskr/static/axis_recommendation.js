function dist_recomm(data, X, draggedID) {
	// Normalize current axis values
	var X_norm = [];
	var min = mymin(X, draggedID),
		max = mymax(X, draggedID);
	for (var i=0; i<draggedID.length; i++) {
		X_norm[i] = (X[draggedID[i]]-min)/(max-min);
	}
	
	// Normalize data
	var data_norm = [];
	var numAttr = data.length; // number of attributes
	var numData = draggedID.length; //data[0].length;
	for (var i=0; i<numAttr; i++) {
		var min = mymin(data[i], draggedID),
			max = mymax(data[i], draggedID);
		var tmpAttr = [];
		for (var j=0; j<numData; j++) {
			tmpAttr[j] = (data[i][draggedID[j]]-min)/(max-min);
		}
		data_norm[i] = tmpAttr;
	}

	// Calculate differences in distances
	var distScore = [];
	for (var i=0; i<numAttr; i++) {
		var distSum = 0;
		for (var j=0; j<numData; j++) {
			distSum += (X_norm[j]-data_norm[i][j])*(X_norm[j]-data_norm[i][j]);
		}
		if(isNaN(distSum))
			distScore[i] = 1000;
		else
		    distScore[i] = distSum;
	}


	console.log(distScore);
	return {'Score': distScore};

	//return recAttr;
}

function mymin(array, index) {
	if (index==undefined)
		return d3.min(array)
	else {
		var val = Infinity;
		for (var i=0; i<index.length; i++) {
			if (val > array[index[i]]) {
				val = array[index[i]];
			}
		}
		return val;
	}
}
function mymax(array, index) {
	if (index==undefined)
		return d3.max(array)
	else {
		var val = -Infinity;
		for (var i=0; i<index.length; i++) {
			if (val < array[index[i]]) {
				val = array[index[i]];
			}
		}
		return val;
	}
}


/**********************************************************************/
function size_recomm(data,dataPointSize){
    // Normalize data points size
  var Size_norm = [];
	var min = d3.min(dataPointSize),
	max = d3.max(dataPointSize);
  numResizedPoints =0;
	for (var i=0; i<dataPointSize.length; i++) {

        if(dataPointSize[i] > radius)
        {
            Size_norm[i] = 0.5 * (1+ ((dataPointSize[i] - (radius*radius)*3.14)/(max - (radius*radius)*3.14 )));
            numResizedPoints  ++;
        }
        else if((dataPointSize[i] < radius))
        {
            Size_norm[i] = 0.5 * (((radius*radius)*3.14 - dataPointSize[i])/((radius*radius)*3.14 - min));
            numResizedPoints  ++;
        }
        else
        {
        	Size_norm[i] = 0.5;
        }

	}



    // Normalize data
    var data_norm = [];
	var numAttr = data.length; // number of attributes
	var numData = data[0].length;
	for (var i=0; i<numAttr; i++) {
		var min = d3.min(data[i]),
			max = d3.max(data[i]);
		var tmpAttr = [];
		for (var j=0; j<numData; j++) {
			tmpAttr[j] = (data[i][j]-min)/(max-min);
		}
		data_norm[i] = tmpAttr;
	}


  // dis function
  var distScore = [];
	for (var i=0; i<numAttr; i++) {
		var distSum = 0;
		for (var j=0; j<dataPointSize.length; j++) {
			if(Size_norm[j] != 0.5)
			     distSum += ((data_norm[i][j] - Size_norm[j])*(data_norm[i][j] - Size_norm[j]))/numResizedPoints;
		}
		if(isNaN(distSum))
			distScore[i] =1;
		else
			distScore[i] = (numResizedPoints/numAttr)*distSum;
	}
    return {'Score': distScore};
}


/*********************************************************************/
function clustering_recomm(data, nbr_list) { // weighted k-means
	// data: attr.item

	// Normalize current axis values
	var X_norm = [];
	var min = d3.min(X),
		max = d3.max(X);
	for (var i=0; i<X.length; i++) {
		X_norm[i] = (X[i]-min)/(max-min);
	}

	// Normalize data
	var data_norm = [];
	var numAttr = data.length; // number of attributes
	var numData = data[0].length;
	for (var i=0; i<numAttr; i++) {
		var min = d3.min(data[i]),
			max = d3.max(data[i]);
		var tmpAttr = [];
		for (var j=0; j<numData; j++) {
			tmpAttr[j] = (data[i][j]-min)/(max-min);
		}
		data_norm[i] = tmpAttr;
	}

	// Check which attributes
	// for

	// Calculate weighted distances

}

// function k_means(data, k) {
// 	// random initial centroids
// 	var centroid = [];
// 	for (var i=0; i<k; i++) {
// 		var tmpcent = [];
// 		for (var j=0; j<data.length; j++) {
// 			tmpcent[j] = Math.random();
// 		}
// 		centroid[i] = tmpcent;
// 	}

// 	if (weight === undefined) {
// 		var weight = [];
// 		for (var i=0; i<data.length; i++) {
// 			weight[i] = 1/k;
// 		}
//     }

//     var iter = 0;
// 	while (iter <= 5) {
// 		km = k_means_loop(data, centroid);
// 		cluster = km.cluster;
// 		centroid = km.centroid;
// 		iter ++;
// 		if (km.k<k)
// 	}
// }

function k_means_loop(data, centroid, weight) {
	var k = centroid.length;

	// Assign data items to clusters
	var cluster = [];
	for (var i=0; i<data[0].length; i++) {
		var min_dist = Infinity;
		var assn = 0;
		for (var j=0; j<k; j++) {
			var dist = 0;
			for (var h=0; h<data.length; h++) {
				dist += weight[h] * (centroid[j][h] - data[h][i]);
			}
			if (dist < min_dist) {
				min_dist = dist;
				assn = j;
			}
		}
		cluster[i] = assn;
	}

	// Update cluster centroids
	for (var i=0; i<k; i++) {
		for (var j=0; j<data.length; j++) {
			centroid[i][j] = 0;
		}
		count[i] = 0;
	}
	for (var i=0; i<data[0].length; i++) {
		var assn = cluster[i];
		for (var j=0; j<data.length; j++) {
			centroid[assn][j] += data[j][i];
			count[assn]++;
		}
	}
	for (var i=0; i<k; i++) {
		if (count[i]>0) {
			for (var j=0; j<data.length; j++) {
				centroid[i][j] = centroid[i][j]/count[i];
			}
		} else {
			// when there's an empty cluster
			delete centroid[i];
			delete count[i];
			k--;
			for (var j=0; j<data[0].length; j++) {
				if (cluster[j]>i) {
					cluster[j]--;
				}
			}
		}
	}

	return {"cluster": cluster, "centroid": centroid, "k": centroid.length};
}

function color_recomm(data, trans_data) {
	var numAttr = data.length; // number of attributes
	var numData = data[0].length;
	var color_trans = d3.nest()
		.key(function(d) {return d.Color;})
		.rollup(function(v) {return v.map(function (el) {return Number(el.dataId.substring(3));});})
		.entries(trans_data)
		.filter(function(d) {return d.key!="#85E087";});
	var colorSet = color_trans.map(function(el) {return el.key;});
	var output = [];
	for (var i=0; i<categorical.length; i++) {
		var tmpClr = [];
		for (var j=0; j<color_trans.length; j++) {
			var attrVal = data[categorical[i]][color_trans[j].values[0]];
			var tmpDataCol = [];
			for (var k=0; k<color_trans[j].values.length; k++) {
				tmpDataCol[k] = data[categorical[i]][color_trans[j].values[k]];
			}
			if (uniqueNo(tmpDataCol)==1) {
				tmpClr.push([color_trans[j].key, attrVal]);
			}
		}
		if (tmpClr.length == colorSet.length) {
			var tmpVals = [];
			tmpClr.forEach(function(d) {tmpVals.push(d[1]);});
			if (uniqueNo(tmpVals) == colorSet.length) {
				output.push({"attr":categorical[i], "val":tmpClr});
			}
		}
	}
	//console.log(output);
	return output;
}

function determ_var(data) { // decide which attributes are categorical? execute once at the start?
	var numAttr = data.length; // number of attributes
	var numData = data[0].length;
	var categorical = [];
	for (var i=0; i<numAttr; i++) { // checks each attribute column whether it's categorical
		var unqNo = uniqueNo(data[i]);
		if (unqNo < d3.min([numData/2,10])) { // by counting the number of unique values
			categorical.push(i);
		}
	}
	// console.log(categorical);
	return categorical;
}

function uniqueNo(arr) { // return the number of unique values in an array
    var a = [], prev;
    arr.sort();
    for ( var i = 0; i < arr.length; i++ ) {
        if ( arr[i] !== prev ) {
            a.push(arr[i]);
        }
        prev = arr[i];
    }
    return a.length;
}

function coloring_preview(fake_data, id, output) {
	//console.log("output");
	//console.log(output);

	 var color_assgn = [];
	 output.forEach(function(d) {
	 	if (d.attr == id) {
	 		color_assgn = d.val;
	 	}
	 });
	 fake_data.forEach(function(d) {
	 	d.Color = transformed_data[d.dataId.substring(3)].Color;
	 	for (var i=0; i<color_assgn.length; i++) {
	 		var color = color_assgn[i][0]; // red or blue
	 		if (data[id][d.dataId.substring(3)] == color_assgn[i][1]) {
	 			d.Color = color;
	 		}
	 	}
	 });
	 return fake_data;
}

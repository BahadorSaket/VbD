/**
 * Created by arjun010 on 12/28/15.
 */
(function() {
    ial = {};
    this.ialIdToDataMap = {};
    this.useNormalizedAttributeWeights;
    /*
     * specialAttributeList is an optional list of one or more attributes
     * condition is either 'includeOnly','exclude'
     * */
    ial.init = function(passedData,normalizeAttributeWeights,specialAttributeList,condition) {
        normalizeAttributeWeights = typeof normalizeAttributeWeights !== 'undefined' ? normalizeAttributeWeights : 0;
        specialAttributeList = typeof specialAttributeList !== 'undefined' ? specialAttributeList : [];
        if(specialAttributeList.length>0){
            if(['includeOnly','exclude'].indexOf(condition)==-1){
                throw 'ERROR: condition must be "includeOnly" or "exclude"';
                return ;
            }
        }

        this.attrVector = {};
        this.dataSet = passedData;
        this.clusters = [];
        this.attributeWeightVector = {}; // map of attributes to weights in range [0,1]
        this.ialIdToDataMap  = {}; // map from ialId to actual data item
        this.attributeValueMap = {}; // map from attribute name to its data type and summary statistics about it
        this.activeAttributeCount = 0;
        this.sessionLogs = [];

        this.interactionQueue = [];
        this.attributeWeightVectorQueue = [];
        this.biasLogs = [];
        this.maxQueueSize = 10000;
        this.BIAS_ATTRIBUTE_WEIGHT = 'bias_attribute_weight';
        this.BIAS_VARIANCE = 'bias_variance';
        this.BIAS_SUBSET = 'bias_subset';
        this.BIAS_REPETITION = 'bias_repetition';
        // TODO: update this if more metrics are added
        this.BIAS_TYPES = [this.BIAS_ATTRIBUTE_WEIGHT, this.BIAS_VARIANCE, this.BIAS_SUBSET, this.BIAS_REPETITION]; 
        this.ATTRIBUTE_SCORES = ['span', 'average', 'max'];

        // initializing attributeWeightVector and attributeValueMap
        var attributeList = Object.keys(passedData[0]);
        for (var attribute in passedData[0]) {
            var shouldConsiderAttribute = 1;
            if (attribute == "ial");
            else {
                if(specialAttributeList.length>0){
                    if(condition=='includeOnly'){
                        if(specialAttributeList.indexOf(attribute)==-1){ // if specialAttributeList does not contain attribute, exclude
                            shouldConsiderAttribute = -1;
                        }
                    }else if(condition=='exclude'){
                        if(specialAttributeList.indexOf(attribute)>-1){ // if specialAttributeList contains attribute, exclude
                            shouldConsiderAttribute = -1;
                        }
                    }
                }
                if(shouldConsiderAttribute==1){
                    this.activeAttributeCount += 1;
                    this.attributeWeightVector[attribute] = 1.0;
                    var isCategorical = false;
                    var uniqueVals = new Set();
                    for (var index in passedData) {
                        this.dataSet[index]["ial"] = {};
                        this.dataSet[index]["ial"]["id"] = index;
                        this.dataSet[index]["ial"]["weight"] = 1;
                        this.ialIdToDataMap[index] = this.dataSet[index];

                        if (isNaN(this.dataSet[index][attribute])) {
                            isCategorical = true;
                            break;
                        }
                        uniqueVals.add(this.dataSet[index][attribute]);
                    }

                    // if there are 3 or fewer values, define it as categorical
                    if (uniqueVals.size < 4) isCategorical = true;

                    if (isCategorical) {
                        this.attributeValueMap[attribute] = {
                            'min': passedData[0][attribute],
                            'max': passedData[0][attribute],
                            'mean': passedData[0][attribute],
                            'variance': passedData[0][attribute],
                            'distribution': {},
                            'dataType': 'categorical'
                        };
                    } else {
                        this.attributeValueMap[attribute] = {
                            'min': parseFloat(passedData[0][attribute]),
                            'max': parseFloat(passedData[0][attribute]),
                            'mean': parseFloat(passedData[0][attribute]),
                            'variance': parseFloat(passedData[0][attribute]),
                            'distribution': {},
                            'dataType': 'numeric'
                        };
                    }
                }
            }
        }

        if(normalizeAttributeWeights==1) {
            this.useNormalizedAttributeWeights = 1;
            ial.normalizeAttributeWeightVector();
        } else this.useNormalizedAttributeWeights = 0;

        // find mean, min, and max for all attributes
        for (var attribute in this.attributeValueMap) {
            if (this.attributeValueMap[attribute]['dataType'] == 'numeric') {
                var curMean = 0;
                var curMin = parseFloat(passedData[0][attribute]);
                var curMax = parseFloat(passedData[0][attribute]);
                for (var index in passedData) {
                    var dataItem = passedData[index];
                    var curVal = parseFloat(dataItem[attribute]);
                    if (curVal < curMin) curMin = curVal;
                    if (curVal > curMax) curMax = curVal;
                    curMean += curVal;
                }
                this.attributeValueMap[attribute]['min'] = curMin;
                this.attributeValueMap[attribute]['max'] = curMax;
                this.attributeValueMap[attribute]['mean'] = curMean / passedData.length;
            } else { // categorical
                var curDistribution = {};
                var curMean = passedData[0][attribute];
                var curMin = passedData[0][attribute];
                var curMax = passedData[0][attribute];
                for (var index in passedData) {
                    var dataItem = passedData[index];
                    var curVal = dataItem[attribute];

                    if (curDistribution.hasOwnProperty(curVal)) curDistribution[curVal]++;
                    else curDistribution[curVal] = 1;

                    if (curVal < curMin) curMin = curVal;
                    if (curVal > curMax) curMax = curVal;
                }
                this.attributeValueMap[attribute]['min'] = curMin;
                this.attributeValueMap[attribute]['max'] = curMax;

                this.attributeValueMap[attribute]['distribution'] = curDistribution;
                var keyVals = Object.keys(curDistribution).sort();
                var halfwayPoint = Math.floor(passedData.length / 2);
                var curCount = 0;
                for (var i = 0; i < keyVals.length; i++) {
                    var curKey = keyVals[i];
                    curCount += curDistribution[curKey];
                    if (curCount >= halfwayPoint) {
                        this.attributeValueMap[attribute]['mean'] = curKey;
                        break;
                    }
                }
            }
        }

        // find variance
        for (var attribute in this.attributeValueMap) {
            if (this.attributeValueMap[attribute]['dataType'] == 'numeric') {
                var attrMean = parseFloat(this.attributeValueMap[attribute]['mean']);
                var attrVariance = 0;
                for (var index in passedData) {
                    var dataItem = passedData[index];
                    if (!isNaN(dataItem[attribute])) {
                        var curValue = parseFloat(dataItem[attribute]);
                        var curSqDiff = (curValue - attrMean) * (curValue - attrMean);
                        attrVariance += curSqDiff;
                    } else {
                        attrVariance = dataItem[attribute];
                        break;
                    }
                }
                this.attributeValueMap[attribute]['variance'] = attrVariance / passedData.length;
            } else {
                // will compute entropy for categorical variables instead
                this.attributeValueMap[attribute]['variance'] = computeAttributeVariance(this.dataSet, attribute);
            }
        }

        for(var index in passedData){
            this.dataSet[index]["ial"]["itemScore"] = parseFloat(getItemScore(this.ialIdToDataMap[index],this.attributeWeightVector));
        }
    };

// set the given list of attributes to categorical
    ial.setCategorical = function(attributeList) {
        for (var j = 0; j < attributeList.length; j++) {
            var attribute = attributeList[j];
            this.attributeValueMap[attribute]['dataType'] = 'categorical';

            var curDistribution = {};
            var curMean = this.dataSet[0][attribute];
            var curMin = this.dataSet[0][attribute];
            var curMax = this.dataSet[0][attribute];
            for (var index in this.dataSet) {
                var dataItem = this.dataSet[index];
                var curVal = dataItem[attribute];

                if (curDistribution.hasOwnProperty(curVal)) curDistribution[curVal]++;
                else curDistribution[curVal] = 1;

                if (curVal < curMin) curMin = curVal;
                if (curVal > curMax) curMax = curVal;
            }
            this.attributeValueMap[attribute]['min'] = curMin;
            this.attributeValueMap[attribute]['max'] = curMax;

            this.attributeValueMap[attribute]['distribution'] = curDistribution;
            var keyVals = Object.keys(curDistribution).sort();
            var halfwayPoint = Math.floor(this.dataSet.length / 2);
            var curCount = 0;
            for (var i = 0; i < keyVals.length; i++) {
                var curKey = keyVals[i];
                curCount += curDistribution[curKey];
                if (curCount >= halfwayPoint) {
                    this.attributeValueMap[attribute]['mean'] = curKey;
                    break;
                }
            }

            // will compute entropy for categorical variables instead
            this.attributeValueMap[attribute]['variance'] = computeAttributeVariance(this.dataSet, attribute);
        }
    }

// set the given list of attributes to numerical
    ial.setNumeric = function(attributeList) {
        for (var j = 0; j < attributeList.length; j++) {
            var attribute = attributeList[j];
            this.attributeValueMap[attribute]['dataType'] = 'numeric';
            var curMean = 0;
            var curMin = parseFloat(this.dataSet[0][attribute]);
            var curMax = parseFloat(this.dataSet[0][attribute]);
            for (var index in this.dataSet) {
                var dataItem = this.dataSet[index];
                var curVal = parseFloat(dataItem[attribute]);
                if (curVal < curMin) curMin = curVal;
                if (curVal > curMax) curMax = curVal;
                curMean += curVal;
            }
            curMean /= this.dataSet.length;
            this.attributeValueMap[attribute]['min'] = curMin;
            this.attributeValueMap[attribute]['max'] = curMax;
            this.attributeValueMap[attribute]['mean'] = curMean;

            var normAttrMean = (curMean - curMin) / (curMax - curMin);
            var attrVariance = 0;
            for (var index in this.dataSet) {
                var dataItem = this.dataSet[index];
                if (!isNaN(dataItem[attribute])) {
                    var curValue = parseFloat(dataItem[attribute]);
                    var curNormValue = (curValue - curMin) / (curMax - curMin);
                    var curSqDiff = (curNormValue - normAttrMean) * (curNormValue - normAttrMean);
                    attrVariance += curSqDiff;
                } else {
                    attrVariance = dataItem[attribute];
                    this.attributeValueMap[attribute]['variance'] = attrVariance;
                    break;
                }
            }
            this.attributeValueMap[attribute]['variance'] = attrVariance / this.dataSet.length;
        }
    }

    ial.getAttributeVectorSum = function () {
        var weightSum = 0.0;
        for(var attribute in this.attributeWeightVector){
            weightSum += parseFloat(this.attributeWeightVector[attribute]);
        }
        return weightSum;
    };


    /*
     * computes item score
     * params: data point object, current attribute weight vector
     * */
    function getItemScore(d,attributeVector){
        var score = 0.0;
        for(var attribute in attributeVector){
            if(attributeVector[attribute]>0.0 && !isNaN(d[attribute])){
                var attributeVal = ial.getNormalizedAttributeValue(d[attribute],attribute);
                attributeVal *= attributeVector[attribute];
                score += attributeVal;
            }
        }
        score = parseFloat(Math.round(score* 10000) / 10000).toFixed(4);
        return score;
    }


    /*
     * updates item scores for all data points
     * */
    ial.updateItemScores = function () {
        for(var ialId in this.ialIdToDataMap){
            var d = this.ialIdToDataMap[ialId];
            d.ial.itemScore = parseFloat(getItemScore(d,this.attributeWeightVector));
        }
    };

    /*
     * Normalize weight vector
     * */
    ial.normalizeAttributeWeightVector = function () {
        var activeSum = 0;
        for(var attribute in this.attributeWeightVector){
            if(this.attributeWeightVector[attribute]!=0.0){
                activeSum += this.attributeWeightVector[attribute];
            }
        }
        for(var attribute in this.attributeWeightVector){
            if(this.attributeWeightVector[attribute]!=0.0){
                this.attributeWeightVector[attribute] = this.attributeWeightVector[attribute]/activeSum;
            }
        }
    };

    var inverseNormalizedMap = function(inputMap){
        for(var attribute in inputMap){
            inputMap[attribute] = 1-inputMap[attribute];
        }
        return inputMap;
    };

    var getNormalizedMap = function (inputMap) {
        var activeSum = 0;
        for(var attribute in inputMap){
            activeSum += inputMap[attribute];
        }
        for(var attribute in inputMap){
            inputMap[attribute] = inputMap[attribute]/activeSum;
        }

        return inputMap;
    };


    /*
     * returns the dataset
     * */
    ial.getData = function() {
        return this.dataSet;
    }

    /*
     * sets weight to new value
     * */
    ial.setItemWeight = function (d,newWeight,logEvent,additionalLogInfoMap) {
        logEvent = typeof logEvent !== 'undefined' ? logEvent : false;
        additionalLogInfoMap = typeof additionalLogInfoMap !== 'undefined' ? additionalLogInfoMap : {};

        var logObj = new LogObj(d);
        logObj.setOldWeight(d.ial.weight);
        logObj.setNewWeight(newWeight);
        logObj.setEventName('ItemWeightChange_SET');
        if(additionalLogInfoMap!={}){
            logObj.setCustomLogInfo(additionalLogInfoMap);
        }

        d.ial.weight = newWeight;

        if(logEvent==true){
            this.sessionLogs.push(logObj);
            // track item weight changes in interactionQueue
            ial.interactionEnqueue(logObj);
        }
    };

    /*
     * increments weight by increment value
     * */
    ial.incrementItemWeight = function (d,increment,logEvent,additionalLogInfoMap) {
        logEvent = typeof logEvent !== 'undefined' ? logEvent : false;
        additionalLogInfoMap = typeof additionalLogInfoMap !== 'undefined' ? additionalLogInfoMap : {};

        var logObj = new LogObj(d);
        logObj.setOldWeight(d.ial.weight);
        logObj.setEventName('ItemWeightChange_UPDATE');

        d.ial.weight += increment;

        logObj.setNewWeight(d.ial.weight);
        if(additionalLogInfoMap!={}){
            logObj.setCustomLogInfo(additionalLogInfoMap);
        }

        if(logEvent==true){
            this.sessionLogs.push(logObj);
            // track item weight changes in interactionQueue
            ial.interactionEnqueue(logObj);
        }
        //console.log(logObj)
    };

// returns the current attributeValueMap
    ial.getAttributeValueMap = function(){
        return ial.utils.clone(this.attributeValueMap);
    };

    /*
    * Function to delete an item from all computations.
    * Given a dataItem object, removes the corresponding item from both the this.dataSet (list) and the this.ialIdToDataMap (hashmap)
    * */
    ial.deleteItem = function (dataItem) {
        var idToDelete = dataItem.ial.id;
        var indexToDelete = -1;
        for(var i in this.dataSet){
            var d = this.dataSet[i];
            var curId = d.ial.id;
            if(idToDelete==curId){
                indexToDelete=i;
                break;
            }
        }
        if(indexToDelete!=-1){
            this.dataSet.splice(indexToDelete,1);
            delete this.ialIdToDataMap[idToDelete];
        }
    };

    ial.addData = function (dataPoints) {
        for(var dataPoint of dataPoints){
            var newId = parseInt(this.dataSet[this.dataSet.length-1].ial.id);
            while(newId in this.ialIdToDataMap){
                newId += 1;
            }

            dataPoint['ial'] = {};
            dataPoint['ial']['id'] = newId;
            dataPoint['ial']['weight'] = 1;
            dataPoint['ial']['itemScore'] = parseFloat(getItemScore(dataPoint,this.attributeWeightVector));

            this.ialIdToDataMap[newId] = dataPoint;
            this.dataSet.push(dataPoint);
        }
    };

    /*
     * returns normalized value in [0,1] given an attribute's current value and name
     * ref: http://stackoverflow.com/questions/5294955/how-to-scale-down-a-range-of-numbers-with-a-known-min-and-max-value
     * */
    ial.getNormalizedAttributeValue = function(val,attribute) {
        if (this.attributeValueMap[attribute]['dataType'] != 'categorical') {
            var a = 0, b = 1;
            var min = this.attributeValueMap[attribute]['min'];
            var max = this.attributeValueMap[attribute]['max'];

            var normalizedValue;
            normalizedValue = ((b - a) * (val - min) / (max - min)) + a;
            return normalizedValue;
        } else { return val; }
    };

    /*
     * returns current attributeWeightVector
     * */
    ial.getAttributeWeightVector = function(){
        return ial.utils.clone(this.attributeWeightVector);
    };

    ial.getIalIdToDataMap = function () {
        return this.ialIdToDataMap;
    };

    /*
     * returns requested attribute's weight
     * */
    ial.getAttributeWeight = function (attribute) {
        if (attribute in this.attributeWeightVector){
            return this.attributeWeightVector[attribute];
        }else{
            throw "Attribute not available or not specifed in weight vector during initialization."
        }
    };


    /*
     * sets attribute's weight to newWeight. Checks to ensure that the weight is always in [0.0,1.0]
     * */
    ial.setAttributeWeight = function(attribute,newWeight,logEvent,additionalLogInfoMap){

        logEvent = typeof logEvent !== 'undefined' ? logEvent : false;
        additionalLogInfoMap = typeof additionalLogInfoMap !== 'undefined' ? additionalLogInfoMap : {};

        var logObj = new LogObj(attribute);
        logObj.setOldWeight(this.attributeWeightVector[attribute]);
        logObj.setEventName('AttributeWeightChange_SET');

        if(this.useNormalizedAttributeWeights==0) {
            if (newWeight > 1.0) {
                this.attributeWeightVector[attribute] = 1.0;
            } else if (newWeight < 0.0) {
                this.attributeWeightVector[attribute] = 0.0;
            } else {
                this.attributeWeightVector[attribute] = newWeight;
            }
        }else{
            this.attributeWeightVector[attribute] = newWeight;
            ial.normalizeAttributeWeightVector();
        }
        ial.updateActiveAttributeCount();

        if(additionalLogInfoMap!={}){
            logObj.setCustomLogInfo(additionalLogInfoMap);
        }

        logObj.setNewWeight(this.attributeWeightVector[attribute]);

        if(logEvent==true){
            this.sessionLogs.push(logObj);
            // track attribute weight changes in attributeWeightVectorQueue
            ial.attributeWeightVectorEnqueue(logObj);
        }

        ial.updateItemScores();
    };

    /*
     * Increments attribute's weight by increment. Checks to ensure that the weight is always in [0.0,1.0]
     * */
    ial.incrementAttributeWeight = function(attribute,increment,logEvent,additionalLogInfoMap){
        logEvent = typeof logEvent !== 'undefined' ? logEvent : false;
        additionalLogInfoMap = typeof additionalLogInfoMap !== 'undefined' ? additionalLogInfoMap : {};

        var logObj = new LogObj(attribute);
        logObj.setOldWeight(this.attributeWeightVector[attribute]);
        logObj.setEventName('AttributeWeightChange_UPDATE');

        var newWeight = this.attributeWeightVector[attribute] + increment;

        if(this.useNormalizedAttributeWeights==0) {
            console.log("if");
            if (newWeight > 1.0) {
                this.attributeWeightVector[attribute] = 1.0;
            } else if (newWeight < 0.0) {
                this.attributeWeightVector[attribute] = 0.0;
            } else {
                this.attributeWeightVector[attribute] = newWeight;
            }
        }else{
            this.attributeWeightVector[attribute] = newWeight;
            ial.normalizeAttributeWeightVector();
        }
        ial.updateActiveAttributeCount();


        if(additionalLogInfoMap!={}){
            logObj.setCustomLogInfo(additionalLogInfoMap);
        }

        logObj.setNewWeight(this.attributeWeightVector[attribute]);

        if(logEvent==true){
            this.sessionLogs.push(logObj);
            // track attribute weight changes in attributeWeightVectorQueue
            ial.attributeWeightVectorEnqueue(logObj);
        }

        ial.updateItemScores();
    };

    /*
     * Sets the attribute weight vector to the newly passed map
     * */
    ial.setAttributeWeightVector = function(newAttributeWeightVector,logEvent,additionalLogInfoMap){
        logEvent = typeof logEvent !== 'undefined' ? logEvent : false;
        additionalLogInfoMap = typeof additionalLogInfoMap !== 'undefined' ? additionalLogInfoMap : {};

        var logObj = new LogObj(ial.utils.clone(this.attributeWeightVector));
        logObj.setOldWeight(ial.utils.clone(this.attributeWeightVector));
        logObj.setEventName('AttributeWeightChange_SETALL');

        this.attributeWeightVector = ial.utils.clone(newAttributeWeightVector);
        for(var attribute in this.attributeWeightVector){
            if(this.attributeWeightVector[attribute]>1.0){
                this.attributeWeightVector[attribute] = 1.0
            }
            if(this.attributeWeightVector[attribute]<0.0){
                this.attributeWeightVector[attribute] = 0.0
            }
        }

        logObj.setNewWeight(ial.utils.clone(this.attributeWeightVector));
        if(additionalLogInfoMap!={}){
            logObj.setCustomLogInfo(additionalLogInfoMap);
        }

        if(logEvent==true){
            this.sessionLogs.push(logObj);
            // track attribute weight changes in attributeWeightVectorQueue
            ial.attributeWeightVectorEnqueue(logObj);
        }

        if(this.useNormalizedAttributeWeights==1){
            ial.normalizeAttributeWeightVector();
        }

        ial.updateItemScores();
    };


    /*
     * Private function to update active attribute counts based on attribute weight vector
     * */
    ial.updateActiveAttributeCount = function () {
        this.activeAttributeCount = 0;
        for(var attribute in this.attributeWeightVector){
            if(this.attributeWeightVector[attribute]>0.0){
                this.activeAttributeCount += 1;
            }
        }
    };

    /*
     * resets the attributeWeightVector to have all 1.0s
     * */
    ial.resetAttributeWeightVector = function (logEvent,additionalLogInfoMap) {
        logEvent = typeof logEvent !== 'undefined' ? logEvent : false;
        additionalLogInfoMap = typeof additionalLogInfoMap !== 'undefined' ? additionalLogInfoMap : {};

        var logObj = new LogObj(ial.utils.clone(ial.printAttributeWeightVectorQueue));
        logObj.setOldWeight(ial.utils.clone(this.attributeWeightVector));
        logObj.setEventName('AttributeWeightChange_RESET');

        for(var attribute in this.attributeWeightVector){
            this.attributeWeightVector[attribute] = 1.0;
        }


        if(additionalLogInfoMap!={}){
            logObj.setCustomLogInfo(additionalLogInfoMap);
        }

        logObj.setNewWeight(ial.utils.clone(this.attributeWeightVector));

        if(logEvent==true){
            this.sessionLogs.push(logObj);
            // track attribute weight changes in attributeWeightVectorQueue
            ial.attributeWeightVectorEnqueue(logObj);
        }
        ial.updateActiveAttributeCount();

        if(this.useNormalizedAttributeWeights==1){
            ial.normalizeAttributeWeightVector();
        }

        ial.updateItemScores();
    };

    /*
     * Nullifies attributeWeightVector to 0.0s
     * */
    ial.nullifyAttributeWeightVector = function (logEvent, additionalLogInfoMap) {

        logEvent = typeof logEvent !== 'undefined' ? logEvent : false;
        additionalLogInfoMap = typeof additionalLogInfoMap !== 'undefined' ? additionalLogInfoMap : {};

        var logObj = new LogObj(ial.utils.clone(this.attributeWeightVector));
        logObj.setOldWeight(ial.utils.clone(this.attributeWeightVector));
        logObj.setEventName('AttributeWeightChange_NULLIFY');

        for(var attribute in this.attributeWeightVector){
            this.attributeWeightVector[attribute] = 0.0;
        }

        logObj.setNewWeight(ial.utils.clone(this.attributeWeightVector));
        if(additionalLogInfoMap!={}){
            logObj.setCustomLogInfo(additionalLogInfoMap);
        }

        if(logEvent==true){
            this.sessionLogs.push(logObj);
            // track attribute weight changes in attributeWeightVectorQueue
            ial.attributeWeightVectorEnqueue(logObj);
        }

        ial.updateActiveAttributeCount();
        ial.updateItemScores();
    };

    /*
     * Nullifies attributeWeightVector to 0.0s
     * */
    ial.nullifyAttributeWeights = function (attributes, logEvent, additionalLogInfoMap) {

        logEvent = typeof logEvent !== 'undefined' ? logEvent : false;
        additionalLogInfoMap = typeof additionalLogInfoMap !== 'undefined' ? additionalLogInfoMap : {};

        var logObj = new LogObj(ial.utils.clone(this.attributeWeightVector));
        logObj.setOldWeight(ial.utils.clone(this.attributeWeightVector));
        logObj.setEventName('AttributeWeightChange_NULLIFY');

        for(var i = 0; i < attributes.length; i++){
            ial.setAttributeWeight(attributes[i], 0.0);
        }

        logObj.setNewWeight(ial.utils.clone(this.attributeWeightVector));
        if(additionalLogInfoMap!={}){
            logObj.setCustomLogInfo(additionalLogInfoMap);
        }

        if(logEvent==true){
            this.sessionLogs.push(logObj);
            // track attribute weight changes in attributeWeightVectorQueue
            ial.attributeWeightVectorEnqueue(logObj);
        }

        ial.updateActiveAttributeCount();
        ial.updateItemScores();
    };

    /*
     * Returns top N points based on interaction weight (a.k.a. weight)
     * */
    ial.getTopNPointsByInteractionWeights = function (N,logEvent,additionalLogInfoMap) {
        N = typeof N !== 'undefined' ? N : 1;
        logEvent = typeof logEvent !== 'undefined' ? logEvent : false;
        additionalLogInfoMap = typeof additionalLogInfoMap !== 'undefined' ? additionalLogInfoMap : {};

        var logObj = new LogObj();
        logObj.setOldWeight('');
        logObj.setEventName('GetTopN_ByInteractionWeight');


        var list = this.dataSet.slice(0);
        sortObj(list, 'ial.weight', 'd');

        logObj.setNewWeight('');
        if(additionalLogInfoMap!={}){
            logObj.setCustomLogInfo(additionalLogInfoMap);
        }
        logObj.setEventSpecificInfo({'dataReturned':list.slice(0,N),'N':N});
        if(logEvent==true){
            this.sessionLogs.push(logObj);
        }

        return list.slice(0,N);
    };

    /*
     * Returns top N points based on interaction weight (a.k.a. weight)
     * */
    ial.getTopNPointsByScores = function (N,logEvent,additionalLogInfoMap) {
        N = typeof N !== 'undefined' ? N : 1;
        logEvent = typeof logEvent !== 'undefined' ? logEvent : false;
        additionalLogInfoMap = typeof additionalLogInfoMap !== 'undefined' ? additionalLogInfoMap : {};

        var logObj = new LogObj();
        logObj.setOldWeight('');
        logObj.setEventName('GetTopN_ByScore');


        var list = this.dataSet.slice(0);
        sortObj(list, 'ial.itemScore', 'd');

        var topNPoints = list.slice(0,N);
        logObj.setNewWeight('');
        if(additionalLogInfoMap!={}){
            logObj.setCustomLogInfo(additionalLogInfoMap);
        }
        logObj.setEventSpecificInfo({'dataReturned':topNPoints,'N':N});
        if(logEvent==true){
            this.sessionLogs.push(logObj);
        }

        return topNPoints;
    };


    /*
     * return an array of the n most similar points to the given data point
     */
    ial.getNSimilarPoints = function(dataPoint, n,logEvent,additionalLogInfoMap) {

        logEvent = typeof logEvent !== 'undefined' ? logEvent : false;
        additionalLogInfoMap = typeof additionalLogInfoMap !== 'undefined' ? additionalLogInfoMap : {};

        var logObj = new LogObj(dataPoint);
        logObj.setOldWeight(dataPoint.ial.weight);
        logObj.setEventName('GetSimilarPoints');

        var id = dataPoint.ial.id;

        // locate the given point
        var dataPt;
        if (id in this.ialIdToDataMap) {
            dataPt = this.ialIdToDataMap[id];
        } else { return []; }

        var allPts = [];
        var similarPts = [];

        for (var i in this.dataSet) {
            // don't care to get the similarity with itself
            if (this.dataSet[i]["ial"]["id"] != id) {
                var similarityScore = ial.getSimilarityScore(dataPt, this.dataSet[i]);
                if (similarityScore != -1) {
                    var newPt = { "data" : this.dataSet[i], "similarity" : similarityScore };
                    allPts.push(newPt);
                } else
                    console.log("GetNSimilarPoints: Score of -1 between id " + id + " and id " + this.dataSet[i]["ial"]["id"]);
            }
        }

        allPts.sort(function(a, b) {
            return a["similarity"] - b["similarity"];
        });

        for (var i = 0; i < n; i++)
            similarPts.push(allPts[i]["data"]);

        logObj.setNewWeight(dataPoint.ial.weight);
        if(additionalLogInfoMap!={}){
            logObj.setCustomLogInfo(additionalLogInfoMap);
        }
        if(logEvent==true){
            this.sessionLogs.push(logObj);
        }

        return similarPts;
    };

    /*
     * get the similarity score of the two given items
     * lower value indicates more similar
     */
    ial.getSimilarityScore = function(dataPoint1, dataPoint2) {
        var id1 = dataPoint1.ial.id;
        var id2 = dataPoint2.ial.id;
        // locate the given points
        var dataPt1, dataPt2;

        if ((id1 in this.ialIdToDataMap) && (id2 in this.ialIdToDataMap)) {
            dataPt1 = this.ialIdToDataMap[id1];
            dataPt2 = this.ialIdToDataMap[id2];
        } else { return -1; }

        simScore = 0;
        for (var attribute in this.attributeWeightVector) {
            var currentAttrWeight = this.attributeWeightVector[attribute];
            simScore += ((currentAttrWeight * 1.0 / this.activeAttributeCount) * ial.getNormalizedDistanceByAttribute(dataPt1, dataPt2, attribute));
        }

        if (simScore > 1 || simScore < 0) { console.log("GetSimilarityScore: invalid score " + simScore); }
        return simScore;
    };


    /* get the normalized distance between the two items with the given ids for the given attribute */
    ial.getNormalizedDistanceByAttribute = function(dataPoint1, dataPoint2, attribute) {
        var id1 = dataPoint1.ial.id;
        var id2 = dataPoint2.ial.id;

        // locate the given points
        var dataPt1, dataPt2;

        if ((id1 in this.ialIdToDataMap) && (id2 in this.ialIdToDataMap)) {
            dataPt1 = this.ialIdToDataMap[id1];
            dataPt2 = this.ialIdToDataMap[id2];
        } else { return -1; }

        var attrVal1, attrVal2;

        if (this.attributeValueMap[attribute]['dataType'] == 'categorical') {
            attrVal1 = ial.getNormalizedAttributeValue(dataPt1[attribute],attribute);
            attrVal2 = ial.getNormalizedAttributeValue(dataPt2[attribute],attribute);
            if (attrVal1 == attrVal2) // attributes are the same, distance = 0
                return 0;
            else // attributes are different, distance = 1
                return 1;
        } else { // numerical
            attrVal1 = ial.getNormalizedAttributeValue(parseFloat(dataPt1[attribute]),attribute);
            attrVal2 = ial.getNormalizedAttributeValue(parseFloat(dataPt2[attribute]),attribute);
            var attrRange = [ial.attributeValueMap[attribute]['min'], ial.attributeValueMap[attribute]['max']];
            return Math.abs((attrVal1) - (attrVal2)) / (attrRange[1] - attrRange[0]);
        }
    };

    /*
     * Returns a copy of the session logs collected so far
     * */
    ial.getSessionLogs = function(){
        return this.sessionLogs.slice(0);
    };

    /*
     * Returns the subset of logs which involve data items.
     * */
    ial.getDataItemLogs = function(){
        var dataItemLogList = [];
        for(var i in this.sessionLogs){
            var logObj = this.sessionLogs[i];
            if(logObj.eventName.indexOf('ItemWeightChange')>-1){
                dataItemLogList.push(logObj);
            }
        }

        return dataItemLogList;
    };


    /*
     * Returns the subset of logs which involve attributes.
     * */
    ial.getAttributeLogs = function () {
        var dataItemLogList = [];
        for(var i in this.sessionLogs){
            var logObj = this.sessionLogs[i];
            if(logObj.eventName.indexOf('AttributeWeightChange')>-1){
                dataItemLogList.push(logObj);
            }
        }
        return dataItemLogList;
    };


    function getVariance(arr) {

        function getVariance(arr, mean) {
            return arr.reduce(function(pre, cur) {
                pre = pre + Math.pow((cur - mean), 2);
                return pre;
            }, 0)
        }

        var meanTot = arr.reduce(function(pre, cur) {
            return pre + cur;
        })
        var total = getVariance(arr, meanTot / arr.length);

        var res = {
            mean: meanTot / arr.length,
            variance: total / arr.length
        }

        return res.variance;

        //return ["Mean:",
        //    res.mean,
        //    "Variance:",
        //    res.variance
        //].join(' ');
    }


    /*
     * Returns an attribute weight vector generated based on similarity between given points
     * */
    ial.generateAttributeWeightVectorUsingSimilarity = function (points) {

        // returns 1-result since goal is to find similarity
        var getNormalizedAttributeWeightByVariance = function(variance,minVariance,maxVariance) {
            var a = 0.0, b = 1.0;
            var min = minVariance;
            var max = maxVariance;

            var normalizedValue = 1-(((b - a) * (variance - min) / (max - min)) + a);

            return normalizedValue;
        };


        var tempAttributeWeightVector = {};
        var attributeValueListMap = {};


        // creating a map with all values as lists against attributes (first step)
        for(var i in points){
            var d = points[i];
            for(var attribute in this.attributeWeightVector){
                var val = this.getNormalizedAttributeValue(d[attribute],attribute);
                if( attribute in attributeValueListMap){
                    attributeValueListMap[attribute].push(val);
                }else{
                    attributeValueListMap[attribute] = [];
                    attributeValueListMap[attribute].push(val);
                }
            }
        }
        console.log(attributeValueListMap)

        // setting weights as variances (intermediate step)
        var minVariance = Number.MAX_VALUE,maxVariance = Number.MIN_VALUE;
        for(var attribute in this.attributeWeightVector){
            //console.log("==================")
            if(this.attributeValueMap[attribute]['dataType']!='categorical') {
                tempAttributeWeightVector[attribute] = getVariance(attributeValueListMap[attribute]);
                if(tempAttributeWeightVector[attribute]<minVariance){
                    minVariance = tempAttributeWeightVector[attribute];
                }
                if(tempAttributeWeightVector[attribute]>maxVariance){
                    maxVariance = tempAttributeWeightVector[attribute];
                }
            }else{
                var uniqueVals = getUniqueList(attributeValueListMap[attribute]);
                if(uniqueVals.length>1){
                    tempAttributeWeightVector[attribute] = 0;
                }else{
                    tempAttributeWeightVector[attribute] = 1;
                }
            }
        }
        console.log(ial.utils.clone(tempAttributeWeightVector));
        //console.log(minVariance,maxVariance);

        // setting weights as normalized values between 0 -1 based on variances (final step)
        for(var attribute in this.attributeWeightVector) {
            if (this.attributeValueMap[attribute]['dataType'] != 'categorical') {
                var normalizedAttributeWeight = getNormalizedAttributeWeightByVariance(tempAttributeWeightVector[attribute],minVariance,maxVariance);
                tempAttributeWeightVector[attribute] = normalizedAttributeWeight;
            }
        }

        if(this.useNormalizedAttributeWeights==1){
            tempAttributeWeightVector = getNormalizedMap(tempAttributeWeightVector);
        }

        return tempAttributeWeightVector;
    };



    function getUniqueList(arr){
        var uniqueList = [];
        for(var i in arr){
            if(uniqueList.indexOf(arr[i])==-1){
                uniqueList.push(arr[i]);
            }
        }
        return uniqueList;
    }

    /*
     * Returns an attribute weight vector generated based on difference between given points
     * */
    ial.generateAttributeWeightVectorUsingDifferences = function (points1, points2) {
        var tempAttributeWeightVector = {};
        if (typeof points2 !== 'undefined' && points2.length>0) {
            var points1Avg = {}, points2Avg = {};
            var points1Len = points1.length, points2Len = points2.length;
            var points1CatMap = {}, points2CatMap = {};

            // sum all the attribute values in points1
            for(var i in points1){
                var d = points1[i];
                for(var attribute in this.attributeWeightVector){
                    if(this.attributeValueMap[attribute]['dataType']!='categorical'){
                        var val = this.getNormalizedAttributeValue(d[attribute],attribute);
                        if(points1Avg.hasOwnProperty(attribute)) {
                            points1Avg[attribute] += val;
                        } else{
                            points1Avg[attribute] = val;
                        }
                    } else{
                        var val = this.getNormalizedAttributeValue(d[attribute],attribute);
                        if(points1CatMap.hasOwnProperty(attribute)){
                            if(points1CatMap[attribute].hasOwnProperty(val)){
                                points1CatMap[attribute][val]++;
                            } else{
                                points1CatMap[attribute][val] = 1;
                            }
                        } else{
                            points1CatMap[attribute] = {};
                            points1CatMap[attribute][val] = 1;
                            points1Avg[attribute] = val;
                        }
                    }
                }
            }

            // compute the average for each attribute in points1
            for(var attribute in points1Avg){
                if(this.attributeValueMap[attribute]['dataType']!='categorical'){
                    points1Avg[attribute] = points1Avg[attribute] / points1Len;
                } else{
                    var catMax = Math.MIN_VALUE;
                    var catMaxVal = points1Avg[attribute];
                    for(var attributeVal in points1CatMap[attribute]){
                        if(points1CatMap[attribute][attributeVal] > catMax){
                            catMax = points1CatMap[attribute][attributeVal];
                            catMaxVal = attributeVal;
                        }
                    }
                    points1Avg[attribute] = catMaxVal;
                }
            }

            // sum all the attribute values in points2
            for(var i in points2){
                var d = points2[i];
                for(var attribute in this.attributeWeightVector){
                    if(this.attributeValueMap[attribute]['dataType']!='categorical'){
                        var val = this.getNormalizedAttributeValue(d[attribute],attribute);
                        if(points2Avg.hasOwnProperty(attribute)) {
                            points2Avg[attribute] += val;
                        } else{
                            points2Avg[attribute] = val;
                        }
                    } else{
                        var val = this.getNormalizedAttributeValue(d[attribute],attribute);
                        if(points2CatMap.hasOwnProperty(attribute)){
                            if(points2CatMap[attribute].hasOwnProperty(val)){
                                points2CatMap[attribute][val]++;
                            } else{
                                points2CatMap[attribute][val] = 1;
                            }
                        } else{
                            points2CatMap[attribute] = {};
                            points2CatMap[attribute][val] = 1;
                            points2Avg[attribute] = val;
                        }
                    }
                }
            }

            // compute the average for each attribute in points2
            for(var attribute in points2Avg){
                if(this.attributeValueMap[attribute]['dataType']!='categorical'){
                    points2Avg[attribute] = points2Avg[attribute] / points2Len;
                } else{
                    var catMax = Math.MIN_VALUE;
                    var catMaxVal = points2Avg[attribute];
                    for(var attributeVal in points2CatMap[attribute]){
                        if(points2CatMap[attribute][attributeVal] > catMax){
                            catMax = points2CatMap[attribute][attributeVal];
                            catMaxVal = attributeVal;
                        }
                    }
                    points2Avg[attribute] = catMaxVal;
                }
            }

            var difference = {};
            for(var attribute in points1Avg){
                if(points2Avg.hasOwnProperty(attribute)){
                    if(this.attributeValueMap[attribute]['dataType']!='categorical'){
                        difference[attribute] = points1Avg[attribute] - points2Avg[attribute];
                    }else {
                        if(points1Avg[attribute] == points2Avg[attribute]){
                            difference[attribute] = 0;
                        }else{
                            difference[attribute] = 1;
                        }
                    }
                }
            }

            tempAttributeWeightVector = difference;

        } else {
            /*
            // returns result directly since goal is to find similarity
            var getNormalizedAttributeWeightByVariance = function(variance,minVariance,maxVariance) {
                var a = 0.0, b = 1.0;
                var min = minVariance;
                var max = maxVariance;

                var normalizedValue = (((b - a) * (variance - min) / (max - min)) + a);

                return normalizedValue;
            };


            var tempAttributeWeightVector = {};
            var attributeValueListMap = {};


            // creating a map with all values as lists against attributes (first step)
            for(var i in points1){
                var d = points1[i];
                for(var attribute in this.attributeWeightVector){
                    var val = this.getNormalizedAttributeValue(d[attribute],attribute);
                    if( attribute in attributeValueListMap){
                        attributeValueListMap[attribute].push(val);
                    }else{
                        attributeValueListMap[attribute] = [];
                        attributeValueListMap[attribute].push(val);
                    }
                }
            }

            // setting weights as variances (intermediate step)
            var minVariance = Number.MAX_VALUE,maxVariance = Number.MIN_VALUE;
            for(var attribute in this.attributeWeightVector){
                //console.log("==================")
                if(this.attributeValueMap[attribute]['dataType']!='categorical') {
                    tempAttributeWeightVector[attribute] = getVariance(attributeValueListMap[attribute]);
                    if(tempAttributeWeightVector[attribute]<minVariance){
                        minVariance = tempAttributeWeightVector[attribute];
                    }
                    if(tempAttributeWeightVector[attribute]>maxVariance){
                        maxVariance = tempAttributeWeightVector[attribute];
                    }
                }else{
                    var uniqueVals = getUniqueList(attributeValueListMap[attribute]);
                    if(uniqueVals.length>1){
                        tempAttributeWeightVector[attribute] = 1;
                    }else{
                        tempAttributeWeightVector[attribute] = 0;
                    }
                }
            }
            //console.log(ial.utils.clone(tempAttributeWeightVector));
            //console.log(minVariance,maxVariance);

            // setting weights as normalized values between 0 -1 based on variances (final step)
            for(var attribute in this.attributeWeightVector) {
                if (this.attributeValueMap[attribute]['dataType'] != 'categorical') {
                    var normalizedAttributeWeight = getNormalizedAttributeWeightByVariance(tempAttributeWeightVector[attribute],minVariance,maxVariance);

                    tempAttributeWeightVector[attribute] = normalizedAttributeWeight;
                }
            }

            if(this.useNormalizedAttributeWeights==1){
                tempAttributeWeightVector = getNormalizedMap(tempAttributeWeightVector);
            }
            */

            tempAttributeWeightVector = ial.generateAttributeWeightVectorUsingSimilarity(points1);


            //---------------------------
            // old difference based logic
            //---------------------------
            /*
             for(var attribute in this.attributeWeightVector){
             var val1 = this.getNormalizedAttributeValue(points[0][attribute],attribute);
             var val2 = this.getNormalizedAttributeValue(points[1][attribute],attribute);
             if(this.attributeValueMap[attribute]['dataType']!='categorical'){
             var diff = Math.abs(val1-val2);
             tempAttributeWeightVector[attribute] = diff;
             }else{
             if(val1 == val2){
             tempAttributeWeightVector[attribute] = 0.0;
             }else{
             tempAttributeWeightVector[attribute] = 1.0;
             }
             }
             }
             */
        }

        return tempAttributeWeightVector;
    };

    /*
     * --------------------
     *         KNN
     * --------------------
     * */

    ial.createClusters = function(dataItems, knnDistance) {
        dataItems = typeof dataItems !== 'undefined' ? dataItems : this.dataSet;
        knnDistance = typeof knnDistance !== 'undefined' ? knnDistance : 0.05;
        this.clusters = this.classify(dataItems, knnDistance);
        return this.clusters;
    };

    ial.classify = function(dataPoints, knnDistance) {
        var aggregateScores = [];

        var tempStringId = 10,
            tempStringValMap = {};

        /* Use the attribute weight vector for these computations. */
        for (var index in dataPoints) {
            aggregateScores[index] = {};
            aggregateScores[index]["ial"] = {};
            aggregateScores[index]["ial"]["id"] = dataPoints[index]["ial"]["id"];
            aggregateScores[index]["ial"]["aggregateScore"] = 0;
            for (var attributeName in this.attributeWeightVector) {
                var attributeValue = ial.getNormalizedAttributeValue(dataPoints[index][attributeName],attributeName);
                var attributeWeight = this.attributeWeightVector[attributeName];

                if(attributeName!='ial'){
                    if(this.attributeValueMap[attributeName]['dataType']=='categorical'){
                        if (Object.keys(tempStringValMap).indexOf(attributeValue) == -1) { // if string not found in tempStringValMap i.e. is a new category string
                            tempStringValMap[attributeValue] = tempStringId;
                            attributeValue = tempStringId;
                            tempStringId += 10;
                        } else {
                            attributeValue = tempStringValMap[attributeValue];
                        }
                        aggregateScores[index]["ial"]["aggregateScore"] += attributeValue * attributeWeight;
                    }else{
                        aggregateScores[index]["ial"]["aggregateScore"] += attributeValue * attributeWeight;
                    }
                }
                //
                //if (isNaN(attributeValue) && attributeName!='ial') {
                //    if (Object.keys(tempStringValMap).indexOf(attributeValue) == -1) { // if string not found
                //        tempStringValMap[attributeValue] = tempStringId;
                //        attributeValue = tempStringId;
                //        tempStringId += 10;
                //    } else {
                //        attributeValue = tempStringValMap[attributeValue];
                //    }
                //}
                //
                //if (attributeName != "ial" && isNaN(attributeValue) == false && attributeWeight>0.0) {
                //    //attributeValue = ial.getNormalizedAttributeValue(attributeValue,attributeName); // Using normalized attribute values for computation
                //    aggregateScores[index]["ial"]["aggregateScore"] += attributeValue * attributeWeight;
                //}

            }
            aggregateScores[index]["ial"]["aggregateScore"] *= dataPoints[index]["ial"]["weight"];
        }

        aggregateScores.sort(function(a, b) {
            return b["ial"]["aggregateScore"] - a["ial"]["aggregateScore"];
        });

        var clusters = [];
        var clusterIndex = -1;
        for (var index in aggregateScores) {
            if (clusters.length == 0) {
                clusterIndex += 1;
                var cluster = new Cluster(clusterIndex);
                var curDataObj = ial.ialIdToDataMap[aggregateScores[index]["ial"]["id"]];
                curDataObj.ial.KNNClusterId = cluster.getClusterId();
                cluster.addDataItem(curDataObj);
                clusters.push(cluster);
            } else {
                var previousObject = aggregateScores[index - 1];
                var currentObject = aggregateScores[index];

                if (Math.abs(currentObject["ial"]["aggregateScore"] - previousObject["ial"]["aggregateScore"]) <= knnDistance) {
                    var curDataObj = this.ialIdToDataMap[currentObject["ial"]['id']];
                    curDataObj.ial.KNNClusterId = cluster.getClusterId();
                    cluster.addDataItem(curDataObj);
                } else {
                    clusterIndex += 1;
                    var cluster = new Cluster(clusterIndex);
                    var curDataObj = this.ialIdToDataMap[aggregateScores[index]["ial"]['id']];
                    curDataObj.ial.KNNClusterId = cluster.getClusterId();
                    cluster.addDataItem(curDataObj);
                    clusters.push(cluster);
                }
            }
        }
        return clusters;
    };

    /*
     * Cluster data structure
     * */

    var Cluster = function(id) {
        this.clusterId = id;
        this.clusterLabel = "";
        this.dataItems = [];
    };

    Cluster.prototype.getClusterId = function() {
        return this.clusterId;
    };

    Cluster.prototype.setClusterLabel = function(label) {
        this.clusterLabel = label;
    };

    Cluster.prototype.getClusterLabel = function() {
        return this.clusterLabel;
    };

    Cluster.prototype.addDataItem = function(dataItemOrId) { //TO-DO: handle ids and objects
        this.dataItems.push(dataItemOrId);
    };

    Cluster.prototype.removeDataItem = function(dataItemOrId) { //TO-DO: handle ids and objects
        this.dataItems.push(dataItemOrId);
    };

    Cluster.prototype.getClusterDataItems = function() {
        return this.dataItems;
    };



    /*
     * Log object data structure
     * */

    var LogObj = function (d,tStamp) {
        d = typeof d !== 'undefined' ? d : '';

        this.dataItem = d;
        this.eventName = '';
        this.oldWeight = '';
        this.newWeight = '';
        this.customLogInfo = {};
        this.eventSpecificInfo = {};

        tStamp = typeof tStamp !== 'undefined' ? tStamp : new Date();

        this.eventTimeStamp = tStamp;
    };

    LogObj.prototype.setEventSpecificInfo = function(eventInfoMap) {
        this.eventSpecificInfo = eventInfoMap;
    };

    LogObj.prototype.setNewWeight = function(weight) {
        this.newWeight = weight;
    };

    LogObj.prototype.setOldWeight = function(weight) {
        this.oldWeight = weight;
    };

    LogObj.prototype.setEventName = function(ev) {
        this.eventName = ev;
    };

    LogObj.prototype.setCustomLogInfo = function(customLogInfoMap) {
        this.customLogInfo = ial.utils.clone(customLogInfoMap);
    };



    /*
     * Interaction and attribute weight vector queue utilities
     * */

    ial.setMaxQueueSize = function(newQueueSize) {
        this.maxQueueSize = newQueueSize; 
    }

    ial.getInteractionQueue = function() {
        return this.interactionQueue;
    }

// print the contents of the interaction queue
    ial.printInteractionQueue = function() {
        console.log("Printing Interaction Queue (" + this.interactionQueue.length + "): ");
        for (var i in this.interactionQueue) console.log(this.interactionQueue[i]);
    }

    ial.interactionEnqueue = function(obj) {
        if (typeof obj === 'undefined' || obj == null) return;

        if (this.interactionQueue.length >= this.maxQueueSize) {
            console.log("Max queue size reached");
            ial.interactionDequeue();
        }
        this.interactionQueue.push(obj);
    }

    ial.interactionDequeue = function() {
        return this.interactionQueue.shift(); 
    }

    ial.getAttributeWeightVectorQueue = function() {
        return this.attributeWeightVectorQueue;
    }

// print the contents of the interaction queue
    ial.printAttributeWeightVectorQueue = function() {
        console.log("Printing Attribute Weight Vector Queue (" + this.attributeWeightVectorQueue.length + "): ");
        for (var i in this.attributeWeightVectorQueue) console.log(this.attributeWeightVectorQueue[i]);
    }

    ial.attributeWeightVectorEnqueue = function(obj) {
        if (typeof obj === 'undefined' || obj == null) return;

        if (this.attributeWeightVectorQueue.length >= this.maxQueueSize) {
            console.log("Max queue size reached"); 
            ial.attributeWeightVectorDequeue();
        }
        this.attributeWeightVectorQueue.push(obj);
    }

    ial.attributeWeightVectorDequeue = function() {
        return this.attributeWeightVectorQueue.shift(); 
    }

// private
// time arg can be a Date object; returns all interactions that occurred since 'time'
// time arg can be an integer; returns the last 'time' interactions
// interactionTypes defines which types of interactions to consider
    function getInteractionQueueSubset(time, interactionTypes) {
        this.interactionQueue = ial.utils.clone(ial.getInteractionQueue());
        var interactionSubset = [];

        if (typeof time === 'undefined') time = this.interactionQueue.length;

        if (time instanceof Date) {
            for (var i = 0; i < this.interactionQueue.length; i++) {
                var curLog = this.interactionQueue[i];
                var curTime = curLog.eventTimeStamp;
                var curEventType = curLog['customLogInfo']['eventType'];
                if (curTime.getTime() >= time.getTime() && (typeof interactionTypes == 'undefined' || interactionTypes.indexOf(curEventType) > -1))
                    interactionSubset.push(this.interactionQueue[i]);
            }
        } else if (!isNaN(parseInt(time))) {
            if (time > this.interactionQueue.length) time = this.interactionQueue.length;
            var numLogs = 0;
            var i = this.interactionQueue.length - 1;
            while (i >= 0 && numLogs <= time) {
                var curLog = this.interactionQueue[i];
                var curEventType = curLog['customLogInfo']['eventType'];
                if (typeof interactionTypes == 'undefined' || interactionTypes.indexOf(curEventType) > -1) {
                    interactionSubset.push(curLog);
                    numLogs++;
                }
                i--;
            }
        }

        return interactionSubset;
    }

// private
// 'time' can be a Date object; returns all interactions that occurred since 'time'
// 'time' can be an integer; returns the last 'time' interactions
// interactionTypes defines which types of interactions to consider
    function getInteractionQueueSubsetByEventType(time, interactionTypes) {
        var interactionSubsetQueues = {};
        this.interactionQueue = ial.getInteractionQueue(); 

        if (typeof time === 'undefined') time = this.interactionQueue.length;

        if (time instanceof Date) {
            interactionSubsetQueues = {};
            for (var i = 0; i < this.interactionQueue.length; i++) {
                var curLog = this.interactionQueue[i];
                var curTime = curLog.eventTimeStamp;
                var curEventType = curLog.customLogInfo.eventType;
                if (curEventType === 'undefined') curEventType = 'uncategorized';
                if (curTime.getTime() >= time.getTime() && (typeof interactionTypes == 'undefined' || interactionTypes.indexOf(curEventType) > -1)) {
                    var curQueue = [];
                    if (interactionSubsetQueues.hasOwnProperty(curEventType)) curQueue = interactionSubsetQueues[curEventType];

                    curQueue.push(curLog);
                    interactionSubsetQueues[curEventType] = curQueue;
                }
            }
        } else if (!isNaN(parseInt(time))) {
            interactionSubsetQueues = {};
            if (time > this.interactionQueue.length) time = this.interactionQueue.length;
            var i = 0;
            var numLogs = 0;
            while (i < this.interactionQueue.length && numLogs <= time) {
                var curLog = this.interactionQueue[i];
                var curEventType = curLog.customLogInfo.eventType;
                if (curEventType === 'undefined') curEventType = 'uncategorized';
                if (typeof interactionTypes == 'undefined' || interactionTypes.indexOf(curEventType) > -1) {
                    var curQueue = [];
                    if (interactionSubsetQueues.hasOwnProperty(curEventType)) curQueue = interactionSubsetQueues[curEventType];

                    curQueue.push(curLog);
                    interactionSubsetQueues[curEventType] = curQueue;
                    numLogs++;
                }
                i++;
            }
        }

        return interactionSubsetQueues;
    }

// private
// arg can be a Date object; returns all interactions that occurred since 'time'
// arg can be an integer; returns the last 'time' interactions
    function getWeightVectorQueueSubset(time) {
        this.attributeWeightVectorQueue = ial.getAttributeWeightVectorQueue();
        var weightVectorSubset = ial.getAttributeWeightVectorQueue();

        if (typeof time !== 'undefined') {
            if (time instanceof Date) {
                weightVectorSubset = [];
                for (var i = 0; i < this.attributeWeightVectorQueue.length; i++) {
                    var curTime = this.attributeWeightVectorQueue[i].eventTimeStamp;
                    if (curTime.getTime() >= time.getTime()) weightVectorSubset.push(this.attributeWeightVectorQueue[i]);
                }
            } else if (!isNaN(parseInt(time))) {
                weightVectorSubset = [];
                if (time > this.attributeWeightVectorQueue.length) time = this.attributeWeightVectorQueue.length;
                for (var i = 0; i < time; i++)
                    weightVectorSubset.push(this.attributeWeightVectorQueue[i]);
            }
        }

        return weightVectorSubset;
    }

// private
// computes variance for numerical attributes and entropy for categorical attributes
// entropy ref: http://www.cs.rochester.edu/u/james/CSC248/Lec6.pdf
    function computeAttributeVariance(data, attr) {
        data = getArray(data);
        var attributeValueMap = ial.getAttributeValueMap();
        if (attributeValueMap[attr].dataType == 'categorical') {
            var distr = computeCategoricalDistribution(data, attr);
            var ent = 0;
            var curSum = data.length;
            for (attrVal in distr) {
                var curVal = distr[attrVal];
                ent += ((curVal / curSum) * Math.log2(curVal / curSum));
            }
            if (ent != 0) ent *= -1;
            return ent;
        } else if (attributeValueMap[attr].dataType == 'numeric') {
            var mean = 0;

            // find mean
            for (var curDataItem of data) {
                var curValue = parseFloat(curDataItem[attr]);
                mean += curValue;
            }
            mean /= data.length;

            // find variance
            var variance = 0;
            for (var curDataItem of data) {
                var curValue = parseFloat(curDataItem[attr]);
                var curSqDiff = (curValue - mean) * (curValue - mean);
                variance += curSqDiff;
            }
            variance /= data.length;

            return variance;
        } else return 0;
    }

// private
// computes distribution of categorical attribute values
    function computeCategoricalDistribution(data, attr) {
        data = getArray(data);
        var attributeValueMap = ial.getAttributeValueMap();
        var distribution = {};

        for (var i = 0; i < data.length; i++) {
            var attrValue = data[i][attr];
            if (distribution.hasOwnProperty(attrValue)) distribution[attrValue]++;
            else distribution[attrValue] = 1;
        }

        return distribution;
    }

// make sure you're dealing with an array
    function getArray(arrayLike) {
        let arr = Array.from(arrayLike);
        return arr;
    }

// returns the current queue of bias logs
    ial.getBiasLogs = function() {
        return ial.utils.clone(this.biasLogs);
    }

// print bias logs to console
    ial.printBiasLogs = function() {
        // print data
        console.log("dataset", this.dataSet);

        // print attribute information
        console.log("attributes", this.getAttributeValueMap());

        // iterate through queue
        console.log("# bias logs: " + this.biasLogs.length);
        for (var i = 0; i < this.biasLogs.length; i++) console.log("bias log", this.biasLogs[i]);

        // print individual interaction records
        console.log("# interaction logs: " + this.interactionQueue.length);
        for (var i = 0; i < this.interactionQueue.length; i++) console.log("interaction log", this.interactionQueue[i]);

        // print attribute weight change records
        console.log("# attribute weight logs: " + this.attributeWeightVectorQueue.length);
        for (var i = 0; i < this.attributeWeightVectorQueue.length; i++) console.log("attribute weight log", this.attributeWeightVectorQueue[i]);
    }



    /*
     * Bias metrics
     * */

// totalThreshold (optional) percent of metrics that can return true before it is considered bias (defaults to 0.5)
// metric (optional) which bias metric to compute (defaults to compute all metrics)
// threshold1, threshold2, and threshold3 (optional) how high or low a metric can be before it is considered bias (default varies according to which metric is used)
// time (optional) can be given as a Date object or a number representing the number of previous interactions to consider (default is to consider the full queue) 
// interactionTypes (optional) can specify to only compute bias on a particular types of interaction (based on eventType key in customLogInfo)
// returns true if bias is detected, false otherwise
    ial.computeBias = function(totalThreshold, metric, threshold1, time, threshold2, considerSpan, individualScore, threshold3, interactionTypes) {
        if (typeof totalThreshold === 'undefined' || isNaN(parseFloat(totalThreshold))) totalThreshold = 0.5;

        if (typeof metric !== 'undefined') {
            if (metric == this.BIAS_ATTRIBUTE_WEIGHT) return ial.computeAttributeWeightBias(threshold1, threshold2, individualScore, time);
            else if (metric == this.BIAS_REPETITION) return ial.computeRepetitionBias(threshold1, threshold2, time, considerSpan, interactionTypes);
            else if (metric == this.BIAS_SUBSET) return ial.computeSubsetBias(threshold1, time, interactionTypes);
            else return ial.computeVarianceBias(threshold1, threshold2, time, interactionTypes);
        } else {
            var numMetrics = this.BIAS_TYPES.length;
            var biasResultMap = {};
            var attributeWeightBias = ial.computeAttributeWeightBias(threshold1, threshold2, individualScore, time);
            var repetitionBias = ial.computeRepetitionBias(threshold1, threshold2, time, considerSpan, interactionTypes);
            var subsetBias = ial.computeSubsetBias(threshold1, time, interactionTypes);
            var varianceBias = ial.computeVarianceBias(threshold1, threshold2, threshold3, time, interactionTypes);

            biasResultMap['attribute_weight_metric'] = attributeWeightBias;
            biasResultMap['repetition_metric'] = repetitionBias;
            biasResultMap['subset_metric'] = subsetBias;
            biasResultMap['variance_metric'] = varianceBias;

            var numBiases = 0;
            if (attributeWeightBias['result']) numBiases++;
            if (repetitionBias['result']) numBiases++;
            if (subsetBias['result']) numBiases++;
            if (varianceBias['result']) numBiases++;

            if ((numBiases / numMetrics) > totalThreshold) biasResultMap['result'] = true;
            else biasResultMap['result'] = false;

            return biasResultMap;
        }
    }

// bias is defined as the percentage of the subset of data that has been interacted with that is unique
// threshold (optional) can be a percentage 0-1 (defaults to 0.25) or a whole number
// interactionTypes (optional) limits scope of computation to particular interaction types or all if left unspecified
    ial.computeSubsetBias = function(threshold, time, interactionTypes) {
        if (typeof threshold === 'undefined' || isNaN(parseFloat(threshold)) || threshold < 0 || threshold > this.dataSet.length) threshold = 0.25;

        var interactionSubset = getInteractionQueueSubset(time, interactionTypes);

        var currentLog = {};
        currentLog['bias_type'] = this.BIAS_SUBSET;
        currentLog['current_time'] = new Date();
        currentLog['threshold'] = threshold;
        currentLog['number_of_logs'] = interactionSubset.length;
        var currentLogInfo = {};
        currentLogInfo['interaction_types'] = interactionTypes;

        var maxInteractions = Math.min(interactionSubset.length, this.dataSet.length);

        // figure out how many interactions were with unique data items
        var idSet = new Set();
        for (var i = 0; i < interactionSubset.length; i++)
            idSet.add(interactionSubset[i].dataItem.ial.id);

        var percentUnique = idSet.size / maxInteractions;

        currentLogInfo['max_interactions'] = maxInteractions;
        currentLogInfo['unique_data'] = idSet.size;
        currentLogInfo['percentage'] = percentUnique;
        currentLog['info'] = currentLogInfo;

        if (threshold >= 1) {
            if (idSet.size < threshold) currentLog['result'] = true;
            else currentLog['result'] = false;
        } else {
            if (percentUnique < threshold) currentLog['result'] = true;
            else currentLog['result'] = false;
        }

        this.biasLogs.push(currentLog);
        return currentLog;
    }

// bias is defined as repeating the same interaction on the same data
// indThreshold (optional) is percentage or number of interactions allowed with same data item before it is considered bias (defaults to 0.025 * size of data)
// violationThreshold (optional) is percentage or number of types of interactions that can exceed indThreshold before it is considered bias (default is 0.025)
// considerSpan = true lowers contributing score of repetitions to account for how spread out they were
// interactions are weighted: 
//   if considerSpan: score = number of repeated interactions / difference in indices of first and last occurrence 
//     score doesn't get added to aggregate score unless it surpasses indThreshold
//   else: score = 1
// interactionTypes (optional) limits scope of computation to particular interaction types or all if left unspecified
    ial.computeRepetitionBias = function(indThreshold, violationThreshold, time, considerSpan, interactionTypes) {
        if (typeof indThreshold === 'undefined' || isNaN(parseFloat(indThreshold)) || indThreshold < 1) indThreshold = 0.025 * this.dataSet.length;
        if (indThreshold < 1) indThreshold = 1; // must be at least 1
        if (typeof violationThreshold === 'undefined' || isNaN(parseFloat(violationThreshold)) || violationThreshold < 0) violationThreshold = 0.025;
        if (typeof considerSpan === 'undefined' || (considerSpan != true && considerSpan != false)) considerSpan = true;
        var interactionSubset = getInteractionQueueSubsetByEventType(time, interactionTypes);
        var origInteractionSubset = getInteractionQueueSubset(time, interactionTypes);

        var currentLog = {};
        var curDate = new Date();
        currentLog['bias_type'] = this.BIAS_REPETITION;
        currentLog['current_time'] = new Date();
        currentLog['threshold'] = {'individual_threshold' : indThreshold, 'violation_threshold' : violationThreshold};
        var currentLogInfo = {};
        currentLogInfo['interaction_types'] = interactionTypes;
        currentLogInfo['consider_span'] = considerSpan;

        var repetitionMap = {};
        var numLogsCounter = 0;
        var intTypeCounter = 0;
        for (var eventTypeKey in interactionSubset) {
            var curQueue = interactionSubset[eventTypeKey];
            for (var i = 0; i < curQueue.length; i++) {
                numLogsCounter++;
                var curId = curQueue[i].dataItem.ial.id;
                if (repetitionMap.hasOwnProperty(eventTypeKey)) {
                    var curObj = repetitionMap[eventTypeKey];
                    if (curObj.hasOwnProperty(curId)) repetitionMap[eventTypeKey][curId]++;
                    else {
                        repetitionMap[eventTypeKey][curId] = 1;
                        intTypeCounter++;
                    }
                } else {
                    repetitionMap[eventTypeKey] = { [curId]: 1 };
                    intTypeCounter++;
                }
            }
        }
        currentLog['number_of_logs'] = numLogsCounter;

        var numViolations = 0;
        for (var eventTypeKey in repetitionMap) {
            var curQueue = repetitionMap[eventTypeKey];
            for (var curId in curQueue) {
                var curKey = eventTypeKey + "," + curId;
                if (repetitionMap[eventTypeKey][curId] > indThreshold) {
                    if (considerSpan) {

                        // find indices of when eventTypeKey occurred with data item curId
                        var occurrenceIndices = [];
                        for (var j = 0; j < origInteractionSubset.length; j++) {
                            var curObj = origInteractionSubset[j];
                            if (curObj.dataItem.ial.id == curId && curObj['customLogInfo'].hasOwnProperty('eventType') && curObj['customLogInfo']['eventType'] == eventTypeKey) {
                                occurrenceIndices.push(j);
                                if (occurrenceIndices.length == repetitionMap[eventTypeKey][curId]) break;
                            }
                        }

                        var curSpan = Math.abs(occurrenceIndices[occurrenceIndices.length - 1] - occurrenceIndices[0]) + 1;
                        var bestSpan = curSpan;
                        var bestWindowSize = occurrenceIndices.length;
                        var bestScore = bestWindowSize / curSpan;

                        // find best window size (number of repeated interactions to consider) - must be greater than indThreshold
                        for (var windowSize = indThreshold + 1; windowSize <= occurrenceIndices.length; windowSize++) {
                            for (var j = 0; j < occurrenceIndices.length; j++) {
                                for (var k = j + windowSize - 1; k < occurrenceIndices.length; k++) {
                                    curSpan = Math.abs(occurrenceIndices[k] - occurrenceIndices[j]) + 1;
                                    var curScore = windowSize / curSpan;
                                    if (curScore > bestScore) {
                                        bestScore = curScore;
                                        bestSpan = curSpan;
                                    }
                                }
                            }
                        }

                        numViolations += bestScore;
                        currentLogInfo[curKey] = {'count' : repetitionMap[eventTypeKey][curId], 'window_size' : bestWindowSize, 'span_used' : bestSpan, 'score' : bestScore, 'result' : true};
                    } else {
                        numViolations++;
                        currentLogInfo[curKey] = {'count' : repetitionMap[eventTypeKey][curId], 'score' : 1, 'result' : true};
                    }
                } else {
                    currentLogInfo[curKey] = {'count' : repetitionMap[eventTypeKey][curId], 'score' : 0, 'result' : false};
                }
            }
        }

        currentLogInfo['num_violations'] = numViolations;
        currentLogInfo['num_interaction_types'] = intTypeCounter;
        currentLogInfo['percentage'] = numViolations / intTypeCounter;
        currentLog['info'] = currentLogInfo;

        if (violationThreshold >= 1) {
            if (numViolations > violationThreshold) currentLog['result'] = true;
            else currentLog['result'] = false;
        } else {
            if ((numViolations / intTypeCounter) > violationThreshold) currentLog['result'] = true;
            else currentLog['result'] = false;
        }

        this.biasLogs.push(currentLog);
        return currentLog;
    }

// bias is defined as the variance between the data that has been examined
// indNumThreshold (optional) indicates the p-value below which the f-test would reject the hypothesis that the data items interacted with and the actual distribution are the same for numerical attributes (defaults to 0.1)
// indCatThreshold (optional) indicates the p-value below which the chi-squared test would reject the hypothesis that the data items interacted with and the actual distribution are the same for categorical attributes (defaults to 0.1)
// percAttrThreshold (optional) indicates what number or percentage of attributes can be below indThreshold (defaults to 0.5)
// interactionTypes (optional) limits scope of computation to particular interaction types or all if left unspecified
    ial.computeVarianceBias = function(indNumThreshold, indCatThreshold, percAttrThreshold, time, interactionTypes) {
        var attributeValueMap = ial.getAttributeValueMap();
        if (typeof indNumThreshold === 'undefined' || isNaN(parseFloat(indNumThreshold)) || indNumThreshold < 0 || indNumThreshold > 1) indNumThreshold = 0.1;
        if (typeof indCatThreshold === 'undefined' || isNaN(parseFloat(indCatThreshold)) || indCatThreshold < 0 || indCatThreshold > 1) indCatThreshold = 0.1;
        if (typeof percAttrThreshold === 'undefined' || isNaN(parseFloat(percAttrThreshold)) || percAttrThreshold < 0 || percAttrThreshold > Object.keys(attributeValueMap).length) percAttrThreshold = 0.5;
        var interactionSubset = getInteractionQueueSubset(time, interactionTypes);

        var currentLog = {};
        var curDate = new Date();
        currentLog['bias_type'] = this.BIAS_VARIANCE;
        currentLog['current_time'] = new Date();
        currentLog['threshold'] = {'individual_numerical_threshold' : indNumThreshold, 'individual_categorical_threshold' : indCatThreshold, 'percent_attribute_threshold' : percAttrThreshold};
        currentLog['number_of_logs'] = interactionSubset.length;
        var currentLogInfo = {};
        currentLogInfo['interaction_types'] = interactionTypes;

        var dataSubset = [];
        for (var i = 0; i < interactionSubset.length; i++) dataSubset.push(interactionSubset[i].dataItem);

        var numAttributes = 0;
        var numViolations = 0;
        var varianceVector = {};

        for (var attr in attributeValueMap) {
            varianceVector[attr] = {};
            if (attributeValueMap[attr].dataType == 'numeric') {
                numAttributes++;
                var curVariance = Number(computeAttributeVariance(dataSubset, attr));
                var fullVariance = Number(attributeValueMap[attr]['variance']);

                function beta2(testParam, df1, df2) {
                    var a0 = 0;
                    var b0 = 1;
                    var a1 = 1;
                    var b1 = 1;
                    var m1 = 0;
                    var a2 = 0;
                    var c1;
                    while (Math.abs((a1 - a2) / a1) > .00001) {
                        a2 = a1;
                        c1 = -(df1 + m1) * (df1 + df2 + m1) * testParam / (df1 + 2 * m1) / (df1 + 2 * m1 + 1);
                        a0 = a1 + c1 * a0;
                        b0 = b1 + c1 * b0;
                        m1++;
                        c1 = m1 * (df2 - m1) * testParam / (df1 + 2 * m1 - 1) / (df1 + 2 * m1);
                        a1 = a0 + c1 * a1;
                        b1 = b0 + c1 * b1;
                        a0 /= b1;
                        b0 /= b1;
                        a1 /= b1;
                        b1 = 1;
                    }
                    return a1 / df1;
                }

                function beta1(testParam, df1, df2) {
                    var prob;
                    var temp = df1 + df2;
                    var bt = Math.exp(ial.utils.logGamma(temp) - ial.utils.logGamma(df2) - ial.utils.logGamma(df1) + df1 * Math.log(testParam) + df2 * Math.log(1 - testParam));
                    if (testParam < (df1 + 1) / (temp + 2)) prob = bt * beta2(testParam, df1, df2);
                    else prob = 1 - bt * beta2(1 - testParam, df2, df1);
                    return prob;
                }

                var fValue = 1.0 / (curVariance / fullVariance);
                dfFull = this.dataSet.length - 1; 
                dfSub = dataSubset.length - 1; 
                var testParam = fValue / (fValue + dfSub / dfFull);
                var result = beta1(testParam, dfFull / 2, dfSub / 2);
                result = Math.round(result * 100000) / 100000;

                varianceVector[attr]["degrees_of_freedom_1_full"] = dfFull; 
                varianceVector[attr]["degrees_of_freedom_2_sub"] = dfSub;
                varianceVector[attr]["f_value"] = fValue;
                varianceVector[attr]["p_value"] = result; 
                if (result < indNumThreshold) numViolations++;

            } else if (attributeValueMap[attr].dataType == 'categorical') {
                numAttributes++;
                // variance for categorical attributes returns chi-squared test
                var distr = computeCategoricalDistribution(dataSubset, attr);
                var fullDistr = attributeValueMap[attr]["distribution"];
                var chiSq = 0; 
                for (attrVal in fullDistr) {
                    var expVal = dataSubset.length * (parseFloat(fullDistr[attrVal]) / this.dataSet.length);
                    var obsVal = 0; 
                    if (distr.hasOwnProperty(attrVal)) obsVal = parseFloat(distr[attrVal]);
                    chiSq += Math.pow(obsVal - expVal, 2) / expVal; 
                }
                var degFree = Object.keys(fullDistr).length - 1;

                var gamma = function(x, df) {
                    var gammaResult;
                    if (x <= 0) gammaResult = 0;
                    else if (x < df + 1) {
                        var t1 = 1 / df;
                        var prob = t1;
                        var count = 1;
                        while (t1 > prob * .00001) {
                            t1 = t1 * x / (df + count);
                            prob = prob + t1;
                            count = count + 1;
                        }
                        prob = prob * Math.exp(df * Math.log(x) - x - ial.utils.logGamma(df));
                        return prob;
                    } else {
                        var a0 = 0;
                        var b0 = 1;
                        var a1 = 1;
                        var b1 = x;
                        var aOld = 0;
                        var count = 0;
                        while (Math.abs((a1 - aOld) / a1) > .00001) {
                            aOld = a1;
                            count = count + 1;
                            a0 = a1 + (count - df) * a0;
                            b0 = b1 + (count - df) * b0;
                            a1 = x * a0 + count * a1;
                            b1 = x * b0 + count * b1;
                            a0 = a0 / b1;
                            b0 = b0 / b1;
                            a1 = a1 / b1;
                            b1 = 1;
                        }
                        var prob = 1.0 - (Math.exp(df * Math.log(x) - x - ial.utils.logGamma(df)) * a1);
                        return prob;
                    }

                    return gammaResult;
                }

                var result = gamma(chiSq / 2, degFree / 2);
                result = 1.0 - (Math.round(result * 100000) / 100000);
                varianceVector[attr]["degrees_of_freedom"] = degFree; 
                varianceVector[attr]["chi_squared"] = chiSq;
                varianceVector[attr]["p_value"] = result; 
                if (result < indCatThreshold) numViolations++;
            }
        }

        currentLogInfo['variance_vector'] = varianceVector;
        currentLogInfo['num_violations'] = numViolations;
        currentLogInfo['num_attributes'] = Object.keys(attributeValueMap).length;
        currentLogInfo['percentage'] = numViolations / numAttributes;
        currentLog['info'] = currentLogInfo;

        if (percAttrThreshold >= 1) {
            if (numViolations > percAttrThreshold) currentLog['result'] = true;
            else currentLog['result'] = false;
        } else {
            if ((numViolations / numAttributes) > percAttrThreshold) currentLog['result'] = true;
            else currentLog['result'] = false;
        }

        this.biasLogs.push(currentLog);
        return currentLog;
    }

// bias is defined as the average percent change in the distribution of attribute weights
// indThreshold (optional) indicates the minimum percent change in an attribute's weight that is tolerated (defaults to 0.5)
// percAttrThreshold (optional) indicates what number or percentage of attributes can be below indThreshold (defaults to 0.5)
// scoreType (optional) metric for when individual attribute weight change is in violation (span, average, or max)
    ial.computeAttributeWeightBias = function(indThreshold, percAttrThreshold, scoreType, time) {
        var attributeValueMap = ial.getAttributeValueMap();
        if (typeof indThreshold === 'undefined' || isNaN(parseFloat(indThreshold)) || indThreshold > 1 || indThreshold < 0) indThreshold = 0.1;
        if (typeof percAttrThreshold === 'undefined' || isNaN(parseFloat(percAttrThreshold)) || percAttrThreshold < 0 || percAttrThreshold > Object.keys(attributeValueMap).length) percAttrThreshold = 0.5;
        if (this.ATTRIBUTE_SCORES.indexOf(scoreType) < 0) scoreType = this.ATTRIBUTE_SCORES[0];
        var weightVectorSubset = getWeightVectorQueueSubset(time);

        var currentLog = {};
        var curDate = new Date();
        currentLog['bias_type'] = this.BIAS_ATTRIBUTE_WEIGHT;
        currentLog['current_time'] = new Date();
        currentLog['threshold'] = {'individual_threshold' : indThreshold, 'percent_attribute_threshold' : percAttrThreshold};
        currentLog['number_of_logs'] = weightVectorSubset.length;
        var currentLogInfo = {};
        currentLogInfo['score_type'] = scoreType;

        if (weightVectorSubset.length < 1) {
            currentLog['info'] = currentLogInfo;
            currentLog['result'] = false;
            return currentLog;
        }

        var numViolations = 0;
        var numAttributes = Object.keys(attributeValueMap).length;
        var changeVector = {};
        if (scoreType == 'span') {
            var firstVector = weightVectorSubset[0].oldWeight;
            var lastVector = weightVectorSubset[weightVectorSubset.length - 1].newWeight;
            for (var curKey in attributeValueMap) {
                if (firstVector.hasOwnProperty(curKey) && lastVector.hasOwnProperty(curKey)) {
                    var curChange = Math.abs(firstVector[curKey] - lastVector[curKey]);
                    if (firstVector[curKey] != 0) curChange = curChange / firstVector[curKey];
                    if (curChange > 1) curChange = 1; // set maximum change to be 1
                    changeVector[curKey] = curChange;
                    if (curChange < indThreshold) numViolations++;
                }
            }

            currentLogInfo["first"] = firstVector;
            currentLogInfo["last"] = lastVector;
            currentLogInfo['percent_change_vector'] = changeVector;
        } else if (scoreType == 'max') {
            // consider it a violation if the largest change in weight to a given attribute is below the threshold
            for (var i = 0; i < weightVectorSubset.length; i++) {
                var oldVector = weightVectorSubset[i].oldWeight;
                var newVector = weightVectorSubset[i].newWeight;
                for (var curKey in attributeValueMap) {
                    if (oldVector.hasOwnProperty(curKey) && newVector.hasOwnProperty(curKey)) {
                        var curChange = Math.abs(newVector[curKey] - oldVector[curKey]);
                        if (oldVector[curKey] != 0) curChange = curChange / oldVector[curKey];
                        if (curChange > 1) curChange = 1; // set maximum change to be 1
                        if ((!changeVector.hasOwnProperty(curKey)) || (changeVector.hasOwnProperty(curKey) && curChange > changeVector[curKey])) {
                            changeVector[curKey] = curChange;
                        }
                    }
                }
            }

            for (var curKey in attributeValueMap) {
                if (changeVector.hasOwnProperty(curKey)) {
                    if (changeVector[curKey] < indThreshold) numViolations++;
                }
            }
            currentLogInfo['max_change_vector'] = changeVector;
        } else {
            // compute as scoreType = 'average'
            var mult = 1 / weightVectorSubset.length;
            for (var i = 0; i < weightVectorSubset.length; i++) {
                var oldVector = weightVectorSubset[i].oldWeight;
                var newVector = weightVectorSubset[i].newWeight;
                for (var curKey in attributeValueMap) {
                    if (oldVector.hasOwnProperty(curKey) && newVector.hasOwnProperty(curKey)) {
                        var curChange = Math.abs(newVector[curKey] - oldVector[curKey]);
                        if (oldVector[curKey] != 0) curChange = curChange / oldVector[curKey];
                        if (curChange > 1) curChange = 1; // set maximum change to be 1
                        if (changeVector.hasOwnProperty(curKey)) changeVector[curKey] += (mult * curChange);
                        else changeVector[curKey] = (mult * curChange);
                    }
                }
            }

            for (var curKey in attributeValueMap) {
                if (changeVector.hasOwnProperty(curKey)) {
                    if (changeVector[curKey] < indThreshold) numViolations++;
                }
            }
            currentLogInfo['average_change_vector'] = changeVector;
        }

        currentLogInfo['num_violations'] = numViolations;
        currentLogInfo['num_attributes'] = numAttributes;
        currentLogInfo['percentage'] = numViolations / numAttributes;
        currentLog['info'] = currentLogInfo;

        if (percAttrThreshold >= 1) {
            if (numViolations > percAttrThreshold) currentLog['result'] = true;
            else currentLog['result'] = false;
        } else {
            if ((numViolations / numAttributes) > percAttrThreshold) currentLog['result'] = true;
            else currentLog['result'] = false;
        }

        this.biasLogs.push(currentLog);
        return currentLog;
    }



    /*
     * ---------------------
     *   Utility functions
     * ---------------------
     * */

    ial.utils = {}
    ial.utils.logGamma = function(x) {
        var curVal = 1 + 76.18009173 / x - 86.50532033 / (x + 1) + 24.01409822 / (x + 2) - 1.231739516 / (x + 3) + .00120858003 / (x + 4) - .00000536382 / (x + 5);
        var logRes = (x - .5) * Math.log(x + 4.5) - (x + 4.5) + Math.log(curVal * 2.50662827465);
        return logRes;
    }

    ial.utils.clone = function(obj) {
        // Handle the 3 simple types, and null or undefined
        if (null == obj || "object" != typeof obj) return obj;

        // Handle Date
        if (obj instanceof Date) {
            var copy = new Date();
            copy.setTime(obj.getTime());
            return copy;
        }

        // Handle Array
        if (obj instanceof Array) {
            var copy = [];
            for (var i = 0, len = obj.length; i < len; i++) {
                copy[i] = ial.utils.clone(obj[i]);
            }
            return copy;
        }

        // Handle Object
        if (obj instanceof Object) {
            var copy = {};
            for (var attr in obj) {
                if (obj.hasOwnProperty(attr)) copy[attr] = ial.utils.clone(obj[attr]);
            }
            return copy;
        }

        throw new Error("Unable to copy obj! Its type isn't supported.");
    }

// private
    function sortObj(list, key, order) {
        order = typeof order !== 'undefined' ? order : 'a';
        function compare(a, b) {
            if(key == "ial.weight" || key == "ial.id" || key == "ial.itemScore") {
                a = a["ial"][key.split('.')[1]];
                b = b["ial"][key.split('.')[1]];
            } else {
                a = a[key];
                b = b[key];
            }
            var type = (typeof(a) === 'string' ||
            typeof(b) === 'string') ? 'string' : 'number';
            var result;
            if (type === 'string') result = a.localeCompare(b);
            else {
                if (order == 'a') {
                    result = a - b;
                } else if (order == 'd') {
                    result = b - a;
                }
            }
            return result;
        }
        return list.sort(compare);
    }
})();
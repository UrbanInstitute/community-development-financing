var pymChild = new pym.Child();
var indicator;
var indicators = ["z_Business","z_CommDevOther","z_GlobalCapacity","z_Housing","z_ImpactFinance"];
var indicatorKey = {
	"z_Business":{
		"variable":"Business",
		"proper":"Small Business"
	},
	"z_CommDevOther":{
		"variable":"CommDevOther",
		"proper":"Other Community Development"
	},
	"z_GlobalCapacity":{
		"variable":"GlobalCapacity",
		"proper":"Combined"
	},
	"z_Housing":{
		"variable":"Housing",
		"proper":"Housing"
	},
	"z_ImpactFinance":{
		"variable":"ImpactFinance",
		"proper":"Impact Finance"	
	}
}

function findSize(binNum) {
	if (binNum === 2) {
		var name = 'small',
		desc = '*Small counties have populations between 50,000 and 99,999 people'
	} else if (binNum === 3) {
		var name = 'medium',
		desc = '*Medium counties have populations between 100,000 and 299,999 people'
	} else {
		var name = 'large',
		desc = '*Large counties have populations of more than 300,000 people'
	}

	return {"name":name,"desc":desc}
}

// color function for the map and the dots
function colorList(d,num) {

	var colorList6 = ["#a2d4ec","#73bfe2","#46abdb","#1696d2","#12719e","#000000"];
	var colorList5 = ["#73bfe2","#46abdb","#1696d2","#12719e","#000000"];
	

	if (num === 5) {
		var index = Math.ceil(d) + 1 > num - 1 ? (num-1) : Math.ceil(d);	
	} else {
		var index = Math.ceil(d) + 1 > num - 1 ? (num-1) : Math.ceil(d)+1;
	}

	if (index < 0) {index = 0}

	var color = num === 5 ? colorList5[index] : colorList6[index]
	
	return color;
}

// move to front function for the map
d3.selection.prototype.moveToFront = function() {
  return this.each(function(){
    this.parentNode.appendChild(this);
  });
};

d3.queue()
    .defer(d3.csv, "data/county14.csv")    
    .defer(d3.json, "data/counties_20m.json")    
    .await(ready);

function ready(error, data, topo) {    
	// make data searchable in autocomplete by adding the value category. 
	data.forEach(function(d){
		d.value = d.CountyName + " County, " + d.State;
	})

	var fipsIndex = d3.map(data, function(d) { return d.fips5; });	

	// autocomplete call
	$( '#autocompletez').autocomplete( {
	    lookup: data,
	    lookupLimit: 10,
	    maxHeight: 350,
	    showNoSuggestionNotice: true,
	    noSuggestionNotice: function () {
	      return "No county found"
	    },
	    onSelect: function ( suggestion ) {
	      // console.log(suggestion)
	      TipPopulate(suggestion,"auto")
	      g.selectAll(".county").classed("active",false).attr("r",bubbleRadius)
	      g.select(".fips" + suggestion.fips5).classed("active",true).attr("r",(bubbleRadius*2))


	      // CAll function that highlights selected line
	      // Highlight( suggestion.value )
	    }
	  } );

	// event for clicking on buttons to change data
	$('.switch.dots.second-in').on('click',function(){		
		$('.switch.dots.second-in').removeClass("active");
		indicator = $(this)["0"].attributes[2].nodeValue;
		update(data,indicator,y)
		BuildMap(indicator,topo,fipsIndex);

		$(this).addClass("active");
	})

	
	var breakpoint = 768,
		width = parseInt(d3.select("#chart").style("width"));

	// static parameters
	var spacer = 10,
		bubbleRadius = 4,
		bubbleSpacer = 3,
		bnMult = bubbleRadius*2+bubbleSpacer,
		topBubbleLevel = -8,
		yLineTop = 140,
		yLineX = -56,
		LineTextLeft = -51;


	// width based parameters
	if (width > breakpoint) {
		var margin = {top: 60, right: 10, bottom: 10, left: 100}
	} else {
		// Smaller viewports
		var margin = {top: 20, right: 10, bottom: 10, left: 10}
	}	

	var colorScale = d3.scaleOrdinal()
		.range(["#848081","#d5d5d4","#332d2f","#5c5859","#0096d2","#a2d4ec","#0a4c6a","#12719e","#fdbf11","#fce39e","#843215","#e88e2d"]);		

  	//////// mess with the data

  	var y = {}

	// create d3 key here. 
	var map = d3.map(data, function(d) { return d.id; });

	for (var k = 0; k < indicators.length; k++) {	
		// var extent = d3.extent(data, function(d) { return +d[indicators[k]]});
		var min = Math.floor(d3.min(data, function(d) { return +d[indicators[k]]}));
		// var max = Math.ceil(d3.max(data, function(d) { return +d[indicators[k]]}));
		var max = 3;		


		// Problem here!!!! 
		// Can only have (width/radius) balls per row. 

		var histogram = d3.histogram()
			.domain([min,max])
			.thresholds(100)
			.value(function(d,i,data) { 
				return +d[indicators[k]]; 
			})

		var bins = histogram(data)

		y[indicators[k]] = d3.scaleLinear()
			.domain([min,max])
			.range([bins.length*bnMult,0]); 

		y[indicators[k]].numBins = bins.length;


		for (var i = 0; i < bins.length; i++) {
			// bins[i].sort(function(a,b){return b[indicators[k]] - a[indicators[k]]  })
			for (var j = 0; j < bins[i].length; j++) {
				var now = map.get(bins[i][j].id);
				now[indicators[k] + "Index"] = j;
				now[indicators[k] + "Y"] = (bins[i].x1 + bins[i].x0)/2;
			}
		}
	}

	var chartHeight = 200 * (bubbleRadius*2);
	var svg = d3.select("#chart").append("svg")
	  .attr("width", width)
	  .attr("height", chartHeight + margin.top + margin.bottom);

  	// declare main g and stuff
  	var g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  	// map gs and svgs
	var svg2 = d3.select("#map").append("svg")
	  .attr("width", 400)
	  .attr("height", 200);
  	
  	var g2 = svg2.append("g").attr("transform", "translate(0,0)");

	var projection = d3.geoAlbers() // updated for d3 v4
	    .scale(400)
	    .translate([400 / 2, 200 / 2]);

	// var projection = d3.geoAlbersUsa();
	var path = d3.geoPath()
	    .projection(projection);

  function update(data,indicator,y) {
  	var t = d3.transition()
      .duration(1500);

	// Index of county bubbles over the max height
    var overIndex = -1;
    // reset height and redraw based on width?
    
	
	var chartHeight = y[indicator].numBins*(bnMult),
		yLineBottom = chartHeight - 130;



	svg.attr("height",chartHeight+margin.top+margin.bottom)

	//remove existing yGrid lines	
	g.selectAll(".yGrid").remove()		
	g.selectAll(".yNum").remove()		

	for (var i = y[indicator].domain()[0]; i <= y[indicator].domain()[1]; i++) {
		g.append("line")
			.attr("class","yGrid")
			.attr("x1",function(d){
				if (i === 0) {
					return -75
				} else {
					return -40
				}
			})
			.attr("x2",width)
			.attr("y1",y[indicator](i))
			.attr("y2",y[indicator](i))

		g.append("text")
			.attr("class","yNum")
			.attr("x",function(d){
				if (i === 0) {
					return -60
				} else {
					return -35
				}
			})			
			.attr("y",y[indicator](i) - 5)
			.text(function(){
				if (i === y[indicator].domain()[1]) {
					return i + "+"
				} else {
					return i
				}
			})			
	}

	g.append("text")
		.attr("class","xText")
		.attr("x",0)
		.attr("y",-45)
		.text("Number of Counties")

	
	var numXticks = Math.floor((width-margin.left)/(bnMult)/5)

	// create x ticks
	for (var i = 1; i <= numXticks; i++) {
		g.append("text")
			.attr("class","xNum")
			.attr("x",function(d){
				return (i*(bnMult)*5 - (bnMult) + 1);
			})
			.attr("y",-20)
			.text(i*5)		
	}	
	
	// Lines and arrows and text
	g.append("line")
		.attr("class","yLine1")
		.attr("x1",yLineX)
		.attr("x2",yLineX)
		.attr("y1",yLineTop)
		.attr("y2",y[indicator](0) - 25)

	g.append("line")
		.attr("class","yLine1")
		.attr("x1",yLineX)
		.attr("x2",yLineX + 6)
		.attr("y1",yLineTop)
		.attr("y2",yLineTop + 5)		

	g.append("line")
		.attr("class","yLine1")
		.attr("x1",yLineX)
		.attr("x2",yLineX - 6)
		.attr("y1",yLineTop)
		.attr("y2",yLineTop + 5)				

	g.append("line")
		.attr("class","yLine2")
		.attr("x1",yLineX)
		.attr("x2",yLineX)
		.attr("y1",y[indicator](0) + 10)
		.attr("y2",yLineBottom)

	g.append("line")
		.attr("class","yLine2")
		.attr("x1",yLineX)
		.attr("x2",yLineX + 6)
		.attr("y1",yLineBottom)
		.attr("y2",yLineBottom - 5)		

	g.append("line")
		.attr("class","yLine2")
		.attr("x1",yLineX)
		.attr("x2",yLineX - 6)
		.attr("y1",yLineBottom)
		.attr("y2",yLineBottom - 5)				

	g.append("text")
		.attr("class","yLineText")
		.attr("x",-10)
		.attr("y",LineTextLeft)
		.attr("transform", function(d) {
	        return "rotate(-90)" 
        })
		.text("More Investment")

	g.append("text")
		.attr("class","yLineText end")
		.attr("x",-chartHeight + 10)
		.attr("y",LineTextLeft)
		.attr("transform", function(d) {
	        return "rotate(-90)" 
        })        
		.text("Less Investment")

	g.append("text")
		.attr("class","yLineText title")
		.attr("x",-10)
		.attr("y",LineTextLeft-30)
		.attr("transform", function(d) {
	        return "rotate(-90)" 
        })
		.text("Standard Deviations from Mean")

  	// data join
	var counties = g.selectAll("circle")
		.data(data, function(d) {return d.fips5; })


		// EXIT old elements not present in new data.
	counties.exit()	  
		.transition(t)
		  .style("fill-opacity", 1e-6)
		  .remove();

	  // update
  	counties.style("fill-opacity", 1)
    	.transition(t)
			.attr("cx", function (d) { 
				if (isNaN(d[indicator + "Y"])) {
					overIndex += 1;
					return overIndex*bnMult;
				}
				else {
					return d[indicator + "Index"]*bnMult;	
				}				
			})
			.attr("cy", function (d) { 	
				if (isNaN(d[indicator + "Y"])) {
					return topBubbleLevel;
				}	
				else {
					return y[indicator](d[indicator + "Y"])	
				}	
			})
			.style("fill", function(d) {
				if (indicator === "z_GlobalCapacity" || indicator === "z_Business") {						
					return colorList(+d[indicator],6)
				} else {
					return colorList(+d[indicator],5)
				}
			})

	  // enter + update
	  counties.enter().append("circle")
      	.attr("class", function(d){
      		return "county fips" + d.fips5;
      	})
			.attr("cx", function (d) { 
				if (isNaN(d[indicator + "Y"])) {
					overIndex += 1;
					return overIndex*bnMult;
				}
				else {
					return d[indicator + "Index"]*bnMult;	
				}		
			})
			.attr("cy", function (d) {
				if (isNaN(d[indicator + "Y"])) {
					return topBubbleLevel;
				}	
				else {
					return y[indicator](d[indicator + "Y"])	
				}	
			})
			.attr("r", bubbleRadius)
			.style("fill", function(d) {
				if (indicator === "z_GlobalCapacity" || indicator === "z_Business") {						
					return colorList(+d[indicator],6)
				} else {
					return colorList(+d[indicator],5)
				}
			})
			.style("fill-opacity", 1e-6)
			.on("mouseover",function(d,i){
				d3.selectAll("circle.active")
					.attr("r",bubbleRadius)
					.classed("active",false)

				d3.select(this)
					.attr("r",2*bubbleRadius)
					.classed("active",true)		
				TipPopulate(d,"mouse")

			})
    	.transition(t)
    		.style("fill-opacity", 1);

  }

  // starting indicator?
  indicator = "z_Housing"
  update(data,indicator,y);
  BuildMap(indicator,topo,fipsIndex);


  function TipPopulate(data,type) {
  	// if hidden, show tip

  	if (!$("#tooltip").hasClass("active")) {
  		$("#tooltip").addClass("active")
  	}

  	if (data[indicator] > 2) {  		
  		var tipHead = g.select(".fips" + data.fips5).attr("cy");
  	} else if (data[indicator] > 0) {
  		var tipHead = g.select(".fips" + data.fips5).attr("cy") - ($("#tooltip").outerHeight() / 2)
  	} else {
  		var tipHead = g.select(".fips" + data.fips5).attr("cy") - $("#tooltip").outerHeight()
  	}

  	$("#tooltip").css('top',tipHead + "px")

  	// $("#chart").

  	// SCROLL THE PAGE HERE
  	if (type === "auto") {
  		var newHeight = $('html').scrollTop() + +tipHead + 100;
  		// console.log($('#search').scrollTop())
  		// console.log($('html').scrollTop())
  		// console.log($('body').scrollTop())
  		$('html, body').animate({scrollTop: newHeight +'px'}, 800);	
  	}

  	// update Dom
  	var title = '<span class="bold">' + data.CountyName + ' County,</span> ' + data.State,
  	size = findSize(+data.popsize_bin)
  	population = '<span class="bold">Population:</span> ' + data.totalpop + '</p>',
  	rankOverall =  '<span class="bold">Rank – '+ indicatorKey[indicator].proper +' overall:</span> ' + data[indicatorKey[indicator].variable + "_rank_overall"] +'</p>',
  	percOverall =  '<span class="bold">Percentile – '+ indicatorKey[indicator].proper +' overall:</span> ' + data[indicatorKey[indicator].variable + "_ptile_overall"] +' percentile</p>',
  	rankSpecific =  '<span class="bold">Rank – '+ indicatorKey[indicator].proper +' among ' + size.name + '* counties:</span> ' + data[indicatorKey[indicator].variable + "_rank"] +'</p>',
  	percSpecifc =  '<span class="bold">Percentile – '+ indicatorKey[indicator].proper +' among ' + size.name + '* counties:</span> ' + data[indicatorKey[indicator].variable + "_ptile"] +' percentile</p',
  	sizeDesc = size.desc;

console.log(size)
console.log(data.popsize_bin)

  	$(".tip-title").html(title)
  	$("#population").html(population)
  	$("#rankOverall").html(rankOverall)
  	$("#percOverall").html(percOverall)
  	$("#rankSpecific").html(rankSpecific)
  	$("#percSpecifc").html(percSpecifc)
	$(".tip-note").html(sizeDesc)
	
  	// update map/zoom the map
  	zoomMap(data,indicator)

  	g.select(".fips" + data.fips5).classed("active",true)

  }

  function BuildMap(category,topo,fipsIndex) {
  	svg2.selectAll(".subunit").remove();
	svg2.selectAll("path").remove();

    g2.append("path")
		.attr("class","pathDaddy")
    	.datum(topojson.feature(topo, topo.objects.counties))
			.attr("d", path);

	g2.selectAll(".subunit")
	  .data(topojson.feature(topo, topo.objects.counties).features)
	.enter().append("path")
	  .attr("class", function(d) {
	  	return "subunit fips" + d.id})
	  .attr("d", path)
	  .attr("fill", function(d){			  	
		if (fipsIndex.get(d.id) != undefined) {
			if (category === "z_GlobalCapacity" || category === "z_Business") {						
				return colorList(+fipsIndex.get(d.id)[category],6)
			} else {
				return colorList(+fipsIndex.get(d.id)[category],5)
			}
		} else {
			return "#d2d2d2"
		}	
	  })

  }

  	function zoomMap(suggestion,category) {		
  		var height = 200;
  		var width = 400;

		county = topojson.feature(topo, topo.objects.counties).features.filter(function(d) { return +d.id === +suggestion.fips5; })[0];

		projection
	      .scale(1)
	      .translate([0, 0]);

		var b = path.bounds(county),
			s = .55 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height),
			t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];

		 projection
			.scale(s)
			.translate(t);

		// move the map, don't just redraw it entirely!

		g2.selectAll(".subunit").classed("active",false)
		g2.select(".fips" + suggestion.fips5).moveToFront();
		g2.select(".fips" + suggestion.fips5).classed("active",true)
		g2.select(".pathDaddy").attr("d", path);
		g2.selectAll(".subunit").attr("d", path);
	}

}

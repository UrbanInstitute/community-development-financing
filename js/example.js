// Pym stuff here....not sure if its done
  function drawGraphic(width) {
    console.log(width)
    // do your resize event here
  } 

var pymChild = new pym.Child({ renderCallback: drawGraphic });


var margin = 0,
    width = parseInt(d3.select("#master_container").style("width")) - margin*2,
    height = width / 2;
    // height = parseInt(d3.select("#map_container").style("height")) - margin*2;

// var width = 960,
//     height = 600;


var projection = d3.geo.albersUsa();
      
var path = d3.geo.path()
    .projection(projection);

var svg = d3.select("#map_container")
    .attr("width", width + margin*2)
    .attr("height", height + margin*2);

var radius2 = d3.scale.sqrt()
    // .domain([400000, 50000000]) if using total sqft
    .domain([0, 2500])
    .range([10, 25]);

var legend = svg.append("g")
    .attr("class", "legend")    
    .selectAll("g")
      .data([500, 1000, 2000])
      .enter().append("g");

// Pie chart parameters //first 4 colors are bluish and fossil/nuclear, last two are renewable. Add a diff for nuclear, tweak??
var color = d3.scale.ordinal()
    .range(['#bae4bc','#7bccc4','#2b8cbe']);

var radius = 80;
var arc = d3.svg.arc()
    .outerRadius(radius - 10)
    .innerRadius(30);

var pie = d3.layout.pie()
    .sort(null)
    .value (function(d){  
      return d.value;   
      //Trying to figure out a way to prune results.
    });

  d3.json("data/bbc_1.json", function(error, us) {
  if (error) return console.error(error);

  var TheData = topojson.feature(us, us.objects.us_50m).features;

//build a map outside of resize
  svg.selectAll(".state")
    .data(topojson.feature(us, us.objects.us_50m).features)
    .enter().append("path")
      .attr("class", function(d) {return "state " + d.id; });

      //this is building of the USA shape
  svg.append("path")
    .datum(topojson.mesh(us, us.objects.us_50m, function(a,b) {return a !== b;}))
    .attr("class", "state-boundary");

  svg.append("g")
    .attr("class", "bubbles")
  .selectAll("circle")
    .data(topojson.feature(us, us.objects.us_50m).features)
  .enter().append("circle")
    .attr("class", function(d) {
      return "posB bubble"
    });       

    function resize() {
	    var width = parseInt(d3.select("#master_container").style("width")) - margin*2,
	    height = width / 2;    	
     	// width = $(window).width();    

    // Smaller viewport
      if (width <= 800) {
        projection
          .scale(width * 1.2)
          .translate([width / 2, ((height / 2) + 45)])             
      } else if (width <= 900) {

        projection
          .scale(width * 1.2)
          .translate([width / 2, ((height / 2) + 30)])             
      } 
      // full viewport
      else {
        projection
          .scale(width)
          .translate([width / 2, ((height / 2) + 10)])   
      };

        var radius2 = d3.scale.linear()  
          .domain([0, 2500])
          .range([(5), (width / 15)]); 

      // resize paths of states
      svg.selectAll('path.state')
        .attr("d", path);

      svg.selectAll('path.state-boundary')
        .attr("d", path);

      // create the legend
      legend.append("circle")

      legend.append("text")
          .attr("dy", "1.3em")
          // .text(d3.format(".1s"));
          .text(function(d){return d});

        // hang the legend based on louisiana's location
      // var lgspot = [(path.centroid(TheData[8])[0] + (width / 7)),(path.centroid(TheData[8])[1] + (width / 20))]
      var lgspot2 = (width - (radius2(5000) + 10)) + "," + (height - 10)

      legend        
        // .attr("transform", "translate(" + (width - (radius2(5000) + 10)) + "," + (height - 10) + ")");
        .attr("transform", function(d) { 
          return "translate(" + lgspot2 + ")"; });

      legend.selectAll("circle")
        .attr("cy", function(d) { return -radius2(d); })
        .attr("r", radius2);

      legend.selectAll("text")
        .attr("y", function(d) { return -2 * radius2(d); }); 

      d3.selectAll(".legendText").remove();     
      // Legend Text
      var legendText = svg.append("g")
      .attr("class", "legendText lg")
      .append("text")
      .attr("dy", "1.3em")      
      .attr("text-anchor","middle")
      .attr("fill","rgb(51,51,51)")
      .attr("transform", function(d) { 
          return "translate(" + lgspot2 + ")"; });     

      legendText.append("tspan")
        .text("Buildings Participating Per State")
        .attr("x",0)
        .attr("y",0);

      // legendText.append("tspan")
      //   .text("In Gigawatts (GW)")
      //   .attr("x",0)
      //   .attr("y",25);

    	svg.selectAll("circle.bubble")
    		.data(topojson.feature(us, us.objects.us_50m).features
          .sort(function(a, b) { return b.properties.total - a.properties.total; }))
        .attr("transform", function(d) { 
          return "translate(" + path.centroid(d) + ")"; })
        .attr("r", function(d) { 
          return radius2(d.properties.total)


        })
        .attr("text", function(d){ return d.properties.name});
    }

    function tooltip(d) {     

      width = parseInt(d3.select("#master_container").style("width")) - margin*2,

      // Remove everything and start over.
      remover();
      
      var data = d;
      centroid = path.centroid(data);

      if (width > 900) {
        if (centroid[1] < 250) {
          centroid_adjusted = [(centroid[0]-radius - 5),(centroid[1]+25)];
        } else {
          centroid_adjusted = [(centroid[0]-radius - 5),(centroid[1]-(2 * radius + 80))];
        };        
      }
      else if (width > 700) {  
        if (centroid[1] < 225) {
          centroid_adjusted = [(centroid[0]-radius - 5),(centroid[1]+25)];
        } else {
          centroid_adjusted = [(centroid[0]-radius - 5),(centroid[1]-(2 * radius + 80))];
        };
      }
      else if (width > 480) {
        if (centroid[0] < width / 2) {
          centroid_adjusted = [(width - 175),(5)];        
        } else {
          centroid_adjusted = [(5),(5)];               
        };
      } else {
        if (centroid[0] < 200) {
          centroid_adjusted = [(width - 175),(5)];        
        } else {
          centroid_adjusted = [(5),(5)];               
        };
      };

        tip_text  = [(centroid_adjusted[0] + radius + 10),(centroid_adjusted[1] + 20)];
        tip_text2  = [(centroid_adjusted[0] + radius + 10),(centroid_adjusted[1] + 55)];
        tip_text4  = [(centroid_adjusted[0] + radius + 10),(centroid_adjusted[1] + 40)];      
        pie_center = [(centroid_adjusted[0] + radius + 10),(centroid_adjusted[1]+(radius + 50))];
        tip_close = [(centroid_adjusted[0] + radius*2 + 10),(centroid_adjusted[1]+(15))];

      var zeroten = parseInt(data.properties.imp_none) + parseInt(data.properties.imp_ten);



// Create array for pie charts here!!!!!!!!!!!!!!!!!!!!!!! put in memory and use laterZZzzzZzzZzzzZZzzZZZz
      var data_array = [              
        {type: "0-10%", total: data.properties.total, value: zeroten, x:centroid_adjusted[0], y:centroid_adjusted[1]},
        {type: "11-20%", total: data.properties.total, value: data.properties.imp_twenty, x:centroid_adjusted[0], y:centroid_adjusted[1]},
        {type: ">20%", total: data.properties.total, value: data.properties.imp_greater, x:centroid_adjusted[0], y:centroid_adjusted[1]}
        ];

      var tooltipContainer = svg.append("g")
        .attr("id", "tooltip")
      .append("rect")
        // .attr("id", "tooltip")
        .attr("transform", function() { 
          return "translate(" + centroid_adjusted + ")"; })
        .attr("width", (radius * 2 + 20))
        .attr("height", (radius * 2 + 80))
        .attr("rx", 6)
        .attr("ry", 6)
        // .attr("fill", "brown");

// tip title
      svg
        .append("text")
        .attr("class","tip-text")
        .text(function(d){
            return data.properties.name;
        })
        .attr("transform", function() { 
          return "translate(" + tip_text + ")"; });

      svg
        .append("text")
        .attr("class","tip-text2")
        .text(function(d){
            //calculate million sqft
            return data.properties.total + " buildings"
        })
        .attr("transform", function() { 
          return "translate(" + tip_text4 + ")"; });

      svg
        .append("text")
        .attr("class","tip-text2")
        .text(function(d){
            //calculate million sqft
            var sqft = Math.round(Math.round(data.properties.sum_sqft) / 10000) / 100 ;
            return sqft + " million sq. ft.";
        })
        .attr("transform", function() { 
          return "translate(" + tip_text2 + ")"; });

      svg.append("g")
        .attr("class", "closer")
        .attr("transform", function(){
          return "translate(" + tip_close + ")";
        })
          .append("text")
          .attr("class", "tip-text2")
          .text("X").on("click", remover);

      var tip_position = [(centroid_adjusted[0] + 90),(centroid_adjusted[1] + 215)];

      var toolbody = svg.append("text")
                      .attr("class","tip-text3")
                      .attr("transform", function() { 
                        return "translate(" + tip_position + ")"; });

          toolbody
            .append("tspan")
            .text("Hover over pie chart ")
            .attr("x",0)
            .attr("y",0);

          toolbody
            .append("tspan")
            .text("for more information")
            .attr("x",0)
            .attr("y",15);
            
      var g = svg.selectAll(".arc")
          .data(pie(data_array))
        .enter().append("g")
          .attr("class", "arc")
          .attr("transform", function() { 
          return "translate(" + pie_center + ")"; });

      g.append("path")
        .attr("d", arc)
        .style("fill", function(d) { 
          return color(d.data.type); });

    d3.selectAll("g.arc").on('mouseover', arctip);      
  }    


  function arctip(d) { 
    d3.selectAll(".tip-text3").remove();
    var tip_data = d.data

    var tip_position = [(tip_data.x + 90),(tip_data.y + 215)];

       var toolbody = svg
        .append("text")
        .attr("class","tip-text3")
        .attr("transform", function() { 
          return "translate(" + tip_position + ")"; });

      toolbody.append("tspan")      
        .text(function(d){
          // var percent = Math.round(tip_data.value/tip_data.total * 100);
            return tip_data.value + " buildings with";
        })
        .attr("x",0)
        .attr("y",0);

      toolbody.append("tspan")
        .text(function(d){
          return tip_data.type + " improvement in EUI"
        })
        .attr("x",0)
        .attr("y",15);
      }



    function remover() {
      d3.select("#tooltip").remove();
      d3.selectAll(".arc").remove();
      d3.selectAll(".tip-text").remove();
      d3.selectAll(".tip-text2").remove();        
      d3.selectAll(".tip-text3").remove();     
    }

   	resize();
    d3.select(window).on('resize', resize); 
    d3.selectAll("circle.bubble").on('click', tooltip);

    resize(); 
    // Need both resizes???????
	});


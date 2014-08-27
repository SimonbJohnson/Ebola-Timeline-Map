function generateBarChart(id,data){

    var margin = {top: 0, right: 30, bottom: 30, left: 30},
        width = $(id).width() - margin.left - margin.right,
        height =  $(id).height() - margin.top - margin.bottom;

    var chart = d3.select(".chart")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var x = d3.scale.ordinal()
        .rangeRoundBands([0, width], .1);

    var y = d3.scale.linear()
        .range([height, 0]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .ticks(5);

    var yGrid = d3.svg.axis()
        .scale(y)
        .orient("left")
        .tickSize(-width, 0, 0)
        .tickFormat("")
        .ticks(5);

    var svg = d3.select(id).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
    var max = d3.max(data, function(d) { return d.newCases+d.newDeaths; })
    
    x.domain(data.map(function(d) { return formatDate(d.Date); }));
    y.domain([0, max]);
    
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);
       
    svg.append("g")
        .attr("class", "grid")
        .call(yGrid);       

    svg.selectAll(".totalbar")
        .data(data)
    .enter().append("rect")
        .attr("class", "totalbar")
        .attr("x", function(d) { return x(formatDate(d.Date)); })
        .attr("width", x.rangeBand())
        .attr("y", function(d) { return y(d.newCases+d.newDeaths); })
        .attr("height", function(d) {
           return height - y(d.newCases+d.newDeaths);});
           
    svg.selectAll(".deathbar")
        .data(data)
    .enter().append("rect")
        .attr("class", "deathbar")
        .attr("x", function(d) { return x(formatDate(d.Date)); })
        .attr("width", x.rangeBand())
        .attr("y", function(d) { return y(d.newDeaths); })
        .attr("height", function(d) {
           return height - y(d.newDeaths);});
          
    svg.selectAll(".current")
        .data(data)
    .enter().append("rect")
        .attr("class", "current")
        .attr("x", function(d) { return x(formatDate(d.Date)); })
        .attr("width", x.rangeBand())
        .attr("y", function(d) { return y(max); })
        .attr("height", function(d) {
           return height - y(max);})
        .attr("opacity",0)
        .attr("id",function(d,i){return "barSelect"+i;})
        .on("click",function(d,i){
            d3.select("#barSelect"+currentWeek).transition().duration(200).attr("opacity",0);
            currentWeek=i;
            d3.select("#barSelect"+currentWeek).transition().duration(200).attr("opacity",0.15);
        });
}

function formatDate(date){
    var month=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    return date.substring(0,2) + " " + month[parseInt((date.substring(4,5))-1)];
}

var currentWeek=0;
generateBarChart('#bar_chart',totalCasesAndDeaths);
d3.select("#barSelect"+currentWeek).attr("opacity",0.15);
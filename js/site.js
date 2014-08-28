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
            d3.select("#barSelect"+currentWeek).attr("opacity",0);
            currentWeek=i;
            d3.select("#barSelect"+currentWeek).attr("opacity",0.15);
            transitionMap();
        });
}

function generateMap(){
    var margin = {top: 10, right: 10, bottom: 10, left: 10},
    width = $('#map').width() - margin.left - margin.right,
    height = 425;
   
    var projection = d3.geo.mercator()
        .center([-5,7.7])
        .scale(1500);

    var svg = d3.select('#map').append("svg")
        .attr("width", width)
        .attr("height", height);

    var path = d3.geo.path()
        .projection(projection);

    var g = svg.append("g");
    
    g.selectAll("path")
        .data(westafrica.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("stroke",'#aaaaaa')
        .attr("fill",'#ffffff')
        .attr("class","country");

    var g = svg.append("g");    

    g.selectAll("path")
        .data(regions.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("stroke",'#aaaaaa')
        .attr("fill",'#ff0000')
        .attr("opacity",0)
        .attr("id",function(d){return d.properties.NAME_REF;})
        .attr("class","region");

}

function transitionMap(){
    
    
    var projection = d3.geo.mercator()
        .center([mapSettings[currentWeek].lng,mapSettings[currentWeek].lat])
        .scale(mapSettings[currentWeek].scale);

    var path = d3.geo.path()
        .projection(projection);

    d3.selectAll('.country').transition()
            .attr('d', path);
            
    
    var data = regionDeaths[currentWeek].Deaths;
    data.forEach(function(element){
               d3.select("#"+element.Region.split(' ').join('_'))
                        .transition()
                        .attr("opacity",convertDeathsToOpacity(element.Deaths))
                        .attr('d', path); 
            });
            
            

}

function convertDeathsToOpacity(deaths){
    var opacity = deaths/90*0.7;
    if(opacity>0){opacity=opacity+0.2;}
    console.log(opacity);
    return opacity;
}

function formatDate(date){
    var month=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    return date.substring(0,2) + " " + month[parseInt((date.substring(4,5))-1)];
}

var currentWeek=0;
generateBarChart('#bar_chart',totalCasesAndDeaths);
d3.select("#barSelect"+currentWeek).attr("opacity",0.15);
generateMap();
transitionMap();

$(document).keydown(function(e) {
    switch(e.which) {
        case 37:
            d3.select("#barSelect"+currentWeek).attr("opacity",0);    
            currentWeek=currentWeek-1;
            if(currentWeek<0){currentWeek=0;}
            d3.select("#barSelect"+currentWeek).attr("opacity",0.15);
            transitionMap();
            break;

        case 39:
            d3.select("#barSelect"+currentWeek).attr("opacity",0);    
            currentWeek=currentWeek+1;
            if(currentWeek>totalCasesAndDeaths.length-1){
                currentWeek=totalCasesAndDeaths.length-1;
            }
            d3.select("#barSelect"+currentWeek).attr("opacity",0.15); 
            transitionMap();
            break;

        default: return; // exit this handler for other keys
    }
    e.preventDefault(); // prevent the default action (scroll / move caret)
});
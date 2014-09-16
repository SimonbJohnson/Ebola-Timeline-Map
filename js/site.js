function generateBarChart(id,data){

    var margin = {top: 0, right: 80, bottom: 30, left: 30},
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
    
    var max = d3.max(data, function(d) { return d.newCases; });
    
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
        .attr("width", x.rangeBand()/2)
        .attr("y", function(d) { return y(d.newCases); })
        .attr("height", function(d) {
           return height - y(d.newCases);});
           
    svg.selectAll(".deathbar")
        .data(data)
    .enter().append("rect")
        .attr("class", "deathbar")
        .attr("x", function(d) { return x(formatDate(d.Date))+x.rangeBand()/2; })
        .attr("width", x.rangeBand()/2)
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
        
    var g = svg.append("g");
        
    g.append("rect")
        .attr("x", width+10)
        .attr("y", 10)
        .attr("width", 10)
        .attr("height", 10)
        .attr("fill","steelblue");

    g.append("rect")
        .attr("x", width+10)
        .attr("y", 30)
        .attr("width", 10)
        .attr("height", 10)
        .attr("fill","red");

    g.append("text")
        .attr("x",width+25)
        .attr("y",18)
        .text("New Cases")
        .attr("font-size","10px");

    g.append("text")
        .attr("x",width+25)
        .attr("y",38)
        .text("Deaths")
        .attr("font-size","10px");


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
        .attr("id",function(d){return d.properties.NAME_REF.replace(/\s/g, '');})
        .attr("class","region");

    var g = svg.append("g");    

    g.selectAll("path")
        .data(blockades_geo.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("stroke",'brown')
        .attr("fill","none")
        .attr("stroke-width",2)
        .attr("opacity",1)
        .attr("class","blockade")
        .attr("id",function(d){
                    return d.properties.Border_ID;});
    
    var g = svg.append("g"); 
    
    g.selectAll("circles")
        .data(medical_centres_geo.features)
        .enter()
        .append("circle")
        .attr('cx',function(d){
                    var point = projection([ d.geometry.coordinates[0], d.geometry.coordinates[1] ]);
                    return point[0];
                })
        .attr('cy',function(d){
                    var point = projection([ d.geometry.coordinates[0], d.geometry.coordinates[1] ]);
                    return point[1];
                })
        .attr("r", 5)
        .attr("id",function(d){
                    return d.properties.ID;
        })
        .attr("class","medical_centres")
        .attr("fill",function(d){
            if(d.properties.Type=="Isolation"){
                return "green";
            }else{
                return "blue";
            }
                })
        .attr("opacity",0.7);        

    var g = svg.append("g");
        
    g.append("rect")
        .attr("x", 0)
        .attr("y", 350)
        .attr("width", 10)
        .attr("height", 10)
        .attr("fill","#ff9999");

    g.append("text")
        .attr("x",15)
        .attr("y",358)
        .text("Confirmed Cases")
        .attr("font-size","10px");

    g.append("rect")
        .attr("x", 0)
        .attr("y", 374)
        .attr("width", 10)
        .attr("height", 2)
        .attr("fill","brown");

    g.append("text")
        .attr("x",15)
        .attr("y",378)
        .text("Blockade")
        .attr("font-size","10px");

    g.append("circle")
        .attr("cx",5)
        .attr("cy",335)
        .attr("r",5)
        .attr("fill","green");

    g.append("text")
        .attr("x",15)
        .attr("y",338)
        .text("Referral Centre")
        .attr("font-size","10px");

    g.append("circle")
        .attr("cx",5)
        .attr("cy",315)
        .attr("r",5)
        .attr("fill","blue");

    g.append("text")
        .attr("x",15)
        .attr("y",318)
        .text("Treatment")
        .attr("font-size","10px");

    var mapLabels = svg.append("g");    

    mapLabels.selectAll('text')
      .data(westafrica.features)
         .enter()
         .append("text")
         .attr("x", function(d,i){
                     return path.centroid(d)[0]-20;})
         .attr("y", function(d,i){
                     return path.centroid(d)[1];})
         .attr("dy", ".55em")
         .attr("class","maplabel")
         .style("font-size","20px")
         .attr("opacity",0.4)
         .text(function(d,i){
                      return d.properties.NAME_REF;
                  });

}

function transitionMap(){
    
    
    $('#week').html("<h4>Map for week ending " + mapSettings[currentWeek].Date + "</h4>");
    
    var projection = d3.geo.mercator()
        .center([mapSettings[currentWeek].lng,mapSettings[currentWeek].lat])
        .scale(mapSettings[currentWeek].scale);

    var path = d3.geo.path()
        .projection(projection);

    d3.selectAll('.country').transition()
            .attr('d', path);
            
    d3.selectAll('.blockade').transition()
            .attr('d', path);
    
    d3.selectAll('.maplabel').transition()
        .attr("x", function(d,i){
                     return path.centroid(d)[0]-20;})
        .attr("y", function(d,i){
                     return path.centroid(d)[1];});
         
    //d3.selectAll(".medical_centres").transition();            
    
    var data = regionDeaths[currentWeek].Deaths;
    data.forEach(function(element){
               d3.select("#"+element.Region.replace(/\s/g, ''))
                        .transition()
                        .attr("opacity",convertDeathsToOpacity(element.Deaths))
                        .attr('d', path); 
            });
            
    var data = blockades[currentWeek].blockades;
    data.forEach(function(element){
               d3.select("#"+element.blockade_id.split(' ').join('_'))
                        .transition()
                        .attr("opacity",convertBlockadesToOpacity(element.enforced))
                        .attr('d', path); 
            });
            
    var data = medical_centres[currentWeek].medical_centres;
    data.forEach(function(element){
               d3.select("#"+element.id.split(' ').join('_'))
                        .transition()
                        .attr("opacity",convertMedicalCentresToOpacity(element.open))
                        .attr('cx',function(d){
                                    var point = projection([ d.geometry.coordinates[0], d.geometry.coordinates[1] ]);
                                    return point[0];
                                })
                        .attr('cy',function(d){
                                    var point = projection([ d.geometry.coordinates[0], d.geometry.coordinates[1] ]);
                                    return point[1];
                                });  
            });             

}

function convertDeathsToOpacity(deaths){
    var opacity = deaths/200*0.7;
    if(opacity>0){opacity=opacity+0.2;}
    return opacity;
}

function convertBlockadesToOpacity(enforce){
    if(enforce=="F"){
        return 0;
    } else {
        return 0.75;
    }
}

function convertMedicalCentresToOpacity(open){
    if(open==1){
        return 0.75;
    } else {
        return 0;
    }
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

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
    
    x.domain(data.map(function(d) {return formatDate(d.Date); }));
    y.domain([0, max]);
    xAxis.tickValues(["31 Mar","14 Apr", "28 Apr", "12 May","26 May","09 Jun","23 Jun","07 Jul","21 Jul","04 Aug","18 Aug","01 Sep","15 Sep","29 Sep","13 Oct"]);
    
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
        .center([124.5,12])
        .scale(1500);

    var svg = d3.select('#map').append("svg")
        .attr("width", width)
        .attr("height", height);

    var path = d3.geo.path()
        .projection(projection);

    var g = svg.append("g");    

    g.selectAll("path")
        .data(regions.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("stroke",'#cccccc')
        .attr("fill",'#ffffff')
        .attr("opacity",1)
        .attr("id",function(d){
            return d.properties.PCODE_REF;
        })
        .attr("class","region");


    var g = svg.append("g");
    
    g.selectAll("path")
        .data(westafrica.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("stroke",'#aaaaaa')
        .attr("fill",'none')
        .attr("class","country");    
    
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
            if(d.properties.Type1=="Transit Centre" || d.properties.Type1=="Holding Centre" ){
                return "green";
            }else{
                return "blue";
            }
                })
        .attr("opacity",0.7);        

    var g = svg.append("g");
    
    g.append("rect")
        .attr("x", 0)
        .attr("y", 220)
        .attr("width", 10)
        .attr("height", 10)
        .attr("fill","#ffffff")
        .attr("stroke","#000000")
        .attr("stroke-width",1);

    g.append("text")
        .attr("x",15)
        .attr("y",228)
        .text("No cases")
        .attr("font-size","10px");    
        
    g.append("rect")
        .attr("x", 0)
        .attr("y", 240)
        .attr("width", 10)
        .attr("height", 10)
        .attr("fill","#ffecb3");

    g.append("text")
        .attr("x",15)
        .attr("y",248)
        .text("1 to 5 cases in the last 4 weeks")
        .attr("font-size","10px");

    g.append("rect")
        .attr("x", 0)
        .attr("y", 260)
        .attr("width", 10)
        .attr("height", 10)
        .attr("fill","#ffd54f");

    g.append("text")
        .attr("x",15)
        .attr("y",268)
        .text("5 to 49 cases in the last 4 weeks")
        .attr("font-size","10px");

    g.append("rect")
        .attr("x", 0)
        .attr("y", 280)
        .attr("width", 10)
        .attr("height", 10)
        .attr("fill","#ffc107");

    g.append("text")
        .attr("x",15)
        .attr("y",288)
        .text("50 to 99 cases in the last 4 weeks")
        .attr("font-size","10px");

    g.append("rect")
        .attr("x", 0)
        .attr("y", 300)
        .attr("width", 10)
        .attr("height", 10)
        .attr("fill","#ffa000");

    g.append("text")
        .attr("x",15)
        .attr("y",308)
        .text("100 to 499 cases in the last 4 weeks")
        .attr("font-size","10px");

    g.append("rect")
        .attr("x", 0)
        .attr("y", 320)
        .attr("width", 10)
        .attr("height", 10)
        .attr("fill","#ff6f00");

    g.append("text")
        .attr("x",15)
        .attr("y",328)
        .text("More than 500 cases in the last 4 weeks")
        .attr("font-size","10px");

    g.append("circle")
        .attr("cx",5)
        .attr("cy",365)
        .attr("r",5)
        .attr("fill","green");

    g.append("text")
        .attr("x",15)
        .attr("y",368)
        .text("Referral Centre")
        .attr("font-size","10px");

    g.append("circle")
        .attr("cx",5)
        .attr("cy",345)
        .attr("r",5)
        .attr("fill","blue");

    g.append("text")
        .attr("x",15)
        .attr("y",348)
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
                      return d.properties.NAME;
                  });

}

function transitionMap(){
    
    
    $('#week').html("<h4>A map of cases in the previous 4 weeks up to the week ending " + mapSettings[currentWeek].Date + "</h4>");
    
    var projection = d3.geo.mercator()
        .center([mapSettings[currentWeek].lng,mapSettings[currentWeek].lat])
        .scale(mapSettings[currentWeek].scale);

    var path = d3.geo.path()
        .projection(projection);

    d3.selectAll('.country')
            .attr('d', path);
            
    d3.selectAll('.blockade')
            .attr('d', path);
    
    d3.selectAll('.maplabel')
        .attr("x", function(d,i){
                     return path.centroid(d)[0]-20;})
        .attr("y", function(d,i){
                     return path.centroid(d)[1];});  
         
    d3.selectAll('.region').attr('d', path);
    
    var data = regionCases[currentWeek].Cases;
    data.forEach(function(element){
            d3.select("#"+element.Region.replace(/\s/g, ''))
                        .attr("fill",convertCasesToColor(element.Cases));
            });
            
    var data = medical_centres[currentWeek].medical_centres;
    data.forEach(function(element){
               d3.select("#"+element.id.split(' ').join('_'))
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

function convertCasesToColor(cases){
    var colors = [
        "#ffffff",
        "#fff8e1",
        "#ffecb3",
        "#ffe082",
        "#ffd54f",
        "#ffca28",
        "#ffc107",
        "#ffb300",
        "#ffa000",
        "#ff8f00",
        "#ff6f00"
    ];
    if(cases==0){
        c=0;
    } else if(cases<5){
        c=2;
    } else if(cases<50){
        c=4;
    } else if(cases<100){
        c=6;
    } else if(cases<500){
        c=8;
    } else {
        c=10;
    };
    return colors[c];
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
    return date.substring(0,2) + " " + month[parseInt((date.substring(3,5))-1)];
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

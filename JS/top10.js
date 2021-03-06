(function () {
    var data;
    /*    var width = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
      var height = Math.max(document.documentElement.clientHeight, window.innerHeight || 0); */

    var width = d3.select('#top10').node().getBoundingClientRect().width;

    var height = d3.select('#top10').node().getBoundingClientRect().height;

    var margin = { top: 50, bottom: 50, left: 110, right: 50 };

    var displayed;
    var svg = d3.select('#top10')
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')




    width = width - margin.left - margin.right;


    height = height - margin.top - margin.bottom;

    // SCALES
    var yScale = d3.scaleBand()
        .range([height, 0]);

    var xScale = d3.scaleLinear().range([0, width]);


    var parseTime = d3.timeParse("%Y");

    var colours = d3.scaleOrdinal().range(['#27647b', '#ca3542', '#aecbc9', '#b49fad', '#57575f']);


    d3.csv('csv/top10_fatality.csv', function (d) {

        d.year = parseTime(d.year);
        d.victims = +d.victims;
        return d;
    }, function (deaths_data) {
        /*  console.log(deaths_data); */


        data = deaths_data;

    



        svg.append("g")
            .attr("class", "y axis")
           // .call(d3.axisLeft(yScale));


         

           

        svg.append("g")
            .attr("class", "x axis")
            .attr(
                "transform",
                "translate(0," + (height) + ")"
            );
          /*   .call(d3.axisBottom(xScale)
            .ticks(8)); */


            
 svg.append("g")
 .attr("class","grid")
 .attr("transform","translate(0," + height + ")")
 .style("stroke-dasharray",("3,3"));


        // axis labels

        svg.append("text")
            .attr("transform",
                "translate(" + (width / 2) + " ," +
                (height + margin.bottom) + ")")
            .style("text-anchor", "middle")
            .attr('class', 'x axisLabel')
            .text("Victims");


        /*   svg.append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", 0 - margin.left)
          .attr("x",0 - (height / 2))
          .attr("dy", "1em")
          .style("text-anchor", "middle")
          .attr('class', 'y axisLabel')
          .text("Groups");
       */


      barChart(deaths_data);


        // legend
        createLegend(d3.select('#top10 svg'), data)


    })



    var barChart = function (data) {

        data.sort(function (a, b) {
            return d3.ascending(a.victims, b.victims);
        })


        // nested to create one bar per event without grouping them
        var nest = d3.nest()
            .key(function (d) { return d.location_name })
            .entries(data);

        /* console.log(nest) */

        yScale.domain(data.map(function (d) {
            return d.location_name + ' ' + d.year.getFullYear()
        })).padding(.1)

        xScale.domain([0, d3.max(data, function (d) {
            return d.victims
        })]);


        
        svg.select('.x.axis')
        .transition()
        .call(d3.axisBottom(xScale)
        .ticks(8));

        svg.select('.y.axis')
        .call(d3.axisLeft(yScale));

        
        svg.select('g.grid')
            .transition()
        .call(d3.axisBottom(xScale)
        .ticks(8)
          .tickSize(-height)
          .tickFormat("")
        )


        var groups = svg
            .selectAll('.group')
            .data(nest, function (d) {
                return d.key
            })
            .enter()
            .append('g')
            .attr('class', 'group');

// add bars with fill by context of death
        groups
            .selectAll('.bar')
            .data(function (d) {
                return d.values
            })
            .enter()
            .append('rect')
            .attr('class', 'bar')
            .attr('x', 0)
            .attr('y', function (d) {
                return yScale(d.location_name + ' ' + d.year.getFullYear())
            })
            .attr('height', yScale.bandwidth())
            .transition()
            .duration(740)
            .attr('width', function (d) {
                return xScale(d.victims)
            })
            .attr('fill', function (d) {

                return colours(d.context)
            });


    // show div with summary of events
        groups
            .on('click', function (d) {
             
                var bar = d3.select(this);

                // if statements to handle selections and transitions
                if (bar.classed('selected')) {
                    // if the bar is selected, hide it and change the format
                    displayed = false;
                    d3.select('#top10_story').classed('invisible', true);
                    bar.classed('selected', false);
                }
                else {

                    // If another bar is selected, deselect them all, then select the right one and change the text
                    if (displayed) {
                        svg.selectAll('.group').classed('selected', false);
                        bar.classed('selected', true);
                        d3.select('#top10_story h2')
                            .text(d.values[0].story_title)
                        d3.select('#top10_story p')
                            .html(d.values[0].story)

                    } else {

                        // if no bar is selected, change the class to selected bar and show div
                        bar.classed('selected', true);
                        d3.select('#top10_story').classed('invisible', false);
                        d3.select('#top10_story h2')
                            .text(d.values[0].story_title)

                        d3.select('#top10_story p')
                            .html(d.values[0].story)
                        displayed = true;
                    }

                }


            })
    
            // style bar labels
/*         groups
            .selectAll('.barlabel')
            .data(function (d) {
                return d.values
            })
            .enter()
            .append('text')
            .attr('class', 'barlabel')
            .attr('x', 7)

            .attr("y", function (d) { return yScale(d.location_name + ' ' + d.year.getFullYear()) + yScale.bandwidth() / 2 })

            //.style('font-size', .4 * yScale.bandwidth())

            .attr('text-anchor', 'left')
            .text(function (d) { return d.victims }); */





    }



    function createLegend(parent, data) {

        // colour legend with labels
        var square = 15;
        var y = 10;
        var legendWidth = width / 3;
        var legend = parent.insert('g', 'g')
            .attr('class', 'legend');

        var l_group = legend.selectAll('g')
            .data(d3.map(data, function (d) { return d.context; }).keys())
            .enter()
            .append('g')
            .attr("transform", function (d, i) {
                {
                    return "translate(0," + i * 20 + ")"
                }
            })

        l_group
            .append('rect')
            .attr('width', square)
            .attr('height', square)
            .attr('x', 0)
            .attr('y', 0)
            .attr('fill', function (d) {
                return colours(d);
            })

        l_group
            .append('text')
            .attr('x', 20)
            .attr('y', 10)
            .attr('dy', '.25em')
            .style("text-anchor", "start")
            .text(function (d) {
                return d;
            })
    }


})();


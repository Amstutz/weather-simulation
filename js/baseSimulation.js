function BaseSimulation() {

    var targetBox;
    var Hit;
    var noHit;
    var scale;
    var svg;
    var field;
    let g = 9.81;
    let start;

    this.init = function () {
        if($(".simulation-space").children().length > 0){
            initSVG();
            return;
        }

        d3.xml("svg/Burg.svg").then(function (xml) {
            let importedSvg = document.importNode(xml.documentElement, true);
            let simulation = d3.select(".simulation-space");
            simulation.each(function () {
                this.appendChild(importedSvg);
            });
            initSVG();
        })
    };

    let initSVG = function(){
        svg = d3.select(".simulation-space svg");
        start = getRealCoordinates(svg.select("#Flugobjekt").node());
        targetBox = new collisionBox(svg.select("#Burg").node());
        field = d3.select("#Background").node().getBBox();

        Hit = svg.select("#Feedback_passed").style("opacity", 0);
        noHit = svg.select("#Feedback_failed").style("opacity", 0);
        initAxis();
    }

    let initAxis = function(){
        let x_axis_length_pixels = field.width - start.x - 100;
        let x_axis_domain = 110;
        scale = x_axis_length_pixels/x_axis_domain;
        let y_axis_length_pixels = -start.y;
        let y_axis_domain = -y_axis_length_pixels/scale;

        let x = d3.scaleLinear().range([0, x_axis_length_pixels]).domain([0,x_axis_domain]);
        let y = d3.scaleLinear().range([0, y_axis_length_pixels]).domain([0,y_axis_domain]);;

        //x Axis
        svg.append("g")
            .attr("transform", "translate(" + start.cx + "," + start.cy + ")")
            .call(d3.axisBottom(x).ticks(10).tickSize(y_axis_length_pixels)
                .tickFormat(function(d){return d;}))
            .selectAll(".tick:not(:first-of-type) line").attr("stroke", "#aaa").attr("stroke-dasharray", "2,2");
        svg.append("text")
            .attr("transform",
                "translate(" + (start.cx + x_axis_length_pixels/2) + "," + (start.y2+20) + ")")
            .style("text-anchor", "middle")
            .text("Distance (x) in m");

        //y Axis
        svg.append("g")
            .attr("transform", "translate(" + start.cx + "," + start.cy + ")")
            .call(d3.axisLeft(y).ticks(6).tickSize(-x_axis_length_pixels)
                .tickFormat(function(d){return d;}))
            .selectAll(".tick:not(:first-of-type) line").attr("stroke", "#aaa").attr("stroke-dasharray", "2,2")
        svg.append("text")
            .attr("transform",
                "translate(" + (start.cx-30) + "," + (start.cy + y_axis_length_pixels/2) + "), rotate(-90)")
            .style("text-anchor", "middle")
            .text("Distance (z) in m");
    };

    this.ballAnimation = function (ball_shapes, duration) {
        ball_shapes.transition("ballAnimation").duration(duration).ease(d3.easeLinear)
        .attrTween("cx", function (ball) {
            return function (t) {
                let tsec = t * duration / 1000;
                return calculateHorizontalPosition(start.x+ball.r,ball.vx,tsec,scale);
            }
        }).attrTween("cy", function (ball) {
            return function (t) {
                let tsec = t * duration / 1000;
                return calculateVerticalPosition(start.y+ball.r,ball.vy,tsec,scale);
            }
        }).styleTween("opacity", function (ball,i,shape) {
            var self = this;
            return function (t) {
                tsec = t * duration / 1000;
                let x = calculateHorizontalPosition(start.x+ball.r,ball.vx,tsec,scale);
                let y = calculateVerticalPosition(start.y+ball.r,ball.vy,tsec,scale);

                svg.append("circle")
                    .attr("cx", x)
                    .attr("cy", y)
                    .attr("r", 1)
                    .attr("opacity",0.5);

                if(x > field.width+ball.r || y > field.height+ball.r ){
                    noHit.style("opacity", 1);
                    ball_shapes.interrupt("ballAnimation");
                    return "0";
                }
                if (targetBox.intersects(new collisionBox(self))) {
                    Hit.style("opacity", 1);
                    ball_shapes.interrupt("ballAnimation");
                    return "0";
                }

                return "1";
            }
        });
    }

    this.hideFeedback = function(){
        console.log(this);
        Hit.style("opacity", 0);
        noHit.style("opacity", 0);
    }

    this.getSvg = function(){
        return svg;
    }

    this.getStart = function(){
        return start;
    }

}


const width = 600;
const height = 500;
const margin = { top: 20, right: 30, bottom: 30, left: 40 };

d3.csv("visualizer_joojak.csv").then((dataset) => {
    showScatterPlot(dataset);
    d3.select("#changeColorButton").on("click", () => {
        const pointCounts = d3.rollup(
            dataset,
            v => v.length,
            d => +d.user_review,
            d => +d.meta_score
        );

        const maxCount = d3.max(Array.from(pointCounts.values()).flat());
        const colorScale = d3.scaleSequential()
            .domain([1, maxCount])
            .interpolator(d3.interpolateBlues);
        d3.selectAll("circle")
            .attr("fill", d => {
                const count = pointCounts.get(+d.user_review).get(+d.meta_score);
                return colorScale(count);
            })
            .on("mouseover", (event, d) => {
                const count = pointCounts.get(+d.user_review).get(+d.meta_score);
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html(`Occurrences: ${count}`)
                    .style("left", (event.clientX + 10) + "px")
                    .style("top", (event.clientY - 25) + "px");
            })
            .on("mousemove", (event) => {
                tooltip.style("left", (event.clientX + 10) + "px")
                       .style("top", (event.clientY - 25) + "px");
            })
            .on("mouseout", () => {
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });

        // Remove the legend
        d3.selectAll(".legend").remove();
    });
});

function showScatterPlot(data) {
    const svg = d3
        .select("#chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right + 100) // Additional space for legend
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const xScale = d3.scaleLinear()
        .domain([3, d3.max(data, (d) => +d.user_review)])
        .range([0, width]);

    const yScale = d3.scaleLinear()
        .domain([84, d3.max(data, (d) => +d.meta_score)])
        .range([height, 0]);

    const colorScale = d3.scaleOrdinal(d3.schemeCategory10)
        .domain(data.map(d => d.genre));

    const xAxis = d3.axisBottom().scale(xScale);
    const xAxisGroup = svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(xAxis);

    const yAxis = d3.axisLeft().scale(yScale);
    const yAxisGroup = svg.append("g").call(yAxis);

    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    const circles = svg.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", (d) => xScale(+d.user_review))
        .attr("cy", (d) => yScale(+d.meta_score))
        .attr("r", 4)
        .attr("fill", (d) => colorScale(d.genre))
        .on("mouseover", (event, d) => {
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html(`Name: ${d.name}<br/>Platform: ${d.platform}<br/>Release Date: ${d.release_date}<br/>Genre: ${d.genre}<br/>Meta Score: ${d.meta_score}<br/>User Review: ${d.user_review}`)
                .style("left", (event.clientX + 10) + "px")
                .style("top", (event.clientY - 25) + "px");
        })
        .on("mousemove", (event, d) => {
            tooltip.style("left", (event.clientX + 10) + "px")
                   .style("top", (event.clientY - 25) + "px");
        })
        .on("mouseout", () => {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });

    const avgUserReview = d3.mean(data, d => +d.user_review);
    const avgMetaScore = d3.mean(data, d => +d.meta_score);

    svg.append("line")
        .attr("x1", xScale(avgUserReview))
        .attr("x2", xScale(avgUserReview))
        .attr("y1", 0)
        .attr("y2", height)
        .attr("stroke", "grey")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "4");

    svg.append("line")
        .attr("x1", 0)
        .attr("x2", width)
        .attr("y1", yScale(avgMetaScore))
        .attr("y2", yScale(avgMetaScore))
        .attr("stroke", "grey")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "4");

    // Add legend
    const legend = svg.selectAll(".legend")
        .data(colorScale.domain())
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", (d, i) => `translate(0, ${i * 20})`);

    legend.append("rect")
        .attr("x", width + 20)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", colorScale);

    legend.append("text")
        .attr("x", width + 45)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "start")
        .text(d => d);
}
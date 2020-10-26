<template>
  <v-container id="app">
    <v-row class="row">
      <v-col cols="4" class="d-flex align-center justify-center">
        <div class="pa-2">
          <h3 class="pb-2">GDP charts</h3>
        </div>
      </v-col>
    </v-row>
    <v-row class="row align-center justify-center">
      <v-col class="col-lg-5 col-md-5 align-center justify-center" id="chart"></v-col>
      <v-col class="col-lg-5 col-md-5 align-center justify-center" id="chart2"></v-col>
      <v-col class="col-lg-5 col-md-5 align-center justify-center" id="chart3"></v-col>
    </v-row>
  </v-container>
</template>

<script>
import * as d3 from "d3";
// import * as fs from "fs";

export default {
  name: "D3",
  data() {
    return {
      gdp: [
        {country: "USA", value: "1000"},
        {country: "China", value: "500"},
        {country: "Japan", value: "400"},
        {country: "Korea", value: "300"}
      ],
    }
  },
  mounted() {
    // this.generateArcChart();
    // this.generateContourChart();
    this.generateBarChart();
  },
  methods: {
    async generateArcChart() {
      console.log(this.gdp);
      const svg = d3.select('#chart')
          .append('svg')
          .attr('width', 512)
          .attr('height', 512);
      const color = d3.scaleOrdinal(d3.schemeDark2);
      const maxGdp = d3.max(this.gdp, o => o.value);
      const angleScale = d3.scaleLinear()
          .domain([0, maxGdp])
          .range([0, 1.5 * Math.PI]);
      const arc = d3.arc()
          .innerRadius((d, i) => (i + 1) * 25)
          .outerRadius((d, i) => (i + 2) * 25)
          .startAngle(angleScale(0))
          .endAngle(d => angleScale(d.value));
      const g = svg.append('g');
      g.selectAll('path')
          .data(this.gdp)
          .enter()
          .append('path')
          .attr("d", arc)
          .attr("fill", (d, i) => color(i))
          .attr("stroke", "#FFF")
          .on("mouseenter", function() {
            d3.select(this)
                .transition()
                .duration(200)
                .attr("opacity", 0.5);
          })
          .on("mouseout", function() {
            d3.select(this)
                .transition()
                .duration(200)
                .attr("opacity", 1);
          });
      g.selectAll('text')
          .data(this.gdp)
          .enter()
          .append("text")
          .text(d => `${d.country} -  ${d.value} Trillion`)
          .attr("x", -150)
          .attr("dy", -8)
          .attr("y", (d, i) => -(i + 1) * 25);
      g.attr("transform", "translate(200,150)");
    },
    async generateContourChart() {
      let data = Object.assign(
          await d3.tsv("/faithful.tsv",
              ({waiting: x, eruptions: y}) => ({x: +x, y: +y})),
          {x: "Idle (min.)", y: "Erupting (min.)"});
      console.log(data);
      let width = 600;
      let height = 600;
      let margin = ({top: 20, right: 30, bottom: 30, left: 40});
      let x = d3.scaleLinear()
          .domain(d3.extent(data, d => d.x)).nice()
          .rangeRound([margin.left, width - margin.right]);
      let y = d3.scaleLinear()
          .domain(d3.extent(data, d => d.y)).nice()
          .rangeRound([height - margin.bottom, margin.top]);
      let xAxis = g => g.append("g")
          .attr("transform", `translate(0,${height - margin.bottom})`)
          .call(d3.axisBottom(x).tickSizeOuter(0))
          .call(g => g.select(".domain").remove())
          .call(g => g.select(".tick:last-of-type text").clone()
              .attr("y", -3)
              .attr("dy", null)
              .attr("font-weight", "bold")
              .text(data.x));
      let yAxis = g => g.append("g")
          .attr("transform", `translate(${margin.left},0)`)
          .call(d3.axisLeft(y).tickSizeOuter(0))
          .call(g => g.select(".domain").remove())
          .call(g => g.select(".tick:last-of-type text").clone()
              .attr("x", 3)
              .attr("text-anchor", "start")
              .attr("font-weight", "bold")
              .text(data.y));
      let contours = d3.contourDensity()
          .x(d => x(d.x))
          .y(d => y(d.y))
          .size([width, height])
          .bandwidth(30)
          .thresholds(30)(data);
      console.log(contours);

      const svg = d3.select("#chart2").append("svg").attr("viewBox", [0,0,width,height]);
      svg.append("g").call(xAxis);
      svg.append("g").call(yAxis);
      svg.append("g")
          .attr("fill", "none")
          .attr("stroke", "steelblue")
          .attr("stroke-linejoin", "round")
          .selectAll("path")
          .data(contours)
          .enter().append("path")
          .attr("stroke-width", (d, i) => i % 5 ? 0.25 : 1)
          .attr("d", d3.geoPath());

      let tooltip = d3.select("body")
          .append("div")
          .style("class", "align-center")
          .style("position", "absolute")
          .style("z-index", "10")
          .style("visibility", "hidden")
          .style("background", "#699")
          .text("");

      svg.append("g")
          .attr("stroke", "white")
          .selectAll("circle")
          .data(data)
          .enter().append("circle")
          .attr("cx", d => x(d.x))
          .attr("cy", d => y(d.y))
          .attr("r", 2)
      .on("mouseover", function (d) {
        tooltip
            .html("You clicked at point (" + d.x + "," + d.y + "). Visit <a href='/'>details</a>")
            .style("top", (d.y-10)+"px")
            .style("left",(d.x+10)+"px");

        return tooltip.style('visibility', 'visible');
      })
      ;
    },
    async generateBarChart() {
      const margin = 35;
      const width = 800 - 2 * margin;
      const height = 500 - 2 * margin;
      const svg = d3.select('#chart3')
          .append('svg')
          .attr('width', width)
          .attr('height', height);
      const chart = svg.append('g')
          .attr('transform', `translate(${margin}, ${margin})`);
      const yScale = d3.scaleLinear().range([height, 0]).domain([0, 1200]);
      const xScale = d3.scaleBand().range([0, width]).domain(this.gdp.map((d) => d.country));
      let tooltip = d3.select("body")
          .append("div")
          .style("class", "align-center")
          .style("position", "absolute")
          .style("z-index", "10")
          .style("visibility", "hidden")
          .style("background", "#699")
          .text("");
      chart.append('g').call(d3.axisRight(yScale));
      chart.append('g').attr('transform', `translate(100, ${height}-200)`).call(d3.axisBottom(xScale));
      chart.selectAll().data(this.gdp).enter().append('rect')
          .attr('fill', '#66f')
          .attr('x', (d) => xScale(d.country)+50)
          .attr('y', (d) => yScale(d.value))
          .attr('height', (d) => height - yScale(d.value))
          .attr('width', xScale.bandwidth()/2)
          .on('mouseover', function () {
          })
      ;
    }
  }
}
</script>

<style scoped>

</style>
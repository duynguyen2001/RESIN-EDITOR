import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

function CircleChart({ data, circleColor }) {
  const svgRef = useRef();

  useEffect(() => {
    if (data) {
      // Create a new D3 selection for the SVG element
      const svg = d3.select(svgRef.current);

      // Create a new D3 scale for the x-axis
      const xScale = d3.scaleLinear().domain([0, d3.max(data, (d) => d.x)]).range([0, 600]);

      // Create a new D3 scale for the y-axis
      const yScale = d3.scaleLinear().domain([0, d3.max(data, (d) => d.y)]).range([0, 400]);

      // Create a new D3 scale for the circle radius
      const rScale = d3.scaleLinear().domain([0, d3.max(data, (d) => d.r)]).range([5, 50]);

      // Create a new D3 selection for the circles
      const circles = svg.selectAll('circle').data(data);

      // Update the existing circles
      circles
        .attr('cx', (d) => xScale(d.x))
        .attr('cy', (d) => yScale(d.y))
        .attr('r', (d) => rScale(d.r))
        .attr('fill', circleColor);

      // Add new circles
      circles
        .enter()
        .append('circle')
        .attr('cx', (d) => xScale(d.x))
        .attr('cy', (d) => yScale(d.y))
        .attr('r', (d) => rScale(d.r))
        .attr('fill', circleColor);

      // Remove old circles
      circles.exit().remove();
    }
  }, [data, circleColor]);

  return <svg ref={svgRef} width="600" height="400"></svg>;
}

export default CircleChart;

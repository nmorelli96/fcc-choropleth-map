class FetchError extends Error {
  constructor(response) {
    super(`HTTP error ${response.status}`);
    this.response = response;
  }
}
function fetchJSON(...args) {
  return fetch(...args)
    .then(response => {
      if (!response.ok) {
        throw new FetchError(response);
      }
      return response.json();
    });
}
function fetchText(...args) {
  return fetch(...args)
    .then(response => {
      if (!response.ok) {
        throw new FetchError(response);
      }
      return response.text();
    });
}

const urls = ['https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json',
  'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json'];

fetchJSON(urls[0]).then(result => {
  let educationData = result
  fetchJSON(urls[1]).then(result2 => {
    let countiesData = result2

    let topojsonFeatures = topojson.feature(countiesData, countiesData.objects.counties).features

    console.log(countiesData)
    console.log(educationData)
    console.log(topojsonFeatures)


    const w = 950;
    const h = 610;
    const margin = { top: 0, right: 0, bottom: 0, left: 0 };
    const innerWidth = w - margin.left - margin.right;
    const innerHeight = h - margin.top - margin.bottom;

    const legendScale = d3
      .scaleLinear()
      .domain([66, 3])
      .range([270, 61])

    const svg = d3
      .select("#graph")
      .append("svg")
      .attr("width", w)
      .attr("height", h);

    const tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip")
      .attr("id", "tooltip")
      .style("opacity", 0);

    svg
      .append('g')
      .attr('class', 'counties')
      .selectAll('path')
      .data(topojsonFeatures) //associate the paths with the geojson array
      .enter()  //what to do where there is not a path?
      .append('path') //we create a new path
      /*set the data attribute calling the geoPath method, 
      that converts the geojson data into a path that svg can use*/
      .attr('d', d3.geoPath())
      .attr('class', 'county')
      .attr('fill', (countyData) => {
        let id = countyData['id']
        let county = educationData.find((elem) => {
          return elem['fips'] === id
        })
        let percentage = county['bachelorsOrHigher']
        if (percentage <= 12) {
          return '#d5efed'
        } else if (percentage <= 21) {
          return '#b7e4da'
        } else if (percentage <= 30) {
          return '#8fd4c1'
        } else if (percentage <= 39) {
          return '#69c2a3'
        } else if (percentage <= 48) {
          return '#49b17f'
        } else if (percentage <= 57) {
          return '#2f995a'
        } else if (percentage <= 66) {
          return '#157f3c'
        }
      })
      .attr('data-fips', (countyData) => {
        return countyData['id']
      })
      .attr('data-education', (countyData) => {
        let id = countyData['id']
        let county = educationData.find((elem) => {
          return elem['fips'] === id
        })
        let percentage = county['bachelorsOrHigher']
        return percentage;
      })
      .on("mouseover", function (countyData, i) {
        let id = i['id']
        let county = educationData.find((elem) => {
          return elem['fips'] === id
        })
        tooltip
          .html(
            county.area_name + ", " + county.state + " " + county['bachelorsOrHigher'] + "%"
          )
          .attr("data-education", county['bachelorsOrHigher'])
          .style("left", event.pageX - 100 + "px")
          .style("top", event.pageY - 50 + "px");
        tooltip.style("opacity", 0.9);
        tooltip.attr("id", "tooltip");
        var colorChange = d3.select(this);
        colorChange.style("stroke", "grey");
      })
      .on("mouseout", function () {
        var colorChange = d3.select(this);
        colorChange.style("stroke", "none")
        tooltip.style("opacity", 0);
      });

    const legendAxis = d3.axisBottom(legendScale).tickFormat(x => `${x.toFixed(0)}%`).tickValues([3, 12, 21, 30, 39, 48, 57, 66]).tickSize(17)
      ;

    svg
      .append("g")
      .attr('id', 'legend')
      .attr('transform', `translate(611, 44)`);

    svg
      .append("g")
      .attr('id', 'legend-axis')
      .attr('transform', 'translate(550,44)')
      .call(legendAxis);

    svg
      .select('#legend').append('rect').attr('x', 0).attr('y', 0).attr('width', 30)
      .attr('height', 15).style('fill', '#d5efed');

    svg
      .select('#legend').append('rect').attr('x', 30).attr('y', 0).attr('width', 30)
      .attr('height', 15).style('fill', '#b7e4da');

    svg
      .select('#legend').append('rect').attr('x', 60).attr('y', 0).attr('width', 30)
      .attr('height', 15).style('fill', '#8fd4c1');

    svg
      .select('#legend').append('rect').attr('x', 90).attr('y', 0).attr('width', 30)
      .attr('height', 15).style('fill', '#69c2a3');

    svg
      .select('#legend').append('rect').attr('x', 120).attr('y', 0).attr('width', 30)
      .attr('height', 15).style('fill', '#49b17f');

    svg
      .select('#legend').append('rect').attr('x', 150).attr('y', 0).attr('width', 30)
      .attr('height', 15).style('fill', '#2f995a');

    svg
      .select('#legend').append('rect').attr('x', 180).attr('y', 0).attr('width', 30)
      .attr('height', 15).style('fill', '#157f3c');

  })
})

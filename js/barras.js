// Función principal para crear el gráfico
function createBarChartFromCSV(nombreArchivo) {
    d3.csv(nombreArchivo, d3.autoType).then(data => {
      // Extract headers from the first row of data
      const headers = Object.keys(data[0]);

      // Populate dropdowns with headers
      const xAxisSelect = document.getElementById('x-axis');
      const yAxisSelect = document.getElementById('y-axis');

      headers.forEach(header => {
        const optionX = document.createElement('option');
        optionX.value = header;
        optionX.textContent = header.charAt(0).toUpperCase() + header.slice(1); // Capitalize first letter
        xAxisSelect.appendChild(optionX);

        const optionY = document.createElement('option');
        optionY.value = header;
        optionY.textContent = header.charAt(0).toUpperCase() + header.slice(1); // Capitalize first letter
        yAxisSelect.appendChild(optionY);
      });

      // Create initial bar chart
      const svg = d3.select("svg");
      const width = +svg.attr("width");
      const height = +svg.attr("height");
      const margin = { top: 20, right: 20, bottom: 30, left: 40 };

      const x = d3.scaleBand()
        .range([margin.left, width - margin.right])
        .padding(0.1);

      const y = d3.scaleLinear()
        .range([height - margin.bottom, margin.top]);

      const xAxisGroup = svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${height - margin.bottom})`);

      const yAxisGroup = svg.append("g")
        .attr("class", "y-axis")
        .attr("transform", `translate(${margin.left},0)`);

      const updateChart = () => {
        const xAxisColumn = xAxisSelect.value;
        const yAxisColumn = yAxisSelect.value;

        // Check if the selected Y-axis column contains only numeric values
        const isNumeric = (value) => !isNaN(value) && isFinite(value);
        const isYAxisNumeric = data.every(d => isNumeric(d[yAxisColumn]));

        if (!isYAxisNumeric) {
          alert("Please select a numeric column for the Y-axis.");
          return;
        }

        // Update scales
        x.domain(data.map(d => d[xAxisColumn]));
        y.domain([0, d3.max(data, d => d[yAxisColumn])]).nice();

        // Update bars with transitions
        const bars = svg.selectAll(".bar")
          .data(data, d => d[xAxisColumn]); // Key by xAxisColumn value

        // Exit old bars
        bars.exit()
          .transition()
          .duration(750)
          .attr("y", height)
          .attr("height", 0)
          .remove();

        // Update existing bars
        bars.transition()
          .duration(750)
          .attr("x", d => x(d[xAxisColumn]))
          .attr("y", d => y(d[yAxisColumn]))
          .attr("width", x.bandwidth())
          .attr("height", d => height - margin.bottom - y(d[yAxisColumn]));

        // Enter new bars
        bars.enter()
          .append("rect")
          .attr("class", "bar")
          .attr("x", d => x(d[xAxisColumn]))
          .attr("y", height)
          .attr("width", x.bandwidth())
          .attr("height", 0)
          .transition()
          .duration(750)
          .attr("y", d => y(d[yAxisColumn]))
          .attr("height", d => height - margin.bottom - y(d[yAxisColumn]));

        // Update x-axis with transition
        xAxisGroup.transition()
          .duration(750)
          .call(d3.axisBottom(x));

        // Update y-axis with transition
        yAxisGroup.transition()
          .duration(750)
          .call(d3.axisLeft(y));
      };

      // Initial chart rendering
      updateChart();

      // Update chart when dropdown selection changes
      xAxisSelect.addEventListener('change', updateChart);
      yAxisSelect.addEventListener('change', updateChart);
      
    }).catch(error => console.error('Error loading the CSV file:', error));
  }
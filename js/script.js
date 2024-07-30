// script.js

// Cargar datos desde el archivo CSV
d3.csv("Archivo_procesado/filtered_medication_errors_barra_tiempo_xd.csv", d => {
    d.culmen_length_mm = +d.culmen_length_mm;
    d.culmen_depth_mm = +d.culmen_depth_mm;
    d.flipper_length_mm = +d.flipper_length_mm;
    d.body_mass_g = +d.body_mass_g;
    return d;
}).then(data => {
    // Configuración de dimensiones y padding
    const margin = { top: 140, right: 150, bottom: 140, left: 40 };
    const width = 928 - margin.left - margin.right;
    const height = width; // Make it square
    //const height = width;
    const padding = 28;
    const columns = ['patientweight', 'totalamount', 'originalamount', 'originalrate'];
    const size = (width - (columns.length + 1) * padding) / columns.length + padding;

    // Definir las escalas
    const x = columns.map(c => d3.scaleLinear()
        .domain(d3.extent(data, d => d[c]))
        .rangeRound([padding / 2, size - padding / 2]));

    const y = x.map(x => x.copy().range([size - padding / 2, padding / 2]));

    // Definir la escala de color
    const color = d3.scaleOrdinal()
        .domain(d3.map(data, d => d.species).keys())
        .range(d3.schemeCategory10);

    // Definir los ejes
    const axisx = d3.axisBottom()
        .ticks(6)
        .tickSize(size * columns.length);

    const axisy = d3.axisLeft()
        .ticks(6)
        .tickSize(-size * columns.length);

    // Crear el SVG
    const svg = d3.create("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [-padding, 0, width, height]);

    svg.append("style")
        .text(`circle.hidden { fill: #000; fill-opacity: 1; r: 1px; }`);

    // Añadir ejes X y Y
    svg.append("g")
        .call(g => g.selectAll("g")
            .data(x)
            .join("g")
            .attr("transform", (d, i) => `translate(${i * size},0)`)
            .each(function(d) { d3.select(this).call(axisx.scale(d)); })
            .call(g => g.select(".domain").remove())
            .call(g => g.selectAll(".tick line").attr("stroke", "#ddd")));

    svg.append("g")
        .call(g => g.selectAll("g")
            .data(y)
            .join("g")
            .attr("transform", (d, i) => `translate(0,${i * size})`)
            .each(function(d) { d3.select(this).call(axisy.scale(d)); })
            .call(g => g.select(".domain").remove())
            .call(g => g.selectAll(".tick line").attr("stroke", "#ddd")));

    // Añadir celdas y círculos
    const cell = svg.append("g")
        .selectAll("g")
        .data(d3.cross(d3.range(columns.length), d3.range(columns.length)))
        .join("g")
        .attr("transform", ([i, j]) => `translate(${i * size},${j * size})`);

    cell.append("rect")
        .attr("fill", "none")
        .attr("stroke", "#aaa")
        .attr("x", padding / 2 + 0.5)
        .attr("y", padding / 2 + 0.5)
        .attr("width", size - padding)
        .attr("height", size - padding);

    cell.each(function([i, j]) {
        d3.select(this).selectAll("circle")
            .data(data.filter(d => !isNaN(d[columns[i]]) && !isNaN(d[columns[j]])))
            .join("circle")
            .attr("cx", d => x[i](d[columns[i]]))
            .attr("cy", d => y[j](d[columns[j]]));
    });

    cell.selectAll("circle")
        .attr("r", 3.5)
        .attr("fill-opacity", 0.7)
        .attr("fill", d => color(d.species));

    // Añadir etiquetas a los ejes
    svg.append("g")
        .style("font", "bold 12px sans-serif")
        .style("pointer-events", "none")
        .selectAll("text")
        .data(columns)
        .join("text")
        .attr("transform", (d, i) => `translate(${i * size},${i * size})`)
        .attr("x", padding)
        .attr("y", padding)
        .attr("dy", ".71em")
        .text(d => d);

    // Añadir la funcionalidad de brushing
    function brush(cell, circle, svg, {padding, size, x, y, columns}) {
        const brush = d3.brush()
            .extent([[padding / 2, padding / 2], [size - padding / 2, size - padding / 2]])
            .on("start", brushstarted)
            .on("brush", brushed)
            .on("end", brushended);

        cell.call(brush);

        let brushCell;

        // Clear the previously-active brush, if any.
        function brushstarted() {
            if (brushCell !== this) {
                d3.select(brushCell).call(brush.move, null);
                brushCell = this;
            }
        }

        // Highlight the selected circles.
        function brushed({selection}, [i, j]) {
            let selected = [];
            if (selection) {
                const [[x0, y0], [x1, y1]] = selection; 
                circle.classed("hidden",
                    d => x0 > x[i](d[columns[i]])
                    || x1 < x[i](d[columns[i]])
                    || y0 > y[j](d[columns[j]])
                    || y1 < y[j](d[columns[j]]));
                selected = data.filter(
                    d => x0 < x[i](d[columns[i]])
                    && x1 > x[i](d[columns[i]])
                    && y0 < y[j](d[columns[j]])
                    && y1 > y[j](d[columns[j]]));
            }
            svg.property("value", selected).dispatch("input");
        }

        // If the brush is empty, select all circles.
        function brushended({selection}) {
            if (selection) return;
            svg.property("value", []).dispatch("input");
            circle.classed("hidden", false);
        }
    }

    // Llamar a la función brush para añadir la funcionalidad de brushing
    cell.call(brush, cell.selectAll("circle"), svg, {padding, size, x, y, columns});

    // Añadir el SVG al cuerpo del documento
    document.body.appendChild(svg.node());
});

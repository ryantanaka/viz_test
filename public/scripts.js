$(function() {


    $('#send-params').on('submit', function(event) {
        event.preventDefault();

        var num_compute_hosts_input = $('#num-compute-hosts-input');
        var simulation_output = $('#simulation-output');
        var chart = $('#chart').empty();
        simulation_output.empty();

        $.ajax({
            url: '/run',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({num_compute_hosts: num_compute_hosts_input.val()}),
            success: function(response) {
                console.log(response); // our response is a plain string but it has the html
                num_compute_hosts_input.val('');
                simulation_output.append(response.simulation_output);

                parse_data(response.task_data);
                console.log(response.task_data);
                generate_graph(response.task_data);
            }
        });
    });
});

function parse_data(data) {
    var keys = ['read', 'compute', 'write', 'whole_task'];

    data.forEach(function(task, i) {
        task.start = task['whole_task'].start;
        keys.forEach(function(k) {
            task[k] = task[k].end - task[k].start;
        });
    });
}

function generate_graph(data) {
    // Chart params
    var chart_height = 400;
    var chart_width  = 600;
    var svg_height   = 500;
    var padding      = 60;

    var read_color    = '#cbb5dd';
    var compute_color = '#f7daad';
    var write_color   = '#abdcf4';
    var colors        = [read_color, compute_color, write_color];

// Create the svg element
    var svg = d3.select('#chart')
        .append('svg')
        .attr('width', chart_width)
        .attr('height', svg_height);

// Create scales
    var x_scale = d3.scaleLinear()
        .domain([0, d3.max(data, function (d) {
            return d['read'] + d['compute'] + d['write'] + d['start'];
        })])
        .range([padding, chart_width - padding]);

    var task_ids = [];
    data.forEach(function(task) {
        task_ids.push(task['task_id']);
    });

    var y_scale = d3.scaleBand()
        .domain(task_ids)
        .range([chart_height - padding, padding])
        .padding(0.1);

// Stack layout
    var stack = d3.stack().keys([
        'read', 'compute', 'write'
    ]);

    var stack_data = stack(data);

// Groups
    var groups = svg.selectAll('g')
        .data(stack_data)
        .enter()
        .append('g')
        .style('fill', function(d, i) {
            return colors[i];
        });

// Add the data
    groups.selectAll('rect')
        .data(function(d) {
            return d;
        })
        .enter()
        .append('rect')
        .attr('x', function(d) {
            return x_scale(d[0] + d['data'].start);
        })
        .attr('y', function(d) {
            return y_scale(d['data'].task_id);
        })
        .attr('height', function(d) {
            return y_scale.bandwidth();
        })
        .attr('width', function(d) {
            return x_scale(d[1]) - x_scale(d[0]);
        });

// Create axis
    var x_axis = d3.axisBottom(x_scale);
    svg.append('g')
        .attr('class', 'x-axis')
        .attr('transform',
            'translate(0,' + (chart_height - padding) + ')')
        .call(x_axis);

    var y_axis = d3.axisLeft(y_scale);
    svg.append('g')
        .attr('class', 'y-axis')
        .attr('transform',
            'translate(' + padding + ',0)')
        .call(y_axis);
}

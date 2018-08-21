var express = require("express"),
    app = express(),
    bodyParser = require("body-parser"),
    methodOverride = require("method-override"),
    au = require('ansi_up'),
    {exec} = require("child_process"),
    fs = require('fs');

var current_run = 0;

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(methodOverride("_method"));


var ansi_up = new au.default;

app.get("/", function(req, res) {
    res.render("index");
});

app.post("/run", function(req, res) {
    var path_prefix = '/home/wrench/wrench-pedagogic-modules/' +
        'activity_1_getting_started/';

    var wrench = path_prefix + 'activity_simulator' + res.simulator_number;
    var platform_file = path_prefix + 'platform_files/platform.xml';
    var workflow_file = path_prefix + 'workflow_files/workflow.dax';
    //var num_compute_hosts = 1;
    var logging = [
        '--log=root.thresh:critical',
        '--log=wms.thresh:debug',
        '--log=simple_wms.thresh:debug',
        '--log=simple_wms_scheduler.thresh:debug'
    ];

    var cmd = [
        wrench,
        platform_file,
        workflow_file,
        logging.join(' '),
    ].join(' ');

    //const child = spawn(wrench, wrench_args);

    //child.stdout.on('data', function(data) {
    //    console.log('child stdout:\n' + data);
    //});

    //child.stderr.on('data', function(data) {
    //   console.error('child stderr:\n' + data);
    //   res.send(data);
    //});

    console.log("num compute hosts: " + num_compute_hosts);
    console.log("Executing cmd: " + cmd);

    exec(cmd, function(err, stdout, stderr) {
        if (err) {
            console.error('We encountered a problem');
            return;
        }

        console.log(stderr);
        //res.send(stderr);

        var find = '</span>';
        var re = new RegExp(find, 'g');

        //res.send(ansi_up.ansi_to_html(stderr).replace(re, '<br>' + find));
        res.json({
            "simulation_output": ansi_up.ansi_to_html(stderr).replace(re, '<br>' + find),
            "simulator_number": res.simulator_number,
            "task_data": JSON.parse(fs.readFileSync("/home/wrench/workflow_data.json"))
        });
    });

    //res.redirect("/");
});

app.listen(3000, function() {
    console.log("Server is running!");
});

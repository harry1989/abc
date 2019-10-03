const puppeteer = require('puppeteer');
const puppeteerExecPath = puppeteer.executablePath(); 
const { extractMetricsFromPerformanceAndTiming } = require('./helpers');
const ArgumentParser = require('argparse').ArgumentParser;
const {min, max, median, mean}  = require('simple-statistics'); 
const cTable = require('console.table');

// global variables
const no_trials = 1;
const DEFAULT_METRICS = 'dns,connect,ttfb,domInteractive,pageLoadTime'


const run_simulation = async function (args) {
    let simulation_results = [];
    let trail_count = 1;
   
    process.stdout.write('Benchmarking, please wait:');
    const pupeteer_opts = args['pupeteer'];
    while (trail_count <= args.trials){
        //console.log(`Testing ${args.url}`);
      const browser = await puppeteer.launch({
            executablePath: puppeteerExecPath,
            args: pupeteer_opts.split(','),
            ignoreHTTPSErrors: true
      });
      const page = await browser.newPage();
        const client = await page.target().createCDPSession();
        await client.send('Performance.enable');
        await page.goto(args.url);
        const timingmetrics = JSON.parse(
            await page.evaluate(() => JSON.stringify(window.performance.timing))
        );

        //await page.waitFor(1000);
        const performanceMetrics = await client.send('Performance.getMetrics');
        //console.log(performanceMetrics);
        //console.log(timingmetrics);
        process.stdout.write('.');
        let metrics = extractMetricsFromPerformanceAndTiming(performanceMetrics,
                timingmetrics,
                args.metrics);

        //console.log(`Trail ${trail_count}/${args.trials}: complete`);
        simulation_results.push(metrics);
        trail_count += 1;
        await browser.close();
     }
    
     console.log(' Completed');
     return simulation_results
};

const printStats = (run_stats) => {
    var to_measure = ['min', 'mean', 'median', 'max']

    var statsToPrint = {}
    //console.log(run_stats);
    run_stats.forEach(a => {
        Object.keys(a).forEach(b => {
            if (!statsToPrint.hasOwnProperty(b)){
                statsToPrint[b] = [];
            }
            statsToPrint[b].push(a[b]);
        });
    });

    var stats_table = [];
    Object.keys(statsToPrint).forEach(a => {
        stats_table.push({
            metric: a,
            min: min(statsToPrint[a]),
            max: max(statsToPrint[a]),
            mean: mean(statsToPrint[a]),
            median: median(statsToPrint[a])
            //'50%': stats.percentile(statsToPrint[a], 50),
            //'90%': stats.percentile(statsToPrint[a], 90),
            //'95%': stats.percentile(statsToPrint[a], 95)
        })
    });

    console.table(stats_table);
};

const printArgDetails = (args) => {
    console.log('Benchmark results..:');
    console.log('URL: ', args.url);
    console.log('# of trials:', args.trials);
    console.log('Stats: \n');
}

const getArguments = () => {

    const parser = new ArgumentParser({
        addHelp: true,
        description: 'Measure performance metrics of an application'
    });
    parser.addArgument(['--url'], { help: 'Url to parse', 'required': true});
    parser.addArgument(['--trials', '-n'], { help: 'Number of trails', type: 'int', defaultValue : no_trials});
    parser.addArgument(['--metrics'], { help: 'Metrics to measure', defaultValue : DEFAULT_METRICS});
    parser.addArgument(['--pupeteer'], {help: 'Pupetter configuration', defaultValue: '--disable-setuid-sandbox,--no-sandbox'});
    return parser.parseArgs();
};

const main = async function() {
    var args = getArguments();
    console.log();
    const stats = await run_simulation(args);
    printArgDetails(args);
    printStats(stats);
}

main();

//run_simulation();


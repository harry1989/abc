const Parser = require('expr-eval').Parser;

// global variables
const mapping = {
        'pageLoadTime' : 'loadEventStart - navigationStart',
    'domainLookupTime' : 'domainLookupEnd - domainLookupStart',
'serverConnectionTime' : 'connectEnd - connectStart',
  'serverResponseTime' : 'responseStart - requestStart',
    'pageDownloadTime' : 'responseEnd - responseStart',
     'redirectionTime' : 'fetchStart - navigationStart',
  'domInteractiveTime' : 'domInteractive - navigationStart',
'domContentLoadedTime' : 'domContentLoadedEventStart - navigationStart',
    'dns': 'domainLookupEnd - domainLookupStart',
'connect': 'connectEnd - navigationStart',
'ttfb': 'responseStart - navigationStart',
'basePage': 'responseEnd - responseStart',
'frontEnd': 'loadEventStart - responseEnd',
'preRequest': 'connectEnd - navigationStart',
'serverTime': 'responseEnd - navigationStart',
'clientTime': 'loadEventEnd - responseEnd'
}


const getTimeFromPerformanceMetrics = (metrics, name) =>
  metrics.find(x => x.name === name).value * 1000;

// To extract the infomration from Navigation Timing API.
const extractDataFromPerformanceTiming = (timing, ...dataNames) => {
  const navigationStart = timing.navigationStart;

  const extractedData = {};
  dataNames.forEach(name => {
    extractedData[name] = timing[name] - navigationStart;
  });

  return extractedData;
}

// To extract data from Performance object
const extractDataFromPerformanceMetrics = (metrics, ...dataNames) => {
  debugger;  
  const navigationStart = getTimeFromPerformanceMetrics(
    metrics,
    'NavigationStart'
  );

  const extractedData = {};
  dataNames.forEach(name => {
    extractedData[name] =
      getTimeFromPerformanceMetrics(metrics, name) - navigationStart;
  });

  return extractedData;
};


// to Exact the information from both performance and timing as well as customer
// metrics
const extractMetricsFromPerformanceAndTiming = (perfMetrics, timingMetrics, metricsParams) => {

    //Check if the metric is in Perf
   return metricsParams.split(',').map(metric => {
         
        if (perfMetrics.metrics.find(x => x.name == metric)) {
            return extractDataFromPerformanceMetrics(perfMetrics.metrics, metric);
        }
        else if (timingMetrics.hasOwnProperty(metric)) {
            return extractDataFromPerformanceTiming(timingMetrics, metric);
        }
        else if (mapping.hasOwnProperty(metric)) {
            var parser = new Parser();
            var expr = parser.parse(mapping[metric]);
            var entry = {};
            entry[metric] = expr.evaluate(timingMetrics);
            return entry;
        }
        else {
            console.error(`Metric ${metric} is not a valid metric`);
            return null;
        }
    }).reduce((m, n) => n = Object.assign(m, n), {})
}

module.exports = {
  extractMetricsFromPerformanceAndTiming,
};

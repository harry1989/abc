Apache Benchmark Client:
------------------------
This is a Apache Benchmark like utility to measure the metrics of a page on a browser.

Metrics supported:
------------------
* TTFB (Time to First byte)
* DOM Interactive 
* Page load time
* serverTime
* clientTime
* dns (Time taken to resolve DNS)


Usage:
------

Install the binaries
`npm install -g abc`

Look at help guide for all options
`abc -h`

Sample invocation
`abc --url 'https://google.com' --metrics dns,ttfb,domInteractiveTime,pageLoadTime`
```
Benchmark results..:
URL:  https://google.com
# of trials: 1
Stats:

metric              min   max   mean  median
------------------  ----  ----  ----  ------
dns                 0     0     0     0
ttfb                990   990   990   990
domInteractiveTime  1146  1146  1146  1146
pageLoadTime        1910  1910  1910  1910
```

Dependencies:
-------------
* Pupeteer
* Node 8+


How does it work?
------------------
- ABC internally invokes the pupeteer in the headless mode.
- Capture the metrics using the navigation API
- Calculates the required metrics based on calculation.
- Averages over several samples and prints the stat.


Why should I use this over X?
-----------------------------
This is a simple utility over existing tools and just provides the convenience, instead of
adding new capabilities. 

Some tools which provides same functionality:
* Pupeteer (which we internally use)
* LightHouse (Google's tool for reporting all stats)

Advantages:
* Appealing to Backend developers who are used to Apache BenchMark
* Easier to invoke through and configure
* Metrics can be calculated over several tries instead of just one like in lighthouse. 

;(function(w,d) {

  const messagesEl = d.getElementById('adminContent_messages');

  /*
   *  @dataSet TYPE: String VAL: employee, location, or reviews.
   *  This will be passed to the node server to form the sql query determining what data is gathered and how it is formatted
  */
  function getData(dataSet) {

    const req = new XMLHttpRequest(),
          type = {type: dataSet};

    req.open('POST', '/nn-admin/stats', true);
    req.setRequestHeader('Content-Type', 'application/json');
    req.send(JSON.stringify(type));

    req.onloadstart = function() {
      messagesEl.innerText = "Getting Data, this can take some time if there is allot of it. We will try to keep you updated.";
    }

    req.onprogress = function(e) {
      messagesEl.innerText = "Loading Data... " + e.loaded + " of " + e.total;
    }

    req.onload = function () {
      messagesEl.innerText = "";
      if (req.status === 200) {

        const chartData = JSON.parse(this.responseText);
        if (dataSet === 'employee') {
          initEmployeeCharts(chartData);
        } else if (dataSet === 'location') {
          initLocationCharts(chartData);
        } else {
          initReviewCharts(chartData);
        }

      } else {
        console.log("something happened. I dont even know what. " + this.status);
      }
    }
    req.onerror = function (e) {
      console.log("there was an error when fetching the chart data : " + req.statusText);
    }
  }

  function initEmployeeCharts(chartData) {

    const eCanvas = d.getElementById('employeeChart');
    const employees = chartData.reduce( (list, current) => {

      let location = list.findIndex( det => det.name === current.UserName);

      if ( location === -1 ) {
        let employee = {
          name : current.UserName,
          total : current.EventTotal
        };
        list.push(employee);
      } else {
        list[location].total += current.EventTotal;
      }
      return list;
    }, []);

    const labels = employees.map( employee => {
      return employee.name;
    });

    const values = employees.map( employee => {
      return employee.total;
    });

    const colors = employees.map( employee => {
      return createRandomHex();
    })

    let employeeChart = new Chart( eCanvas , {
      type: 'horizontalBar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Total Events',
          data: values,
          backgroundColor: colors
        }]
      },
      options: {
        scales: {
          xAxes: [{
            ticks: {
              beginAtZero: true
            }
          }]
        },
        responsiveAnimationDuration: 500,
        maintainAspectRatio: false
      }
    });

  }

  function initLocationCharts(chartData) {

  }

  function initReviewCharts(chartData) {

  }

  function createRandomHex() {
    return '#'+Math.floor(Math.random()*16777215).toString(16);
  }

  w.onload = function() {
    getData('employee');
  }

})(window, document);

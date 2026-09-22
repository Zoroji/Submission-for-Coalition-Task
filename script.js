var bpChart = null;

window.onload = function () {
  var req = new XMLHttpRequest();
  req.open('GET', 'https://fedskillstest.coalitiontechnologies.workers.dev', true);
  req.setRequestHeader('Authorization', 'Basic ' + btoa('coalition:skills-test'));

  req.onload = function () {
    if (req.status >= 200 && req.status < 300) {
      var list = JSON.parse(req.responseText);

      var navEl = document.getElementById('patients-list');
      if (navEl) {
        var str = '';
        for (var i = 0; i < list.length; i++) {
          var item = list[i];
          var cls = item.name === 'Jessica Taylor' ? 'patient-item active' : 'patient-item';
          str + = '<li class = "' + cls + '">';
          str + = '<div class = "patient-main-info">';
          str + = '<img src = "' + item.profile_picture + '" alt = "' + item.name + '" class = "patient-avatar" onerror = "this.src = \'assets/jessica-taylor.png\'">';
          str + = '<div class = "patient-text">';
          str + = '<span class = "patient-name">' + item.name + '</span>';
          str + = '<span class = "patient-sub">' + item.gender + ', ' + item.age + '</span>';
          str + = '</div></div>';
          str + = '<button class = "icon-btn" aria-label = "Options"><img src = "assets/more-horiz.svg" alt = "More"></button>';
          str + = '</li>';
        }
        navEl.innerHTML = str;
      }

      var patient = null;
      for (var idx = 0; idx < list.length; idx++) {
        if (list[idx].name === 'Jessica Taylor') {
          patient = list[idx];
          break;
        }
      }

      if (patient) {
        setVal('profile-avatar', patient.profile_picture || 'assets/jessica-taylor.png', 'src');
        setVal('profile-name', patient.name);
        setVal('profile-gender', patient.gender);
        setVal('profile-phone', patient.phone_number);
        setVal('profile-emergency', patient.emergency_contact);
        setVal('profile-insurance', patient.insurance_type);

        if (patient.date_of_birth) {
          var dt = new Date(patient.date_of_birth);
          var formatted = dt.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
          setVal('profile-dob', formatted);
        }

        var diagHist = patient.diagnosis_history || [];
        if (diagHist.length > 0) {
          var rec = diagHist.slice(0, 6).reverse();
          var monthLabels = [];
          var sysArr = [];
          var diaArr = [];

          for (var m = 0; m < rec.length; m++) {
            var curr = rec[m];
            monthLabels.push(curr.month.substring(0, 3) + ', ' + curr.year);
            sysArr.push(curr.blood_pressure.systolic.value);
            diaArr.push(curr.blood_pressure.diastolic.value);
          }

          var cvs = document.getElementById('bpChart');
          if (cvs) {
            if (bpChart) {
              bpChart.destroy();
            }
            bpChart = new Chart(cvs.getContext('2d'), {
              type: 'line',
              data: {
                labels: monthLabels,
                datasets: [
                  {
                    label: 'Systolic',
                    data: sysArr,
                    borderColor: '#E66FD2',
                    backgroundColor: '#E66FD2',
                    pointBackgroundColor: '#E66FD2',
                    pointBorderColor: '#FFF',
                    pointBorderWidth: 2,
                    pointRadius: 6,
                    tension: 0.4
                  },
                  {
                    label: 'Diastolic',
                    data: diaArr,
                    borderColor: '#8C6FE6',
                    backgroundColor: '#8C6FE6',
                    pointBackgroundColor: '#8C6FE6',
                    pointBorderColor: '#FFF',
                    pointBorderWidth: 2,
                    pointRadius: 6,
                    tension: 0.4
                  }
                ]
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  x: { grid: { display: false }, ticks: { font: { family: 'Manrope', size: 12 }, color: '#072635' } },
                  y: { min: 60, max: 180, grid: { color: '#CBC8D4' }, ticks: { stepSize: 20, font: { family: 'Manrope', size: 12 }, color: '#072635' } }
                }
              }
            });
          }

          var latestRecord = diagHist[0];
          if (latestRecord.blood_pressure) {
            setVal('systolic-val', latestRecord.blood_pressure.systolic.value);
            setVal('systolic-status', latestRecord.blood_pressure.systolic.levels);
            setVal('diastolic-val', latestRecord.blood_pressure.diastolic.value);
            setVal('diastolic-status', latestRecord.blood_pressure.diastolic.levels);
          }

          if (latestRecord.respiratory_rate) {
            setVal('resp-val', latestRecord.respiratory_rate.value + ' bpm');
            setVal('resp-status', latestRecord.respiratory_rate.levels);
          }

          if (latestRecord.temperature) {
            setVal('value-val', latestRecord.temperature.value + '°F');
            setVal('value-status', latestRecord.temperature.levels);
          }

          if (latestRecord.heart_rate) {
            setVal('heart-val', latestRecord.heart_rate.value + ' bpm');
            setVal('heart-status', latestRecord.heart_rate.levels);
          }
        }

        var tableList = patient.diagnostic_list || [];
        var tbodyEl = document.getElementById('diagnostic-tbody');
        if (tbodyEl) {
          var tHtml = '';
          for (var x = 0; x < tableList.length; x++) {
            var row = tableList[x];
            tHtml + = '<tr><td>' + row.name + '</td><td>' + row.description + '</td><td>' + row.status + '</td></tr>';
          }
          tbodyEl.innerHTML = tHtml;
        }

        var labResultsArr = patient.lab_results || [];
        var labsContainer = document.getElementById('lab-results-list');
        if (labsContainer) {
          var lHtml = '';
          for (var y = 0; y < labResultsArr.length; y++) {
            var activeClass = y === 1 ? 'lab-item active' : 'lab-item';
            lHtml + = '<li class = "' + activeClass + '"><span>' + labResultsArr[y] + '</span><button class = "icon-btn" aria-label = "Download"><img src = "assets/download.svg" alt = "Download"></button></li>';
          }
          labsContainer.innerHTML = lHtml;
        }
      }
    }
  };

  req.onerror = function () {
    console.log('XHR Connection Error');
  };

  req.send();
};

function setVal(id, text, prop) {
  var node = document.getElementById(id);
  if (!node) return;
  if (prop === 'src') {
    node.src = text;
  } else {
    node.textContent = text;
  }
}

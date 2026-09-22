var chartObj = null;

window.onload = function() {
  var request = new XMLHttpRequest();
  request.open('GET', 'https://fedskillstest.coalitiontechnologies.workers.dev', true);
  request.setRequestHeader('Authorization', 'Basic ' + btoa('coalition:skills-test'));

  request.onload = function() {
    if (request.status >= 200 && request.status < 300) {
      var allPatients = JSON.parse(request.responseText);

      var patientListContainer = document.getElementById('patients-list');
      if (patientListContainer) {
        var sidebarContent = '';
        for (var i = 0; i < allPatients.length; i++) {
          var currentPatient = allPatients[i];
          var activeClass = currentPatient.name === 'Jessica Taylor' ? 'patient-item active' : 'patient-item';
          sidebarContent += '<li class="' + activeClass + '">';
          sidebarContent += '<div class="patient-main-info">';
          sidebarContent += '<img src="' + currentPatient.profile_picture + '" alt="' + currentPatient.name + '" class="patient-avatar" onerror="this.src=\'assets/jessica-taylor.png\'">';
          sidebarContent += '<div class="patient-text">';
          sidebarContent += '<span class="patient-name">' + currentPatient.name + '</span>';
          sidebarContent += '<span class="patient-sub">' + currentPatient.gender + ', ' + currentPatient.age + '</span>';
          sidebarContent += '</div></div>';
          sidebarContent += '<button class="icon-btn" aria-label="Options"><img src="assets/more-horiz.svg" alt="More"></button>';
          sidebarContent += '</li>';
        }
        patientListContainer.innerHTML = sidebarContent;
      }

      var jessicaData = null;
      for (var j = 0; j < allPatients.length; j++) {
        if (allPatients[j].name === 'Jessica Taylor') {
          jessicaData = allPatients[j];
          break;
        }
      }

      if (jessicaData) {
        var avatarElem = document.getElementById('profile-avatar');
        if (avatarElem) avatarElem.src = jessicaData.profile_picture || 'assets/jessica-taylor.png';

        var nameElem = document.getElementById('profile-name');
        if (nameElem) nameElem.textContent = jessicaData.name;

        var dobElem = document.getElementById('profile-dob');
        if (dobElem && jessicaData.date_of_birth) {
          var dobDate = new Date(jessicaData.date_of_birth);
          dobElem.textContent = dobDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        }

        var genderElem = document.getElementById('profile-gender');
        if (genderElem) genderElem.textContent = jessicaData.gender;

        var phoneElem = document.getElementById('profile-phone');
        if (phoneElem) phoneElem.textContent = jessicaData.phone_number;

        var emergencyElem = document.getElementById('profile-emergency');
        if (emergencyElem) emergencyElem.textContent = jessicaData.emergency_contact;

        var insuranceElem = document.getElementById('profile-insurance');
        if (insuranceElem) insuranceElem.textContent = jessicaData.insurance_type;

        var historyList = jessicaData.diagnosis_history || [];
        if (historyList.length > 0) {
          var lastSixMonths = historyList.slice(0, 6).reverse();
          var monthLabels = [];
          var systolicValues = [];
          var diastolicValues = [];

          for (var k = 0; k < lastSixMonths.length; k++) {
            var historyItem = lastSixMonths[k];
            monthLabels.push(historyItem.month.substring(0, 3) + ', ' + historyItem.year);
            systolicValues.push(historyItem.blood_pressure.systolic.value);
            diastolicValues.push(historyItem.blood_pressure.diastolic.value);
          }

          var chartCanvas = document.getElementById('bpChart');
          if (chartCanvas) {
            if (chartObj) {
              chartObj.destroy();
            }
            chartObj = new Chart(chartCanvas.getContext('2d'), {
              type: 'line',
              data: {
                labels: monthLabels,
                datasets: [
                  {
                    label: 'Systolic',
                    data: systolicValues,
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
                    data: diastolicValues,
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

          var latestRecord = historyList[0];
          if (latestRecord.blood_pressure) {
            var sysVal = document.getElementById('systolic-val');
            if (sysVal) sysVal.textContent = latestRecord.blood_pressure.systolic.value;

            var sysStat = document.getElementById('systolic-status');
            if (sysStat) sysStat.textContent = latestRecord.blood_pressure.systolic.levels;

            var diaVal = document.getElementById('diastolic-val');
            if (diaVal) diaVal.textContent = latestRecord.blood_pressure.diastolic.value;

            var diaStat = document.getElementById('diastolic-status');
            if (diaStat) diaStat.textContent = latestRecord.blood_pressure.diastolic.levels;
          }

          if (latestRecord.respiratory_rate) {
            var respVal = document.getElementById('resp-val');
            if (respVal) respVal.textContent = latestRecord.respiratory_rate.value + ' bpm';

            var respStat = document.getElementById('resp-status');
            if (respStat) respStat.textContent = latestRecord.respiratory_rate.levels;
          }

          if (latestRecord.temperature) {
            var tempVal = document.getElementById('temp-val');
            if (tempVal) tempVal.textContent = latestRecord.temperature.value + '°F';

            var tempStat = document.getElementById('temp-status');
            if (tempStat) tempStat.textContent = latestRecord.temperature.levels;
          }

          if (latestRecord.heart_rate) {
            var heartVal = document.getElementById('heart-val');
            if (heartVal) heartVal.textContent = latestRecord.heart_rate.value + ' bpm';

            var heartStat = document.getElementById('heart-status');
            if (heartStat) heartStat.textContent = latestRecord.heart_rate.levels;
          }
        }

        var diagnosisTable = jessicaData.diagnostic_list || [];
        var tbodyElem = document.getElementById('diagnostic-tbody');
        if (tbodyElem) {
          var tableRowsHTML = '';
          for (var m = 0; m < diagnosisTable.length; m++) {
            var diagItem = diagnosisTable[m];
            tableRowsHTML += '<tr><td>' + diagItem.name + '</td><td>' + diagItem.description + '</td><td>' + diagItem.status + '</td></tr>';
          }
          tbodyElem.innerHTML = tableRowsHTML;
        }

        var labResultsList = jessicaData.lab_results || [];
        var labContainerElem = document.getElementById('lab-results-list');
        if (labContainerElem) {
          var labItemsHTML = '';
          for (var n = 0; n < labResultsList.length; n++) {
            var labClass = n === 1 ? 'lab-item active' : 'lab-item';
            labItemsHTML += '<li class="' + labClass + '"><span>' + labResultsList[n] + '</span><button class="icon-btn" aria-label="Download"><img src="assets/download.svg" alt="Download"></button></li>';
          }
          labContainerElem.innerHTML = labItemsHTML;
        }
      }
    }
  };

  request.onerror = function() {
    console.log('Request error');
  };

  request.send();
};

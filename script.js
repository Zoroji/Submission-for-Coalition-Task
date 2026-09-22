var bpChart = null;

document.addEventListener('DOMContentLoaded', function() {
  var headers = new Headers();
  headers.append('Authorization', 'Basic ' + btoa('coalition:skills-test'));

  fetch('https://fedskillstest.coalitiontechnologies.workers.dev', {
    method: 'GET',
    headers: headers
  })
  .then(function(res) {
    return res.json();
  })
  .then(function(patients) {
    var sidebar = document.getElementById('patients-list');
    if (sidebar) {
      var html = '';
      for (var i = 0; i < patients.length; i++) {
        var p = patients[i];
        var isActive = p.name === 'Jessica Taylor' ? ' active' : '';
        html += '<li class="patient-item' + isActive + '">';
        html += '<div class="patient-main-info">';
        html += '<img src="' + p.profile_picture + '" alt="' + p.name + '" class="patient-avatar" onerror="this.src=\'assets/jessica-taylor.png\'">';
        html += '<div class="patient-text">';
        html += '<span class="patient-name">' + p.name + '</span>';
        html += '<span class="patient-sub">' + p.gender + ', ' + p.age + '</span>';
        html += '</div></div>';
        html += '<button class="icon-btn" aria-label="Options"><img src="assets/more-horiz.svg" alt="More"></button>';
        html += '</li>';
      }
      sidebar.innerHTML = html;
    }

    var target = null;
    for (var j = 0; j < patients.length; j++) {
      if (patients[j].name === 'Jessica Taylor') {
        target = patients[j];
        break;
      }
    }

    if (!target) return;

    var avatarImg = document.getElementById('profile-avatar');
    if (avatarImg) avatarImg.src = target.profile_picture || 'assets/jessica-taylor.png';

    var nameEl = document.getElementById('profile-name');
    if (nameEl) nameEl.textContent = target.name;

    var dobEl = document.getElementById('profile-dob');
    if (dobEl && target.date_of_birth) {
      var d = new Date(target.date_of_birth);
      dobEl.textContent = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    }

    var genderEl = document.getElementById('profile-gender');
    if (genderEl) genderEl.textContent = target.gender;

    var phoneEl = document.getElementById('profile-phone');
    if (phoneEl) phoneEl.textContent = target.phone_number;

    var emergencyEl = document.getElementById('profile-emergency');
    if (emergencyEl) emergencyEl.textContent = target.emergency_contact;

    var insuranceEl = document.getElementById('profile-insurance');
    if (insuranceEl) insuranceEl.textContent = target.insurance_type;

    var history = target.diagnosis_history || [];
    if (history.length > 0) {
      var recent = history.slice(0, 6).reverse();
      var labels = [];
      var systolicData = [];
      var diastolicData = [];

      for (var k = 0; k < recent.length; k++) {
        var h = recent[k];
        labels.push(h.month.substring(0, 3) + ', ' + h.year);
        systolicData.push(h.blood_pressure.systolic.value);
        diastolicData.push(h.blood_pressure.diastolic.value);
      }

      var canvas = document.getElementById('bpChart');
      if (canvas) {
        if (bpChart) {
          bpChart.destroy();
        }
        bpChart = new Chart(canvas.getContext('2d'), {
          type: 'line',
          data: {
            labels: labels,
            datasets: [
              {
                label: 'Systolic',
                data: systolicData,
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
                data: diastolicData,
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

      var current = history[0];
      if (current.blood_pressure) {
        document.getElementById('systolic-val').textContent = current.blood_pressure.systolic.value;
        document.getElementById('systolic-status').textContent = current.blood_pressure.systolic.levels;
        document.getElementById('diastolic-val').textContent = current.blood_pressure.diastolic.value;
        document.getElementById('diastolic-status').textContent = current.blood_pressure.diastolic.levels;
      }

      if (current.respiratory_rate) {
        document.getElementById('resp-val').textContent = current.respiratory_rate.value + ' bpm';
        document.getElementById('resp-status').textContent = current.respiratory_rate.levels;
      }

      if (current.temperature) {
        document.getElementById('temp-val').textContent = current.temperature.value + '°F';
        document.getElementById('temp-status').textContent = current.temperature.levels;
      }

      if (current.heart_rate) {
        document.getElementById('heart-val').textContent = current.heart_rate.value + ' bpm';
        document.getElementById('heart-status').textContent = current.heart_rate.levels;
      }
    }

    var diagnostics = target.diagnostic_list || [];
    var tbody = document.getElementById('diagnostic-tbody');
    if (tbody) {
      var diagHtml = '';
      for (var dIdx = 0; dIdx < diagnostics.length; dIdx++) {
        var item = diagnostics[dIdx];
        diagHtml += '<tr><td>' + item.name + '</td><td>' + item.description + '</td><td>' + item.status + '</td></tr>';
      }
      tbody.innerHTML = diagHtml;
    }

    var labs = target.lab_results || [];
    var labListEl = document.getElementById('lab-results-list');
    if (labListEl) {
      var labHtml = '';
      for (var lIdx = 0; lIdx < labs.length; lIdx++) {
        var activeClass = lIdx === 1 ? ' active' : '';
        labHtml += '<li class="lab-item' + activeClass + '"><span>' + labs[lIdx] + '</span><button class="icon-btn" aria-label="Download"><img src="assets/download.svg" alt="Download"></button></li>';
      }
      labListEl.innerHTML = labHtml;
    }
  })
  .catch(function(err) {
    console.log('Error fetching patient data', err);
  });
});

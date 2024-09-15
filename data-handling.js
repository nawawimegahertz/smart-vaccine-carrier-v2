<!-- Leaflet JS -->
<script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
<!-- Leaflet Routing Machine JS -->
<script src="https://unpkg.com/leaflet-routing-machine/dist/leaflet-routing-machine.js"></script>
<!-- Bootstrap JS -->
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.min.js"></script>
<!-- XLSX Library -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"></script>

var map = L.map('map').setView([0, 0], 15);
var polyline = L.polyline([], { color: 'blue' }).addTo(map);
var startMarker, endMarker, currentMarker, routeControl;

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(map);

function updateMap(data) {
    var latitude = parseFloat(data.field1);
    var longitude = parseFloat(data.field2);
    var temp = parseFloat(data.field3);
    var batt = parseFloat(data.field4);
    var timestamp = data.created_at;
    
    var date_ = timestamp.split('T'), date_now = date_[0];
    var time_ = date_[1].split('+'), time_now = time_[0];

    document.getElementById('latitude').textContent = latitude.toFixed(6);
    document.getElementById('longitude').textContent = longitude.toFixed(6);
    document.getElementById('time_date').textContent = date_now;
    document.getElementById('time_time').textContent = time_now;
    document.getElementById('temperature').textContent = temp.toFixed(2);
    document.getElementById('battery').textContent = batt.toFixed(2);

    updateMarker(latitude, longitude);
    
    if (stat_btn == 1) {
        polyline.addLatLng([latitude, longitude]);
        map.addLayer(polyline);
    }
    map.panTo([latitude, longitude]);
}

function updateMarker(latitude, longitude) {
    var customPopup = `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`;
    if (currentMarker) {
        currentMarker.setLatLng([latitude, longitude]).bindPopup(customPopup).openPopup();
    } else {
        currentMarker = L.marker([latitude, longitude], {
            icon: L.icon({ iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png', iconSize: [25, 41], iconAnchor: [12, 41] })
        }).addTo(map).bindPopup(customPopup).openPopup();
    }
}

function updateRoute() {
    var startLocation = document.getElementById('startLocation').value.split(',');
    var endLocation = document.getElementById('endLocation').value.split(',');
    var startLat = parseFloat(startLocation[0]);
    var startLng = parseFloat(startLocation[1]);
    var endLat = parseFloat(endLocation[0]);
    var endLng = parseFloat(endLocation[1]);

    if (isNaN(startLat) || isNaN(startLng) || isNaN(endLat) || isNaN(endLng)) {
        alert('Koordinat tidak valid untuk keberangkatan dan tujuan.');
        return;
    }

    if (startMarker) map.removeLayer(startMarker);
    if (endMarker) map.removeLayer(endMarker);

    startMarker = L.marker([startLat, startLng]).addTo(map);
    endMarker = L.marker([endLat, endLng]).addTo(map);
    routeControl = L.Routing.control({ waypoints: [L.latLng(startLat, startLng), L.latLng(endLat, endLng)], routeWhileDragging: true }).addTo(map);
}

document.getElementById('startPolylineButton').addEventListener('click', function () {
    stat_btn = 1;
    document.getElementById('resetButton').style.display = 'inline-block';
});

document.getElementById('resetButton').addEventListener('click', function () {
    stat_btn = 0;
    polyline.setLatLngs([]);
    if (routeControl) routeControl.remove();
    if (startMarker) map.removeLayer(startMarker);
    if (endMarker) map.removeLayer(endMarker);
    document.getElementById('resetButton').style.display = 'none';
});

document.getElementById('exportXLSXButton').addEventListener('click', function () {
    var tableData = [
        ['Tanggal', document.getElementById('time_date').textContent],
        ['Waktu', document.getElementById('time_time').textContent],
        ['Suhu (°C)', document.getElementById('temperature').textContent],
        ['Baterai (%)', document.getElementById('battery').textContent],
        ['Latitude', document.getElementById('latitude').textContent],
        ['Longitude', document.getElementById('longitude').textContent]
    ];

    var worksheet = XLSX.utils.aoa_to_sheet(tableData);
    var workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Tracking Data');
    XLSX.writeFile(workbook, 'tracking_data.xlsx');
});

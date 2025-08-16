import RouterAuth from "./Auth.js";


const auth = new RouterAuth();

if(!auth.isAuthenticated()) {
    window.location.href = "Main.html";
}

let guestpass = "";
let guestssid = "";
let bdata = {};

async function getDevices() {
    try {
        const response = await fetch('/cgi-bin/get-guest-devices');
        const unfiltereddata = await response.json();

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }


        if (!unfiltereddata.devices || !Array.isArray(unfiltereddata.devices)) {
            throw new Error('Invalid response format: devices array not found');
        }

        const blockedMacs = new Set(bdata.blocked_devices ? bdata.blocked_devices.map(device => device.mac) : []);
        const data = unfiltereddata.devices.filter(device => !blockedMacs.has(device.mac));

        const devicesList = document.querySelector('.devices-list');

        if (!devicesList) {
            throw new Error('Devices list element not found');
        }

        devicesList.innerHTML = '';


        data.forEach(element => {
            devicesList.innerHTML += `
            <div class="device-item">
                <span class="device-name">${element.hostname || 'Unknown Device'}</span>
                <span class="device-status" data-status="${element.status}">${element.status}</span>
                <span class="device-ip">IP: ${element.ip}</span>
                <span class="device-mac">MAC: ${element.mac}</span>
                <span class="device-block-button-section">
                    <button class="device-block-button" onclick="blockDevice('${element.mac}')">
                        block <i class="fa-solid fa-lock"></i>
                    </button>
                </span>
            </div>
            `;
        });
    } catch (error) {
        console.error('Error fetching devices:', error);
        const devicesList = document.querySelector('.devices-list');
        if (devicesList) {
            devicesList.innerHTML = '<div class="error-message">Failed to load devices. Please try again.</div>';
        }
    }

    setTimeout(() => {
        getDevices();
    }, 10000);
}

window.openEditPopup = async function (setting) {
    const popupTitle = document.querySelector('#popupTitle');
    const popupContent = document.querySelector('.popup-label');
    const popupact = document.querySelector('.popup-act');
    const popupactions = document.querySelector('.popup-actions');

    popupact.style.display = 'block';
    popupTitle.textContent = '';
    popupContent.innerHTML = '';
    popupact.innerHTML = '';

    const popup = document.querySelector('.popup-overlay');
    popup.style.display = 'flex';

    switch (setting) {
        case 'schedule':
            popupTitle.textContent = 'Set Schedule';
            popupContent.innerHTML = `
                    <input type="time" id="popupFromInput">
                    To
                    <input type="time" id="popupToInput">
            `;
            popupact.innerHTML = `
                <button class="popup-button" onclick="clearSchedule()">Clear Schedule</button>
            `;
            popupactions.innerHTML = `
            <button class="popup-button" onclick="saveChanges('schedule')">Save</button>
            <button class="popup-button" onclick="closeEditPopup()">Cancel</button>
            `;
            break;

        case 'bandwidth':
            popupTitle.textContent = 'Set Bandwidth';
            popupContent.innerHTML = `
                    <input type="number" id="popupDownInput" placeholder="KB/s">
                    <input type="number" id="popupUpInput" placeholder="KB/s">
            `;
            popupact.innerHTML = `
                <label class="switch">
                    <input type="checkbox" id="popupToggle">
                    <span class="slider"></span>
                </label>
            `;
            const data = await getGuestBandwidth();
            const poptog = document.querySelector('#popupToggle');
            data.enabled === '1' ? poptog.checked = true : poptog.checked = false;
            popupactions.innerHTML = `
            <button class="popup-button" onclick="saveChanges('bandwidth')">Save</button>
            <button class="popup-button" onclick="closeEditPopup()">Cancel</button>
            `;
            break;

        case 'password':
            popupTitle.textContent = 'Set Password';
            popupContent.innerHTML = `
                    <input type="password" id="popupPasswordInput" placeholder="Password">
            `;
            popupact.style.display = 'none';
            popupactions.innerHTML = `
            <button class="popup-button" onclick="saveChanges('password')">Save</button>
            <button class="popup-button" onclick="closeEditPopup()">Cancel</button>
            `;
            break;

        case 'ssid':
            popupTitle.textContent = 'Set SSID';
            popupContent.innerHTML = `
                <input type="text" id="popupSSIDInput" placeholder="SSID">
            `;
            popupact.style.display = 'none';
            popupactions.innerHTML = `
            <button class="popup-button" onclick="saveChanges('ssid')">Save</button>
            <button class="popup-button" onclick="closeEditPopup()">Cancel</button>
            `;
            break;
        default:
            console.log('Invalid setting');
            break;
    }
}

window.closeEditPopup = function () {
    const popup = document.querySelector('.popup-overlay');
    popup.style.display = 'none';
}

window.toggleGuest = async function () {

    const guestToggle = document.querySelector('#guest-toggle');

    try{

        const response = await fetch('/cgi-bin/guest-controls?toggle=true', {
            method: 'POST'
        });
        const data = await response.json();

        if (data.status === '0') {
            guestToggle.checked = true;
        }else {
            guestToggle.checked = false;
        }

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

    } catch (error) {
        console.error('Error toggling guest:', error);
    }
}

async function getGuestStatus() {
    try{
        const response = await fetch('/cgi-bin/guest-controls');
        const data = await response.json();
        const guestToggle = document.querySelector('#guest-toggle');
        const guestSSID = document.querySelector('#guest-ssid');

        guestSSID.textContent = data.ssid;
        data.status === '0' ? guestToggle.checked = true : guestToggle.checked = false;
        guestpass = data.password;
        guestssid = data.ssid;

        const guestSSID2 = document.querySelector('#settingsSSIDValue');
        guestSSID2.textContent = data.ssid;
        const guestPassword2 = document.querySelector('#settingsPasswordValue');
        guestPassword2.textContent = data.password;
    } catch (error) {
        console.error('Error fetching status:', error);
    }

}

window.saveChanges = async function (setting) {
    const popup = document.querySelector('.popup-overlay');
    popup.style.display = 'none';

    try{

    switch (setting) {
        case 'schedule':
            const fromInput = document.querySelector('#popupFromInput').value;
            const toInput = document.querySelector('#popupToInput').value;

            await fetch('/cgi-bin/set-guest-schedule', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    action: 'schedule',
                    start_time: fromInput,
                    end_time: toInput
                })
            });
            new Promise(resolve => setTimeout(resolve, 2000));
            await getGuestSchedule();
            break;
        case 'bandwidth':
            let downInput = document.querySelector('#popupDownInput').value;
            let upInput = document.querySelector('#popupUpInput').value;
            const toggleInput = document.querySelector('#popupToggle').checked;

            if (!toggleInput) {
                downInput = 0;
                upInput = 0;
            }

            await fetch('/cgi-bin/set-guest-bandwidth', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: `download=${downInput}&upload=${upInput}`
            });
            new Promise(resolve => setTimeout(resolve, 2000));
            await getGuestBandwidth();
            break;
        case 'password':
            const passwordInput = document.querySelector('#popupPasswordInput').value;

            await fetch('/cgi-bin/guest-controls', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: `password=${encodeURIComponent(passwordInput)}`
            });
            new Promise(resolve => setTimeout(resolve, 2000));
            await getGuestStatus();
            break;
        case 'ssid':
            const ssidInput = document.querySelector('#popupSSIDInput').value;

            await fetch('/cgi-bin/guest-controls', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: `ssid=${encodeURIComponent(ssidInput)}`
            });
            new Promise(resolve => setTimeout(resolve, 2000));
            await getGuestStatus();
            break;
        default:
            console.log('Invalid setting');
            break;
    }
    } catch (error) {
        console.error('Error saving changes:', error);
    }
}

window.showQRCode = function () {

    const wifiString = `WIFI:T:WPA;S:${guestssid};P:${guestpass};;`;
    const popupContent = document.querySelector('.popup-content');
    document.querySelector('.popup-overlay').style.display = 'flex';

    popupContent.innerHTML = `
            <h3>Scan to Connect</h3>
            <div id="qrcode"></div>
                <div class ="qr-info">
                    <div>Network: ${guestssid}</div>
                    <div>Password: ${guestpass}</div>
                </div>

        <div class="popup-actions">
            <button class="popup-button" onclick="downloadQRCode()"><i class="fa fa-download"></i> Download QR Code</button>
            <button class="popup-button" onclick="closeEditPopup()">Close</button>
        </div>
    `;

    new QRCode(document.getElementById("qrcode"), {
        text: wifiString,
        width: 256,
        height: 256,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });

}

window.downloadQRCode = function () {
    const canvas = document.querySelector('#qrcode canvas');
    if (canvas) {
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = 'WiFi-qrcode-guest.png';
        link.click();
    }
}

async function getGuestBandwidth () {

    try{
        const response = await fetch ('/cgi-bin/get-guest-bandwidth');
        const data = await response.json();

        document.querySelector('#guest-download').textContent = data.download;
        document.querySelector('#guest-upload').textContent = data.upload;
        document.querySelector('#settingsBandwidthValue').innerHTML = `<i class="fa fa-download"></i> ${data.download} <i class="fa fa-upload"></i> ${data.upload}`;

        return data;

    } catch (error) {
        console.error('Error fetching guest bandwidth:', error);
    }
}

async function getGuestSchedule () {

    try{
        const response = await fetch ('/cgi-bin/get-guest-schedule');
        const data = await response.json();

        document.querySelector('#settingsScheduleValue').textContent = ` From ${data.schedule.start} To ${data.schedule.end}`;

    } catch (error) {
        document.querySelector('#settingsScheduleValue').textContent = 'Not scheduled';
    }
}

window.clearSchedule = async function () {
    await fetch('/cgi-bin/set-guest-schedule', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            action: 'clear'
        })
    });
    document.querySelector('.popup-overlay').style.display = 'none';
    await getGuestSchedule();
}

window.blockDevice = async function (mac) {

    try {

        const response = await fetch(`/cgi-bin/block-device.py?mac=${mac}`, {
            method: 'POST',
            headers: {'Accept': 'application/json'}
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

    } catch (error) {
        console.error('Error modifying device:', error);
    }
}

async function getBlockedDevices () {

     try {
        const response = await fetch(`/cgi-bin/get-blocked-devices.py`, {
            method: 'GET',
            headers: {'Accept': 'application/json'}
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        bdata = await response.json();

    } catch (error) {
        console.error('Error fetching blocked devices:', error);
    }

    setTimeout(async () => {
        await getBlockedDevices();
    }, 10000);
}




document.addEventListener('DOMContentLoaded',async  function() {
    await getBlockedDevices();
    getDevices();
    getGuestStatus();
    getGuestBandwidth();
    getGuestSchedule();
    auth.monitorActivity();
    console.log(auth.getSessionInfo());
});
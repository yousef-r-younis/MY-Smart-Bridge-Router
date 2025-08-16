import RouterAuth from "./Auth.js";

const auth = new RouterAuth();

const refreshTime = 15000;
let bdata = {};


if (!auth.isAuthenticated()) {
    window.location.href = "Main.html";
}

async function hardwareStats() {

    try {
        const response = await fetch(`/cgi-bin/get-system-stats.py`, {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        let stats = await response.json();

        document.getElementById('cpuTemp').innerHTML = stats.cpu_temperature + ' °C';
        document.getElementById('cpuLoad').innerHTML = stats.cpu_usage_percent + '%';
        document.getElementById('systemLoad').innerHTML = stats.load['1min'] + '%';
        document.getElementById('memoryUsage').innerHTML = stats.memory.used_percent + '%';
        document.getElementById('uptime').innerHTML = stats.uptime.formatted;

    } catch (error) {
        console.error('Error fetching dashboard data:', error);
    }

    setTimeout(() => hardwareStats(), refreshTime);
}


async function networkStats() {

    try {
        const response = await fetch(`/cgi-bin/get-network-stats.py`, {
            method: 'GET',
            headers: {'Accept': 'application/json'}
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        let stats = await response.json();

        document.getElementById('downloadTotal').innerHTML = stats.download.total;
        document.getElementById('downloadPackets').innerHTML = stats.download.packets;
        document.getElementById('downloadRate').innerHTML = stats.download.rate;
        document.getElementById('uploadTotal').innerHTML = stats.upload.total;
        document.getElementById('uploadPackets').innerHTML = stats.upload.packets;
        document.getElementById('uploadRate').innerHTML = stats.upload.rate;

    } catch (error) {
        console.error('Error fetching network stats:', error);
    }

    setTimeout(() => networkStats(), refreshTime);
}


function getSignalBarsHTML(dbm) {

    let activeBars = 0;
    let colorClass = '';

    if (dbm >= -50) {
        activeBars = 4;
        colorClass = 'active';
    } else if (dbm >= -60) {
        activeBars = 3;
        colorClass = 'active';
    } else if (dbm >= -70) {
        activeBars = 2;
        colorClass = 'weak';
    } else if (dbm >= -80) {
        activeBars = 1;
        colorClass = 'weak';
    } else {
        activeBars = 1;
        colorClass = 'poor';
    }

    let barsHTML = '<div class="signal-bars">';
    for (let i = 0; i < 4; i++) {
        const activeClass = i < activeBars ? colorClass : '';
        barsHTML += `<div class="signal-bar ${activeClass}"></div>`;
    }
    barsHTML += '</div>';

    return barsHTML;
}

window.toggleDeviceList = function (state) {
    let deviceList;
    let arrow;
    if (state === 'blocked') {
         deviceList = document.querySelector(`.blockedDeviceList`);
         arrow = document.querySelector(`.device-count-container span[aria-label="Expand blocked device list"]`);
    }else{
         deviceList = document.querySelector(`.deviceList`);
         arrow = document.querySelector(`.device-count-container span[aria-label="Expand device list"]`);
    }
    if (deviceList.style.display === 'none') {
        deviceList.style.display = 'flex';
        arrow.textContent = '▲';
    } else {
        deviceList.style.display = 'none';
        arrow.textContent = '▼';
    }
}


async function connectedDevices() {

    try {
        const response = await fetch(`/cgi-bin/get-connected-devices.py`, {
            method: 'GET',
            headers: {'Accept': 'application/json'}
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        let unfiltereddata = await response.json();
        const blockedMacs = new Set(bdata.blocked_devices ? bdata.blocked_devices.map(device => device.mac) : []);
        const data = unfiltereddata.devices.filter(device => !blockedMacs.has(device.mac));

        const devicesList = document.querySelector('.deviceList');
        document.getElementById('count').textContent = data.length;

        devicesList.innerHTML = '';

        data.forEach(device => {
            devicesList.innerHTML += `
            <div class="device-item">
                <span class="device-name">${device.hostname}</span>
                <div class="device-info">
                    ${device.connection_type === "wireless"
                        ? `<span class="device-uptime">${(device.wireless_details.connected_time.split(' ')[0] / 60).toFixed(1)} mins</span>`
                        : `<span class="device-uptime"></span>`
                    }

                    ${device.connection_type === "wireless"
                        ? `<span class="device-signal">${getSignalBarsHTML(device.wireless_details.signal)}</span>`
                        : `<span class="device-signal"><i class="fa-solid fa-ethernet"></i></span>`
                    }
                    <span>${device.connection_type}</span>
                </div>
                <span class="device-ip">IP: ${device.ip}</span>
                <span class="device-mac">MAC: ${device.mac}</span>
                <span class="device-interface"><i class="fa-solid fa-tower-broadcast"></i> Interface: ${device.interface}</span>
                ${device.connection_type === "wireless"
                    ? `<span class="device-TX">TX: ${device.wireless_details.tx_bitrate}</span>
                       <span class="device-RX">RX: ${device.wireless_details.rx_bitrate}</span>
                       <span class="device-transfer-up">&uarr; ${(device.wireless_details.tx_bytes/1000000).toFixed(2)} MB</span>
                       <span class="device-transfer-down">&darr; ${(device.wireless_details.rx_bytes/1000000).toFixed(2)} MB</span>
                       <span class="device-traffic-tx"><i class="fa-solid fa-file-arrow-down"></i> Tx: ${device.wireless_details.tx_packets} packets</span>
                       <span class="device-traffic-rx"><i class="fa-solid fa-file-arrow-up"></i> Rx: ${device.wireless_details.rx_packets} packets</span>`
                    : `<span class="device-transfer-up">&uarr; ${(device.ethernet_details.tx_bytes/1000000).toFixed(2)} MB</span>
                       <span class="device-transfer-down">&darr; ${(device.ethernet_details.rx_bytes/1000000).toFixed(2)} MB</span>
                       <span class="device-traffic-tx"><i class="fa-solid fa-file-arrow-down"></i> Tx: ${device.ethernet_details.tx_packets} packets</span>
                       <span class="device-traffic-rx"><i class="fa-solid fa-file-arrow-up"></i> Rx: ${device.ethernet_details.rx_packets} packets</span>
                       <span><i class="fa-solid fa-bug"></i> Tx-error: ${device.ethernet_details.tx_errors} packets</span>
                       <span><i class="fa-solid fa-bug"></i> Rx-error: ${device.ethernet_details.rx_errors} packets</span>`
                }
                <span class="device-block-button-section" onclick="modifyDevice('${device.mac}', 'block')"><button class="device-block-button">Block <i class="fa-solid fa-lock"></i></button></span>
            </div>`
        });

    } catch (error) {
        console.error('Error fetching connected devices:', error);
    }

    setTimeout(() => connectedDevices(), refreshTime);
}

async function blockedDevices() {
    try {
        const response = await fetch(`/cgi-bin/get-blocked-devices.py`, {
            method: 'GET',
            headers: {'Accept': 'application/json'}
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        bdata = await response.json();

        const blockedDevicesList = document.querySelector('.blockedDeviceList');
        document.querySelector('#countb').textContent = bdata.blocked_devices.length;
        blockedDevicesList.innerHTML = '';

        bdata.blocked_devices.forEach(device => {
            blockedDevicesList.innerHTML += `
            <div class="blocked-device-item">
                    <span class="blocked-device-name">${device.hostname}</span>
                    <span class="blocked-device-ip">IP: ${device.ip}</span>
                    <span class="blocked-device-mac">MAC: ${device.mac}</span>
                    <span class="device-unblock-button-section" onclick="modifyDevice('${device.mac}', 'unblock')"><button class="device-unblock-button">Unblock <i class="fa-solid fa-unlock"></i></button></span>
            </div>`
        });

    } catch (error) {
        console.error('Error fetching blocked devices:', error);
    }

    setTimeout(() => blockedDevices(), 8000);
}

window.modifyDevice = async function (mac , action) {

    try {

        const response = await fetch(`/cgi-bin/${action}-device.py?mac=${mac}`, {
            method: 'POST',
            headers: {'Accept': 'application/json'},
            body: JSON.stringify({ mac: mac })
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

    } catch (error) {
        console.error('Error modifying device:', error);
    }

}

async function routerAction(action) {

    try {
        const response = await fetch(`/cgi-bin/router-control.py?action=${action}`, {
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

window.Confirmation = function (action) {
    const confirmationDiv = document.querySelector('.confirmation');
    const confirmText = confirmationDiv.querySelector('.confirm-text');
    const confirmButton = confirmationDiv.querySelector('.confirm-button');
    const cancelButton = confirmationDiv.querySelector('.cancel-button');

    if (!confirmationDiv || !confirmButton || !cancelButton) {
        console.error('Required confirmation elements not found');
        return;
    }

    const newConfirmButton = confirmButton.cloneNode(true);
    const newCancelButton = cancelButton.cloneNode(true);

    confirmText.textContent = `Are you sure you want to ${action} the router?`;
    confirmationDiv.style.display = 'grid';

    confirmButton.replaceWith(newConfirmButton);
    cancelButton.replaceWith(newCancelButton);

    newConfirmButton.addEventListener('click', () => {
        confirmText.textContent = 'Performing action...';
        newConfirmButton.remove();
        newCancelButton.remove();
        setTimeout(() => {
            confirmationDiv.style.display = 'none';
        }, 1500);
        routerAction(action);
    });

    newCancelButton.addEventListener('click', () => {
        confirmationDiv.style.display = 'none';
    });
}

function getSessionInfo() {
    let authinfo = auth.getSessionInfo();
    document.querySelector('#username').textContent = auth.validCredentials.username;
    document.querySelector('#authenticated').textContent = authinfo.isAuthenticated ? 'Yes' : 'No';
    document.querySelector('#timeLeft').textContent = authinfo.timeLeftMinutes;
    document.querySelector('#maxAttempts').textContent = authinfo.maxAttempts;

    setTimeout(() => {
        getSessionInfo();
    }, 65000);
}

window.HandleLogout = function () {
    auth.logout();
}





document.addEventListener('DOMContentLoaded', async function() {
    hardwareStats();
    networkStats();
    await blockedDevices();
    connectedDevices();
    auth.monitorActivity();
    getSessionInfo();
    console.log(auth.getSessionInfo());
});

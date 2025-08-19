import RouterAuth from "./Auth.js";

const auth = new RouterAuth();

if (!auth.isAuthenticated()) {
    window.location.href = "Main.html";
}

let rules = [];

async function getWifiInfo() {

    try {

        const response = await fetch('/cgi-bin/get-wifi-info');

        if (!response.ok){
            throw new error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        return data;

    } catch (error) {
        console.error('Error fetching wifi info:', error);
    }
}

async function loadWifiInfo() {
    const wifiInfo = await getWifiInfo();

    document.querySelector('.ssid-input').value = wifiInfo.ssid;
    document.querySelector('.password-input').value = wifiInfo.password;
    try{
    document.querySelector('.channel-select').value = wifiInfo.channel;
    }catch (error) {
        document.querySelector('.channel-select').value = auto;
    }
}

window.toggleVisibility = function () {

    const passwordInput = document.querySelector('.password-input');
    const passwordToggle = document.querySelector('#toggle-eye');

    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        passwordToggle.classList.remove('fa-eye');
        passwordToggle.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        passwordToggle.classList.remove('fa-eye-slash');
        passwordToggle.classList.add('fa-eye');
    }
}

window.repairWifiConnection = function () {

    try {

        fetch('/cgi-bin/repair_wifi');

    } catch (error) {
        console.error('Error fetching wifi info:', error);
    }
}

async function getLanInfo() {

    try {

        const response = await fetch('/cgi-bin/get-lan-info');

        if (!response.ok){
            throw new error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        return data;

    } catch (error) {
        console.error('Error fetching wifi info:', error);
    }
}

async function loadLanInfo() {
    const lanInfo = await getLanInfo();

    document.querySelector('#lan-ip').textContent = lanInfo.lan_ip;
    document.querySelector('#lan-subnet').textContent = lanInfo.netmask;
    document.querySelector('#lan-dns').textContent = lanInfo.dns;
    document.querySelector('#lan-dhcp-start').textContent = lanInfo.dhcp_start;
    document.querySelector('#lan-dhcp-end').textContent = lanInfo.dhcp_limit;
    document.querySelector('#lan-lease-time').textContent = lanInfo.dhcp_leasetime;
}

async function scanWifi() {

    try {

        const response = await fetch('/cgi-bin/scan-wifi.py');

        if (!response.ok){
            throw new error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        return data;

    } catch (error) {
        console.error('Error fetching wifi info:', error);
    }
}

window.scanAndDisplayWifi = async function () {
document.querySelector('#wifi-list').innerHTML = '<tr><td colspan="9"><i class="fa-solid fa-spinner fa-spin"></i> Scanning for networks</td></tr>';
    const wifiList = await scanWifi();
    document.querySelector('#wifi-count').textContent = wifiList.count;

    const wifiTableBody = document.querySelector('#wifi-list');
    wifiTableBody.innerHTML = '';

    wifiList.networks.forEach(wifi => {
        const quality = getSignalInfo(wifi.quality.value, wifi.quality.max);
        const row = document.createElement('tr');
        row.innerHTML = `<td>${wifi.essid}</td>
                         <td>${wifi.address}</td>
                         <td>${wifi.encryption}</td>
                         <td>${wifi.channel}</td>
                         <td>${wifi.frequency_ghz} GHz</td>
                         <td>${wifi.band}</td>
                         <td>${wifi.signal_dbm} dBm</td>
                         <td>${quality.bars} ${quality.label}</td>
                         <td><button class="connect-button" onclick= "openConnectPopup('${wifi.essid}')">Connect</button></td>`;
        wifiTableBody.appendChild(row);
    });
}

function getSignalInfo(qualityValue, qualityMax = 70) {
    const percent = (qualityValue / qualityMax) * 100;
    let label, bars;

    if (percent >= 80) {
        label = "Excellent";
        bars = getSignalBarsHTML(4, "active");
    } else if (percent >= 60) {
        label = "Good";
        bars = getSignalBarsHTML(3, "active");
    } else if (percent >= 40) {
        label = "Fair";
        bars = getSignalBarsHTML(2, "weak");
    } else if (percent >= 20) {
        label = "Poor";
        bars = getSignalBarsHTML(1, "weak");
    } else {
        label = "Very Poor";
        bars = getSignalBarsHTML(0, "poor");
    }

    return { label, bars };
}

function getSignalBarsHTML(activeBars, colorClass) {
    let barsHTML = '<div class="signal-bars">';
    for (let i = 0; i < 4; i++) {
        const activeClass = i < activeBars ? colorClass : '';
        barsHTML += `<div class="signal-bar ${activeClass}"></div>`;
    }
    barsHTML += '</div>';
    return barsHTML;
}

window.connectToWifi = async function () {

    try {

        const response = await fetch('/cgi-bin/connect-wifi', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `ssid=${encodeURIComponent(document.querySelector('#networkName').textContent)}&password=${encodeURIComponent(document.querySelector('#connect-password').value)}`
        });

        if (!response.ok){
            throw new Error(`HTTP ${response.status}`);
        }

        document.querySelector('#connectButton').innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Connecting...';

        const data = await response.text();



        if (data.includes('Successfully connected')){
            successNoti(`Successfully connected to ${document.querySelector('#networkName').value}`);
        }else {
            errorNoti(`Failed to connect to ${document.querySelector('#networkName').value}`);
        }

    } catch (error) {
        console.error('Error fetching wifi info:', error);
    }
}

function successNoti (message) {

    document.querySelector('.connect-popup').style.display = 'none';
    let noti = document.querySelector('#notification-popup');
    noti.classList.remove('failed-notification-popup');
    noti.classList.add('notification-popup');
    noti.style.display = 'block';
    document.querySelector('#notification-message').textContent = message;
    noti.style.animation = 'none';
    void noti.offsetHeight;
    noti.style.animation = "fade-in 0.5s ease-in-out, fade-out 0.5s ease-in-out 2s forwards";
}

function errorNoti (message) {

    document.querySelector('.connect-popup').style.display = 'none';
    let noti = document.querySelector('#notification-popup');
    noti.classList.remove('notification-popup');
    noti.classList.add('failed-notification-popup');
    noti.style.display = 'block';
    document.querySelector('#notification-message').textContent = message;
    noti.style.animation = 'none';
    void noti.offsetHeight;
    noti.style.animation = "fade-in 0.5s ease-in-out, fade-out 0.5s ease-in-out 2s forwards";

}

window.closeConnectPopup = function () {
    document.querySelector('.connect-popup').style.display = 'none';
}

window.applyWifiChanges = async function () {

    try {

        const response = await fetch('/cgi-bin/set_wifi', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `ssid=${encodeURIComponent(document.querySelector('.ssid-input').value)}&password=${encodeURIComponent(document.querySelector('.password-input').value)}&channel=${encodeURIComponent(document.querySelector('.channel-select').value)}`
        });

        if (!response.ok){
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.text();

        if (data.includes('updated')){
            await loadWifiInfo();
        }
    } catch (error) {
        console.error('Error fetching wifi info:', error);
    }
}

window.togglePreset = function () {

    if (document.querySelector('.port-preset').style.display === 'none') {
        document.querySelector('.port-preset').style.display = 'flex';
    } else {
        document.querySelector('.port-preset').style.display = 'none';
    }
}

window.openConnectPopup = function (networkName) {
    document.querySelector('#networkName').textContent = networkName;
    document.querySelector('#connect-password').value = '';
    document.querySelector('.connect-popup').style.display = 'flex';
    document.querySelector('#connectButton').innerHTML = 'Connect';
}

window.addRule = async function () {
    try {

        rules = await getPortRules();

        if (rules.some(rule => rule.rule_name === document.querySelector('#ruleName').value.trim())) {
            errorNoti('Rule name already exists');
            return;
        }

        let protocols = [];
        if (document.querySelector('#anyCheckbox').checked) protocols.push('all');
        else{
            if (document.querySelector('#tcpCheckbox').checked) protocols.push('tcp');
            if (document.querySelector('#udpCheckbox').checked) protocols.push('udp');
            if (document.querySelector('#icmpCheckbox').checked) protocols.push('icmp');
            if (protocols.length === 0) protocols.push('all');
        }

        const ruleName = document.querySelector('#ruleName').value.trim();
        const externalPort = document.querySelector('#externalPort').value;
        const internalPort = document.querySelector('#internalPort').value;
        const internalIP = `${document.querySelector('#internalIp1').value}.${document.querySelector('#internalIp2').value}.${document.querySelector('#internalIp3').value}.${document.querySelector('#internalIp4').value}`;


        if (!ruleName || !externalPort || !internalPort || !document.querySelector('#internalIp1').value || !document.querySelector('#internalIp2').value || !document.querySelector('#internalIp3').value || !document.querySelector('#internalIp4').value) {
            errorNoti('Please fill in all fields');
            return;
        }

        if (ruleName.length > 32) {
            errorNoti('Rule name too long (max 32 characters)');
            return;
        }

        if (externalPort < 1 || externalPort > 65535 || internalPort < 1 || internalPort > 65535) {
            errorNoti('Ports must be between 1 and 65535');
            return;
        }


        const ipValidation = validateIP(internalIP);
        if (!ipValidation.isValid) {
            errorNoti(`Invalid IP: ${ipValidation.error}`);
            return;
        }


        const response = await fetch('/cgi-bin/add-port-forwarding', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                rule_name: ruleName,
                protocols: protocols,
                external_port: externalPort,
                internal_ip: internalIP,
                internal_port: internalPort
            })
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = await response.json();

        if (data.status === 'success') {
            successNoti('Rule added successfully!');
            closeAddRulePopup();
            await loadPortRules();
        } else {
            errorNoti(data.message || 'Failed to add rule');
        }

    } catch (error) {
        console.error('Error:', error);
        errorNoti('Failed to add rule');
    }
};

function validateIP(ip) {
    const parts = ip.split('.');
    if (parts.length !== 4) return { isValid: false, error: 'Invalid format' };

    for (let i = 0; i < 4; i++) {
        const num = parseInt(parts[i]);
        if (isNaN(num) || num < 0 || num > 255) {
            return { isValid: false, error: `Octet ${i + 1} invalid` };
        }
    }
    return { isValid: true };
}

window.closeAddRulePopup = function () {
    document.querySelector('.addportRule').style.display = 'none';
    document.querySelector('#ruleName').value = '';
    document.querySelector('#externalPort').value = '';
    document.querySelector('#internalPort').value = '';
    document.querySelector('#internalIp1').value = '';
    document.querySelector('#internalIp2').value = '';
    document.querySelector('#internalIp3').value = '';
    document.querySelector('#internalIp4').value = '';
}

async function getPortRules() {

    try {
        const response = await fetch('/cgi-bin/get-port-forwarding');
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching port rules:', error);
        return [];
    }
}

async function loadPortRules () {
    const portRules = await getPortRules();
    const ruleList = document.querySelector('#port-forwarding-list');
    ruleList.innerHTML = '';

    portRules.forEach(rule => {
        const ruleItem = document.createElement('tr');
        ruleItem.innerHTML = `
                <td>${rule.rule_name}</td>
                <td>${rule.protocols}</td>
                <td>${rule.external_port}</td>
                <td>${rule.internal_ip}</td>
                <td>${rule.internal_port}</td>
                <td>
                    <button onclick="removePortRule('${rule.rule_name}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
        `;
        ruleList.appendChild(ruleItem);
    });
}

window.openAddRulePopup = function () {
    document.querySelector('.addPortRule').style.display = 'flex';
}

async function getRulesNames() {

    try {
        rules = await getPortRules();
        return rules.map(rule => rule.rule_name);
    } catch (error) {
        console.error('Error fetching port rules:', error);
        return [];
    }
}

window.removePortRule = async function (ruleName) {

    try {
        const response = await fetch('/cgi-bin/remove_port_forwarding', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ rule_name: ruleName })
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        if (data.status === 'success') {
            successNoti('Rule deleted successfully!');
            await loadPortRules();
        } else {
            errorNoti(data.message || 'Failed to delete rule');
        }
    } catch (error) {
        console.error('Error:', error);
        errorNoti('Failed to delete rule');
    }
};



document.addEventListener('DOMContentLoaded',async  function() {
    loadWifiInfo();
    loadLanInfo();
    loadPortRules();
    auth.monitorActivity();
    console.log(auth.getSessionInfo());
});
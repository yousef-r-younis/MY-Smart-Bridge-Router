import RouterAuth from "./Auth.js";

const auth = new RouterAuth();

if (!auth.isAuthenticated()) {
    window.location.href = "Main.html";
}

let domains = [];
let hostnames = {};

window.closeAddRule = function (id) {
    document.querySelector(`#${id}`).style.display = 'none';

    if (id === 'addDomainRule-card') {
        domains = [];
        document.querySelector('.device_selector').value = 'all';
        document.querySelector('#custom-rule').value = '';
        document.querySelector('#time_start').value = '';
        document.querySelector('#time_end').value = '';
        document.querySelector('.domain-list').innerHTML = '';
        domains = [];
    }else{
        document.querySelector('.device-selector').value = 'all';
        document.querySelector('#time-start').value = '';
        document.querySelector('#time-end').value = '';
    }
    document.querySelectorAll('.day-checkbox-group input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = false;
        });
}

window.openAddRule = async function (id) {
    document.querySelector(`#${id}`).style.display = 'flex';
    if (id === 'addDomainRule-card') {
        await loadConnectedDevices('device_selector');
    }else {
        await loadConnectedDevices('device-selector');
    }
}

window.toggleSchedule = function () {
    if (document.querySelector('.schedule-input').style.display === 'none') {
        document.querySelector('.schedule-input').style.display = 'flex';
    } else {
        document.querySelector('.schedule-input').style.display = 'none';
    }
}


window.addToList = function () {
    const domain = document.querySelector('#custom-rule').value.trim();

    const domainRegex = /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    document.querySelector('.domain-list').innerHTML = '';

    if (domainRegex.test(domain)) {
        domains.push(domain);
        document.querySelector('#custom-rule').value = '';
    } else {
        errorNoti('Invalid domain - use valid format');
    }

    domains.forEach(domain => {
        document.querySelector('.domain-list').innerHTML += `<div class="domain-item">${domain} <button class="remove-domain" onclick="removeDomain('${domain}')"><i class="fa fa-trash"></i></button></div>`;
    });
}

window.removeDomain = function (domain) {
    domains = domains.filter(d => d !== domain);
    document.querySelector('.domain-list').innerHTML = '';
    domains.forEach(domain => {
        document.querySelector('.domain-list').innerHTML += `<div class="domain-item">${domain} <button class="remove-domain" onclick="removeDomain('${domain}')"><i class="fa fa-trash"></i></button></div>`;
    });
}

function successNoti (message) {

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

    let noti = document.querySelector('#notification-popup');
    noti.classList.remove('notification-popup');
    noti.classList.add('failed-notification-popup');
    noti.style.display = 'block';
    document.querySelector('#notification-message').textContent = message;
    noti.style.animation = 'none';
    void noti.offsetHeight;
    noti.style.animation = "fade-in 0.5s ease-in-out, fade-out 0.5s ease-in-out 2s forwards";

}

async function getAdguardStatus () {

    try {
        const response = await fetch(`/cgi-bin/adguard-status`, {
            method: 'GET',
            headers: {'Accept': 'application/text'}
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.text();
        return data;
    } catch (error) {
        console.error('Error fetching adguard status:', error);
    }
}

async function updateAdguardStatus () {
    const status = await getAdguardStatus();
    if (status.trim() === 'enabled') {
        document.querySelector('#adg-toggle').checked = true;
    }else {
        document.querySelector('#adg-toggle').checked = false;
    }
}

async function getAdguardStats () {

    try {

        const response = await fetch(`/cgi-bin/get-adguard-stats`, {
            method: 'GET',
            headers: {'Accept': 'application/json'}
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching adguard stats:', error);
    }
}

async function loadAdguardStats () {
    const stats = await getAdguardStats();
    document.querySelector('#adg-totalQueries').textContent = stats.total_queries;
    document.querySelector('#adg-blockedQueries').textContent = stats.blocked_queries;
    document.querySelector('#adg-blockedAdult').textContent = stats.adult_blocked;
    document.querySelector('#adg-blockRate').textContent = stats.blocked_percentage + '%';
}

async function getAdguardQueries () {

    try{

        const response = await fetch(`/cgi-bin/get-adguard-queries`, {
            method: 'GET',
            headers: {'Accept': 'application/text'}
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.text();
        return data;

    } catch (error) {
        console.error('Error fetching adguard queries:', error);
    }
}

async function loadAdguardQueries () {
    let loadedqueries = await getAdguardQueries();
    let query;
    let splittedqueries = loadedqueries.split('\n');
    document.querySelector('.query-section').innerHTML = '';
    splittedqueries.forEach(lquery => {
        query = lquery.split(' ');
        document.querySelector('.query-section').innerHTML += `<div class="query-item"><span><strong>Domain:</strong> ${query[0]}</span><span><strong>Type:</strong> ${query[1]}</span></div>`
    });

}

window.sortQueries = function () {
    var tableState = document.querySelector('.query-section');

    if (tableState.style.flexDirection === 'column') {
        tableState.style.flexDirection = 'column-reverse';
    } else {
        tableState.style.flexDirection = 'column';
    }
}

window.RefreshQueryLog = function () {
    loadAdguardQueries();
}

async function getDevices () {

    try {

        const response = await fetch(`/cgi-bin/get-connected-devices.py`, {
            method: 'GET',
            headers: {'Accept': 'application/json'}
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        hostnames = {};
        data.devices.forEach(device => {
            hostnames[device.mac] = device.hostname;
        });
        return data;
    } catch (error) {
        console.error('Error fetching connected devices:', error);
    }
}

async function loadConnectedDevices (className) {
    const Cdevices = await getDevices();
    const deviceList = document.querySelector(`.${className}`);
    if (className === 'device_selector') {
        deviceList.innerHTML = '<option value="all">All</option>';
    }else {
        deviceList.innerHTML = '';
    }

    Cdevices.devices.forEach(device => {
        deviceList.innerHTML += `<option value="${device.mac}">${device.hostname} (${device.mac})</option>`;
    });
}


window.addDomainRule = async function () {

    if(domains.length === 0) {
        errorNoti('Enter at least one domain.');
        return;
    }

    let timeStart = '';
    let timeEnd = '';
    let days = [];
    let mac = document.querySelector('.device_selector').value;
    if (mac === 'all') {
        mac = '';
    }

    if (document.querySelector('#schedule-toggle').checked) {
        timeStart = document.querySelector('#time_start').value;
        timeEnd = document.querySelector('#time_end').value;
        document.querySelectorAll('.day-checkbox-group input[type="checkbox"]:checked').forEach(checkbox => {
            days.push(checkbox.value);
        });
    }

    if (timeStart === '' && timeEnd !== '' || timeStart !== '' && timeEnd === '') {
        errorNoti('Either fill both times or leave both empty.');
        return;
    }else if (timeStart !== '' && timeEnd !== '') {
        timeStart += `:00`;
        timeEnd += ':00';
    }else {
        timeStart = '';
        timeEnd = '';
    }

    domains.forEach(async (domain, index) => {
        await fetchAddDomain(`custom-filter-${Math.floor(Date.now() / 1000)}-${index}`, mac, domain, timeStart, timeEnd, days.join(' '));
    });

    closeAddRule('addDomainRule-card');
}

async function fetchAddDomain (rulename, mac, domain, timeStart, timeEnd, days) {

    try {

        const response = await fetch(`/cgi-bin/parental-domain-action?cmd=add&rule_name=${encodeURIComponent(rulename)}&domain=${encodeURIComponent(domain)}&action=block&src_mac=${encodeURIComponent(mac)}&weekdays=${encodeURIComponent(days)}&start_time=${encodeURIComponent(timeStart)}&stop_time=${encodeURIComponent(timeEnd)}`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        if (data.status !== 'success') {
            errorNoti(data.message);
            return;
        }
        successNoti(data.message);
        await getDomainRules();
    } catch (error) {
        console.error('Error adding domain:', error);
    }
}

async function loadDomainRules () {

    try {

        const response = await fetch(`/cgi-bin/parental-domain-action?cmd=list`);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error loading domain rules:', error);
    }
}

async function getDomainRules () {

    const domainrules = await loadDomainRules();
    document.querySelector('.rule-section').innerHTML = '';

    domainrules.data.rules.forEach(rule => {
        const ruleItem = document.createElement('div');
        ruleItem.className = 'domainRule-item';

        const weekdays = rule.weekdays ? rule.weekdays : [];
        if (weekdays.length === 0) {
            weekdays.push('Everyday');
        }

        const startTime = rule.start_time ? rule.start_time : '00:00';
        const stopTime = rule.stop_time ? rule.stop_time : '23:59';

        ruleItem.innerHTML = `
            <span>${rule.domain}</span>
            <span>From ${startTime} To ${stopTime}</span>
            <span>${weekdays}</span>
            <button onclick="removeDomainRule('${rule.name}')"><i class="fa fa-trash"></i></button>
        `;
        document.querySelector('.rule-section').appendChild(ruleItem);
    });

}

window.removeDomainRule = async function (rulename) {
    try {
        const response = await fetch(`/cgi-bin/parental-domain-action?cmd=delete&rule_name=${encodeURIComponent(rulename)}`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        if (data.status !== 'success') {
            errorNoti(data.message);
            return;
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
        await getDomainRules();
    } catch (error) {
        console.error('Error removing domain:', error);
    }
}

window.addAccessRule = async function () {

    let timeStart = document.querySelector('#time-start').value;
    let timeEnd = document.querySelector('#time-end').value;
    if ( timeStart === '' || timeEnd === '') {
        errorNoti('Please fill in all fields');
        return;
    }
    const mac = document.querySelector('.device-selector').value;

    if (mac === '') {
        errorNoti('Please select a device');
        return;
    }

    const days = [];
    document.querySelectorAll('.day-checkbox-group input[type="checkbox"]:checked').forEach(checkbox => {
        days.push(checkbox.value);
    });

    await fetchAddAccessRule(`access-filter-${Math.floor(Date.now() / 1000)}`, mac, timeStart + ':00', timeEnd + ':00', days.join(' '));

    closeAddRule('addAccessRule-card');
}

async function fetchAddAccessRule (rulename, mac, timeStart, timeEnd, days) {

    try {
        const response = await fetch(`/cgi-bin/parental-access-action?action=add&name=${encodeURIComponent(rulename)}&mac=${encodeURIComponent(mac)}&start_time=${encodeURIComponent(timeStart)}&stop_time=${encodeURIComponent(timeEnd)}&weekdays=${encodeURIComponent(days)}`, {
            method: 'GET',
            headers: {'Content-Type': 'application/json'},
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        if (data.status !== 'success') {
            errorNoti(data.message);
            return;
        }
        successNoti(data.message);
        await getAccessRules();
    } catch (error) {
        console.error('Error adding access rule:', error);
    }
}

async function loadAccessRules () {

    try {

        const response = await fetch(`/cgi-bin/parental-access-action?action=get`);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        if (data.status !== 'success') {
            errorNoti(data.message);
            return;
        }
        return data.rules;
    } catch (error) {
        console.error('Error adding access rule:', error);
    }

}

async function getAccessRules () {

    const accessRules = await loadAccessRules();

    document.querySelector('.access-rule-list').innerHTML = '';

    accessRules.forEach( rule => {
        const ruleItem = document.createElement('div');
        ruleItem.className = 'accessRule-item';

        const weekdays = rule.weekdays ? rule.weekdays : [];
        if (weekdays.length === 0) {
            weekdays.push('Everyday');
        }

        const startTime = rule.start_time ? rule.start_time : '00:00';
        const stopTime = rule.stop_time ? rule.stop_time : '23:59';

        ruleItem.innerHTML = `
            <span>${hostnames[rule.src_mac]}</span>
            <span>From ${startTime} To ${stopTime}</span>
            <span>${weekdays}</span>
            <button onclick="removeAccessRule('${rule.name}')"><i class="fa fa-trash"></i></button>
        `;
        document.querySelector('.access-rule-list').appendChild(ruleItem);
    });
}

window.removeAccessRule = async function (rulename) {

    try {

        const response = await fetch(`/cgi-bin/parental-access-action?action=remove&name=${encodeURIComponent(rulename)}`, {
            method: 'GET',
            headers: {'Content-Type': 'application/json'},
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        if (data.status !== 'success') {
            errorNoti(data.message);
            return;
        }
        await getAccessRules();
    } catch (error) {
        console.error('Error removing access rule:', error);
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    await getDevices();
    updateAdguardStatus();
    loadAdguardStats();
    getDomainRules();
    getAccessRules();
    loadAdguardQueries();
    auth.monitorActivity();
    console.log(auth.getSessionInfo());
});
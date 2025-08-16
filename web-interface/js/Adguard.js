import RouterAuth from "./Auth.js";

const auth = new RouterAuth();

if (!auth.isAuthenticated()) {
    window.location.href = "Main.html";
}

let domains = [];

window.closeAddRule = function (id) {
    document.querySelector(`#${id}`).style.display = 'none';

    if (id === 'addDomainRule-card') {
        domains = [];
        document.querySelector('.device_selector').value = 'all';
        document.querySelector('#custom-rule').value = '';
        document.querySelector('#time_start').value = '';
        document.querySelector('#time_end').value = '';
    }else{
        document.querySelector('.device-selector').value = 'all';
        document.querySelector('#time-start').value = '';
        document.querySelector('#time-end').value = '';
    }
}

window.openAddRule = function (id) {
    document.querySelector(`#${id}`).style.display = 'flex';
}

window.toggleSchedule = function () {
    if (document.querySelector('.time-input').style.display === 'none') {
        document.querySelector('.time-input').style.display = 'flex';
    } else {
        document.querySelector('.time-input').style.display = 'none';
    }
}


window.addToList = function () {
    const domain = document.querySelector('#custom-rule').value.trim();

    const domainRegex = /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (domainRegex.test(domain)) {
        domains.push(domain);
        document.querySelector('#custom-rule').value = '';
    } else {
        errorNoti('Invalid domain - use valid format');
    }
}

window.addAccessRule = function () {

    let timeStart = document.querySelector('#time-start').value;
    let timeEnd = document.querySelector('#time-end').value;
    if ( timeStart === '' || timeEnd === '') {
        errorNoti('Please fill in all fields');
        return;
    }
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








document.addEventListener('DOMContentLoaded', async () => {
    updateAdguardStatus();
    loadAdguardStats();
    loadAdguardQueries();
    auth.monitorActivity();
    console.log(auth.getSessionInfo());
});
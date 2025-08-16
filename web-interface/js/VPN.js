import RouterAuth from "./Auth.js";

const auth = new RouterAuth();


if (!auth.isAuthenticated()) {
    window.location.href = "Main.html";
}

let server;
let originalIP;
let vpnToggle = document.querySelector('#vpn-toggle');
let vpnstatus;
const span = document.querySelector(".app-title i");

async function loadIP (box) {

    originalIP = await getIP();
    document.querySelector(`#${box}`).textContent = originalIP;

}

function getSelectedServer () {
    const serverSelect = document.querySelector('.server-select');
    server = serverSelect.value;
}

window.connectToServer = async function () {

    getSelectedServer();

    if (!server) {
        alert('Please select a server.');
        return;
    }

    try {
        switch (server) {
            case "United States":
                document.querySelector('#server-name').textContent = server;
                await fetchServer("usa");
                break;

            case "Japan":
                document.querySelector('#server-name').textContent = server;
                await fetchServer("japan");
                break;

            case "Netherlands":
                document.querySelector('#server-name').textContent = server;
                await fetchServer("netherland");
                break;

            default:
                throw new Error("Unknown server selected");
        }
    } catch (error) {
        console.log(error.message);
        return;
    }


}

async function fetchServer (name) {

    try {

        await fetch(`/cgi-bin/${name}-server`);

        vpnstatus = await getVPNstatus();

        if (vpnstatus.status === 'connected'){
            vpnToggle.checked = true;
            loadIP('vpn-ip');
            setColorOn();
        } else {
            vpnToggle.checked = false;
            document.querySelector('#server-name').textContent = "--";
            document.querySelector('#vpn-ip').textContent = "---";
            setColorOff();
        }
    } catch (error) {
        console.error('Error fetching server data:', error);
    }
}

async function disconnectFromServer () {

    try {
        await fetch('/cgi-bin/vpn-kill');

        await new Promise(resolve => setTimeout(resolve, 3000));

        vpnstatus = await getVPNstatus();

        if (vpnstatus.status === 'connected'){
            vpnToggle.checked = true;
            loadIP('vpn-ip');
            setColorOn();
        } else {
            vpnToggle.checked = false;
            document.querySelector('#server-name').textContent = "--";
            document.querySelector('#vpn-ip').textContent = "---";
            setColorOff();
        }

    } catch (error) {
        console.error('Error disconnecting from server:', error);
    }
}

async function getIP () {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
    } catch (error) {
        console.error('Failed to get IP:', error);
        return '---';
    }
}

window.toggleVPN = async function () {

    if (vpnToggle.checked) {
        connectToServer();
    } else {
        disconnectFromServer();
    }
}

async function getVPNstatus () {
    try {
        const response = await fetch('/cgi-bin/vpn_status');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Failed to get VPN status:', error);
        return '---';
    }
}

async function setToggle () {

    vpnstatus = await getVPNstatus();

    if (vpnstatus.config_name === 'usa.conf') {
        document.querySelector('.server-select').value = "United States";
        document.querySelector('#server-name').textContent = "United States";
        vpnToggle.checked = true;
        setColorOn();
        loadIP('vpn-ip');
    } else if (vpnstatus.config_name === 'japan.conf') {
        document.querySelector('.server-select').value = "Japan";
        document.querySelector('#server-name').textContent = "Japan";
        vpnToggle.checked = true;
        loadIP('vpn-ip');
        setColorOn();
    } else if (vpnstatus.config_name === 'neth.conf') {
        document.querySelector('.server-select').value = "Netherlands";
        document.querySelector('#server-name').textContent = "Netherlands";
        vpnToggle.checked = true;
        loadIP('vpn-ip');
        setColorOn();
    }else {
        return;
    }

}

function setColorOn () {

    const element = document.querySelector(".app-title");
    element.style.background = 'var(--vpn-on-background)';
    element.style.webkitBackgroundClip = 'text';
    element.style.backgroundClip = 'text';
    element.style.color = 'transparent';

    span.addEventListener('mouseenter', () => {
         span.style.textShadow = `0 0 10px var(--vpn-on-shadow),
                                0 0 20px var(--vpn-on-shadow),
                                0 0 40px var(--vpn-on-shadow)`;
    })

    span.addEventListener('mouseleave', () => {
        span.style.textShadow = '';
    });

    document.querySelector(".back-button").style.background = 'var(--vpn-on-background)';
    document.querySelector(".vpn-card").style.background = 'var(--vpn-on-background)';
    document.querySelector(".vpn-card").style.boxShadow = '0 0 10px var(--vpn-on-shadow)';
    document.querySelector(".server-card").style.boxShadow = '0 0 10px var(--vpn-on-shadow)';
    document.querySelector(".server-card").style.border = ' 1px solid var(--vpn-on-shadow)';
    document.querySelector(".server-card select").style.border = ' 1px solid var(--vpn-on-shadow)';
    document.querySelector(".vpn-status").textContent = "Protected";
    document.querySelector(".connect-button").style.background = 'var(--vpn-on-background)';
    document.querySelectorAll(".info-label").forEach(label => {
        label.style.color = "rgba(255, 255, 255, 1)";
        label.style.fontSize = "17px";
    })
}

function setColorOff () {

    const element = document.querySelector(".app-title");
    element.style.background = 'var(--vpn-off-background)';
    element.style.webkitBackgroundClip = 'text';
    element.style.backgroundClip = 'text';
    element.style.color = 'transparent';

    span.addEventListener('mouseenter', () => {
         span.style.textShadow = `0 0 10px var(--dark-shadow),
                                0 0 20px var(--dark-shadow),
                                0 0 40px var(--dark-shadow)`;
    })

    span.addEventListener('mouseleave', () => {
        span.style.textShadow = '';
    });

    document.querySelector(".back-button").style.background = 'var(--vpn-off-background)';
    document.querySelector(".vpn-card").style.background = 'var(--vpn-off-background)';
    document.querySelector(".vpn-card").style.boxShadow = '0 0 10px var(--dark-shadow)';
    document.querySelector(".server-card").style.boxShadow = '0 0 10px var(--dark-shadow)';
    document.querySelector(".server-card").style.border = ' 1px solid var(--dark-shadow)';
    document.querySelector(".server-card select").style.border = ' 1px solid var(--dark-shadow)';
    document.querySelector(".vpn-status").textContent = "Unprotected";
    document.querySelector(".connect-button").style.background = 'var(--vpn-off-background)';
}


document.addEventListener('DOMContentLoaded',async  function() {
    loadIP('original-ip');
    setToggle();
    auth.monitorActivity();
    console.log(auth.getSessionInfo());
});
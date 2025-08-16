# Smart Bridge Router: Secure and Adaptive Connectivity Anywhere  

An **OpenWrt-based smart travel router** built on a Raspberry Pi 4, providing **VPN, AdGuard, firewall management, device monitoring, and real-time statistics** through a **custom web dashboard**.  

This project was developed as a **Senior Project** at the **Lebanese International University (LIU), School of Engineering** under the supervision of Dr. Abdel-Mehsen Ahmad.  

## Authors

**Moayad K. Salloum** – @Moayad717
**Yousef R. Younis** – @yousef.r.younis
---

## Key Features

**Security & Privacy**

* OpenVPN support (ProtonVPN: Japan, USA, Netherlands)
* AdGuard Home for ad, malware, and tracker blocking
* Guest network isolation and firewall management

**Network Management**

* Real-time device monitoring
* Bandwidth control per device or network
* Parental controls: website blocking and time restrictions
* Easy port forwarding

**Web Dashboard**

* Responsive interface for desktop, tablet, and mobile
* One-click toggles for VPN, DNS, and network services
* Built-in speed test and QR code sharing

**Performance & Reliability**

* Smart Queue Management (SQM) for traffic prioritization
* Self-healing Wi-Fi and network auto-repair
* System metrics: CPU load, temperature, and network health
* Scheduled maintenance and automatic reboots

---

## Quick Start

**Access the Web Dashboard**

* Wi-Fi: `MY Wi-Fi`
* Browser: `http://70.70.70.1/main.html`
* Login: `root` / `tonystark`

**Default Wi-Fi**: Main `MY Wi-Fi`, Guest `Guest Wi-Fi` (disabled by default)

---

## Web Interface Pages

| Page      | Purpose                               |
| --------- | ------------------------------------- |
| Login     | Secure authentication                 |
| Dashboard | System overview and device management |
| VPN       | VPN server selection and logs         |
| AdGuard   | DNS filtering and parental controls   |
| Guest     | Guest network management              |
| Settings  | Advanced configuration                |

---

## Use Cases

* Home users: secure and controlled home networks
* Travelers: safe public Wi-Fi access
* Families: parental controls and safe browsing
* Gamers: QoS and VPN for reduced latency
* Small businesses: guest network and device management
* Students: learn networking and OpenWrt

---

## System Requirements

**Hardware**

* Raspberry Pi 4, 4GB+ RAM
* MicroSD 32GB+
* USB Wi-Fi adapter + Ethernet

**Software**

* OpenWrt 21.02+
* AdGuard Home, OpenVPN, uhttpd
* Modern browser (Chrome, Firefox, Safari)

---

## Documentation

For advanced setup, scripts, and configuration details, see:
`docs/Implementation_Details.md`

Other docs:

* `docs/Final_Report.pdf` – Full project report
* `docs/User_Manual.md` – Step-by-step user guide
* `docs/Deployment_Guide.md` – Installation instructions

---

## Troubleshooting

**Common issues**

* Can't access dashboard → check Wi-Fi or `http://70.70.70.1`
* No internet → use “Repair Wi-Fi” in Settings
* VPN not connecting → verify server credentials
* Device not blocked → check MAC address and firewall rules

---

## License

MIT License – see `LICENSE`

---

*Lebanese International University – Spring 2024–2025*



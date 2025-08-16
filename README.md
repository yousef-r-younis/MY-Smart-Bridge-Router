# Smart Bridge Router: Secure and Adaptive Connectivity Anywhere  

An **OpenWrt-based smart travel router** built on a Raspberry Pi 4, providing **VPN, AdGuard, firewall management, device monitoring, and real-time statistics** through a **custom web dashboard**.  

This project was developed as a **Senior Project** at the **Lebanese International University (LIU), School of Engineering**.  

---

## 🚀 Features  
- 🔒 **VPN Integration (OpenVPN)** – Secure internet traffic on public networks  
- 🛡️ **AdGuard Home** – Network-wide ad & tracker blocking  
- 🔧 **Firewall & Device Management** – Block/allow devices, parental controls  
- 📊 **Smart Queue Management (SQM)** – Optimize bandwidth and reduce latency  
- 📡 **Guest Wi-Fi** – Isolated guest network with SSID, bandwidth limits, and QR code  
- 💻 **Web-Based Dashboard** – Responsive UI (HTML, CSS, JS + Bash CGI)  
- 📈 **System Monitoring** – CPU usage, system load, temperature, and speed tests  

---

## 📂 Repository Structure  
MY-Smart-Bridge-Router/
│── docs/ # Final report, user manual, deployment guide
│ └── Final_Report.pdf
│── src/
│ ├── cgi-bin/ # Bash CGI scripts
│ ├── www/ # HTML, CSS, JS frontend
│ └── configs/ # OpenWrt, firewall, VPN configs
│── README.md # Project overview (this file)
│── LICENSE # Open-source license

---

## 🔧 Installation & Setup  
1. Flash **OpenWrt** on Raspberry Pi 4.  
2. Set LAN IP (e.g., `70.70.70.1`).  
3. Copy CGI scripts to `/www/cgi-bin/`.  
4. Copy frontend files to `/www/`.  
5. Install & configure:  
   - **AdGuardHome** (edit `dnsmasq` settings)  
   - **OpenVPN** with `.conf` and `.auth` files  
6. Access the router dashboard in your browser:  
http://70.70.70.1/main.html

---

## 📘 Documentation  
- 📑 [Final Report](docs/Final_Report.pdf)  
- 📖 [User Manual](docs/User_Manual.pdf)  
- ⚙️ [Deployment & Configuration Manual](docs/Deployment_Guide.pdf)  

---

## 👨‍💻 Authors  
- **Yousef R. Younis** – 22230294  
- **Moayad K. Salloum** – 22230296  

Supervised by: **Dr. Abdel-Mehsen Ahmad**  

---

## 📜 License  
This project is licensed under the **MIT License** – see [LICENSE](LICENSE) for details.  

---

## ⭐ Acknowledgments  
- **OpenWrt Community** for firmware and support  
- **AdGuard & OpenVPN** open-source tools  
- **Lebanese International University (LIU)**, School of Engineering  

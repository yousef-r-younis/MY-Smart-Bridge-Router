export default class RouterAuth {
    constructor() {
        this.sessionTimeout = 15 * 60 * 1000; // 15 minutes
        this.warningTime = 2 * 60 * 1000; // 2 minutes
        this.timeoutId = null;
        this.warningId = null;
        this.maxLoginAttempts = 5;
        this.lockoutDuration = 15 * 60 * 1000; // 15 minutes

        this.validCredentials = {
            username: 'root',
            password: 'tonystark'
        };

        if (this.isAuthenticated()) {
            this.startSessionTimer();
        }

    }

    async login(credentials) {
        try {

            if (this.isLockedOut()) {
                throw new Error(`Account locked. Try again in ${(this.getRemainingLockoutTime() / 60000).toFixed(0)} minutes.`);
            } else {

                if (credentials.username === this.validCredentials.username && credentials.password === this.validCredentials.password) {

                    const token = btoa(JSON.stringify({
                        username: credentials.username,
                        loginTime: Date.now(),
                        exp: Date.now() + this.sessionTimeout
                    }));

                    sessionStorage.setItem('routerAuth', token);
                    sessionStorage.setItem('loginTime', Date.now().toString());
                    sessionStorage.setItem('lastEvent', sessionStorage.getItem('loginTime'));


                    this.clearLoginAttempts();

                    return { success: true, message: 'Login successful' };
                } else {
                    this.incrementLoginAttempts();
                    throw new Error(`Invalid username or password (${this.getRemainingAttempts()}/${this.maxLoginAttempts})`);
                }
            }
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    getTimeLeft() {
        const loginTime = sessionStorage.getItem('loginTime');
        if (!loginTime) return 0;

        const elapsed = Date.now() - parseInt(loginTime);
        const remaining = this.sessionTimeout - elapsed;

        return remaining > 0 ? remaining : 0;
    }

    isAuthenticated() {
        const token = sessionStorage.getItem('routerAuth');
        const loginTime = sessionStorage.getItem('loginTime');

        if (!token || !loginTime) return false;

        const elapsed = Date.now() - parseInt(loginTime);
        if (elapsed > this.sessionTimeout) {
            this.logout();
            return false;
        }

        return true;
    }

    extendSession() {
        if (this.isAuthenticated()) {
            sessionStorage.setItem('loginTime', Date.now().toString());
            this.startSessionTimer();
        }
    }

    startSessionTimer() {
    if (this.timeoutId) clearTimeout(this.timeoutId);
    if (this.warningId) clearTimeout(this.warningId);

    const remainingTime = this.getTimeLeft();
    if (remainingTime <= 0) {
        this.logout();
        return;
    }

    if (remainingTime > this.warningTime) {
        const warningDelay = remainingTime - this.warningTime;
        this.warningId = setTimeout(() => {
            if (this.isAuthenticated()) {
                if (confirm('Session will expire in 2 minutes. Stay logged in?')) {
                    this.extendSession();
                }
            }
        }, warningDelay);
    }

    this.timeoutId = setTimeout(() => {
        if (this.isAuthenticated()) {
            alert('Session expired for security. Please log in again.');
            this.logout();
        }
    }, remainingTime);
}

    logout() {
        sessionStorage.removeItem('routerAuth');
        sessionStorage.removeItem('loginTime');
        sessionStorage.removeItem('lastEvent');

        if (this.timeoutId) clearTimeout(this.timeoutId);
        if (this.warningId) clearTimeout(this.warningId);

        window.location.href = '/Main.html';
    }

    monitorActivity() {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    let lastActivity = parseInt(sessionStorage.getItem('lastEvent')) || Date.now();
    let isThrottled = false;

    const handleActivity = () => {
        if (isThrottled) return;

        const now = Date.now();
        if (now - lastActivity > 60000) { // 1 minute
            this.extendSession();
            lastActivity = now;
            sessionStorage.setItem('lastEvent', lastActivity.toString());
        }

        isThrottled = true;
        setTimeout(() => {
            isThrottled = false;
        }, 2000);
    };

    events.forEach(event => {
        document.addEventListener(event, handleActivity, { passive: true });
    });
}

    incrementLoginAttempts() {
        const attempts = this.getLoginAttempts() + 1;
        sessionStorage.setItem('loginAttempts', attempts.toString());

        if (attempts >= this.maxLoginAttempts) {
            sessionStorage.setItem('lockoutUntil', (Date.now() + this.lockoutDuration).toString());
        }
    }

    getLoginAttempts() {
        const attempts = sessionStorage.getItem('loginAttempts');
        return attempts ? parseInt(attempts) : 0;
    }

    clearLoginAttempts() {
        sessionStorage.removeItem('loginAttempts');
        sessionStorage.removeItem('lockoutUntil');
    }

    isLockedOut() {
        const lockoutUntil = sessionStorage.getItem('lockoutUntil');
        if (!lockoutUntil) return false;

        const lockoutTime = parseInt(lockoutUntil);
        const isLocked = Date.now() < lockoutTime;

        if (!isLocked) {
            sessionStorage.removeItem('lockoutUntil');
        }

        return isLocked;
    }

    getRemainingLockoutTime() {
        const lockoutUntil = sessionStorage.getItem('lockoutUntil');

        if (!lockoutUntil) return 0;
        const lockoutTime = parseInt(lockoutUntil);
        const remaining = lockoutTime - Date.now();
        return remaining > 0 ? remaining : 0;
    }

    getRemainingAttempts() {
        const currentAttempts = this.getLoginAttempts();
        return this.maxLoginAttempts - currentAttempts;
    }

    getSessionInfo() {
        return {
            isAuthenticated: this.isAuthenticated(),
            timeLeftMinutes: Math.ceil(this.getTimeLeft() / 60000),
            loginAttempts: this.getLoginAttempts(),
            maxAttempts: this.maxLoginAttempts,
            remainingAttempts: this.getRemainingAttempts(),
            isLockedOut: this.isLockedOut(),
            lockoutMinutesRemaining: Math.ceil(this.getRemainingLockoutTime() / 60000)
        };
    }

}


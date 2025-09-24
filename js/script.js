// Basic scaffold: mobile menu, theme toggle, year, smooth anchor helpers
(function () {
    const mobileMenuButton = document.getElementById('mobileMenuButton');
    const mobileMenu = document.getElementById('mobileMenu');
    const themeToggle = document.getElementById('themeToggle');
    const themeToggleMobile = document.getElementById('themeToggleMobile');
    const yearEl = document.getElementById('year');
    const contactForm = document.getElementById('contactForm');

    // Footer year
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }

    // Mobile menu toggle
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', () => {
            const isHidden = mobileMenu.classList.contains('hidden');
            mobileMenu.classList.toggle('hidden', !isHidden);
            mobileMenuButton.setAttribute('aria-expanded', String(isHidden));
        });
        // Close on click of any link
        mobileMenu.querySelectorAll('a').forEach((a) => {
            a.addEventListener('click', () => {
                mobileMenu.classList.add('hidden');
                mobileMenuButton.setAttribute('aria-expanded', 'false');
            });
        });
    }

    // Theme toggle (persist in localStorage)
    const applyTheme = (dark) => {
        const root = document.documentElement;
        root.classList.toggle('dark', dark);
        localStorage.setItem('theme', dark ? 'dark' : 'light');
    };

    const initTheme = () => {
        const stored = localStorage.getItem('theme');
        if (stored === 'dark') return applyTheme(true);
        if (stored === 'light') return applyTheme(false);
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        applyTheme(prefersDark);
    };
    initTheme();

    const toggleHandlers = [themeToggle, themeToggleMobile].filter(Boolean);
    toggleHandlers.forEach((btn) => {
        btn.addEventListener('click', () => {
            const isDark = document.documentElement.classList.contains('dark');
            applyTheme(!isDark);
            btn.setAttribute('aria-pressed', String(!isDark));
        });
    });

    // Toast helper
    const showToast = (message, type = 'success') => {
        const toast = document.createElement('div');
        toast.role = 'status';
        toast.ariaLive = 'polite';
        toast.textContent = message;
        toast.className = `fixed inset-x-0 top-4 mx-auto w-fit max-w-[90%] rounded-lg px-4 py-2 text-sm font-medium shadow-lg z-[9999] ${
            type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
        }`;
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.classList.add('opacity-0');
            toast.classList.add('transition-opacity');
            toast.classList.add('duration-300');
        }, 1800);
        setTimeout(() => toast.remove(), 2200);
    };

    // EmailJS integration
    const EMAILJS_SERVICE_ID = 'service_aiowirp';
    const EMAILJS_TEMPLATE_ID = 'template_6qkn4dw';
    const EMAILJS_PUBLIC_KEY = 'L6kiY1IEbvJegZCZu';

    if (window.emailjs && typeof window.emailjs.init === 'function') {
        window.emailjs.init(EMAILJS_PUBLIC_KEY);
    }

    const isValidEmail = (value) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    };

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitButton = contactForm.querySelector('button[type="submit"]');
            const name = contactForm.name.value.trim();
            const email = contactForm.email.value.trim();
            const message = contactForm.message.value.trim();
            const recaptchaResponse = (window.grecaptcha && window.grecaptcha.getResponse) ? window.grecaptcha.getResponse() : '';

            // Client-side validation
            if (!name || !email || !message) {
                showToast('❌ Please fill out all required fields.', 'error');
                return;
            }
            if (!isValidEmail(email)) {
                showToast('❌ Please enter a valid email address.', 'error');
                return;
            }
            if (!recaptchaResponse) {
                showToast('❌ Please complete the reCAPTCHA.', 'error');
                return;
            }

            // Disable submit to prevent multiple sends
            const originalText = submitButton.textContent;
            submitButton.disabled = true;
            submitButton.textContent = 'Sending...';

            try {
                const templateParams = {
                    from_name: name,
                    from_email: email,
                    message: message,
                    'g-recaptcha-response': recaptchaResponse,
                };

                await window.emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams);
                contactForm.reset();
                showToast('✅ Message sent successfully!', 'success');
            } catch (err) {
                console.error('EmailJS error:', err);
                showToast('❌ Something went wrong. Please try again.', 'error');
            } finally {
                submitButton.disabled = false;
                submitButton.textContent = originalText;
                if (window.grecaptcha && window.grecaptcha.reset) {
                    window.grecaptcha.reset();
                }
            }
        });
    }
})();


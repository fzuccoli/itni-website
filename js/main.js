// ITNI Main JS

document.addEventListener('DOMContentLoaded', () => {
    // Initialize AOS Animations
    if(typeof AOS !== 'undefined') {
        AOS.init({
            once: true, // Whether animation should happen only once - while scrolling down
            offset: 80, // Offset (in px) from the original trigger point
            duration: 800, // Values from 0 to 3000, with step 50ms
            easing: 'ease-out-cubic', // Default easing for AOS animations
        });
    }

    // Mobile Menu Toggle Logic
    const mobileBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if(mobileBtn && mobileMenu) {
        mobileBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });

        // Close mobile menu when clicking a link
        const mobileLinks = document.querySelectorAll('.mobile-link');
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.add('hidden');
            });
        });
    }

    // Header scroll glassmorphism logic
    const header = document.getElementById('header');
    if(header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 20) {
                // Add shadow and reduce transparency on scroll
                header.classList.add('shadow-md', 'bg-brand-dark2/95');
                header.classList.remove('bg-brand-dark2/85');
            } else {
                header.classList.remove('shadow-md', 'bg-brand-dark2/95');
                header.classList.add('bg-brand-dark2/85');
            }
        });
    }

    // Form validation and mock submission
    const form = document.getElementById('contact-form');
    if(form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault(); // Prevent page reload
            
            const btn = form.querySelector('button[type="submit"]');
            const originalHtml = btn.innerHTML;
            
            // Visual feedback for sending
            btn.innerHTML = '<span>Enviando...</span><i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i>';
            btn.disabled = true;
            lucide.createIcons(); // re-init icons
            
            // Mock API request delay
            setTimeout(() => {
                btn.innerHTML = '<span>Mensagem Enviada!</span><i data-lucide="check-circle" class="w-4 h-4"></i>';
                btn.classList.add('bg-green-500');
                btn.classList.remove('bg-brand-primary', 'hover:bg-brand-secondary');
                lucide.createIcons();
                form.reset();
                
                // Reset button after 3 seconds
                setTimeout(() => {
                    btn.innerHTML = originalHtml;
                    btn.disabled = false;
                    btn.classList.remove('bg-green-500');
                    btn.classList.add('bg-brand-primary', 'hover:bg-brand-secondary');
                    lucide.createIcons();
                }, 3000);
            }, 1500);
        });
    }

    // Modal Logic
    const modalOverlay = document.getElementById('modal-overlay');
    const modalTriggers = document.querySelectorAll('.footer-modal-trigger');
    const modalCloses = document.querySelectorAll('.modal-close');
    const modals = document.querySelectorAll('.modal-card');

    const openModal = (modalId) => {
        const targetModal = document.getElementById(`modal-${modalId}`);
        if (targetModal && modalOverlay) {
            // Hide all modals first
            modals.forEach(m => m.style.display = 'none');
            
            // Show overlay and target modal
            modalOverlay.style.display = 'flex';
            targetModal.style.display = 'block';
            
            // Trigger animation
            setTimeout(() => {
                modalOverlay.classList.add('active');
            }, 10);

            // Scroll lock
            document.body.style.overflow = 'hidden';

            // Focus on close button for accessibility
            const closeBtn = targetModal.querySelector('.modal-close');
            if (closeBtn) {
                setTimeout(() => closeBtn.focus(), 100);
            }
        }
    };

    const closeModal = () => {
        if (modalOverlay) {
            modalOverlay.classList.remove('active');
            
            // Wait for transition to finish before hiding elements
            setTimeout(() => {
                modalOverlay.style.display = 'none';
                modals.forEach(m => m.style.display = 'none');
                document.body.style.overflow = '';
            }, 300);
        }
    };

    modalTriggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            const modalId = trigger.getAttribute('data-modal');
            openModal(modalId);
        });
    });

    modalCloses.forEach(close => {
        close.addEventListener('click', closeModal);
    });

    // Close on overlay click
    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) closeModal();
        });
    }

    // Close on ESC key
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modalOverlay && modalOverlay.classList.contains('active')) {
            closeModal();
        }
    });

    // Accessibility: Trap focus in modal
    modalOverlay.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            const activeModal = Array.from(modals).find(m => m.style.display === 'block');
            if (!activeModal) return;

            const focusableElements = activeModal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];

            if (e.shiftKey) { // Shift + Tab
                if (document.activeElement === firstElement) {
                    lastElement.focus();
                    e.preventDefault();
                }
            } else { // Tab
                if (document.activeElement === lastElement) {
                    firstElement.focus();
                    e.preventDefault();
                }
            }
        }
    });
});

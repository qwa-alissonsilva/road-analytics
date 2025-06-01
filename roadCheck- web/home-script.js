document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    const carousel = document.querySelector('.carousel');
    const slides = carousel.querySelectorAll('.carousel-item');
    let currentSlide = 0;
    let slideInterval;

    function goToSlide(index) {
        slides[currentSlide].classList.remove('active');
        currentSlide = (index + slides.length) % slides.length;
        slides[currentSlide].classList.add('active');
    }

    function nextSlide() {
        goToSlide(currentSlide + 1);
    }

    function startSlideShow() {
        if (slideInterval) {
            clearInterval(slideInterval);
        }
        slideInterval = setInterval(nextSlide, 3000);
    }

    carousel.addEventListener('mouseenter', () => {
        clearInterval(slideInterval);
    });

    carousel.addEventListener('mouseleave', startSlideShow);

    startSlideShow();

    let currentCounter = 1;
    const counterItems = document.querySelectorAll('.counter-item');
    
    function updateCounter() {
        counterItems.forEach((item, index) => {
            item.style.opacity = index + 1 === currentCounter ? '1' : '0.5';
        });
        currentCounter = currentCounter === 3 ? 1 : currentCounter + 1;
    }

    setInterval(updateCounter, 3000);
}); 
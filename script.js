const menuOpenButton = document.querySelector("#menu-open-button");
const menuCloseButton = document.querySelector("#menu-close-button");

// Menu buttons logic
if (menuOpenButton && menuCloseButton) {
    menuOpenButton.addEventListener("click", () => {
        document.body.classList.toggle("snow-mobile-menu");
    });

    menuCloseButton.addEventListener("click", () => {
        document.body.classList.remove("snow-mobile-menu");
    });
}

// Fixed Menu Logic (Closes when a link is clicked)
function initNavLinks() {
    const navLinks = document.querySelectorAll(".nav-menu .nav-link");
    navLinks.forEach(link => {
        link.addEventListener("click", () => {
            document.body.classList.remove("snow-mobile-menu");
        });
    });
}

// AJAX Form Submission (Prevents Formspree redirect and resets form)
async function handleFormSubmit(event) {
    event.preventDefault(); // THIS is what stops the new Formspree tab

    const form = event.target;
    const button = form.querySelector(".submit-button");
    const actionUrl = form.action;

    // Safety check: Don't submit if URL isn't loaded from CMS
    if (!actionUrl || actionUrl.includes("#") || actionUrl === window.location.href) {
        alert("Form destination not set. Please check CMS.");
        return;
    }

    button.disabled = true;
    button.textContent = "Sending...";

    try {
        const response = await fetch(actionUrl, {
            method: 'POST',
            body: new FormData(form),
            headers: { 'Accept': 'application/json' }
        });

        if (response.ok) {
            alert("Success! Your message has been sent.");
            form.reset(); // Clears the form fields
        } else {
            alert("Error sending message. Please try again.");
        }
    } catch (error) {
        alert("Could not connect to the server.");
    } finally {
        button.disabled = false;
        button.textContent = "Submit";
    }
}

// Main Data Fetch and Initialization
document.addEventListener("DOMContentLoaded", () => {
    fetch("home.json")
        .then(res => res.json())
        .then(data => {
            // Render all sections
            renderHero(data.hero, data.service);
            renderAbout(data.about);
            renderPastors(data.pastors);
            renderLeaders(data.leaders);
            renderConnect(data.connect);
            renderSocials(data.socials);

            // Initialize Swipers
            if (document.querySelector('.leaders-slider')) {
                initLeadersSwiper();
            }
            if (document.querySelector('.about-swiper')) {
                initAboutSwiper();
            }

            // Initialize Nav Links
            initNavLinks();

            // ATTACH FORM LISTENER HERE (Crucial Step)
            const contactForm = document.getElementById("contact-form");
            if (contactForm) {
                contactForm.addEventListener("submit", handleFormSubmit);
            }
        })
        .catch(err => console.error("Error loading JSON:", err));

    // Copyright year
    const yearSpan = document.getElementById("current-year");
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();
});

//RENDER FUNCTIONS (Keep these as they were)
function renderHero(hero, service) {
    const heroSection = document.getElementById("hero");
    if (heroSection) {
        heroSection.innerHTML = `
            ${hero.video ? `<video autoplay muted loop playsinline class="background-video"><source src="${hero.video}" type="video/mp4"></video>` : ''}
            <div class="section-content">
                <div class="home-details">
                    <h1 class="title">${hero.title}</h1>
                    <h3 class="subtitle">${hero.subtitle}</h3>
                    <p class="verse">"${hero.verse}"</p>
                    <div class="button-wrapper"><a href="#connect" class="visit-us">Visit Us</a></div>
                    <div class="service-details">
                        <p class="service-day"><i class="fa-solid fa-calendar-days"></i> ${service.day}</p>
                        <p class="service-time"><i class="fa-solid fa-clock"></i> ${service.time}</p>
                        <p class="service-location"><i class="fa-solid fa-location-dot"></i> ${service.location}</p>
                    </div>
                </div>
            </div>`;
    }
}

//About section
async function renderAbout(about) {
    const aboutContent = document.getElementById("about-content");

    if (!aboutContent) return;

    let sliderImages = [];

    try {
        const response = await fetch("/.netlify/functions/get-gallery");
        sliderImages = await response.json();
        console.log("Fetched slider images:", sliderImages);
    } catch (error) {
        console.error("Error fetching gallery:", error);

        // fallback to CMS images
        sliderImages = (about.images || []).slice(0, 10);
    }

    aboutContent.innerHTML = `
        <div class="about-details">
            <h2 class="section-title">About Us</h2>

            <div class="about-text text">
                <p>${about.paragraph1}</p>
                <p>${about.paragraph2}</p>
            </div>
        </div>

        <div class="about-image-wrapper">
            <div class="swiper about-swiper">
                <div class="swiper-wrapper">

                    ${sliderImages.map(img => `
                        <div class="swiper-slide">
                            <img 
                                src="${img.url || img.image}" 
                                alt="About Us"
                                class="about-image"
                            >
                        </div>
                    `).join("")}

                </div>

                <div class="about-pagination swiper-pagination"></div>
                <div class="about-prev swiper-button-prev"></div>
                <div class="about-next swiper-button-next"></div>
            </div>

            ${about.galleryUrl ? `
                <div class="gallery-button-wrapper">
                    <a href="${about.galleryUrl}" target="_blank" class="photo-gallery-button">
                        <i class="fa-solid fa-images"></i>
                        View All Photos
                    </a>
                </div>
            ` : ""}
        </div>
    `;

    initAboutSwiper();
}

//function to escape string for bio
function escapeHtmlString(str) {
    if (!str) return "";
    return str
        .replace(/[\r\n]+/g, ' ')  
        .replace(/'/g, "\\'")      
        .replace(/"/g, "&quot;");  
}

function renderPastors(pastors) {
    const list = document.getElementById("pastor-list");
    if (list) {
        list.innerHTML = pastors.map(pastor => {
            const safeName = escapeHtmlString(pastor.name);
            const safeRole = escapeHtmlString(pastor.role);
            const safeBio = escapeHtmlString(pastor.bio);
            const safePhoto = escapeHtmlString(pastor.photo);

            return `
            <li class="pastor-name">
                <div class="profile-image-container">
                    <img src="${pastor.photo}" alt="${pastor.name}" class="pastor-image">
                    ${pastor.has_bio ? `
                        <div class="hover-overlay">
                             <div class="bio-button"
                                onclick="openBioModal('${safeName}', '${safeRole}', '${safeBio}', '${safePhoto}', '${pastor.facebook || ""}', '${pastor.instagram || ""}')">
                                <i class="fa-solid fa-address-card bio-icon"></i>
                                <span class="bio-text">READ BIO</span>
                            </div>
                        </div>
                    ` : ''}
                </div>
                <h3 class="name">${pastor.name}</h3>
                <p class="text">${pastor.role}</p>

            </li>`;
        }).join('');
    }
}

function renderLeaders(leaders) {
    const wrapper = document.getElementById("leaders-slider-wrapper");
    if (wrapper) {
        wrapper.innerHTML = leaders.map(leader => {
            const safeName = escapeHtmlString(leader.name);
            const safeRole = escapeHtmlString(leader.role);
            const safeBio = escapeHtmlString(leader.bio);
            const safePhoto = escapeHtmlString(leader.photo);

            return `
            <div class="leaders-name swiper-slide">
                <div class="profile-image-container">
                    <img src="${leader.photo}" alt="${leader.name}" class="leaders-image">
                    ${leader.has_bio ? `
                        <div class="hover-overlay">
                            <div class="bio-button"
                                onclick="openBioModal('${safeName}', '${safeRole}', '${safeBio}', '${safePhoto}', '${leader.facebook || ""}', '${leader.instagram || ""}')">
                                <i class="fa-solid fa-address-card bio-icon"></i>
                                <span class="bio-text">READ BIO</span>
                            </div>
                        </div>
                    ` : ''}
                </div>
                <h3 class="name">${leader.name}</h3>
                <p class="text">${leader.role}</p>

            </div>`;
        }).join('');
    }
}

function renderConnect(connect) {
    const address = document.getElementById("church-address");
    const time = document.getElementById("service-time");
    const email = document.getElementById("contact-email");
    const phone = document.getElementById("contact-phone");
    const mapFrame = document.getElementById("map-frame");
    const contactForm = document.getElementById("contact-form");

    if (contactForm && connect.formAction) {
        contactForm.action = connect.formAction;
    }

    if (mapFrame && connect.mapEmbededUrl) {
        mapFrame.src = connect.mapEmbededUrl;
    }

    if (address) address.innerHTML = `<i class="fa-solid fa-location-dot"></i> ${connect.address}`;
    if (time) time.innerHTML = `<i class="fa-solid fa-clock"></i> ${connect.serviceTime}`;
    if (email) email.innerHTML = `<i class="fa-solid fa-envelope"></i> ${connect.email}`;
    if (phone) phone.innerHTML = `<i class="fa-solid fa-phone"></i> ${connect.phone}`;
}

function renderSocials(socials) {
    const connectSocials = document.getElementById("social-media-links");
    const footerSocials = document.getElementById("footer-social-links");

    const connectHTML = `
        <a media-name="Facebook" style="--accent-color: #106bff;" href="${socials.facebook || '#'}" target="_blank"> 
            <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Facebook</title><path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z"/></svg>
        </a>
        <a media-name="Instagram" style="--accent-color: #c13584;" href="${socials.instagram || '#'}" target="_blank">
            <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Instagram</title><path d="M7.0301.084c-1.2768.0602-2.1487.264-2.911.5634-.7888.3075-1.4575.72-2.1228 1.3877-.6652.6677-1.075 1.3368-1.3802 2.127-.2954.7638-.4956 1.6365-.552 2.914-.0564 1.2775-.0689 1.6882-.0626 4.947.0062 3.2586.0206 3.6671.0825 4.9473.061 1.2765.264 2.1482.5635 2.9107.308.7889.72 1.4573 1.388 2.1228.6679.6655 1.3365 1.0743 2.1285 1.38.7632.295 1.6361.4961 2.9134.552 1.2773.056 1.6884.069 4.9462.0627 3.2578-.0062 3.668-.0207 4.9478-.0814 1.28-.0607 2.147-.2652 2.9098-.5633.7889-.3086 1.4578-.72 2.1228-1.3881.665-.6682 1.0745-1.3378 1.3795-2.1284.2957-.7632.4966-1.636.552-2.9124.056-1.2809.0692-1.6898.063-4.948-.0063-3.2583-.021-3.6668-.0817-4.9465-.0607-1.2797-.264-2.1487-.5633-2.9117-.3084-.7889-.72-1.4568-1.3876-2.1228C21.2982 1.33 20.628.9208 19.8378.6165 19.074.321 18.2017.1197 16.9244.0645 15.6471.0093 15.236-.005 11.977.0014 8.718.0076 8.31.0215 7.0301.0839m.1402 21.6932c-1.17-.0509-1.8053-.2453-2.2287-.408-.5606-.216-.96-.4771-1.3819-.895-.422-.4178-.6811-.8186-.9-1.378-.1644-.4234-.3624-1.058-.4171-2.228-.0595-1.2645-.072-1.6442-.079-4.848-.007-3.2037.0053-3.583.0607-4.848.05-1.169.2456-1.805.408-2.2282.216-.5613.4762-.96.895-1.3816.4188-.4217.8184-.6814 1.3783-.9003.423-.1651 1.0575-.3614 2.227-.4171 1.2655-.06 1.6447-.072 4.848-.079 3.2033-.007 3.5835.005 4.8495.0608 1.169.0508 1.8053.2445 2.228.408.5608.216.96.4754 1.3816.895.4217.4194.6816.8176.9005 1.3787.1653.4217.3617 1.056.4169 2.2263.0602 1.2655.0739 1.645.0796 4.848.0058 3.203-.0055 3.5834-.061 4.848-.051 1.17-.245 1.8055-.408 2.2294-.216.5604-.4763.96-.8954 1.3814-.419.4215-.8181.6811-1.3783.9-.4224.1649-1.0577.3617-2.2262.4174-1.2656.0595-1.6448.072-4.8493.079-3.2045.007-3.5825-.006-4.848-.0608M16.953 5.5864A1.44 1.44 0 1 0 18.39 4.144a1.44 1.44 0 0 0-1.437 1.4424M5.8385 12.012c.0067 3.4032 2.7706 6.1557 6.173 6.1493 3.4026-.0065 6.157-2.7701 6.1506-6.1733-.0065-3.4032-2.771-6.1565-6.174-6.1498-3.403.0067-6.156 2.771-6.1496 6.1738M8 12.0077a4 4 0 1 1 4.008 3.9921A3.9996 3.9996 0 0 1 8 12.0077"/></svg> 
        </a>
        <a media-name="Bible" style="--accent-color: #8B0000;" href="${socials.bible || '#'}" target="_blank">
            <img src="icons/bible.png" alt="Bible" class="bible-icon" style="width:29px; height:29px; display:inline-block; vertical-align:middle;">
        </a>
    `;

    if (connectSocials) connectSocials.innerHTML = connectHTML;
    if (footerSocials) footerSocials.innerHTML = `
        <a href="${socials.instagram || '#'}" class="social-link instagram" target="_blank"><i class="fa-brands fa-square-instagram"></i></a>
        <a href="${socials.facebook || '#'}" class="social-link facebook" target="_blank"><i class="fa-brands fa-square-facebook"></i></a>
    `;
}

function initLeadersSwiper() {
    new Swiper('.leaders-slider', {
        loop: true,
        observer: true,
        observeParents: true,
        grabCursor: true,
        spaceBetween: 25,
        pagination: { el: '.leaders-pagination', clickable: true, dynamicBullets: true},
        navigation: { nextEl: '.leaders-next', prevEl: '.leaders-prev' },
        breakpoints: {
            0: { slidesPerView: 1 },    
            640: { slidesPerView: 2 },  
            955: { slidesPerView: 3 }   
        }
    });
}

function initAboutSwiper() {
    new Swiper('.about-swiper', {
        loop: true,
        grabCursor: true,
        spaceBetween: 20,

        pagination: {
            el: '.about-pagination',
            clickable: true
        },

        navigation: {
            nextEl: '.about-next',
            prevEl: '.about-prev'
        },

        breakpoints: {
            0: {
                slidesPerView: 1
            },
            768: {
                slidesPerView: 1
            }
        }
    });
}

//read bio card
function openBioModal(name, role, bio, photo, facebook, instagram) {

    document.getElementById("modal-name").textContent = name;
    document.getElementById("modal-role").textContent = role;
    document.getElementById("modal-bio").textContent = bio || "";
    document.getElementById("modal-image").src = photo;

    const socialsContainer = document.getElementById("modal-socials");

    if (socialsContainer) {
        let socialHTML = '';

        if (facebook && facebook !== 'undefined' && facebook.trim() !== '') {
            socialHTML += `
                <a 
                    media-name="Facebook"
                    style="--accent-color: #106bff;"
                    href="${facebook}"
                    target="_blank"
                >
                    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="fill: #106bff;">
                        <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z"/>
                    </svg>
                </a>`;
        }

        if (instagram && instagram !== 'undefined' && instagram.trim() !== '') {
            socialHTML += `
                <a 
                    media-name="Instagram"
                    style="--accent-color: #c13584;"
                    href="${instagram}"
                    target="_blank"
                >
                    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="fill: #c13584;">
                        <path d="M7.0301.084c-1.2768.0602-2.1487.264-2.911.5634-.7888.3075-1.4575.72-2.1228 1.3877-.6652.6677-1.075 1.3368-1.3802 2.127-.2954.7638-.4956 1.6365-.552 2.914-.0564 1.2775-.0689 1.6882-.0626 4.947.0062 3.2586.0206 3.6671.0825 4.9473.061 1.2765.264 2.1482.5635 2.9107.308.7889.72 1.4573 1.388 2.1228.6679.6655 1.3365 1.0743 2.1285 1.38.7632.295 1.6361.4961 2.9134.552 1.2773.056 1.6884.069 4.9462.0627 3.2578-.0062 3.668-.0207 4.9478-.0814 1.28-.0607 2.147-.2652 2.9098-.5633.7889-.3086 1.4578-.72 2.1228-1.3881.665-.6682 1.0745-1.3378 1.3795-2.1284.2957-.7632.4966-1.636.552-2.9124.056-1.2809.0692-1.6898.063-4.948-.0063-3.2583-.021-3.6668-.0817-4.9465-.0607-1.2797-.264-2.1487-.5633-2.9117-.3084-.7889-.72-1.4568-1.3876-2.1228C21.2982 1.33 20.628.9208 19.8378.6165 19.074.321 18.2017.1197 16.9244.0645 15.6471.0093 15.236-.005 11.977.0014 8.718.0076 8.31.0215 7.0301.0839m.1402 21.6932c-1.17-.0509-1.8053-.2453-2.2287-.408-.5606-.216-.96-.4771-1.3819-.895-.422-.4178-.6811-.8186-.9-1.378-.1644-.4234-.3624-1.058-.4171-2.228-.0595-1.2645-.072-1.6442-.079-4.848-.007-3.2037.0053-3.583.0607-4.848.05-1.169.2456-1.805.408-2.2282.216-.5613.4762-.96.895-1.3816.4188-.4217.8184-.6814 1.3783-.9003.423-.1651 1.0575-.3614 2.227-.4171 1.2655-.06 1.6447-.072 4.848-.079 3.2033-.007 3.5835.005 4.8495.0608 1.169.0508 1.8053.2445 2.228.408.5608.216.96.4754 1.3816.895.4217.4194.6816.8176.9005 1.3787.1653.4217.3617 1.056.4169 2.2263.0602 1.2655.0739 1.645.0796 4.848.0058 3.203-.0055 3.5834-.061 4.848-.051 1.17-.245 1.8055-.408 2.2294-.216.5604-.4763.96-.8954 1.3814-.419.4215-.8181.6811-1.3783.9-.4224.1649-1.0577.3617-2.2262.4174-1.2656.0595-1.6448.072-4.8493.079-3.2045.007-3.5825-.006-4.848-.0608M16.953 5.5864A1.44 1.44 0 1 0 18.39 4.144a1.44 1.44 0 0 0-1.437 1.4424M5.8385 12.012c.0067 3.4032 2.7706 6.1557 6.173 6.1493 3.4026-.0065 6.157-2.7701 6.1506-6.1733-.0065-3.4032-2.771-6.1565-6.174-6.1498-3.403.0067-6.156 2.771-6.1496 6.1738M8 12.0077a4 4 0 1 1 4.008 3.9921A3.9996 3.9996 0 0 1 8 12.0077"/>
                    </svg>
                </a>`;
        }

        socialsContainer.innerHTML = socialHTML;
    }

    document.getElementById("bio-modal").classList.add("show-modal");
}

function closeBioModal() {
    document.getElementById("bio-modal")
        .classList.remove("show-modal");
}
const svg = document.getElementById('maskupsvg');
const paths = [document.getElementById('arc1'), document.getElementById('arc2')];
const image = document.getElementById('image');
let pm25value = 50; // default fallback

// Get image position in SVG coordinates
const imageX = parseFloat(image.getAttribute('x'));
const imageY = parseFloat(image.getAttribute('y'));
const imageWidth = parseFloat(image.getAttribute('width'));
const imageHeight = parseFloat(image.getAttribute('height'));

// Create 50 circles moving along arcs
const circles = [];
const path1 = paths[0];  // arc1
const path2 = paths[1];  // arc2

function createCircles(maskApplied, count) {
  // Clear the previous circles
  circles.forEach(circle => {
    svg.removeChild(circle.el);  // Remove circle element from SVG
  });
  circles.length = 0; // Clear existing circles
  for (let i = 0; i < count; i++) {
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute('r', 4);
    svg.appendChild(circle);

    // When the mask is not applied, 50% circles on each path
    // When the mask is applied, 5% circles on one path and 95% on the other
    const pathToUse = maskApplied 
      ? (Math.random() > 0.05 ? path2 : path1)  // 95% on path2 and 5% on path1 when mask is applied
      : (Math.floor(Math.random() * 2) === 0 ? path1 : path2);  // 50% on path1 and 50% on path2 when mask is not applied

    circles.push({
      el: circle,
      path: pathToUse,
      progress: Math.random(),
      speed: 0.001 + Math.random() * 0.002
    });
  }
}

// Initial creation of circles
createCircles(false, pm25value);

// Particle array declared globally
const particles = [];

function createParticles(count) {
  // Remove existing particles from SVG
  particles.forEach(p => svg.removeChild(p.el));
  particles.length = 0;

  for (let i = 0; i < count; i++) {
    const particle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    particle.setAttribute('r', 5);
    particle.setAttribute('fill', 'rgba(0, 0, 255, 0.5)');
    svg.appendChild(particle);
    particles.push({
      el: particle,
      x: Math.random() * 1000, 
      y: Math.random() * 700,
      dx: (Math.random() - 0.5) * 0.6,
      dy: (Math.random() - 0.5) * 0.6,
    });
  }
}
createParticles(200);

function animate() {
    // Move circles along arcs
    circles.forEach(c => {
      c.progress += c.speed;
      if (c.progress > 1) c.progress = 0;

      const length = c.path.getTotalLength();
      const point = c.path.getPointAtLength(c.progress * length);

      c.el.setAttribute('cx', point.x);
      c.el.setAttribute('cy', point.y);
    });

    // Move background particles
    particles.forEach(p => {
      p.x += p.dx;
      p.y += p.dy;

      // Check if particle is within image bounds using viewBox coordinates
      if (p.x >= imageX+30 && p.x <= imageX + imageWidth-30 &&
          p.y >= imageY && p.y <= imageY + imageHeight) {
        p.el.setAttribute('visibility', 'hidden');
      } else {
        p.el.setAttribute('visibility', 'visible');
      }

      // Bounce off viewBox boundaries
      if (p.x <= 0 || p.x >= 1000) p.dx = -p.dx;
      if (p.y <= 0 || p.y >= 700) p.dy = -p.dy;

      p.el.setAttribute('cx', p.x);
      p.el.setAttribute('cy', p.y);
    });

    requestAnimationFrame(animate);
  }

  animate();

  // Handle window resize
  window.addEventListener('resize', () => {
    particles.forEach(p => {
      if (p.x < 0) p.x = 0;
      if (p.x > 1000) p.x = 1000;
      if (p.y < 0) p.y = 0;
      if (p.y > 700) p.y = 700;
    });
  });

  // Event listener for the toggle button
  let maskApplied = false; // Track whether the mask is applied
  document.getElementById('maskbutton').addEventListener('click', function() {
    maskApplied = !maskApplied; // Toggle mask state

    // Change the button text
    this.textContent = maskApplied ? 'Mask Down' : '😷 Mask Up! 😷';

    // Change the info-box font size
    infobox = document.getElementById('mask-info-box');
    infobox.style.fontSize = maskApplied ? '16px' : '5px';

    // Switch image based on the mask state
    image.setAttribute('href', maskApplied ? 'lungsbg_mask.png' : 'lungsbg.png');

    // Update arcs based on the mask state
    if (maskApplied) {
      const randomEndValue = Math.random() > 0.5 ? 500 : 600;
      console.log(randomEndValue);
      document.getElementById('arc1').setAttribute('d', `M 300 380 A 300 200 60 0 0 480 250 A 300 200 60 0 1 520 250 A 300 200 60 0 1 550 360 A 300 200 60 0 1 ${randomEndValue} 380`);
      document.getElementById('arc2').setAttribute('d', 'M 300 400 A 300 200 60 0 0 480 250 A 300 200 80 0 0 400 150');
      // Show the mask info box
      document.getElementById('mask-info-box').style.visibility = "visible";
    } else {
      document.getElementById('arc1').setAttribute('d', 'M 300 380 A 300 200 60 0 0 480 250 A 300 200 60 0 1 520 250 A 300 200 60 0 1 550 360 A 300 200 60 0 1 500 380');
      document.getElementById('arc2').setAttribute('d', 'M 300 400 A 300 200 60 0 0 480 250 A 300 200 60 0 1 520 250 A 300 200 60 0 1 550 360 A 300 200 60 0 1 600 380');
      // Hide the mask info box
      document.getElementById('mask-info-box').style.visibility = "hidden";
    }

    createCircles(maskApplied, Math.floor(pm25value / 3));
  });

// FUNCTION to return a color based on AQI value
function getAQIColor(aqi) {
    if (aqi <= 50) return "#274e1380"; //80 at last - 50% opacitty
    if (aqi <= 100) return "#93c47d80";
    if (aqi <= 200) return "#f2f54280";
    if (aqi <= 300) return "#f5904280";
    if (aqi <= 400) return "#ff000080";
    return "#753b3b80";
}

function getAQ(aqi) {
    if (aqi <= 50) return "Good"; //80 at last - 50% opacitty
    if (aqi <= 100) return "Satisfactory";
    if (aqi <= 200) return "Moderate";
    if (aqi <= 300) return "Poor";
    if (aqi <= 400) return "Very Poor";
    return "Hazardous";
}

// Function to get AQI from AQICN
const token = 'd7f35f8bbf5a998b95331e9e8ae23003f66c44cf'
function getAQI(lat, lon) {
const url = `https://api.waqi.info/feed/geo:${lat};${lon}/?token=${token}`;
fetch(url)
    .then(res => res.json())
    .then(data => {
    if (data.status === 'ok') {
        const aqi = data.data.aqi;
        const pm25 = data.data.iaqi.pm25?.v;
        pm25value = pm25;
        const loc = data.data.city.name;
        const aq = getAQ(aqi);

        document.getElementById('location').textContent = ` from ${loc}.`;
        const box = document.getElementById('aqi');
        box.textContent = `You are breathing in ${aq} quality air of AQI: ${aqi}`;
        box.style.backgroundColor = getAQIColor(aqi);
        const svg = document.getElementById('maskupsvg');
        svg.style.backgroundColor  = getAQIColor(aqi);

        const advice = document.getElementById("advice");
        if (aqi<50) {
            advice.textContent = `Enjoy fresh air!`;
        }

        // Create particles based on PM2.5
        createParticles(Math.floor(pm25*2));
        createCircles(false, Math.floor(pm25/3));

    } else {
        document.getElementById('location').textContent = "API error: " + data.data;
    }
    })
    .catch(err => {
    document.getElementById('location').textContent = "Fetch error: " + err;
    });
}

// Request location from browser and CALL THE FUNCTION
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      position => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        getAQI(lat, lon);
      },
      error => {
        document.getElementById('location').textContent = "Location access denied.";
      }
    );
  } else {
    document.getElementById('location').textContent = "Geolocation is not supported by this browser.";
    }


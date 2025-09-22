// Energy Dashboard JavaScript with Cubes Integration and Advanced Animations

class EnergyDashboard {
    constructor() {
        this.data = {
            usage: { electricity: 123 },
            carbon: 0.72,
            predictions: {
                electricity: {
                    historical: [120,118,123,126,124,129,132,128,135,131],
                    predicted: [128,131,133,135,138,140,142,145,148,150]
                }
            },
            electricityMetrics: {
                peakUsage: 156,
                efficiency: 85,
                cost: 3.25,
                trend: "decreasing"
            },
            leaderboard: [
                {name: "Hostel A", savings: 18, category: "hostel", improvement: 5},
                {name: "Block C Engineering", savings: 16, category: "building", improvement: 3},
                {name: "Classroom 101", savings: 15, category: "classroom", improvement: 8},
                {name: "Hostel B", savings: 13, category: "hostel", improvement: 2},
                {name: "Library Main", savings: 12, category: "building", improvement: 6},
                {name: "Lab Complex", savings: 11, category: "building", improvement: 4}
            ],
            settings: {
                theme: "dark",
                refreshInterval: 3,
                notifications: true,
                units: "kWh",
                sound: false
            }
        };
        
        this.charts = {};
        this.currentTab = 'dashboard';
        this.cubesComponent = null;
        this.refreshInterval = null;
        
        this.init();
    }

    init() {
        this.showLoadingAnimation();
        this.setupEventListeners();
        this.setupTabSystem();
        
        // Initialize dashboard after loading animation
        setTimeout(() => {
            this.hideLoadingScreen();
            this.initDashboard();
        }, 3000);
    }

    showLoadingAnimation() {
        const loadingScreen = document.getElementById('loadingScreen');
        loadingScreen.style.display = 'flex';
    }

    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        loadingScreen.classList.add('fade-out');
        
        setTimeout(() => {
            loadingScreen.style.display = 'none';
            this.triggerSlideAnimations();
        }, 1000);
    }

    setupTabSystem() {
        const tabButtons = document.querySelectorAll('.tab-button');
        const tabContents = document.querySelectorAll('.tab-content');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetTab = button.getAttribute('data-tab');
                
                // Update active states
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));
                
                button.classList.add('active');
                document.getElementById(targetTab).classList.add('active');
                
                this.currentTab = targetTab;
                
                // Initialize tab-specific content
                this.initTabContent(targetTab);
            });
        });
    }

    initTabContent(tab) {
        switch(tab) {
            case 'dashboard':
                if (!this.cubesComponent) {
                    this.initCubesComponent();
                }
                break;
            case 'analytics':
                this.initAnalytics();
                break;
            case 'leaderboard':
                this.initLeaderboard();
                break;
            case 'settings':
                this.initSettings();
                break;
        }
    }

    triggerSlideAnimations() {
        const animatedElements = document.querySelectorAll('.slide-in-left, .slide-in-right, .slide-in-up');
        
        animatedElements.forEach((element, index) => {
            const delay = element.getAttribute('data-delay') || (index * 200);
            setTimeout(() => {
                element.classList.add('animate');
            }, parseInt(delay));
        });
    }

    initDashboard() {
        this.animateCounters();
        this.animateCarbonMeter();
        this.initCubesComponent();
        this.startDataUpdates();
    }

    // Cubes Component Implementation
    initCubesComponent() {
        this.cubesComponent = new CubesComponent({
            container: '#cubesContainer',
            gridSize: 8,
            maxAngle: 45,
            radius: 3,
            easing: 'power3.out',
            duration: { enter: 0.3, leave: 0.6 },
            cellGap: 5,
            borderStyle: '1px solid #00f5ff',
            faceColor: '#060010',
            shadow: '0 0 6px rgba(0,245,255,0.3)',
            autoAnimate: true,
            rippleOnClick: true,
            rippleColor: '#00f5ff',
            rippleSpeed: 2
        });
    }

    animateCounters() {
        const counters = document.querySelectorAll('.counter');
        
        counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-target'));
            const duration = 2000;
            const increment = target / (duration / 16);
            let current = 0;
            
            const updateCounter = () => {
                current += increment;
                if (current < target) {
                    counter.textContent = Math.floor(current);
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.textContent = target;
                    counter.parentElement.classList.add('data-update');
                    setTimeout(() => {
                        counter.parentElement.classList.remove('data-update');
                    }, 500);
                }
            };
            
            setTimeout(updateCounter, 500);
        });
    }

    animateCarbonMeter() {
        const progressCircle = document.getElementById('carbonProgress');
        const carbonValue = document.getElementById('carbonDisplayValue');
        const radius = 40;
        const circumference = 2 * Math.PI * radius;
        
        progressCircle.style.strokeDasharray = `${circumference} ${circumference}`;
        progressCircle.style.strokeDashoffset = circumference;
        
        const targetPercentage = this.data.carbon * 100;
        const targetOffset = circumference - (targetPercentage / 100) * circumference;
        
        let currentOffset = circumference;
        const duration = 2000;
        const startTime = performance.now();
        
        const animateProgress = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const easeOutCubic = 1 - Math.pow(1 - progress, 3);
            currentOffset = circumference - (easeOutCubic * (circumference - targetOffset));
            
            progressCircle.style.strokeDashoffset = currentOffset;
            
            if (progress < 1) {
                requestAnimationFrame(animateProgress);
            } else {
                progressCircle.classList.add('carbon-pulse');
            }
        };
        
        setTimeout(() => {
            requestAnimationFrame(animateProgress);
        }, 800);
    }

    initAnalytics() {
        if (!this.charts.usage) {
            this.initUsageChart();
        }
        
        // Setup chart toggle buttons
        const toggleButtons = document.querySelectorAll('.chart-toggle');
        toggleButtons.forEach(button => {
            button.addEventListener('click', () => {
                toggleButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                const type = button.getAttribute('data-type');
                this.updateChartData(type);
            });
        });
    }

    initUsageChart() {
        const ctx = document.getElementById('usageChart').getContext('2d');
        
        this.charts.usage = new Chart(ctx, {
            type: 'line',
            data: {
                labels: Array.from({length: 10}, (_, i) => `Day ${i + 1}`),
                datasets: [{
                    label: 'Electricity Usage',
                    data: this.data.predictions.electricity.historical,
                    borderColor: '#1FB8CD',
                    backgroundColor: 'rgba(31, 184, 205, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: '#1FB8CD',
                    pointBorderColor: '#1FB8CD',
                    pointHoverBackgroundColor: '#00f5ff',
                    pointHoverBorderColor: '#00f5ff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: '#fff',
                            font: { family: 'Inter' }
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: { color: '#999' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    },
                    y: {
                        ticks: { color: '#999' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    }
                },
                animation: {
                    duration: 2000,
                    easing: 'easeOutQuart'
                }
            }
        });
    }

    updateChartData(type) {
        if (!this.charts.usage) return;
        
        const data = type === 'actual' 
            ? this.data.predictions.electricity.historical
            : this.data.predictions.electricity.predicted;
        
        const label = type === 'actual' ? 'Actual Usage' : 'Predicted Usage';
        const borderStyle = type === 'actual' ? [] : [5, 5];
        
        this.charts.usage.data.datasets[0].data = data;
        this.charts.usage.data.datasets[0].label = label;
        this.charts.usage.data.datasets[0].borderDash = borderStyle;
        this.charts.usage.update('active');
    }

    initLeaderboard() {
        const leaderboard = document.getElementById('leaderboardList');
        leaderboard.innerHTML = '';
        
        this.data.leaderboard.forEach((item, index) => {
            const leaderboardItem = document.createElement('div');
            leaderboardItem.className = 'leaderboard-item';
            leaderboardItem.style.animationDelay = `${index * 0.1}s`;
            
            const rankClass = index < 3 ? `rank-${index + 1}` : '';
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '';
            const improvement = item.improvement > 0 ? `↑ ${item.improvement}%` : '';
            
            leaderboardItem.innerHTML = `
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-4">
                        <span class="text-2xl font-bold ${rankClass}">
                            ${medal || `#${index + 1}`}
                        </span>
                        <div>
                            <h4 class="font-semibold text-lg">${item.name}</h4>
                            <p class="text-gray-400 text-sm">${item.category} • ${improvement}</p>
                        </div>
                    </div>
                    <div class="text-right">
                        <span class="text-2xl font-bold text-neon-green">${item.savings}%</span>
                        <p class="text-gray-400 text-sm">Energy Saved</p>
                    </div>
                </div>
            `;
            
            leaderboard.appendChild(leaderboardItem);
        });
    }

    initSettings() {
        // Initialize settings values
        document.getElementById('themeSelect').value = this.data.settings.theme;
        document.getElementById('refreshSelect').value = this.data.settings.refreshInterval;
        document.getElementById('unitsSelect').value = this.data.settings.units;
        document.getElementById('notificationsToggle').checked = this.data.settings.notifications;
        document.getElementById('soundToggle').checked = this.data.settings.sound;
        
        // Setup settings event listeners
        document.getElementById('themeSelect').addEventListener('change', (e) => {
            this.data.settings.theme = e.target.value;
            this.applyTheme(e.target.value);
        });
        
        document.getElementById('refreshSelect').addEventListener('change', (e) => {
            this.data.settings.refreshInterval = parseInt(e.target.value);
            this.updateRefreshInterval();
        });
        
        document.getElementById('unitsSelect').addEventListener('change', (e) => {
            this.data.settings.units = e.target.value;
            this.updateUnits();
        });
        
        document.getElementById('notificationsToggle').addEventListener('change', (e) => {
            this.data.settings.notifications = e.target.checked;
        });
        
        document.getElementById('soundToggle').addEventListener('change', (e) => {
            this.data.settings.sound = e.target.checked;
        });
    }

    applyTheme(theme) {
        // Theme switching logic can be implemented here
        console.log(`Theme changed to: ${theme}`);
    }

    updateRefreshInterval() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
        this.startDataUpdates();
    }

    updateUnits() {
        // Update unit displays throughout the app
        const unitElements = document.querySelectorAll('.unit-display');
        unitElements.forEach(element => {
            element.textContent = this.data.settings.units;
        });
    }

    startDataUpdates() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
        
        this.refreshInterval = setInterval(() => {
            this.simulateDataUpdate();
        }, this.data.settings.refreshInterval * 1000);
    }

    simulateDataUpdate() {
        const generateVariation = (baseValue, variation = 5) => {
            return baseValue + (Math.random() * variation * 2 - variation);
        };

        // Update electricity usage
        this.data.usage.electricity = Math.round(generateVariation(123, 10));
        
        // Update carbon footprint
        this.data.carbon = Math.round((0.72 + (Math.random() * 0.1 - 0.05)) * 100) / 100;

        // Update predictions
        this.data.predictions.electricity.historical = 
            this.data.predictions.electricity.historical.map(val => Math.round(generateVariation(val, 3)));
        this.data.predictions.electricity.predicted = 
            this.data.predictions.electricity.predicted.map(val => Math.round(generateVariation(val, 5)));

        this.animateDataUpdate();
    }

    animateDataUpdate() {
        // Update counter
        const counter = document.querySelector('.counter');
        if (counter) {
            const newValue = this.data.usage.electricity;
            const currentValue = parseInt(counter.textContent);
            
            if (newValue !== currentValue) {
                counter.parentElement.parentElement.classList.add('data-update');
                this.animateCounter(counter, currentValue, newValue);
                
                setTimeout(() => {
                    counter.parentElement.parentElement.classList.remove('data-update');
                }, 500);
            }
        }

        // Update carbon values
        document.getElementById('carbonValue').textContent = this.data.carbon;
        document.getElementById('carbonDisplayValue').textContent = this.data.carbon;
        this.updateCarbonMeter();

        // Update charts if visible
        if (this.currentTab === 'analytics' && this.charts.usage) {
            const activeToggle = document.querySelector('.chart-toggle.active');
            const type = activeToggle ? activeToggle.getAttribute('data-type') : 'actual';
            this.updateChartData(type);
        }
    }

    animateCounter(counter, from, to) {
        const duration = 1000;
        const startTime = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const current = Math.round(from + (to - from) * progress);
            counter.textContent = current;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }

    updateCarbonMeter() {
        const progressCircle = document.getElementById('carbonProgress');
        const radius = 40;
        const circumference = 2 * Math.PI * radius;
        const targetPercentage = this.data.carbon * 100;
        const targetOffset = circumference - (targetPercentage / 100) * circumference;
        
        progressCircle.style.transition = 'stroke-dashoffset 1s ease-out';
        progressCircle.style.strokeDashoffset = targetOffset;
        
        progressCircle.classList.remove('carbon-pulse');
        setTimeout(() => {
            progressCircle.classList.add('carbon-pulse');
        }, 10);
    }

    setupEventListeners() {
        // Enhanced hover effects for nav links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('mouseenter', (e) => {
                e.target.style.transform = 'scale(1.05)';
            });
            
            link.addEventListener('mouseleave', (e) => {
                e.target.style.transform = 'scale(1)';
            });
        });

        // Usage cards hover effects
        document.querySelectorAll('.usage-card').forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-5px) scale(1.02)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0) scale(1)';
            });
        });
    }
}

// Cubes Component Class (Converted from React)
class CubesComponent {
    constructor(options) {
        this.options = {
            gridSize: 10,
            cubeSize: null,
            maxAngle: 45,
            radius: 3,
            easing: 'power3.out',
            duration: { enter: 0.3, leave: 0.6 },
            cellGap: 5,
            borderStyle: '1px solid #fff',
            faceColor: '#060010',
            shadow: false,
            autoAnimate: true,
            rippleOnClick: true,
            rippleColor: '#fff',
            rippleSpeed: 2,
            container: '#cubesContainer',
            ...options
        };
        
        this.sceneRef = null;
        this.rafRef = null;
        this.idleTimerRef = null;
        this.userActiveRef = false;
        this.simPos = { x: 0, y: 0 };
        this.simTarget = { x: 0, y: 0 };
        this.simRAFRef = null;
        
        this.init();
    }
    
    init() {
        this.createCubesStructure();
        this.setupEventListeners();
        this.startAutoAnimation();
    }
    
    createCubesStructure() {
        const container = document.querySelector(this.options.container);
        if (!container) return;
        
        const { gridSize, cubeSize, cellGap } = this.options;
        
        const colGap = typeof cellGap === 'number' ? `${cellGap}px` : 
                      cellGap?.col !== undefined ? `${cellGap.col}px` : '5%';
        const rowGap = typeof cellGap === 'number' ? `${cellGap}px` : 
                      cellGap?.row !== undefined ? `${cellGap.row}px` : '5%';
        
        const wrapperStyle = {
            '--cube-face-border': this.options.borderStyle,
            '--cube-face-bg': this.options.faceColor,
            '--cube-face-shadow': this.options.shadow === true ? '0 0 6px rgba(0,0,0,.5)' : this.options.shadow || 'none',
            ...(cubeSize ? {
                width: `${gridSize * cubeSize}px`,
                height: `${gridSize * cubeSize}px`
            } : {})
        };
        
        const sceneStyle = {
            gridTemplateColumns: cubeSize ? `repeat(${gridSize}, ${cubeSize}px)` : `repeat(${gridSize}, 1fr)`,
            gridTemplateRows: cubeSize ? `repeat(${gridSize}, ${cubeSize}px)` : `repeat(${gridSize}, 1fr)`,
            columnGap: colGap,
            rowGap: rowGap
        };
        
        container.innerHTML = `
            <div class="cubes-animation" style="${this.objectToStyle(wrapperStyle)}">
                <div class="cubes-animation--scene" style="${this.objectToStyle(sceneStyle)}">
                    ${this.generateCubes()}
                </div>
            </div>
        `;
        
        this.sceneRef = container.querySelector('.cubes-animation--scene');
    }
    
    generateCubes() {
        const { gridSize } = this.options;
        let html = '';
        
        for (let r = 0; r < gridSize; r++) {
            for (let c = 0; c < gridSize; c++) {
                html += `
                    <div class="cube" data-row="${r}" data-col="${c}">
                        <div class="cube-face cube-face--top"></div>
                        <div class="cube-face cube-face--bottom"></div>
                        <div class="cube-face cube-face--left"></div>
                        <div class="cube-face cube-face--right"></div>
                        <div class="cube-face cube-face--front"></div>
                        <div class="cube-face cube-face--back"></div>
                    </div>
                `;
            }
        }
        
        return html;
    }
    
    objectToStyle(obj) {
        return Object.entries(obj)
            .map(([key, value]) => {
                const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
                return `${cssKey}: ${value}`;
            })
            .join('; ');
    }
    
    tiltAt(rowCenter, colCenter) {
        if (!this.sceneRef) return;
        
        const { radius, maxAngle, duration, easing } = this.options;
        const enterDur = duration.enter;
        const leaveDur = duration.leave;
        
        this.sceneRef.querySelectorAll('.cube').forEach(cube => {
            const r = +cube.dataset.row;
            const c = +cube.dataset.col;
            const dist = Math.hypot(r - rowCenter, c - colCenter);
            
            if (dist <= radius) {
                const pct = 1 - dist / radius;
                const angle = pct * maxAngle;
                
                gsap.to(cube, {
                    duration: enterDur,
                    ease: easing,
                    overwrite: true,
                    rotateX: -angle,
                    rotateY: angle
                });
            } else {
                gsap.to(cube, {
                    duration: leaveDur,
                    ease: 'power3.out',
                    overwrite: true,
                    rotateX: 0,
                    rotateY: 0
                });
            }
        });
    }
    
    onPointerMove(e) {
        this.userActiveRef = true;
        if (this.idleTimerRef) clearTimeout(this.idleTimerRef);
        
        const rect = this.sceneRef.getBoundingClientRect();
        const cellW = rect.width / this.options.gridSize;
        const cellH = rect.height / this.options.gridSize;
        const colCenter = (e.clientX - rect.left) / cellW;
        const rowCenter = (e.clientY - rect.top) / cellH;
        
        if (this.rafRef) cancelAnimationFrame(this.rafRef);
        this.rafRef = requestAnimationFrame(() => this.tiltAt(rowCenter, colCenter));
        
        this.idleTimerRef = setTimeout(() => {
            this.userActiveRef = false;
        }, 3000);
    }
    
    onClick(e) {
        if (!this.options.rippleOnClick || !this.sceneRef) return;
        
        const rect = this.sceneRef.getBoundingClientRect();
        const cellW = rect.width / this.options.gridSize;
        const cellH = rect.height / this.options.gridSize;
        const clientX = e.clientX || (e.touches && e.touches[0].clientX);
        const clientY = e.clientY || (e.touches && e.touches[0].clientY);
        const colHit = Math.floor((clientX - rect.left) / cellW);
        const rowHit = Math.floor((clientY - rect.top) / cellH);
        
        const { rippleColor, rippleSpeed, faceColor } = this.options;
        const baseRingDelay = 0.15;
        const baseAnimDur = 0.3;
        const baseHold = 0.6;
        const spreadDelay = baseRingDelay / rippleSpeed;
        const animDuration = baseAnimDur / rippleSpeed;
        const holdTime = baseHold / rippleSpeed;
        
        const rings = {};
        this.sceneRef.querySelectorAll('.cube').forEach(cube => {
            const r = +cube.dataset.row;
            const c = +cube.dataset.col;
            const dist = Math.hypot(r - rowHit, c - colHit);
            const ring = Math.round(dist);
            if (!rings[ring]) rings[ring] = [];
            rings[ring].push(cube);
        });
        
        Object.keys(rings)
            .map(Number)
            .sort((a, b) => a - b)
            .forEach(ring => {
                const delay = ring * spreadDelay;
                const faces = rings[ring].flatMap(cube => 
                    Array.from(cube.querySelectorAll('.cube-face'))
                );
                
                gsap.to(faces, {
                    backgroundColor: rippleColor,
                    duration: animDuration,
                    delay,
                    ease: 'power3.out'
                });
                
                gsap.to(faces, {
                    backgroundColor: faceColor,
                    duration: animDuration,
                    delay: delay + animDuration + holdTime,
                    ease: 'power3.out'
                });
            });
    }
    
    resetAll() {
        if (!this.sceneRef) return;
        
        this.sceneRef.querySelectorAll('.cube').forEach(cube =>
            gsap.to(cube, {
                duration: this.options.duration.leave,
                rotateX: 0,
                rotateY: 0,
                ease: 'power3.out'
            })
        );
    }
    
    startAutoAnimation() {
        if (!this.options.autoAnimate || !this.sceneRef) return;
        
        this.simPos = {
            x: Math.random() * this.options.gridSize,
            y: Math.random() * this.options.gridSize
        };
        this.simTarget = {
            x: Math.random() * this.options.gridSize,
            y: Math.random() * this.options.gridSize
        };
        
        const speed = 0.02;
        const loop = () => {
            if (!this.userActiveRef) {
                const pos = this.simPos;
                const tgt = this.simTarget;
                pos.x += (tgt.x - pos.x) * speed;
                pos.y += (tgt.y - pos.y) * speed;
                this.tiltAt(pos.y, pos.x);
                
                if (Math.hypot(pos.x - tgt.x, pos.y - tgt.y) < 0.1) {
                    this.simTarget = {
                        x: Math.random() * this.options.gridSize,
                        y: Math.random() * this.options.gridSize
                    };
                }
            }
            this.simRAFRef = requestAnimationFrame(loop);
        };
        
        this.simRAFRef = requestAnimationFrame(loop);
    }
    
    setupEventListeners() {
        if (!this.sceneRef) return;
        
        this.onPointerMove = this.onPointerMove.bind(this);
        this.onClick = this.onClick.bind(this);
        this.resetAll = this.resetAll.bind(this);
        
        this.sceneRef.addEventListener('pointermove', this.onPointerMove);
        this.sceneRef.addEventListener('pointerleave', this.resetAll);
        this.sceneRef.addEventListener('click', this.onClick);
        
        // Touch events
        this.sceneRef.addEventListener('touchmove', (e) => {
            e.preventDefault();
            this.userActiveRef = true;
            if (this.idleTimerRef) clearTimeout(this.idleTimerRef);
            
            const rect = this.sceneRef.getBoundingClientRect();
            const cellW = rect.width / this.options.gridSize;
            const cellH = rect.height / this.options.gridSize;
            const touch = e.touches[0];
            const colCenter = (touch.clientX - rect.left) / cellW;
            const rowCenter = (touch.clientY - rect.top) / cellH;
            
            if (this.rafRef) cancelAnimationFrame(this.rafRef);
            this.rafRef = requestAnimationFrame(() => this.tiltAt(rowCenter, colCenter));
            
            this.idleTimerRef = setTimeout(() => {
                this.userActiveRef = false;
            }, 3000);
        }, { passive: false });
        
        this.sceneRef.addEventListener('touchstart', () => {
            this.userActiveRef = true;
        }, { passive: true });
        
        this.sceneRef.addEventListener('touchend', () => {
            this.resetAll();
        }, { passive: true });
    }
    
    destroy() {
        if (this.sceneRef) {
            this.sceneRef.removeEventListener('pointermove', this.onPointerMove);
            this.sceneRef.removeEventListener('pointerleave', this.resetAll);
            this.sceneRef.removeEventListener('click', this.onClick);
        }
        
        if (this.rafRef) cancelAnimationFrame(this.rafRef);
        if (this.idleTimerRef) clearTimeout(this.idleTimerRef);
        if (this.simRAFRef) cancelAnimationFrame(this.simRAFRef);
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new EnergyDashboard();
});

// Performance optimization: throttle resize events
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        if (window.innerWidth < 768) {
            document.body.classList.add('mobile-view');
        } else {
            document.body.classList.remove('mobile-view');
        }
    }, 250);
});
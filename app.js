// app.js ~ main application entry point & tab management

// global instances
let calculator;
let converter;
let solver;

// initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // initialize calculator
    calculator = new Calculator();

    // initialize converter
    converter = new UnitConverter();

    // initialize solver
    solver = new EquationSolver();

    // set up tab switching
    setupTabs();

    console.log('Advanced Scientific Calculator initialized');
}

function setupTabs() {
    // tab functionality is handled by onclick attributes
    // this function can be extended for additional tab behavior
}

function showTab(tabName) {
    // hide all tab contents
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => {
        content.classList.remove('active');
    });

    // remove active class from all tab buttons
    const tabButtons = document.querySelectorAll('.tab');
    tabButtons.forEach(button => {
        button.classList.remove('active');
    });

    // show selected tab content
    const selectedTab = document.getElementById(tabName + '-tab');
    if (selectedTab) {
        selectedTab.classList.add('active');
    }

    // add active class to clicked tab button
    const clickedButton = Array.from(tabButtons).find(btn => 
        btn.textContent.toLowerCase() === tabName.toLowerCase() ||
        btn.textContent.toLowerCase().includes(tabName.toLowerCase())
    );
    if (clickedButton) {
        clickedButton.classList.add('active');
    }
}

// utility function for number formatting used across modules
function formatDisplayNumber(num) {
    if (!isFinite(num)) {
        return 'Error';
    }

    if (Number.isInteger(num) && Math.abs(num) < 1e15) {
        return num.toString();
    }

    if (Math.abs(num) < 0.0001 || Math.abs(num) >= 1e10) {
        return num.toExponential(6);
    }

    return parseFloat(num.toPrecision(10)).toString();
}

// export functions for global access ~ used by onclick handlers
window.showTab = showTab;
window.calculator = null;
window.converter = null;
window.solver = null;

// make instances globally available after initialization
document.addEventListener('DOMContentLoaded', function() {
    window.calculator = calculator;
    window.converter = converter;
    window.solver = solver;
});
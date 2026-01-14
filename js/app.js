// ===========================
// Tips and Plans on progressive overload Training Volume Calculator
// ===========================

// Workout Split Generator
const workoutForm = document.getElementById('workoutForm');
const workoutResults = document.getElementById('workoutResults');

if (workoutForm) {
    workoutForm.addEventListener('submit', (e) => {
        e.preventDefault();
        generateWorkoutSplit();
    });
}

function generateWorkoutSplit() {
    const exercise = document.getElementById('exercise').value;
    const currentWeight = parseFloat(document.getElementById('currentWeight').value);
    const targetWeight = parseFloat(document.getElementById('targetWeight').value);
    
    if (!exercise || !currentWeight || !targetWeight) {
        alert('Please fill in all fields');
        return;
    }
    
    if (targetWeight <= currentWeight) {
        alert('Target weight must be greater than current weight');
        return;
    }
    
    const weightDifference = targetWeight - currentWeight;
    const exerciseName = document.getElementById('exercise').selectedOptions[0].text;
    
    // Calculate weeks needed (assuming 2.5-5 lbs per week for most exercises)
    const weeklyIncrease = exercise === 'bicep-curl' ? 2.5 : 5;
    const weeksNeeded = Math.ceil(weightDifference / weeklyIncrease);
    
    // Generate workout split
    let splitHTML = `
        <div class="results-header" onclick="toggleWorkoutResults()">
            <h3>🎯 Your ${exerciseName} Progressive Overload Plan</h3>
            <button type="button" class="toggle-results" title="Collapse/Expand">
                <span class="toggle-icon">▼</span>
            </button>
        </div>
        <div class="results-content">
            <div class="result-summary">
                <p><strong>Current Weight:</strong> ${currentWeight} lbs</p>
                <p><strong>Target Weight:</strong> ${targetWeight} lbs</p>
                <p><strong>Weight to Gain:</strong> ${weightDifference} lbs</p>
                <p><strong>Estimated Timeline:</strong> ${weeksNeeded} weeks</p>
            </div>
            <div class="workout-split">
                <h4>Weekly Progression Plan:</h4>
    `;
    
    let currentProgression = currentWeight;
    
    for (let week = 1; week <= Math.min(weeksNeeded, 8); week++) {
        const weekWeight = Math.min(currentProgression + weeklyIncrease, targetWeight);
        const sets = exercise === 'bicep-curl' ? 3 : 4;
        const reps = exercise === 'deadlift' ? '3-5' : exercise === 'bicep-curl' ? '8-12' : '5-8';
        
        splitHTML += `
            <div class="week-block">
                <h4>Week ${week} - ${weekWeight} lbs</h4>
                <ul>
                    <li><strong>Monday:</strong> ${sets} sets × ${reps} reps @ ${weekWeight} lbs</li>
                    <li><strong>Wednesday:</strong> ${sets} sets × ${reps} reps @ ${weekWeight} lbs</li>
                    <li><strong>Friday:</strong> ${sets} sets × ${reps} reps @ ${weekWeight} lbs</li>
                    <li><strong>Focus:</strong> Maintain proper form and complete all reps</li>
                </ul>
            </div>
        `;
        
        currentProgression = weekWeight;
        
        if (currentProgression >= targetWeight) break;
    }
    
    if (weeksNeeded > 8) {
        splitHTML += `<p style="text-align: center; color: var(--text-light); margin-top: var(--spacing-md);"><em>Continue this pattern until you reach ${targetWeight} lbs...</em></p>`;
    }
    
    splitHTML += `</div></div>`;
    
    workoutResults.innerHTML = splitHTML;
    workoutResults.classList.add('show');
    workoutResults.classList.add('expanded');
    workoutResults.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function toggleWorkoutResults() {
    if (workoutResults) {
        workoutResults.classList.toggle('expanded');
        const icon = workoutResults.querySelector('.toggle-icon');
        if (icon) {
            icon.textContent = workoutResults.classList.contains('expanded') ? '▼' : '▶';
        }
    }
}

// DOM Elements
const volumeForm = document.getElementById('volumeForm');
const resultsSection = document.getElementById('results');
const logEntriesContainer = document.getElementById('logEntries');

// Training log stored in memory (could be extended to localStorage)
let trainingLog = [];

// ===========================
// Event Listeners
// ===========================

// Form submission handler
volumeForm.addEventListener('submit', (e) => {
    e.preventDefault();
    calculateVolume();
});

// Add real-time validation feedback
const inputs = volumeForm.querySelectorAll('input');
inputs.forEach(input => {
    input.addEventListener('input', () => {
        validateInput(input);
    });
});

// ===========================
// Core Functions
// ===========================

/**
 * Calculate training volume and display results
 */
function calculateVolume() {
    // Get form values
    const exercise = document.getElementById('exercise').value.trim();
    const weight = parseFloat(document.getElementById('weight').value);
    const reps = parseInt(document.getElementById('reps').value);
    const sets = parseInt(document.getElementById('sets').value);

    // Validate inputs
    if (!validateAllInputs(exercise, weight, reps, sets)) {
        return;
    }

    // Calculate volume
    const volumePerSet = weight * reps;
    const totalVolume = volumePerSet * sets;

    // Calculate current max weight (1RM) using Epley formula
    const currentMaxWeight = calculateOneRepMax(weight, reps);

    // Calculate target weight for progressive overload (2.5% increase)
    const targetWeight = calculateTargetWeight(weight, reps);

    // Calculate weight difference to reach target
    const weightDifference = targetWeight - weight;

    // Generate workout link based on exercise and weight difference
    const workoutLink = generateWorkoutLink(exercise, weightDifference);

    // Create log entry
    const logEntry = {
        id: Date.now(),
        timestamp: new Date(),
        exercise,
        weight,
        reps,
        sets,
        volumePerSet,
        totalVolume,
        currentMaxWeight,
        targetWeight,
        weightDifference,
        workoutLink
    };

    // Add to log and display
    addToLog(logEntry);
    displayResults(logEntry);

    // Clear form
    volumeForm.reset();
}

/**
 * Calculate estimated 1 rep max using Epley formula
 * @param {number} weight - Weight lifted
 * @param {number} reps - Number of repetitions
 * @returns {number} - Estimated 1 rep max
 */
function calculateOneRepMax(weight, reps) {
    if (reps === 1) {
        return weight;
    }
    // Epley formula: 1RM = weight × (1 + reps/30)
    const oneRepMax = weight * (1 + reps / 30);
    return Math.round(oneRepMax * 10) / 10; // Round to 1 decimal place
}

/**
 * Calculate target weight for next session (2.5% increase for progressive overload)
 * @param {number} currentWeight - Current weight being lifted
 * @param {number} reps - Number of repetitions
 * @returns {number} - Target weight for next session
 */
function calculateTargetWeight(currentWeight, reps) {
    // For higher reps (8+), suggest adding weight
    // For lower reps (1-7), suggest smaller increments
    let increasePercentage = reps >= 8 ? 0.025 : 0.02; // 2.5% or 2%
    
    const targetWeight = currentWeight * (1 + increasePercentage);
    
    // Round to nearest 2.5 for practical plate loading
    return Math.round(targetWeight * 2) / 2;
}

/**
 * Validate individual input field
 * @param {HTMLElement} input - The input element to validate
 */
function validateInput(input) {
    const value = input.value.trim();
    const type = input.type;

    // Reset validation state
    input.setCustomValidity('');

    if (type === 'number') {
        const num = parseFloat(value);
        const min = parseFloat(input.min);
        const max = parseFloat(input.max);

        if (isNaN(num)) {
            input.setCustomValidity('Please enter a valid number');
        } else if (min !== undefined && num < min) {
            input.setCustomValidity(`Value must be at least ${min}`);
        } else if (max !== undefined && num > max) {
            input.setCustomValidity(`Value must not exceed ${max}`);
        } else if (num < 0) {
            input.setCustomValidity('Value must be positive');
        }
    } else if (type === 'text' && input.required && value === '') {
        input.setCustomValidity('This field is required');
    }
}

/**
 * Validate all form inputs
 * @param {string} exercise - Exercise name
 * @param {number} weight - Weight value
 * @param {number} reps - Repetitions
 * @param {number} sets - Number of sets
 * @returns {boolean} - True if all inputs are valid
 */
function validateAllInputs(exercise, weight, reps, sets) {
    // Check exercise name
    if (!exercise || exercise.length < 2) {
        showError('Please enter a valid exercise name');
        return false;
    }

    // Check weight
    if (isNaN(weight) || weight <= 0) {
        showError('Please enter a valid weight (must be greater than 0)');
        return false;
    }

    // Check reps
    if (isNaN(reps) || reps < 1 || reps > 50) {
        showError('Please enter valid repetitions (between 1 and 50)');
        return false;
    }

    // Check sets
    if (isNaN(sets) || sets < 1 || sets > 10) {
        showError('Please enter valid sets (between 1 and 10)');
        return false;
    }

    return true;
}

/**
 * Generate workout link based on exercise type and weight difference
 * @param {string} exercise - Exercise name
 * @param {number} weightDifference - Weight difference to reach target
 * @returns {Object} - Link object with URL, text, and category
 */
function generateWorkoutLink(exercise, weightDifference) {
    // Normalize exercise name for matching
    const exerciseLower = exercise.toLowerCase();
    
    // Determine weight difference category
    let category = '';
    if (weightDifference < 5) {
        category = 'small';
    } else if (weightDifference < 15) {
        category = 'medium';
    } else {
        category = 'large';
    }

    // Exercise-specific workout links
    const workoutLinks = {
        // Chest exercises
        bench: {
            small: { url: 'https://www.youtube.com/results?search_query=progressive+overload+bench+press+tips', text: 'Bench Press Progressive Overload Tips' },
            medium: { url: 'https://www.youtube.com/results?search_query=increase+bench+press+strength+program', text: 'Bench Press Strength Program' },
            large: { url: 'https://www.youtube.com/results?search_query=bench+press+strength+building+routine', text: 'Advanced Bench Press Training' }
        },
        // Squat exercises
        squat: {
            small: { url: 'https://www.youtube.com/results?search_query=squat+progressive+overload+technique', text: 'Squat Progressive Overload Tips' },
            medium: { url: 'https://www.youtube.com/results?search_query=increase+squat+strength+program', text: 'Squat Strength Program' },
            large: { url: 'https://www.youtube.com/results?search_query=advanced+squat+training+program', text: 'Advanced Squat Training' }
        },
        // Deadlift exercises
        deadlift: {
            small: { url: 'https://www.youtube.com/results?search_query=deadlift+progressive+overload+tips', text: 'Deadlift Progressive Overload Tips' },
            medium: { url: 'https://www.youtube.com/results?search_query=increase+deadlift+strength', text: 'Deadlift Strength Program' },
            large: { url: 'https://www.youtube.com/results?search_query=advanced+deadlift+training', text: 'Advanced Deadlift Training' }
        },
        // Shoulder exercises
        press: {
            small: { url: 'https://www.youtube.com/results?search_query=overhead+press+progressive+overload', text: 'Shoulder Press Progressive Tips' },
            medium: { url: 'https://www.youtube.com/results?search_query=increase+shoulder+press+strength', text: 'Shoulder Press Strength Program' },
            large: { url: 'https://www.youtube.com/results?search_query=advanced+shoulder+training', text: 'Advanced Shoulder Training' }
        },
        // Back exercises
        row: {
            small: { url: 'https://www.youtube.com/results?search_query=row+progressive+overload+tips', text: 'Row Progressive Overload Tips' },
            medium: { url: 'https://www.youtube.com/results?search_query=increase+rowing+strength', text: 'Row Strength Program' },
            large: { url: 'https://www.youtube.com/results?search_query=advanced+back+training', text: 'Advanced Back Training' }
        },
        pullup: {
            small: { url: 'https://www.youtube.com/results?search_query=pullup+progression+tips', text: 'Pull-up Progression Tips' },
            medium: { url: 'https://www.youtube.com/results?search_query=increase+pullup+strength', text: 'Pull-up Strength Program' },
            large: { url: 'https://www.youtube.com/results?search_query=advanced+pullup+training', text: 'Advanced Pull-up Training' }
        },
        // Arm exercises
        curl: {
            small: { url: 'https://www.youtube.com/results?search_query=bicep+curl+progressive+overload', text: 'Curl Progressive Overload Tips' },
            medium: { url: 'https://www.youtube.com/results?search_query=build+bigger+biceps+program', text: 'Bicep Strength Program' },
            large: { url: 'https://www.youtube.com/results?search_query=advanced+arm+training', text: 'Advanced Arm Training' }
        },
        // Default for other exercises
        default: {
            small: { url: 'https://www.youtube.com/results?search_query=progressive+overload+training+tips', text: 'Progressive Overload Training Tips' },
            medium: { url: 'https://www.youtube.com/results?search_query=strength+training+program', text: 'Strength Training Program' },
            large: { url: 'https://www.youtube.com/results?search_query=advanced+strength+training', text: 'Advanced Strength Training' }
        }
    };

    // Find matching exercise type
    let matchedExercise = 'default';
    for (const key in workoutLinks) {
        if (exerciseLower.includes(key)) {
            matchedExercise = key;
            break;
        }
    }

    return workoutLinks[matchedExercise][category];
}

/**
 * Display results in the results section
 * @param {Object} logEntry - The log entry with calculation results
 */
function displayResults(logEntry) {
    const { exercise, weight, reps, sets, volumePerSet, totalVolume, currentMaxWeight, targetWeight, weightDifference, workoutLink } = logEntry;

    resultsSection.innerHTML = `
        <h3>✅ Volume Calculated</h3>
        <div class="volume-result">
            Total Volume: ${totalVolume.toLocaleString()}
        </div>
        <div class="result-detail">
            <strong>${exercise}</strong>
        </div>
        <div class="result-detail">
            ${sets} sets × ${reps} reps @ ${weight} lbs/kg
        </div>
        <div class="result-detail">
            Volume per set: ${volumePerSet.toLocaleString()}
        </div>
        <hr style="margin: 1rem 0; border: none; border-top: 2px solid var(--border-color);">
        <div class="result-detail" style="font-size: 1.1rem; margin-top: 1rem;">
            <strong style="color: var(--electric-blue);">📊 Current Estimated Max (1RM):</strong> ${currentMaxWeight} lbs/kg
        </div>
        <div class="result-detail" style="font-size: 1.1rem;">
            <strong style="color: var(--mint-green);">🎯 Target Weight (Next Session):</strong> ${targetWeight} lbs/kg
        </div>
        <div class="result-detail" style="font-size: 1rem; color: var(--navy-blue); margin-top: 0.5rem;">
            <strong>📈 Weight Increase Needed:</strong> +${weightDifference.toFixed(1)} lbs/kg
        </div>
        <div class="result-detail" style="font-size: 0.9rem; color: var(--text-light); margin-top: 0.5rem;">
            💡 Progressive overload tip: Aim for ${targetWeight} lbs/kg in your next session for gradual strength gains.
        </div>
        <div style="margin-top: 1.5rem; padding-top: 1rem; border-top: 2px solid var(--border-color);">
            <a href="${workoutLink.url}" target="_blank" rel="noopener noreferrer" class="workout-link">
                🏋️ ${workoutLink.text} →
            </a>
            <p style="font-size: 0.85rem; color: var(--text-light); margin-top: 0.5rem;">
                Get personalized tips and workout plans to reach your ${exercise} goal
            </p>
        </div>
    `;

    resultsSection.classList.add('show');

    // Scroll to results
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/**
 * Add entry to training log
 * @param {Object} logEntry - The log entry to add
 */
function addToLog(logEntry) {
    // Add to beginning of log (most recent first)
    trainingLog.unshift(logEntry);

    // Limit log to 10 entries
    if (trainingLog.length > 10) {
        trainingLog = trainingLog.slice(0, 10);
    }

    // Update display
    displayLog();
}

/**
 * Display training log entries
 */
function displayLog() {
    if (trainingLog.length === 0) {
        logEntriesContainer.innerHTML = '<p class="empty-log">No training sessions logged yet. Complete the form above to start tracking!</p>';
        return;
    }

    logEntriesContainer.innerHTML = trainingLog.map(entry => {
        const date = entry.timestamp.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        return `
            <div class="log-entry">
                <div class="log-entry-info">
                    <h4>${entry.exercise}</h4>
                    <div class="log-entry-details">
                        ${entry.sets} sets × ${entry.reps} reps @ ${entry.weight} lbs/kg
                    </div>
                    <div class="log-entry-details" style="color: var(--electric-blue); font-weight: 500;">
                        Max: ${entry.currentMaxWeight} | Target: ${entry.targetWeight} lbs/kg
                    </div>
                    <div class="log-entry-details">
                        ${date}
                    </div>
                </div>
                <div class="log-entry-volume">
                    ${entry.totalVolume.toLocaleString()}
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Show error message
 * @param {string} message - Error message to display
 */
function showError(message) {
    resultsSection.innerHTML = `
        <div style="color: var(--error-red); font-weight: 600;">
            ⚠️ ${message}
        </div>
    `;
    resultsSection.classList.add('show');
}

// ===========================
// Initialize
// ===========================

// Initialize empty log display
displayLog();

// Add helpful console message
console.log('%c🏋️ Tips and Plans on progressive overload Training Calculator Ready!', 'color: #00a8ff; font-size: 16px; font-weight: bold;');
console.log('Track your progressive overload journey with science-based training principles.');

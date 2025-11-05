import { doc, getDoc, setDoc, collection, query, orderBy, limit, getDocs } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// Import the reusable initialization and utilities from the parent directory
import { initializeFirebaseApp, appId } from "../firebase-init.js";

// Global variables for Firebase services, populated upon initialization
let db = null;
let userId = 'anonymous';

const TARGET_NUMBER = 67;
let dailyStartingNumber = null;
let hasSolvedToday = false;
let userDisplayName = null; 

// STATE FOR STEP-BY-STEP FLOW
let currentResult = 0; 
let currentInputNumber = ''; 
let currentOperator = ''; 
let operationCount = 0; 
let operationHistory = []; 
let fullSolutionExpression = ''; // Store the solved expression

const todayKey = new Date().toISOString().split('T')[0];

// --- UI Elements ---
const loadingEl = document.getElementById('loading');
const gameContainerEl = document.getElementById('game-container');
const solvedStatusEl = document.getElementById('solved-status');
const currentResultEl = document.getElementById('current-result');
const opCounterEl = document.getElementById('op-counter'); 
const startingNumberDisplayEl = document.getElementById('starting-number-display');
const messageBoxEl = document.getElementById('message-box');
const solvedExpressionEl = document.getElementById('solved-expression');
const solvedOperationsEl = document.getElementById('solved-operations');
const inputOperatorEl = document.getElementById('input-operator');
const inputNumberEl = document.getElementById('input-number');
const historyModalEl = document.getElementById('history-modal');
const historyListEl = document.getElementById('operation-history-list');
const modalOpCountEl = document.getElementById('modal-op-count');

// MODIFICATION: New elements for share in history/leaderboard modals
const historyShareButtonEl = document.getElementById('history-share-button');
const historyShareMessageEl = document.getElementById('history-share-message');
const leaderboardModalEl = document.getElementById('leaderboard-modal');
const leaderboardBodyEl = document.getElementById('leaderboard-body');
const profileTagEl = document.getElementById('profile-tag');
const leaderboardUserHistoryEl = document.getElementById('leaderboard-user-history'); 
const leaderboardSolvedExpressionEl = document.getElementById('leaderboard-solved-expression'); 
const leaderboardSolvedOperationsEl = document.getElementById('leaderboard-solved-operations'); 
const leaderboardShareMessageEl = document.getElementById('leaderboard-share-message'); 

// --- CORE UTILITY FUNCTIONS ---

/**
 * Calculates the Diversity Score based on the operators used in the solution.
 */
function calculateDiversityScore(history) {
    if (history.length === 0) return 0;
    const usedOperators = new Set(history.map(step => step.op));
    return usedOperators.size;
}

/**
 * Prompts the user for a 2-character display name and saves it.
 */
window.updateDisplayName = async function() {
    let name = '';
    while (true) {
        // NOTE: If using this code in Canvas, replace 'alert' and 'prompt' with custom modal UI.
        const userInput = prompt(`Enter your new 2-character tag. Only letters A-Z are allowed. Current: ${userDisplayName}`);
        
        if (userInput === null) return; // User cancelled
        
        // 1. Remove non-alphabetic characters (the fix)
        // This regex replaces anything that is NOT a letter (a-z, A-Z) with an empty string
        const cleanedName = userInput.replace(/[^a-zA-Z]/g, '').toUpperCase();
        
        // 2. Validate the cleaned length
        if (cleanedName.length >= 2 && cleanedName.length <= 2) {
            name = cleanedName;
            break;
        }
        alert("Please enter exactly 2 characters, using only letters (e.g., ZF, LS). Non-letter characters were ignored.");
    }
    
    // The rest of the logic remains the same, using the now-clean 'name' variable
    userDisplayName = name;
    
    // Save the new name to the user's private profile document
    if (db) {
        // Correct path: /users/{userId}/profile/data
        const userProfileDocRef = doc(db, `/artifacts/${appId}/users/${userId}/profile`, 'data');
        await setDoc(userProfileDocRef, { displayName: userDisplayName }, { merge: true });
        
        // If they already solved today, also update the public leaderboard tag
        if (hasSolvedToday) {
            // FIX 1: Ensure update uses the 5-segment path
            // New Path: /artifacts/{appId}/leaderboard_scores/{todayKey}/scores/{userId}
            const leaderboardDocRef = doc(db, 'artifacts', appId, 'leaderboard_scores', todayKey, 'scores', userId);
            await setDoc(leaderboardDocRef, { displayName: userDisplayName }, { merge: true });
        }
    }
    profileTagEl.textContent = userDisplayName;
}

/**
 * Toggles the visibility of the operation history modal.
 */
window.toggleModal = function(show) {
    if (show) {
        leaderboardModalEl.classList.remove('active'); // Ensure LB is closed
        historyModalEl.classList.remove('hidden');
        historyModalEl.classList.add('active'); 
        renderHistory();
    } else {
        historyModalEl.classList.remove('active'); 
        // MODIFICATION: Hide the share messages when closing
        historyShareMessageEl.style.display = 'none';
        setTimeout(() => {
            historyModalEl.classList.add('hidden');
        }, 300); 
    }
}

/**
 * Toggles the visibility of the leaderboard modal and fetches data if opened.
 */
window.toggleLeaderboardModal = function(show) {
    if (show) {
        historyModalEl.classList.remove('active'); // Ensure History is closed
        leaderboardModalEl.classList.remove('hidden');
        leaderboardModalEl.classList.add('active');
        // MODIFICATION: Set user history box visibility based on solved status
        if (hasSolvedToday) {
            leaderboardUserHistoryEl.classList.remove('hidden');
        } else {
            leaderboardUserHistoryEl.classList.add('hidden');
        }
        // MODIFICATION: Hide share message when opening modal
        leaderboardShareMessageEl.style.display = 'none'; 
        renderLeaderboard();
    } else {
        leaderboardModalEl.classList.remove('active'); 
        // MODIFICATION: Hide the share messages when closing
        leaderboardShareMessageEl.style.display = 'none';
        setTimeout(() => {
            leaderboardModalEl.classList.add('hidden');
        }, 300); 
    }
}

/**
 * Fetches and renders the leaderboard scores.
 */
async function renderLeaderboard() {
    if (!db) {
        leaderboardBodyEl.innerHTML = '<tr><td colspan="4" class="leaderboard-loading">Error: Database connection failed.</td></tr>';
        return;
    }

    try {
        // FIX 2: Correct Collection Path: Now 5 segments (C/D/C/D/C) to query the 'scores' collection
        // Path: /artifacts/{appId}/leaderboard_scores/{todayKey}/scores
        const scoresRef = collection(db, 'artifacts', appId, 'leaderboard_scores', todayKey, 'scores');
        
        // Query: 1. Order by Diversity Score (DESC), 2. Order by Operations (ASC), 3. Take Top 10
        const q = query(
            scoresRef, 
            orderBy('diversityScore', 'desc'),
            orderBy('operations', 'asc'),
            limit(10)
        );

        const snapshot = await getDocs(q);
        let html = '';
        
        if (snapshot.empty) {
            html = '<tr><td colspan="4" class="leaderboard-loading">Be the first to solve today\'s challenge!</td></tr>';
        } else {
            let rank = 1;
            snapshot.forEach(doc => {
                const data = doc.data();
                const isUser = doc.id === userId;
                
                const rowClass = isUser ? 'style="background-color: rgba(6, 182, 212, 0.2);"' : '';
                
                html += `
                    <tr ${rowClass}>
                        <td>${rank}.</td>
                        <td class="rank-tag">${data.displayName}</td>
                        <td>${data.diversityScore}</td>
                        <td>${data.operations}</td>
                    </tr>
                `;
                rank++;
            });
        }
        leaderboardBodyEl.innerHTML = html;

    } catch (error) {
        console.error("Error fetching leaderboard:", error);
        leaderboardBodyEl.innerHTML = '<tr><td colspan="4" class="leaderboard-loading">Error fetching scores. Please check console.</td></tr>';
    }
}


/**
 * Renders the operation history into the modal list.
 */
function renderHistory() {
    historyListEl.innerHTML = '';
    modalOpCountEl.textContent = `Total Steps: ${operationCount}`;

    // MODIFICATION: Enable/Disable share button based on solved status
    historyShareButtonEl.disabled = !hasSolvedToday;
    if (hasSolvedToday) {
        historyShareButtonEl.textContent = "Copy Score to Share";
    } else {
        historyShareButtonEl.textContent = "Solve to Share";
    }

    if (operationHistory.length === 0 && !hasSolvedToday) {
        historyListEl.innerHTML = `<li class="placeholder">Starting with ${dailyStartingNumber}</li>`;
        return;
    }

    const initialLi = document.createElement('li');
    initialLi.style.color = 'var(--text-gray-400)';
    initialLi.style.borderBottom = '1px solid var(--bg-gray-700)';
    initialLi.style.paddingBottom = '0.25rem';
    initialLi.innerHTML = `&rarr; <strong>Start:</strong> <span style="color: var(--text-yellow-400);">${dailyStartingNumber}</span>`;
    historyListEl.appendChild(initialLi);


    operationHistory.forEach((step, index) => {
        const li = document.createElement('li');
        li.style.paddingTop = '0.25rem';
        li.style.paddingBottom = '0.25rem';
        li.style.fontSize = '0.875rem';
        li.style.borderBottom = '1px solid var(--bg-gray-700)';
        if (index === operationHistory.length - 1) {
             li.style.borderBottom = 'none';
        }
        
        li.innerHTML = `
            <span style="color: var(--text-gray-400);">${index + 1}.</span> 
            <span style="font-family: 'IBM Plex Mono', monospace; font-size: 1rem;">${step.prevResult.toFixed(4).replace(/\.?0+$/, '')}</span> 
            <span style="color: var(--text-yellow-400); font-weight: bold;">${step.op}</span> 
            <span style="font-family: 'IBM Plex Mono', monospace; font-size: 1rem;">${step.num.toFixed(4).replace(/\.?0+$/, '')}</span> 
            = 
            <span style="color: var(--calc-display-color); font-weight: bold; font-size: 1rem;">${step.result.toFixed(4).replace(/\.?0+$/, '')}</span>
        `;
        historyListEl.appendChild(li);
    });
}

/**
 * Creates and copies the share message to the clipboard.
 * MODIFICATION: Now uses the share message element from the currently open modal.
 */
window.shareResults = function() {
    if (!hasSolvedToday) return;

    let emojiGrid = operationHistory.map(h => {
        switch(h.op) {
            case '+': return '🟢'; 
            case '*': return '🟡'; 
            case '/': return '🔵'; 
            default: return '⚪️';
        }
    }).join(' ');

    const shareText = 
`🔢 **Calc67** Daily Challenge: ${todayKey}
Tag: ${userDisplayName}
Started at: ${dailyStartingNumber}
Solved in **${operationCount} steps** (Diversity: ${calculateDiversityScore(operationHistory)})!

${emojiGrid}

#Calc67 #MathGame
https://zedf.co.uk/calc67/`;

    // Determine which message element to use
    let shareMessageEl = historyModalEl.classList.contains('active') 
                         ? historyShareMessageEl 
                         : leaderboardModalEl.classList.contains('active') 
                            ? leaderboardShareMessageEl 
                            : null;
    
    // Fallback if somehow neither modal is active (shouldn't happen with the new layout)
    if (!shareMessageEl) {
        console.error("Share called but no active modal found.");
        return;
    }

    // Clear and display copy message logic
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(shareText).then(() => {
            shareMessageEl.textContent = "Copied to clipboard!";
            shareMessageEl.style.display = 'block';
            setTimeout(() => shareMessageEl.style.display = 'none', 3000); 
        }).catch(err => {
            console.error('Could not copy text: ', err);
            shareMessageEl.textContent = "Failed to copy. Check console.";
            shareMessageEl.style.display = 'block';
        });
    } else {
        const tempTextArea = document.createElement('textarea');
        tempTextArea.value = shareText;
        document.body.appendChild(tempTextArea);
        tempTextArea.focus();
        tempTextArea.select();
        try {
            document.execCommand('copy');
            shareMessageEl.textContent = "Copied to clipboard!";
            shareMessageEl.style.display = 'block';
            setTimeout(() => shareMessageEl.style.display = 'none', 3000);
        } catch (err) {
            shareMessageEl.textContent = "Copy failed. Please copy manually.";
            shareMessageEl.style.display = 'block';
        }
        document.body.removeChild(tempTextArea);
    }
}

/**
 * Updates the UI elements based on the current state.
 */
function updateUI() {
    currentResultEl.textContent = currentResult.toFixed(4).replace(/\.?0+$/, ''); 
    inputNumberEl.textContent = currentInputNumber === '' ? '0' : currentInputNumber;
    inputOperatorEl.textContent = currentOperator === '' ? '?' : currentOperator;
    opCounterEl.textContent = `Operations: ${operationCount}`;

    document.querySelectorAll('.op-button').forEach(btn => {
        btn.classList.remove('selected');
    });
    if (currentOperator) {
        let opId;
        if (currentOperator === '*') {
            opId = 'op-mult';
        } else if (currentOperator === '/') {
            opId = 'op-div';
        } else if (currentOperator === '+') {
            opId = 'op-add';
        }

        if (opId) {
            document.getElementById(opId).classList.add('selected');
        }
    }
}

/**
 * Loads the user's display name from their private profile document.
 */
async function loadUserDisplayName() {
    let prefix = userId.substring(0, 2).toUpperCase();
    
    if (!db) {
        userDisplayName = prefix; 
        profileTagEl.textContent = userDisplayName;
        return;
    }
    
    try {
        const userProfileDocRef = doc(db, `/artifacts/${appId}/users/${userId}/profile`, 'data');
        const userDoc = await getDoc(userProfileDocRef);
        
        if (userDoc.exists() && userDoc.data().displayName) {
            userDisplayName = userDoc.data().displayName;
        } else {
            userDisplayName = prefix;
            await setDoc(userProfileDocRef, { displayName: userDisplayName }, { merge: true });
        }
        profileTagEl.textContent = userDisplayName;
        
    } catch (error) {
        console.error("Error loading user display name:", error);
        userDisplayName = prefix;
        profileTagEl.textContent = userDisplayName;
    }
}


/**
 * Loads the daily starting number (creating it if necessary) and the user's status for the day.
 */
async function loadDailyChallenge() {
    await loadUserDisplayName(); 

    if (!db) {
        dailyStartingNumber = (todayKey.charCodeAt(8) * todayKey.charCodeAt(9) % 1000) + 10;
    } else {
        try {
            const dailyNumDocRef = doc(db, `/artifacts/${appId}/public/data/daily_numbers`, todayKey);
            const dailyNumDoc = await getDoc(dailyNumDocRef);

            if (dailyNumDoc.exists()) {
                dailyStartingNumber = dailyNumDoc.data().number;
            } else {
                const min = 10;
                const max = 10000;
                const seed = todayKey.replace(/-/g, '').substring(4); 
                const seededRandom = new (function(seed) {
                    let s = seed;
                    this.next = function() {
                        s = (s * 9301 + 49297) % 233280;
                        return s / 233280.0;
                    };
                })(parseInt(seed));
                
                dailyStartingNumber = Math.floor(seededRandom.next() * (max - min + 1)) + min;
                
                await setDoc(dailyNumDocRef, { number: dailyStartingNumber, date: todayKey });
            }

            const userStatusDocRef = doc(db, `/artifacts/${appId}/users/${userId}/daily_challenges`, todayKey);
            const userStatusDoc = await getDoc(userStatusDocRef);
            if (userStatusDoc.exists() && userStatusDoc.data().solved) {
                hasSolvedToday = true;
                // MODIFICATION: Store the full expression in a global variable
                fullSolutionExpression = userStatusDoc.data().expression || '—'; 
                solvedExpressionEl.textContent = fullSolutionExpression;
                solvedOperationsEl.textContent = `Diversity: ${userStatusDoc.data().diversityScore} | Steps: ${userStatusDoc.data().operations}`;
                
                // NEW: Populate the leaderboard's user history section
                leaderboardSolvedExpressionEl.textContent = fullSolutionExpression;
                leaderboardSolvedOperationsEl.textContent = `Diversity: ${userStatusDoc.data().diversityScore} | Steps: ${userStatusDoc.data().operations}`;

                if (userStatusDoc.data().history) {
                    operationHistory = JSON.parse(userStatusDoc.data().history);
                    operationCount = userStatusDoc.data().operations;
                }
            }

        } catch (error) {
            console.error("Error loading daily challenge from Firestore:", error);
            dailyStartingNumber = 42; 
        }
    }
    
    currentResult = dailyStartingNumber;
    startingNumberDisplayEl.textContent = `Start: ${dailyStartingNumber}`;
    
    loadingEl.classList.add('hidden');
    if (hasSolvedToday) {
        solvedStatusEl.classList.add('active');
    } else {
        gameContainerEl.classList.remove('hidden');
        updateUI();
    }
}

/**
 * Safely evaluates a math expression string, handling division by zero.
 */
function safeEval(exp) {
    try {
        if (!/^[\d\s\.\+\*\/\-]+$/.test(exp)) {
            console.error("Invalid characters in expression.");
            return null;
        }
        
        let finalExp = exp.replace(/\s*\/\s*(\d+\.?\d*)/g, (match, divisor) => {
            if (parseFloat(divisor) === 0) {
                console.error("Division by zero error.");
                return null;
            }
            return `/${divisor}`;
        });
        
        return finalExp === null ? null : new Function('return ' + finalExp)();

    } catch (e) {
        console.error("Evaluation error:", e.message);
        return null;
    }
}

/**
 * Handles all button clicks on the calculator (numbers, operators, AC, DEL).
 */
window.handleInput = function(value) {
    if (hasSolvedToday) {
        messageBoxEl.textContent = "Already solved today!";
        return;
    }
    
    const isNumber = !isNaN(parseFloat(value)) || value === '.';
    const isOperator = ['+', '*', '/'].includes(value);

    if (isNumber) {
        if (currentInputNumber === '' && value === '.') {
            currentInputNumber = '0.';
        } else if (currentInputNumber.includes('.') && value === '.') {
            // Ignore second decimal point
        } else {
            if (currentInputNumber === '0' && value !== '.') {
                currentInputNumber = value;
            } else {
                currentInputNumber += value;
            }
        }
        
    } else if (isOperator) {
        currentOperator = value;
        messageBoxEl.textContent = `Operator selected: ${value}. Ready to APPLY.`;

    } else if (value === 'DEL') {
        if (currentInputNumber.length > 0) {
            currentInputNumber = currentInputNumber.slice(0, -1);
        }
        if (currentInputNumber.length === 0) {
            currentInputNumber = ''; 
        }
        messageBoxEl.textContent = "Entry cleared.";

    } else if (value === 'AC') {
        currentResult = dailyStartingNumber;
        currentInputNumber = '';
        currentOperator = '';
        operationCount = 0; 
        operationHistory = [];
        messageBoxEl.textContent = "Challenge reset. Start a new step!";
    }
    updateUI();
}

/**
 * Executes the step: Current Result [Op] Second Number = New Result.
 */
window.executeStep = function() {
    if (hasSolvedToday) {
        messageBoxEl.textContent = "Already solved today!";
        return;
    }

    const operand2 = parseFloat(currentInputNumber);

    if (currentOperator === '') {
        messageBoxEl.textContent = "Please select an operation (+, *, /).";
        return;
    }
    if (isNaN(operand2) || currentInputNumber === '') {
        messageBoxEl.textContent = "Please enter a valid second number.";
        return;
    }
    
    // --- ANTI-CHEAT LOGIC ---
    
    // Rule 1: Prevent division by self (e.g., 50 / 50 = 1)
    if (currentOperator === '/' && currentResult === operand2) {
        messageBoxEl.textContent = "Cheat Detected: Cannot divide the current result by itself! Try again.";
        currentInputNumber = '';
        updateUI();
        return;
    }

    const expression = `${currentResult} ${currentOperator} ${operand2}`;
    const newResult = safeEval(expression);

    if (newResult === null) {
        messageBoxEl.textContent = "Error: Division by zero or invalid operation! Clearing input.";
        currentInputNumber = '';
        updateUI();
        return;
    }
    
    // Rule 2: Prevent trivial multiplication by 1 to get the target
    if (currentOperator === '*' && Math.abs(operand2 - 1) < 0.0001 && Math.abs(newResult - TARGET_NUMBER) < 0.0001) {
        messageBoxEl.textContent = "Cheat Detected: Trivial solution (*1) blocked. Try a real step!";
        currentInputNumber = '';
        currentOperator = '';
        updateUI();
        return;
    }

    // Record step and update state
    const prevResult = currentResult;
    currentResult = newResult;
    operationCount++;
    
    operationHistory.push({
        op: currentOperator,
        num: operand2,
        prevResult: prevResult,
        result: currentResult
    });

    // Clear input fields for the next step
    currentInputNumber = '';
    currentOperator = '';
    
    messageBoxEl.textContent = `Step ${operationCount} applied. Result: ${currentResult.toFixed(4).replace(/\.?0+$/, '')}`;
    updateUI();

    // Check the result against the target
    checkGoal(currentResult);
}

/**
 * Checks the calculated result against the target number (67) AND handles saving scores.
 */
async function checkGoal(result) {
    const difference = Math.abs(result - TARGET_NUMBER);
    const tolerance = 0.0001; 

    if (difference < tolerance) {
        // --- 1. SUCCESS STATE ---
        messageBoxEl.textContent = "SUCCESS! You hit 67!";
        hasSolvedToday = true;
        
        gameContainerEl.classList.add('hidden');
        
        const expressionSteps = operationHistory.map(h => `${h.op} ${h.num.toFixed(4).replace(/\.?0+$/, '')}`).join(' ');
        fullSolutionExpression = `${dailyStartingNumber} ${expressionSteps} = ${result.toFixed(4).replace(/\.?0+$/, '')}`; // Store expression
        
        // --- 2. DIVERSITY SCORING & DISPLAY ---
        const scoreDiversity = calculateDiversityScore(operationHistory);

        solvedExpressionEl.textContent = fullSolutionExpression;
        solvedOperationsEl.textContent = `Diversity: ${scoreDiversity} | Steps: ${operationCount}`;
        solvedStatusEl.classList.add('active'); 
        
        // NEW: Update the leaderboard's user history section immediately
        leaderboardSolvedExpressionEl.textContent = fullSolutionExpression;
        leaderboardSolvedOperationsEl.textContent = `Diversity: ${scoreDiversity} | Steps: ${operationCount}`;


        // --- 3. SAVE SCORES TO FIRESTORE ---
        if (db) {
            const historyJson = JSON.stringify(operationHistory);
            
            // A. Save to PRIVATE User Status (Correct Path)
            const userStatusDocRef = doc(db, `/artifacts/${appId}/users/${userId}/daily_challenges`, todayKey);
            await setDoc(userStatusDocRef, {
                solved: true,
                date: todayKey,
                operations: operationCount, 
                diversityScore: scoreDiversity,
                result: result,
                history: historyJson, 
                timestamp: new Date(),
                displayName: userDisplayName,
                expression: fullSolutionExpression // Save the full expression here
            }, { merge: true }).catch(e => console.error("Failed to save user status:", e));

            // B. Save to PUBLIC Leaderboard (FIX 3: Corrected Path to 5 segments)
            // New Path: /artifacts/{appId}/leaderboard_scores/{todayKey}/scores/{userId}
            const leaderboardDocRef = doc(db, 'artifacts', appId, 'leaderboard_scores', todayKey, 'scores', userId);
            await setDoc(leaderboardDocRef, {
                userId: userId,
                displayName: userDisplayName,
                operations: operationCount, 
                diversityScore: scoreDiversity,
                timestamp: new Date()
            }, { merge: true }).catch(e => console.error("Failed to save leaderboard score:", e));
        }

        // --- 4. DISPLAY LEADERBOARD ---
        toggleLeaderboardModal(true); // Open the leaderboard modal automatically
    }
}

/**
 * Application Entry Point: Initializes Firebase then loads the daily challenge data.
 */
async function initApp() {
    const firebaseServices = await initializeFirebaseApp();
    db = firebaseServices.db;
    userId = firebaseServices.userId;
    
    await loadDailyChallenge();
}

// Initialize the application on window load
window.onload = initApp;
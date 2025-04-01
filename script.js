let patternStep = 2;
let currentPattern = [];
let userAnswers = new Array(5).fill(null);
let score = 0;
let gameMode = 'forward'; // حالت پیش‌فرض بازی
let usedStartNumbers = new Set(); // برای جلوگیری از تکرار اعداد شروع
let difficulty = 'easy'; // سطح سختی پیش‌فرض
let hintsRemaining = 3; // تعداد راهنمایی‌های باقی‌مانده
let consecutiveCorrect = 0; // تعداد پاسخ‌های درست متوالی

function showDifficultyMenu(mode) {
    gameMode = mode;
    document.getElementById('mainMenu').style.display = 'none';
    document.getElementById('difficultyMenu').style.display = 'block';
    
    // تنظیم عنوان منوی سختی بر اساس حالت بازی
    const modeText = mode === 'forward' ? 'حرکت رو به جلو' : 'حرکت رو به عقب';
    const modeIcon = mode === 'forward' ? '🔼' : '🔽';
    document.getElementById('difficultyTitle').innerHTML = `${modeIcon} انتخاب سطح سختی برای ${modeText}`;
}

function showMainMenu() {
    document.getElementById('mainMenu').style.display = 'block';
    document.getElementById('difficultyMenu').style.display = 'none';
    document.getElementById('gameScreen').style.display = 'none';
    usedStartNumbers.clear(); // پاک کردن تاریخچه اعداد استفاده شده
}

function startGame(selectedDifficulty) {
    difficulty = selectedDifficulty;
    score = 0;
    hintsRemaining = difficulty === 'easy' ? 3 : (difficulty === 'medium' ? 2 : 1);
    consecutiveCorrect = 0;
    
    document.getElementById('score').textContent = '0';
    document.getElementById('hints').textContent = hintsRemaining;
    document.getElementById('difficultyMenu').style.display = 'none';
    document.getElementById('gameScreen').style.display = 'block';
    
    // تنظیم آیکون و متن حالت بازی
    const modeIcon = gameMode === 'forward' ? '🔼' : '🔽';
    const modeText = gameMode === 'forward' ? 'حرکت رو به جلو' : 'حرکت رو به عقب';
    document.getElementById('gameModeIcon').textContent = modeIcon;
    document.getElementById('gameModeText').textContent = modeText;
    
    // نمایش سطح سختی
    const difficultyIcons = { easy: '😊', medium: '🤔', hard: '😰' };
    document.getElementById('difficultyIcon').textContent = difficultyIcons[difficulty];
    
    newGame();
}

function generatePattern() {
    let startNumber;
    const maxAttempts = 10; // حداکثر تلاش برای پیدا کردن عدد جدید
    let attempts = 0;
    
    // محدوده اعداد بر اساس سطح سختی
    const ranges = {
        easy: { min: 1, max: 15 },
        medium: { min: 1, max: 25 },
        hard: { min: 1, max: 50 }
    };
    
    do {
        startNumber = Math.floor(Math.random() * (ranges[difficulty].max - ranges[difficulty].min + 1)) + ranges[difficulty].min;
        attempts++;
        if (attempts >= maxAttempts) {
            usedStartNumbers.clear(); // اگر نتوانستیم عدد جدید پیدا کنیم، لیست را پاک می‌کنیم
            break;
        }
    } while (usedStartNumbers.has(startNumber));
    
    usedStartNumbers.add(startNumber);
    currentPattern = [];
    
    // ایجاد 3 عدد الگو
    if (gameMode === 'forward') {
        for (let i = 0; i < 3; i++) {
            currentPattern.push(startNumber + (i * patternStep));
        }
    } else {
        for (let i = 2; i >= 0; i--) {
            currentPattern.push(startNumber + (i * patternStep));
        }
    }
    
    return currentPattern;
}

function renderPattern() {
    const patternContainer = document.getElementById('pattern-numbers');
    patternContainer.innerHTML = '';
    
    currentPattern.forEach(number => {
        const div = document.createElement('div');
        div.className = 'number';
        div.textContent = number;
        patternContainer.appendChild(div);
    });
}

function renderAnswerSlots() {
    const answerContainer = document.getElementById('answer-numbers');
    answerContainer.innerHTML = '';
    
    for (let i = 0; i < 5; i++) {
        const div = document.createElement('div');
        div.className = 'number answer-slot';
        div.dataset.index = i;
        if (userAnswers[i] !== null) {
            div.textContent = userAnswers[i];
            div.classList.add('selected');
        }
        div.addEventListener('click', () => {
            if (userAnswers[i] !== null) {
                userAnswers[i] = null;
                renderAnswerSlots();
            }
        });
        answerContainer.appendChild(div);
    }
}

function renderNumberPad() {
    const numberPad = document.getElementById('number-pad');
    numberPad.innerHTML = '';
    
    const baseNumber = gameMode === 'forward' ? 
        currentPattern[currentPattern.length - 1] : 
        currentPattern[0];
    
    let possibleNumbers = [];
    for (let i = 1; i <= 5; i++) {
        const nextNumber = gameMode === 'forward' ? 
            baseNumber + (i * patternStep) : 
            baseNumber - (i * patternStep);
            
        // اضافه کردن اعداد نزدیک به جواب صحیح
        possibleNumbers.push(nextNumber - 1);
        possibleNumbers.push(nextNumber);
        possibleNumbers.push(nextNumber + 1);
    }
    
    // حذف اعداد تکراری، منفی و مرتب‌سازی
    possibleNumbers = [...new Set(possibleNumbers)]
        .filter(num => num > 0)
        .sort((a, b) => a - b)
        .slice(0, 10);
    
    // مرتب کردن تصادفی اعداد
    possibleNumbers.sort(() => Math.random() - 0.5);
    
    possibleNumbers.forEach(number => {
        const div = document.createElement('div');
        div.className = 'number';
        div.textContent = number;
        div.addEventListener('click', () => selectNumber(number));
        numberPad.appendChild(div);
    });
}

function selectNumber(num) {
    const emptyIndex = userAnswers.findIndex(answer => answer === null);
    if (emptyIndex !== -1) {
        userAnswers[emptyIndex] = num;
        renderAnswerSlots();
    }
}

function useHint() {
    if (hintsRemaining <= 0) {
        showPopup('warning', 'راهنمایی', 'راهنمایی‌های شما تمام شده است');
        return;
    }

    const emptyIndex = userAnswers.findIndex(answer => answer === null);
    if (emptyIndex === -1) {
        showPopup('warning', 'راهنمایی', 'همه خانه‌ها پر هستند');
        return;
    }

    const baseNumber = gameMode === 'forward' ? 
        currentPattern[currentPattern.length - 1] : 
        currentPattern[0];
    
    const correctAnswer = gameMode === 'forward' ? 
        baseNumber + ((emptyIndex + 1) * patternStep) : 
        baseNumber - ((emptyIndex + 1) * patternStep);

    userAnswers[emptyIndex] = correctAnswer;
    hintsRemaining--;
    
    document.getElementById('hints').textContent = hintsRemaining;
    renderAnswerSlots();
    
    // نمایش انیمیشن برای عدد راهنمایی
    const slots = document.querySelectorAll('.answer-slot');
    slots[emptyIndex].classList.add('hint-animation');
}

function checkAnswer() {
    const filledAnswers = userAnswers.filter(answer => answer !== null).length;
    if (filledAnswers < 5) {
        showPopup('warning', 'خطا', 'لطفاً همه 5 عدد را وارد کنید');
        return;
    }

    const baseNumber = gameMode === 'forward' ? 
        currentPattern[currentPattern.length - 1] : 
        currentPattern[0];
    let correctCount = 0;
    
    const answerSlots = document.querySelectorAll('.answer-slot');
    userAnswers.forEach((answer, index) => {
        const correctAnswer = gameMode === 'forward' ? 
            baseNumber + ((index + 1) * patternStep) : 
            baseNumber - ((index + 1) * patternStep);
        const slot = answerSlots[index];
        
        if (answer === correctAnswer) {
            slot.classList.add('correct');
            correctCount++;
        } else {
            slot.classList.add('incorrect');
        }
    });

    // محاسبه امتیاز بر اساس سطح سختی
    const difficultyMultiplier = {
        easy: 1,
        medium: 1.5,
        hard: 2
    };
    
    const baseScore = correctCount * 5;
    const difficultyBonus = Math.floor(baseScore * (difficultyMultiplier[difficulty] - 1));
    
    score += baseScore + difficultyBonus;

    if (correctCount === 5) {
        consecutiveCorrect++;
        const streakBonus = Math.floor(consecutiveCorrect * 2);
        score += 5 + streakBonus;
        
        // اضافه کردن راهنمایی اضافی بعد از 3 پاسخ درست متوالی
        if (consecutiveCorrect % 3 === 0) {
            hintsRemaining++;
            document.getElementById('hints').textContent = hintsRemaining;
        }
    } else {
        consecutiveCorrect = 0;
    }

    document.getElementById('score').textContent = score;
    
    setTimeout(() => {
        if (correctCount === 5) {
            const message = `امتیاز پایه: ${baseScore}\nپاداش سختی: ${difficultyBonus}\nپاداش توالی: ${consecutiveCorrect * 2}\nمجموع: ${score}`;
            showPopup('success', 'آفرین! 🌟', message);
        } else if (correctCount > 0) {
            showPopup('warning', 'تقریباً درست!', `${correctCount} جواب از 5 جواب درست است`);
        } else {
            showPopup('error', 'اشتباه', 'متأسفانه هیچ کدام از جواب‌ها درست نبودند');
        }
    }, 1000);
}

function showPopup(type, title, message) {
    const popup = document.getElementById('resultPopup');
    const popupElement = popup.querySelector('.popup');
    const iconElement = document.getElementById('popupIcon');
    const titleElement = document.getElementById('popupTitle');
    const messageElement = document.getElementById('popupMessage');

    popupElement.className = 'popup ' + type;

    let icon = '';
    switch(type) {
        case 'success':
            icon = '🎉';
            break;
        case 'error':
            icon = '❌';
            break;
        case 'warning':
            icon = '⚠️';
            break;
    }
    iconElement.textContent = icon;
    titleElement.textContent = title;
    messageElement.textContent = message;
    popup.classList.add('show');
}

function closePopup() {
    const popup = document.getElementById('resultPopup');
    popup.classList.remove('show');
    newGame();
}

function changePattern() {
    patternStep = parseInt(document.getElementById('pattern-type').value);
    newGame();
}

function newGame() {
    userAnswers = new Array(5).fill(null);
    generatePattern();
    renderPattern();
    renderAnswerSlots();
    renderNumberPad();
}

// نمایش منوی اصلی در شروع
document.getElementById('gameScreen').style.display = 'none'; 
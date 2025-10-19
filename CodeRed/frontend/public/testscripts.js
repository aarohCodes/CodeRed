// Auth Modal Functionality
document.addEventListener('DOMContentLoaded', function() {
    const authModal = document.getElementById('authModal');
    const loginBtn = document.getElementById('loginBtn');
    const startReadingBtn = document.getElementById('startReadingBtn');
    const closeModalBtns = document.querySelectorAll('.close-modal');
    const showSignupFormBtn = document.getElementById('showSignupForm');
    const signinBtn = document.querySelector('.signin-btn');
    
    // Screens
    const initialScreen = document.getElementById('initialScreen');
    const signupFormScreen = document.getElementById('signupFormScreen');
    const skillLevelScreen = document.getElementById('skillLevelScreen');
    const storageLocationScreen = document.getElementById('storageLocationScreen');
    const nutritionGoalsScreen = document.getElementById('nutritionGoalsScreen');
    
    // Forms
    const signupForm = document.getElementById('signupForm');
    const skillForm = document.getElementById('skillForm');
    const storageForm = document.getElementById('storageForm');
    const nutritionForm = document.getElementById('nutritionForm');
    
    // Back buttons
    const backToInitial = document.getElementById('backToInitial');
    const backToSignupForm = document.getElementById('backToSignupForm');
    const backToSkillLevel = document.getElementById('backToSkillLevel');
    const backToStorage = document.getElementById('backToStorage');
    
    // Store user data
    let userData = {};

    // Function to open modal
    function openModal() {
        authModal.style.display = 'block';
        document.body.classList.add('modal-open');
        resetToInitialScreen();
    }

    // Function to close modal
    function closeModalFunc() {
        authModal.style.display = 'none';
        document.body.classList.remove('modal-open');
        resetToInitialScreen();
    }

    // Reset to initial screen
    function resetToInitialScreen() {
        initialScreen.classList.remove('slide-left', 'slide-right');
        initialScreen.classList.add('slide-center');
        signupFormScreen.classList.remove('slide-left', 'slide-center');
        signupFormScreen.classList.add('slide-right');
        skillLevelScreen.classList.remove('slide-left', 'slide-center');
        skillLevelScreen.classList.add('slide-right');
        storageLocationScreen.classList.remove('slide-left', 'slide-center');
        storageLocationScreen.classList.add('slide-right');
        nutritionGoalsScreen.classList.remove('slide-left', 'slide-center');
        nutritionGoalsScreen.classList.add('slide-right');
    }

    // Slide to signup form
    function showSignupFormScreen() {
        console.log('showSignupFormScreen called');
        console.log('Initial screen classes before:', initialScreen.className);
        console.log('Signup form screen classes before:', signupFormScreen.className);
        
        initialScreen.classList.remove('slide-center');
        initialScreen.classList.add('slide-left');
        signupFormScreen.classList.remove('slide-right');
        signupFormScreen.classList.add('slide-center');
        
        console.log('Initial screen classes after:', initialScreen.className);
        console.log('Signup form screen classes after:', signupFormScreen.className);
    }

    // Slide to skill level
    function showSkillLevelScreen() {
        signupFormScreen.classList.remove('slide-center');
        signupFormScreen.classList.add('slide-left');
        skillLevelScreen.classList.remove('slide-right');
        skillLevelScreen.classList.add('slide-center');
    }

    // Slide to storage location
    function showStorageLocationScreen() {
        skillLevelScreen.classList.remove('slide-center');
        skillLevelScreen.classList.add('slide-left');
        storageLocationScreen.classList.remove('slide-right');
        storageLocationScreen.classList.add('slide-center');
    }

    // Slide to nutrition goals
    function showNutritionGoalsScreen() {
        storageLocationScreen.classList.remove('slide-center');
        storageLocationScreen.classList.add('slide-left');
        nutritionGoalsScreen.classList.remove('slide-right');
        nutritionGoalsScreen.classList.add('slide-center');
    }

    // Back to initial
    function backToInitialScreen() {
        signupFormScreen.classList.remove('slide-center');
        signupFormScreen.classList.add('slide-right');
        initialScreen.classList.remove('slide-left');
        initialScreen.classList.add('slide-center');
    }

    // Back to signup form
    function backToSignupFormScreen() {
        skillLevelScreen.classList.remove('slide-center');
        skillLevelScreen.classList.add('slide-right');
        signupFormScreen.classList.remove('slide-left');
        signupFormScreen.classList.add('slide-center');
    }

    // Back to skill level
    function backToSkillLevelScreen() {
        storageLocationScreen.classList.remove('slide-center');
        storageLocationScreen.classList.add('slide-right');
        skillLevelScreen.classList.remove('slide-left');
        skillLevelScreen.classList.add('slide-center');
    }

    // Back to storage location
    function backToStorageScreen() {
        nutritionGoalsScreen.classList.remove('slide-center');
        nutritionGoalsScreen.classList.add('slide-right');
        storageLocationScreen.classList.remove('slide-left');
        storageLocationScreen.classList.add('slide-center');
    }

    // Event listeners for buttons that open modal
    // loginBtn now opens the sign-in popup (handled in test.html inline script)
    // Keep startReadingBtn to open the signup modal
    if (startReadingBtn) {
        startReadingBtn.addEventListener('click', openModal);
    }

    // Event listener for close buttons
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', closeModalFunc);
    });

    // Show signup form
    if (showSignupFormBtn) {
        console.log('Sign up button found and listener attached');
        showSignupFormBtn.addEventListener('click', function(e) {
            console.log('Sign up button clicked!');
            e.preventDefault();
            showSignupFormScreen();
        });
    } else {
        console.error('Sign up button not found!');
    }

    // Back buttons
    if (backToInitial) {
        backToInitial.addEventListener('click', backToInitialScreen);
    }

    if (backToSignupForm) {
        backToSignupForm.addEventListener('click', backToSignupFormScreen);
    }

    if (backToSkillLevel) {
        backToSkillLevel.addEventListener('click', backToSkillLevelScreen);
    }

    if (backToStorage) {
        backToStorage.addEventListener('click', backToStorageScreen);
    }

    // Handle signup form submission
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Store user data
            userData.name = document.getElementById('signupName').value;
            userData.email = document.getElementById('signupEmail').value;
            userData.phone = document.getElementById('signupPhone').value;
            
            // Move to skill level screen
            showSkillLevelScreen();
        });
    }

    // Handle skill form submission
    if (skillForm) {
        skillForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get selected skill level
            const selectedSkill = document.querySelector('input[name="skillLevel"]:checked');
            if (selectedSkill) {
                userData.skillLevel = selectedSkill.value;
                console.log('Skill level saved:', userData.skillLevel);
                
                // Move to storage location screen
                showStorageLocationScreen();
            }
        });
    }

    // Handle storage form submission
    if (storageForm) {
        storageForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get all selected storage locations
            const selectedStorage = Array.from(document.querySelectorAll('input[name="storage"]:checked'))
                .map(checkbox => checkbox.value);
            
            userData.storageLocations = selectedStorage;
            console.log('Storage locations saved:', userData.storageLocations);
            
            // Move to nutrition goals screen
            showNutritionGoalsScreen();
        });
    }

    // Handle nutrition form submission
    if (nutritionForm) {
        nutritionForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get nutrition values
            userData.nutritionGoals = {
                calories: document.getElementById('caloriesInput').value,
                protein: document.getElementById('proteinInput').value,
                carbs: document.getElementById('carbsInput').value,
                fat: document.getElementById('fatInput').value
            };
            
            // Store in localStorage or send to server
            console.log('Complete User Data:', userData);
            
            // Redirect to Dashboard
            window.location.href = '/Dashboard.html';
        });
    }

    // Handle Sign In button click inside the modal
    if (signinBtn) {
        signinBtn.addEventListener('click', function() {
            // Close the auth modal
            closeModalFunc();
            // Open the sign-in popup
            const signInModal = document.getElementById('signInModal');
            if (signInModal) {
                signInModal.style.display = 'flex';
            }
        });
    }

    // Close modal when clicking outside of it
    window.addEventListener('click', function(event) {
        if (event.target === authModal) {
            closeModalFunc();
        }
    });

    // Close modal with Escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && authModal.style.display === 'block') {
            closeModalFunc();
        }
    });
});

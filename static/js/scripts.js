// Global variables
let currentUser = null
let savedJobs = []
let appliedJobs = []

// DOM Content Loaded
document.addEventListener("DOMContentLoaded", () => {
  initializeApp()
  setupEventListeners()
  loadUserData()
})

// Initialize application
function initializeApp() {
  console.log("PASIA Job Board initialized")

  // Check if user is logged in
  checkAuthStatus()

  // Initialize search functionality
  initializeSearch()

  // Initialize job cards
  initializeJobCards()

  // Initialize forms
  initializeForms()
}

// Setup event listeners
function setupEventListeners() {
  // Navigation dropdown
  setupDropdowns()

  // Search form
  const searchForm = document.querySelector(".job-search-form")
  if (searchForm) {
    searchForm.addEventListener("submit", handleJobSearch)
  }

  // Filter checkboxes
  const filterCheckboxes = document.querySelectorAll('input[name="work_type"]')
  filterCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", handleFilterChange)
  })

  // Profile edit functionality
  const editProfileBtn = document.querySelector('[onclick="toggleEditMode()"]')
  if (editProfileBtn) {
    editProfileBtn.addEventListener("click", toggleEditMode)
  }

  // Form validation
  const forms = document.querySelectorAll("form")
  forms.forEach((form) => {
    form.addEventListener("submit", validateForm)
  })

  // Job application buttons
  document.addEventListener("click", (e) => {
    if (e.target.matches('[onclick*="applyForJob"]')) {
      const jobId = e.target.getAttribute("onclick").match(/\d+/)[0]
      applyForJob(Number.parseInt(jobId))
    }

    if (e.target.matches('[onclick*="saveJob"]')) {
      const jobId = e.target.getAttribute("onclick").match(/\d+/)[0]
      saveJob(Number.parseInt(jobId))
    }
  })
}

// Navigation dropdowns
function setupDropdowns() {
  const dropdowns = document.querySelectorAll(".dropdown")

  dropdowns.forEach((dropdown) => {
    const toggle = dropdown.querySelector(".dropdown-toggle")
    const menu = dropdown.querySelector(".dropdown-menu")

    if (toggle && menu) {
      toggle.addEventListener("click", (e) => {
        e.preventDefault()
        toggleDropdown(dropdown)
      })

      // Close dropdown when clicking outside
      document.addEventListener("click", (e) => {
        if (!dropdown.contains(e.target)) {
          closeDropdown(dropdown)
        }
      })
    }
  })
}

function toggleDropdown(dropdown) {
  const menu = dropdown.querySelector(".dropdown-menu")
  const isOpen = menu.style.opacity === "1"

  // Close all other dropdowns
  document.querySelectorAll(".dropdown-menu").forEach((m) => {
    m.style.opacity = "0"
    m.style.visibility = "hidden"
    m.style.transform = "translateY(-10px)"
  })

  if (!isOpen) {
    menu.style.opacity = "1"
    menu.style.visibility = "visible"
    menu.style.transform = "translateY(0)"
  }
}

function closeDropdown(dropdown) {
  const menu = dropdown.querySelector(".dropdown-menu")
  menu.style.opacity = "0"
  menu.style.visibility = "hidden"
  menu.style.transform = "translateY(-10px)"
}

// Authentication
function checkAuthStatus() {
  // Check if user is logged in (this would typically check a JWT token or session)
  const token = localStorage.getItem("authToken")
  if (token) {
    // Validate token and get user data
    fetchUserData(token)
  }
}

function fetchUserData(token) {
  // This would make an API call to get user data
  // For now, we'll simulate with localStorage
  const userData = localStorage.getItem("userData")
  if (userData) {
    currentUser = JSON.parse(userData)
    updateUIForLoggedInUser()
  }
}

function updateUIForLoggedInUser() {
  // Update navigation to show user-specific links
  const navRight = document.querySelector(".nav-right")
  if (navRight && currentUser) {
    // Add profile and logout links
    const profileLink = document.createElement("a")
    profileLink.href = "/profile"
    profileLink.className = "nav-link"
    profileLink.textContent = "Profile"

    const logoutLink = document.createElement("a")
    logoutLink.href = "#"
    logoutLink.className = "nav-link"
    logoutLink.textContent = "Logout"
    logoutLink.addEventListener("click", handleLogout)

    navRight.appendChild(profileLink)
    navRight.appendChild(logoutLink)
  }
}

function handleLogout(e) {
  e.preventDefault()
  localStorage.removeItem("authToken")
  localStorage.removeItem("userData")
  currentUser = null
  window.location.href = "/"
}

// Job Search
function initializeSearch() {
  const searchInput = document.querySelector('input[name="keyword"]')
  if (searchInput) {
    // Add autocomplete functionality
    searchInput.addEventListener("input", debounce(handleSearchAutocomplete, 300))
  }
}

function handleJobSearch(e) {
  e.preventDefault()

  const formData = new FormData(e.target)
  const searchParams = {
    keyword: formData.get("keyword"),
    classification: formData.get("classification"),
    location: formData.get("location"),
    work_type: formData.getAll("work_type"),
    date_posted: formData.get("date_posted"),
    salary_range: formData.get("salary_range"),
  }

  // Show loading state
  showLoadingState()

  // Perform search (this would typically be an API call)
  performJobSearch(searchParams)
    .then((results) => {
      displaySearchResults(results)
      hideLoadingState()
    })
    .catch((error) => {
      console.error("Search error:", error)
      showErrorMessage("Search failed. Please try again.")
      hideLoadingState()
    })
}

function handleSearchAutocomplete(e) {
  const query = e.target.value
  if (query.length < 2) return

  // This would typically call an API for suggestions
  const suggestions = getJobSuggestions(query)
  showSearchSuggestions(suggestions, e.target)
}

function getJobSuggestions(query) {
  // Mock suggestions - in real app, this would be an API call
  const mockSuggestions = [
    "Supply Chain Manager",
    "Procurement Specialist",
    "Logistics Coordinator",
    "Operations Manager",
    "Warehouse Supervisor",
  ]

  return mockSuggestions.filter((suggestion) => suggestion.toLowerCase().includes(query.toLowerCase()))
}

function showSearchSuggestions(suggestions, inputElement) {
  // Remove existing suggestions
  const existingSuggestions = document.querySelector(".search-suggestions")
  if (existingSuggestions) {
    existingSuggestions.remove()
  }

  if (suggestions.length === 0) return

  const suggestionsContainer = document.createElement("div")
  suggestionsContainer.className = "search-suggestions"
  suggestionsContainer.style.cssText = `
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: white;
        border: 1px solid #e1e5e9;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        z-index: 1000;
        max-height: 200px;
        overflow-y: auto;
    `

  suggestions.forEach((suggestion) => {
    const suggestionItem = document.createElement("div")
    suggestionItem.className = "suggestion-item"
    suggestionItem.textContent = suggestion
    suggestionItem.style.cssText = `
            padding: 12px 16px;
            cursor: pointer;
            border-bottom: 1px solid #f0f0f0;
        `

    suggestionItem.addEventListener("click", () => {
      inputElement.value = suggestion
      suggestionsContainer.remove()
    })

    suggestionItem.addEventListener("mouseenter", () => {
      suggestionItem.style.backgroundColor = "#f8f9fa"
    })

    suggestionItem.addEventListener("mouseleave", () => {
      suggestionItem.style.backgroundColor = "white"
    })

    suggestionsContainer.appendChild(suggestionItem)
  })

  // Position relative to input
  const inputContainer = inputElement.parentElement
  inputContainer.style.position = "relative"
  inputContainer.appendChild(suggestionsContainer)

  // Close suggestions when clicking outside
  document.addEventListener("click", function closeSuggestions(e) {
    if (!inputContainer.contains(e.target)) {
      suggestionsContainer.remove()
      document.removeEventListener("click", closeSuggestions)
    }
  })
}

function performJobSearch(params) {
  // Mock API call - replace with actual API endpoint
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockResults = [
        {
          id: 1,
          title: "Senior Supply Chain Manager",
          company_name: "Global Logistics Corp",
          location: "Makati, Metro Manila",
          work_type: "Full-time",
          classification: "Supply Chain",
          description: "Lead supply chain operations for a multinational company...",
          posted_time: "2 days ago",
          salary_range: "₱80,000 - ₱120,000",
          is_featured: true,
        },
        {
          id: 2,
          title: "Procurement Specialist",
          company_name: "Manufacturing Solutions Inc",
          location: "Laguna",
          work_type: "Full-time",
          classification: "Procurement",
          description: "Handle procurement activities for manufacturing operations...",
          posted_time: "1 week ago",
          salary_range: "₱50,000 - ₱70,000",
          is_featured: false,
        },
      ]
      resolve(mockResults)
    }, 1000)
  })
}

function displaySearchResults(results) {
  const jobGrid = document.querySelector(".job-grid")
  if (!jobGrid) return

  jobGrid.innerHTML = ""

  if (results.length === 0) {
    jobGrid.innerHTML = '<p class="no-results">No jobs found matching your criteria.</p>'
    return
  }

  results.forEach((job) => {
    const jobCard = createJobCard(job)
    jobGrid.appendChild(jobCard)
  })
}

function createJobCard(job) {
  const card = document.createElement("div")
  card.className = "job-card"
  card.onclick = () => (window.location.href = `/job/${job.id}`)

  card.innerHTML = `
        <div class="job-card-header">
            <h3 class="job-title">${job.title}</h3>
            <div class="job-badges">
                <span class="badge badge-work-type">${job.work_type}</span>
                <span class="badge badge-category">${job.classification}</span>
            </div>
        </div>
        
        <div class="job-card-body">
            <div class="company-info">
                <h4 class="company-name">${job.company_name}</h4>
                <p class="job-location">${job.location}</p>
            </div>
            
            <p class="job-description">${job.description}</p>
            
            ${job.salary_range ? `<p class="salary-range">${job.salary_range}</p>` : ""}
        </div>
        
        <div class="job-card-footer">
            <span class="posted-time">${job.posted_time}</span>
            ${job.is_featured ? '<span class="featured-tag">Featured</span>' : ""}
        </div>
    `

  return card
}

function handleFilterChange(e) {
  const checkedFilters = Array.from(document.querySelectorAll('input[name="work_type"]:checked')).map((cb) => cb.value)

  // Apply filters to current results
  applyFilters(checkedFilters)
}

function applyFilters(filters) {
  const jobCards = document.querySelectorAll(".job-card")

  jobCards.forEach((card) => {
    const workTypeBadge = card.querySelector(".badge-work-type")
    if (!workTypeBadge) return

    const workType = workTypeBadge.textContent.toLowerCase().replace("-", "-")

    if (filters.length === 0 || filters.includes(workType)) {
      card.style.display = "block"
    } else {
      card.style.display = "none"
    }
  })
}

// Job Actions
function applyForJob(jobId) {
  if (!currentUser) {
    showLoginModal()
    return
  }

  // Check if already applied
  if (appliedJobs.includes(jobId)) {
    showMessage("You have already applied for this job.", "info")
    return
  }

  // Show application modal or redirect to application page
  showApplicationModal(jobId)
}

function saveJob(jobId) {
  if (!currentUser) {
    showLoginModal()
    return
  }

  if (savedJobs.includes(jobId)) {
    // Remove from saved jobs
    savedJobs = savedJobs.filter((id) => id !== jobId)
    showMessage("Job removed from saved jobs.", "success")
  } else {
    // Add to saved jobs
    savedJobs.push(jobId)
    showMessage("Job saved successfully!", "success")
  }

  // Update localStorage
  localStorage.setItem("savedJobs", JSON.stringify(savedJobs))

  // Update UI
  updateSaveJobButton(jobId)
}

function showApplicationModal(jobId) {
  const modal = document.createElement("div")
  modal.className = "modal-overlay"
  modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    `

  modal.innerHTML = `
        <div class="modal-content" style="
            background: white;
            padding: 32px;
            border-radius: 12px;
            max-width: 500px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
        ">
            <h2>Apply for this Job</h2>
            <p>Are you sure you want to apply for this position?</p>
            
            <div class="modal-actions" style="
                display: flex;
                gap: 16px;
                justify-content: flex-end;
                margin-top: 24px;
            ">
                <button class="btn btn-outline" onclick="window.closeModal()">Cancel</button>
                <button class="btn btn-primary" onclick="window.confirmApplication(${jobId})">Apply Now</button>
            </div>
        </div>
    `

  document.body.appendChild(modal)

  // Close modal when clicking overlay
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      window.closeModal()
    }
  })
}

function submitJobApplication(jobId) {
  // Show loading state
  showLoadingState()

  // Simulate API call
  setTimeout(() => {
    appliedJobs.push(jobId)
    localStorage.setItem("appliedJobs", JSON.stringify(appliedJobs))

    showMessage("Application submitted successfully!", "success")
    hideLoadingState()

    // Update apply button
    const applyButton = document.querySelector(`[onclick*="applyForJob(${jobId})"]`)
    if (applyButton) {
      applyButton.textContent = "Applied"
      applyButton.disabled = true
      applyButton.classList.add("btn-secondary")
      applyButton.classList.remove("btn-primary")
    }
  }, 1000)
}

function showLoginModal() {
  const modal = document.createElement("div")
  modal.className = "modal-overlay"
  modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    `

  modal.innerHTML = `
        <div class="modal-content" style="
            background: white;
            padding: 32px;
            border-radius: 12px;
            max-width: 400px;
            width: 90%;
            text-align: center;
        ">
            <h2>Login Required</h2>
            <p>Please log in to apply for jobs and save your favorites.</p>
            
            <div class="modal-actions" style="
                display: flex;
                gap: 16px;
                justify-content: center;
                margin-top: 24px;
            ">
                <button class="btn btn-outline" onclick="window.closeModal()">Cancel</button>
                <a href="/login" class="btn btn-primary">Login</a>
            </div>
        </div>
    `

  document.body.appendChild(modal)

  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      window.closeModal()
    }
  })
}

// Profile Management
function toggleEditMode() {
  const editableElements = document.querySelectorAll(".editable-content")
  const editButton = document.querySelector('[onclick="toggleEditMode()"]')

  editableElements.forEach((element) => {
    const displayMode = element.querySelector(".display-mode")
    const editMode = element.querySelector(".edit-mode")

    if (displayMode && editMode) {
      if (displayMode.style.display === "none") {
        // Switch to display mode
        displayMode.style.display = "block"
        editMode.style.display = "none"
        editButton.textContent = "Edit Profile"
      } else {
        // Switch to edit mode
        displayMode.style.display = "none"
        editMode.style.display = "block"
        editButton.textContent = "Save Changes"
      }
    }
  })
}

// Form Validation
function initializeForms() {
  const forms = document.querySelectorAll("form")
  forms.forEach((form) => {
    const inputs = form.querySelectorAll("input, select, textarea")
    inputs.forEach((input) => {
      input.addEventListener("blur", validateField)
      input.addEventListener("input", clearFieldError)
    })
  })
}

function validateForm(e) {
  const form = e.target
  let isValid = true

  // Clear previous errors
  clearFormErrors(form)

  // Validate required fields
  const requiredFields = form.querySelectorAll("[required]")
  requiredFields.forEach((field) => {
    if (!validateField({ target: field })) {
      isValid = false
    }
  })

  // Validate email fields
  const emailFields = form.querySelectorAll('input[type="email"]')
  emailFields.forEach((field) => {
    if (field.value && !isValidEmail(field.value)) {
      showFieldError(field, "Please enter a valid email address")
      isValid = false
    }
  })

  // Validate password confirmation
  const passwordField = form.querySelector('input[name="password"]')
  const confirmPasswordField = form.querySelector('input[name="confirm_password"]')
  if (passwordField && confirmPasswordField) {
    if (passwordField.value !== confirmPasswordField.value) {
      showFieldError(confirmPasswordField, "Passwords do not match")
      isValid = false
    }
  }

  if (!isValid) {
    e.preventDefault()
    showMessage("Please correct the errors below", "error")
  }
}

function validateField(e) {
  const field = e.target
  const value = field.value.trim()

  // Check required fields
  if (field.hasAttribute("required") && !value) {
    showFieldError(field, "This field is required")
    return false
  }

  // Check minimum length for passwords
  if (field.type === "password" && value && value.length < 8) {
    showFieldError(field, "Password must be at least 8 characters long")
    return false
  }

  // Check email format
  if (field.type === "email" && value && !isValidEmail(value)) {
    showFieldError(field, "Please enter a valid email address")
    return false
  }

  return true
}

function showFieldError(field, message) {
  clearFieldError({ target: field })

  field.classList.add("error")
  field.style.borderColor = "#dc3545"

  const errorElement = document.createElement("div")
  errorElement.className = "field-error"
  errorElement.textContent = message
  errorElement.style.cssText = `
        color: #dc3545;
        font-size: 14px;
        margin-top: 4px;
    `

  field.parentElement.appendChild(errorElement)
}

function clearFieldError(e) {
  const field = e.target
  field.classList.remove("error")
  field.style.borderColor = ""

  const errorElement = field.parentElement.querySelector(".field-error")
  if (errorElement) {
    errorElement.remove()
  }
}

function clearFormErrors(form) {
  const errorElements = form.querySelectorAll(".field-error")
  errorElements.forEach((element) => element.remove())

  const errorFields = form.querySelectorAll(".error")
  errorFields.forEach((field) => {
    field.classList.remove("error")
    field.style.borderColor = ""
  })
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Utility Functions
function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

function showLoadingState() {
  const loadingOverlay = document.createElement("div")
  loadingOverlay.id = "loading-overlay"
  loadingOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(255,255,255,0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
    `

  loadingOverlay.innerHTML = `
        <div style="text-align: center;">
            <div class="spinner"></div>
            <p>Loading...</p>
        </div>
    `

  document.body.appendChild(loadingOverlay)
}

function hideLoadingState() {
  const loadingOverlay = document.getElementById("loading-overlay")
  if (loadingOverlay) {
    loadingOverlay.remove()
  }
}

function showMessage(message, type = "info") {
  const messageElement = document.createElement("div")
  messageElement.className = `message message-${type}`
  messageElement.textContent = message
  messageElement.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 24px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
    `

  // Set background color based on type
  switch (type) {
    case "success":
      messageElement.style.backgroundColor = "#28a745"
      break
    case "error":
      messageElement.style.backgroundColor = "#dc3545"
      break
    case "warning":
      messageElement.style.backgroundColor = "#ffc107"
      messageElement.style.color = "#333"
      break
    default:
      messageElement.style.backgroundColor = "#17a2b8"
  }

  document.body.appendChild(messageElement)

  // Auto remove after 5 seconds
  setTimeout(() => {
    messageElement.style.animation = "slideOut 0.3s ease-in"
    setTimeout(() => {
      if (messageElement.parentElement) {
        messageElement.remove()
      }
    }, 300)
  }, 5000)

  // Add click to dismiss
  messageElement.addEventListener("click", () => {
    messageElement.remove()
  })
}

function showErrorMessage(message) {
  showMessage(message, "error")
}

// Initialize job cards
function initializeJobCards() {
  const jobCards = document.querySelectorAll(".job-card")
  jobCards.forEach((card) => {
    card.addEventListener("mouseenter", () => {
      card.style.transform = "translateY(-4px)"
    })

    card.addEventListener("mouseleave", () => {
      card.style.transform = "translateY(0)"
    })
  })
}

// Load user data from localStorage
function loadUserData() {
  const savedJobsData = localStorage.getItem("savedJobs")
  if (savedJobsData) {
    savedJobs = JSON.parse(savedJobsData)
  }

  const appliedJobsData = localStorage.getItem("appliedJobs")
  if (appliedJobsData) {
    appliedJobs = JSON.parse(appliedJobsData)
  }

  // Update UI based on saved/applied jobs
  updateJobCardStates()
}

function updateJobCardStates() {
  // Update save buttons
  savedJobs.forEach((jobId) => {
    updateSaveJobButton(jobId)
  })

  // Update apply buttons
  appliedJobs.forEach((jobId) => {
    const applyButton = document.querySelector(`[onclick*="applyForJob(${jobId})"]`)
    if (applyButton) {
      applyButton.textContent = "Applied"
      applyButton.disabled = true
      applyButton.classList.add("btn-secondary")
      applyButton.classList.remove("btn-primary")
    }
  })
}

function updateSaveJobButton(jobId) {
  const saveButton = document.querySelector(`[onclick*="saveJob(${jobId})"]`)
  if (saveButton) {
    if (savedJobs.includes(jobId)) {
      saveButton.textContent = "Saved"
      saveButton.classList.add("btn-secondary")
      saveButton.classList.remove("btn-primary")
    } else {
      saveButton.textContent = "Save Job"
      saveButton.classList.add("btn-primary")
      saveButton.classList.remove("btn-secondary")
    }
  }
}

// Add CSS animations
const style = document.createElement("style")
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`
document.head.appendChild(style)

// Export functions for global access
window.applyForJob = applyForJob
window.saveJob = saveJob
window.toggleEditMode = toggleEditMode
window.closeModal = () => {
  const modal = document.querySelector(".modal-overlay")
  if (modal) {
    modal.remove()
  }
}

window.confirmApplication = (jobId) => {
  submitJobApplication(jobId)
}

// More filters
document.addEventListener('DOMContentLoaded', function () {
    const toggle = document.getElementById('toggle-filters');
    const wrapper = document.querySelector('.search-filters-wrapper');
    let isOpen = false;

    toggle.addEventListener('click', () => {
        isOpen = !isOpen;
        wrapper.classList.toggle('open', isOpen);
        toggle.classList.toggle('open', isOpen);

        // Accessibility
        toggle.setAttribute('aria-expanded', isOpen);

        // Update text if needed
        const textEl = toggle.querySelector('.toggle-text');
        textEl.textContent = isOpen ? 'Less filters' : 'More filters';
    });

    // Optional: keyboard accessibility
    toggle.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggle.click();
        }
    });
});

// JOB CARD
document.addEventListener('DOMContentLoaded', () => {
  // Save toggle
  document.querySelectorAll('.save-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.classList.toggle('saved');
      btn.innerHTML = btn.classList.contains('saved') ? '★' : '☆';
    });
  });

  // Hide job cards
  document.querySelectorAll('.hide-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.job-card') || btn.closest('.job-card-mini');
      if (card) card.remove();
    });
  });

  // Format posted time
  const formatTimeAgo = (postedDateStr) => {
    const postedDate = new Date(postedDateStr);
    const now = new Date();
    const diffMs = now - postedDate;
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffHours / 24);
    return diffHours < 24
      ? `${diffHours}h ago`
      : `${diffDays}d ago`;
  };

  // Set posted time and salary in each card
  document.querySelectorAll('.job-card, .job-card-mini').forEach(card => {
    const posted = card.getAttribute('data-posted');
    const salary = card.getAttribute('data-salary');
    const postedEl = card.querySelector('.job-posted');
    const salaryEl = card.querySelector('.job-salary');

    if (posted && postedEl) {
      postedEl.textContent = formatTimeAgo(posted);
    }
    if (salary && salaryEl) {
      salaryEl.textContent = salary;
    }
  });
});
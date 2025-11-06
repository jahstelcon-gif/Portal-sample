// =======================
// SLIDER CONTROL
// =======================
const slides = document.querySelector('.slides');
const slideCount = document.querySelectorAll('.slides img').length;
let index = 0;

function showNextSlide(interval) {
  setTimeout(function changeSlide() {
    index = (index + 1) % slideCount;
    slides.style.transform = `translateX(${-index * 100}%)`;
    const nextInterval = (index === 0) ? 6000 : 4000;
    showNextSlide(nextInterval);
  }, interval);
}
showNextSlide(6000);

function togglePasswordPopup() {
  const pass = document.getElementById("login_password_popup");
  pass.type = pass.type === "password" ? "text" : "password";
}

// =======================
// FIREBASE CONNECTION
// =======================
const firebaseConfig = {
  apiKey: "AIzaSyB1Gbmp2j2cTfnUmuWTjcL2ypauUpQn8Qc",
  authDomain: "jahsportal.firebaseapp.com",
  databaseURL: "https://jahsportal-default-rtdb.firebaseio.com",
  projectId: "jahsportal",
  storageBucket: "jahsportal.firebasestorage.app",
  messagingSenderId: "798312139932",
  appId: "1:798312139932:web:2f6654cdd82a23406ff159"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const db = firebase.database();

// =======================
// LOGIN POPUP CONTROLS
// =======================
const loginBtn = document.getElementById("login");
const popLogin = document.getElementById("pop_login");
const closeBtn = document.querySelector("#pop_login .close");

loginBtn.addEventListener("click", () => popLogin.style.display = "flex");
closeBtn.addEventListener("click", () => popLogin.style.display = "none");
window.addEventListener("click", (e) => {
  if (e.target === popLogin) popLogin.style.display = "none";
});

// =======================
// LOGIN FUNCTION (DEBUGGED)
// =======================
const loginForm = document.getElementById("universalLoginFormPopup");
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("login_email_popup").value.trim().toLowerCase();
  const password = document.getElementById("login_password_popup").value;

  if (!email || !password) {
    Swal.fire({
      icon: "warning",
      title: "Missing Input",
      text: "Please enter both email and password."
    });
    return;
  }

  try {
    // ✅ Ensure correct path
    const snap = await db.ref("accounts").orderByChild("email").equalTo(email).once("value");

    if (!snap.exists()) {
      Swal.fire({
        icon: "error",
        title: "Login Failed",
        text: "Invalid email or password."
      });
      return;
    }

    // ✅ Get the first matching record
    let acc = null;
    snap.forEach((child) => acc = child.val());

    console.log("Account found:", acc);

    if (!acc || acc.password !== password) {
      Swal.fire({
        icon: "error",
        title: "Login Failed",
        text: "Invalid email or password."
      });
      return;
    }

    localStorage.setItem("email", acc.email);
    localStorage.setItem("role", acc.role);
    localStorage.setItem("userName", acc.name);

    Swal.fire({
      title: `Welcome, ${acc.name}!`,
      text: "You have successfully logged in.",
      icon: "success",
      confirmButtonText: "Continue",
      timer: 2000,
      timerProgressBar: true
    }).then(() => {
      const role = (acc.role || "").toLowerCase();
      console.log("Redirecting to:", role);
      if (role === "admin") {
        window.location.href = "admin_dashboard.html";
      } else if (role === "teamleader") {
        window.location.href = "team_dashboard.html";
      } else if (role === "employee") {
        window.location.href = "employee_dashboard.html";
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: `Unknown role: ${acc.role}`
        });
      }
    });

  } catch (err) {
    console.error("Firebase Error:", err);
    Swal.fire({
      icon: "error",
      title: "Database Error",
      text: "Something went wrong. Please try again."
    });
  }
});

// =======================
// JOIN POPUP CONTROLS
// =======================
const joinBtn = document.getElementById("join");
const joinPopup = document.getElementById("pop_join");
const closeJoin = document.getElementById("closeJoin");

joinBtn.addEventListener("click", () => joinPopup.style.display = "flex");
closeJoin.addEventListener("click", () => joinPopup.style.display = "none");
window.addEventListener("click", (e) => {
  if (e.target === joinPopup) joinPopup.style.display = "none";
});

// =======================
// BLOCK NON-NUMERIC INPUT
// =======================
document.getElementById("contact_num").addEventListener("input", function () {
  this.value = this.value.replace(/\D/g, ''); // remove non-numbers
});

// =======================
// JOIN FORM VALIDATION
// =======================
document.getElementById("joinForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const joinEmail = document.getElementById("join_email").value.trim().toLowerCase();
  const contactNum = document.getElementById("contact_num").value.trim();
  const joinMessage = document.getElementById("join_message").value.trim();

  if (!joinEmail || !contactNum || !joinMessage) {
    Swal.fire({
      icon: "warning",
      title: "Missing Input",
      text: "Please fill in all fields."
    });
    return;
  }

  if (!/^\d{11}$/.test(contactNum)) {
    Swal.fire({
      icon: "error",
      title: "Invalid Contact Number",
      text: "Contact number must contain exactly 11 digits."
    });
    return;
  }

  if (joinMessage.length > 200) {
    Swal.fire({
      icon: "error",
      title: "Message Too Long",
      text: "Message must be 200 characters or less."
    });
    return;
  }

  db.ref("join_requests").push({
    email: joinEmail,
    contact_number: contactNum,
    message: joinMessage,
    timestamp: new Date().toISOString()
  })
  .then(() => {
    Swal.fire({
      icon: "success",
      title: "Request Sent",
      text: "Your request has been submitted successfully!"
    });
    joinPopup.style.display = "none";
    document.getElementById("joinForm").reset();
  })
  .catch((error) => {
    console.error("Error:", error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "There was an error submitting your request."
    });
  });
});

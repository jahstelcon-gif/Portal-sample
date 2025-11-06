// =======================
// Database connection
// =======================
const firebaseConfig = {
  apiKey: "AIzaSyB1Gbmp2j2cTfnUmuWTjcL2ypauUpQn8Qc",
  authDomain: "jahsportal.firebaseapp.com",
  databaseURL: "https://jahsportal-default-rtdb.firebaseio.com",
  projectId: "jahsportal",
  storageBucket: "jahsportal.firebasestorage.app",
  messagingSenderId: "798312139932",
  appId: "1:798312139932:web:2f6654cdd82a23406ff159",
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

loginBtn.addEventListener("click", () => {
  popLogin.style.display = "flex";
});
closeBtn.addEventListener("click", () => {
  popLogin.style.display = "none";
});
window.addEventListener("click", (e) => {
  if (e.target === popLogin) {
    popLogin.style.display = "none";
  }
});

// =======================
// LOGIN FUNCTION
// =======================
const loginForm = document.getElementById("universalLoginForm");
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("login_email").value.trim();
  const password = document.getElementById("login_password").value;

  if (!email || !password) {
    Swal.fire({
      icon: "warning",
      title: "Missing Input",
      text: "Please enter both email and password.",
    });
    return;
  }

  try {
    const snap = await db
      .ref("accounts")
      .orderByChild("email")
      .equalTo(email)
      .once("value");

    if (!snap.exists()) {
      Swal.fire({
        icon: "error",
        title: "Login Failed",
        text: "Invalid email or password.",
      });
      return;
    }

    let acc = null;
    snap.forEach((child) => {
      acc = child.val();
    });

    if (!acc || acc.password !== password) {
      Swal.fire({
        icon: "error",
        title: "Login Failed",
        text: "Invalid email or password.",
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
      timer: 2500,
      timerProgressBar: true,
    }).then(() => {
      if (acc.role === "admin") {
        window.location.href = "admin_dashboard.html";
      } else if (acc.role === "teamleader") {
        window.location.href = "team_dashboard.html";
      } else if (acc.role === "employee") {
        window.location.href = "employee_dashboard.html";
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Unknown role.",
        });
      }
    });
  } catch (err) {
    console.error(err);
    Swal.fire({
      icon: "error",
      title: "Database Error",
      text: "Something went wrong. Please try again.",
    });
  }
});

// =======================
// JOIN POPUP CONTROLS
// =======================
const joinBtn = document.getElementById("join");
const joinPopup = document.getElementById("pop_join");
const closeJoin = document.getElementById("closeJoin");

joinBtn.addEventListener("click", () => {
  joinPopup.style.display = "flex";
});
closeJoin.addEventListener("click", () => {
  joinPopup.style.display = "none";
});
window.addEventListener("click", (e) => {
  if (e.target === joinPopup) {
    joinPopup.style.display = "none";
  }
});

// =======================
// ✅ EMAILJS CONFIG
// =======================
(function () {
  emailjs.init("I8tvyDhY29nbwRvAE"); // <-- Replace this with your EmailJS Public Key
})();

// =======================
// JOIN OUR TEAM FORM (with SweetAlert2, Email Validation, 200-word constraint)
// =======================
document.getElementById("joinForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const joinEmail = document.getElementById("join_email").value.trim();
  const joinMessage = document.getElementById("join_message").value.trim();

  // ✅ 1. Check message length (minimum 200 words)
  const wordCount = joinMessage.split(/\s+/).filter(Boolean).length;
  if (wordCount < 200) {
    Swal.fire({
      icon: "warning",
      title: "Message Too Short",
      text: `Your message must be at least 200 words. (Currently ${wordCount} words)`,
    });
    return;
  }

  // ✅ 2. Basic email format check
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(joinEmail)) {
    Swal.fire({
      icon: "error",
      title: "Invalid Email",
      text: "Please enter a valid email address.",
    });
    return;
  }

  // ✅ 3. Store request in Firebase
  try {
    await db.ref("join_requests").push({
      email: joinEmail,
      message: joinMessage,
      timestamp: new Date().toISOString(),
    });

    // ✅ 4. Send email confirmation via EmailJS
    await emailjs.send("service_f4zsz1r", "template_re3enfm", {
      to_name: joinEmail,
      to_email: joinEmail,
      message: "Thank you for joining our team! We received your message and will get back to you soon.",
    });

    Swal.fire({
      icon: "success",
      title: "Request Sent!",
      text: "Your request was submitted and a confirmation email has been sent.",
    });
    joinPopup.style.display = "none";
    document.getElementById("joinForm").reset();
  } catch (error) {
    console.error("Error:", error);
    Swal.fire({
      icon: "error",
      title: "Submission Failed",
      text: "There was an error submitting your request or sending confirmation.",
    });
  }
});

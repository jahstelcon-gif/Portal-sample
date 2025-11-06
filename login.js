// =======================
// Firebase Connection
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

if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// =======================
// LOGIN POPUP CONTROLS
// =======================
const loginBtn = document.getElementById("login");
const popLogin = document.getElementById("pop_login");
const closeBtn = document.querySelector("#pop_login .close");

loginBtn.addEventListener("click", () => (popLogin.style.display = "flex"));
closeBtn.addEventListener("click", () => (popLogin.style.display = "none"));
window.addEventListener("click", (e) => {
  if (e.target === popLogin) popLogin.style.display = "none";
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
    Swal.fire({
      title: "Logging in...",
      text: "Please wait while we verify your credentials.",
      didOpen: () => Swal.showLoading(),
      allowOutsideClick: false,
    });

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

joinBtn.addEventListener("click", () => (joinPopup.style.display = "flex"));
closeJoin.addEventListener("click", () => (joinPopup.style.display = "none"));
window.addEventListener("click", (e) => {
  if (e.target === joinPopup) joinPopup.style.display = "none";
});

// =======================
// ✅ EMAILJS CONFIG
// =======================
(function () {
  emailjs.init("I8tvyDhY29nbwRvAE"); // <-- Your EmailJS Public Key
})();

// =======================
// ✅ Google Sign-In (Join Form)
// =======================
const googleJoinBtn = document.getElementById("googleJoinBtn");
const provider = new firebase.auth.GoogleAuthProvider();

googleJoinBtn.addEventListener("click", async () => {
  try {
    const result = await firebase.auth().signInWithPopup(provider);
    const user = result.user;

    if (!user || !user.email.endsWith("@gmail.com")) {
      Swal.fire({
        icon: "error",
        title: "Gmail Required",
        text: "Please use a valid Gmail account.",
      });
      return;
    }

    // Ask for message input after sign-in
    const { value: joinMessage } = await Swal.fire({
      title: "Join Our Team",
      input: "textarea",
      inputLabel: "Enter your message (max 200 characters)",
      inputPlaceholder: "Type your message here...",
      inputAttributes: { maxlength: 200 },
      inputValidator: (value) =>
        !value ? "Message cannot be empty!" : undefined,
      showCancelButton: true,
      confirmButtonText: "Submit",
    });

    if (!joinMessage) return;

    Swal.fire({
      title: "Submitting your request...",
      didOpen: () => Swal.showLoading(),
      allowOutsideClick: false,
    });

    // ✅ Store in Firebase
    await db.ref("join_requests").push({
      email: user.email,
      name: user.displayName,
      message: joinMessage,
      timestamp: new Date().toISOString(),
    });

    // ✅ Send confirmation via EmailJS
    await emailjs.send("service_f4zsz1r", "template_re3enfm", {
      to_name: user.displayName,
      to_email: user.email,
    });

    Swal.fire({
      icon: "success",
      title: "Request Sent!",
      text: `Thank you, ${user.displayName}. A confirmation email has been sent to ${user.email}.`,
    });
  } catch (error) {
    console.error(error);
    Swal.fire({
      icon: "error",
      title: "Google Sign-In Failed",
      text: "Unable to sign in with Google. Please try again.",
    });
  }
});
